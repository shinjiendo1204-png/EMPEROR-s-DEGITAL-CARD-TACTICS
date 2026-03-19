// src/lib/game.ts

import {
  PlayerState,
  Unit,
  BattleLog,
  BattleUnit,
  PackId,
  Stat,
  Ability,
  GameState,
} from "@/types"
import { getRowByIndex, canPlaceAt } from "./board"
import { runBattle } from "./battle/engine"
import { BattleState } from "./battle/state"
import { ROLE_AS, BASE_INTERVAL } from "./battle/constants"
import { BATTLE_COLS, PLAYER_ROWS, COMBAT_ROWS, BATTLE_SIZE } from "./battle/boardsize"
import { PACK_UNITS } from "@/data/packs"
import { addState } from "./battle/stateEffects"
import { createSharedCardPool } from "@/lib/battle/createSharedPool"
import { runAbilities } from "./battle/abilityRunner"
import { HERO_UNITS } from "@/data/heroes"

/* =========================
   GameState（物理在庫）
========================= */

export function createGame(p1Pack: PackId, p2Pack: PackId): GameState {
  const pool = createSharedCardPool(p1Pack, p2Pack)

  const p1 = createPlayer(p1Pack)
  const p2 = createPlayer(p2Pack)

  const game: GameState = {
    p1,
    p2,
    sharedPool: structuredClone(pool),
    claimedHeroes: {},
    activePacks: [p1Pack, p2Pack], 
  }

  // 初回ドロー（未使用分は以後、ターン開始/リロール時にプールへ戻す）
  initialDraw(game, game.p1)
  initialDraw(game, game.p2)

  return game
}

/* =========================
   盤面制限設定
========================= */

export const BASE_MAX_UNITS = 2
export const MAX_BOARD_UNITS = 8

/* =========================
   プレイヤー初期化
========================= */
export function createPlayer(packId: PackId): PlayerState {
  return {
    packId: packId,
    board: Array(BATTLE_SIZE).fill(null),
    hand: [],
   

    // PP
    pp: 2,
    maxPP: 2,
    maxBoardUnits: BASE_MAX_UNITS,

    synergies: [],
    phase: "setup",
    hp: 30,

    equipmentStock: [],

    lastBattleLogs: [],
    debugBattleLogs: [],
    turn: 1,

    rerollCharges: 0,
    maxRerollCharges: 3,
    counters: {
  match: {
  },
  turn: {},
  battle: {}
},

    pendingHero: null,
    activeHeroThisTurn: null,

    // 1ターン1回シナジー貼り
    synergyUsedThisTurn: false,
  }
}

// テンプレ専用
export type UnitTemplate = Unit & {
  readonly __template: true
}

export function createUnitInstance(template: Unit | undefined): Unit {
  if (!template) {
    throw new Error("createUnitInstance: template undefined")
  }

  return {
    ...structuredClone(template),
    equipments: [],
    effects: structuredClone(template.effects ?? []),
  }
}

/* =========================
   BattleUnit生成（盤面実体）
========================= */
export function createBattleUnit(unit: Unit, boardIndex: number, side: "p1" | "p2"): BattleUnit {
  const row = getRowByIndex(boardIndex)

  const abilities = unit.abilities ? structuredClone(unit.abilities) : []

  const rowIndex = Math.floor(boardIndex / BATTLE_COLS)
  const colIndex = boardIndex % BATTLE_COLS
  const baseAS = ROLE_AS[unit.role] ?? 1

  const battleUnit: BattleUnit = {
    instanceId: crypto.randomUUID(),

    unitId: unit.id,
    unitName: unit.name,
    index: boardIndex,
    pack: unit.pack,
    owner: side,
    cost: unit.cost,
    equipments: structuredClone(unit.equipments ?? []),

    hp: unit.hp,
    maxHp: unit.hp,
    atk: unit.atk,

    attackSpeed: baseAS,

    // ★ 基礎値保存（UIで色分けに使う想定）
    baseAtk: unit.atk,
    baseMaxHp: unit.hp,
    baseAttackSpeed: baseAS,
    baseDamageReduce: 0,

    // ★ statesを初期化（statはここに積む）
    states: structuredClone((unit as any).states ?? []),

    row,
    role: unit.role,
    attackRange: unit.attackRange,

    pos: { r: rowIndex, c: colIndex },

    nextActionTime: 0,
    side: side,

    damageDealt: 0,
    damageTaken: 0,

    abilities,
    timedModifiers: [],

    mode: unit.mode,
    ephemeral: (unit as any).ephemeral ?? false,
  }

  // effects 初期反映
  for (const e of unit.effects ?? []) {
    if (e.kind === "stat") {
      switch (e.stat) {
        case "hp":
          battleUnit.hp += e.value
          battleUnit.maxHp += e.value
          battleUnit.baseMaxHp += e.value
          break
        case "atk":
          battleUnit.atk += e.value
          battleUnit.baseAtk += e.value
          break
        case "attackSpeed":
          battleUnit.attackSpeed += e.value
          battleUnit.baseAttackSpeed += e.value
          break
        case "damageReduce":
          battleUnit.baseDamageReduce += e.value
          addState(battleUnit, {
            id: `base_dr_${Date.now()}_${Math.random()}`,
            type: "damage_reduce",
            value: e.value,
          })
          break
      }
    }

    if (e.kind === "keyword" && e.key === "once") {
      if (e.stat === "damageReduce") {
        addState(battleUnit, {
          id: `once_dr_${Date.now()}_${Math.random()}`,
          type: "damage_reduce",
          value: e.value,
          consumeOn: "onDamageTaken",
        })
      }
    }
  }

  // 初期装備反映（盤面Unitが既に装備を持っているケース用）
  for (const eq of battleUnit.equipments) {
    applyEquipmentToBattleUnit(battleUnit, eq)
  }

  return battleUnit
}

/* =========================
   テンプレ取得（プール返却用）
========================= */
function getTemplateById(id: string): Unit {
  for (const pack of Object.values(PACK_UNITS)) {
    const found = pack.find((u) => u.id === id)
    if (found) return structuredClone(found)
  }
    const hero = HERO_UNITS.find((u) => u.id === id)
    if (hero) return structuredClone(hero)
  
    throw new Error("Template not found: " + id)
}

/* =========================
   手札返却（物理在庫）
   - まだ使ってない分だけプールへ戻す
========================= */
function returnUnusedHandToPool(game: GameState, player: PlayerState) {
  if (!Array.isArray(player.hand) || player.hand.length === 0) {
    player.hand = []
    return
  }

  for (const u of player.hand) {
     // 🔥 ephemeralはプールに戻さない（消滅）
    if ((u as any).ephemeral) continue
    // handはinstanceでも id はテンプレIDなのでテンプレで戻す
    game.sharedPool.push(getTemplateById(u.id))
  }
  player.hand = []
}

/* =========================
   ドロー / ターン
========================= */
export function initialDraw(game: GameState, player: PlayerState) {
  drawHand(game, player)
}

export function startTurn(game: GameState, player: PlayerState) {
  // ✅ 前ターン限定カードを消す
  player.hand = player.hand.filter(card => !(card as any).ephemeral)

  // ✅ 前ターンの activeHeroThisTurn はここで破棄（持ち越さない）
  player.activeHeroThisTurn = null

  player.turn += 1
  player.maxPP += 1
  player.pp = player.maxPP

  player.maxBoardUnits = Math.min(
  BASE_MAX_UNITS + (player.turn - 1),
  MAX_BOARD_UNITS
)

  player.synergyUsedThisTurn = false
  player.rerollCharges = Math.min(player.maxRerollCharges, player.rerollCharges + 1)

  // ✅ 通常の5枚
  drawHand(game, player)

  // ✅ 次ターン予約を、このターンの active に移す（このターンだけ有効）
  if (player.pendingHero) {
    player.activeHeroThisTurn = player.pendingHero
    player.pendingHero = null
  }

  // ✅ 6枚目として注入
  injectHeroAs6th(player)

  player.phase = "setup"
}

function injectHeroAs6th(player: PlayerState) {
  if (!player.activeHeroThisTurn) return

  const heroTemplate = player.activeHeroThisTurn

  const heroInstance = createUnitInstance(heroTemplate)
  heroInstance.cost = 0
  ;(heroInstance as any).ephemeral = true
  ;(heroInstance as any).isHero = true // ← 明示

  const already = player.hand.some(
    c => c.id === heroTemplate.id && (c as any).ephemeral
  )

  if (!already) player.hand.push(heroInstance)
}
/* =========================
   ドロー（物理在庫）
   - 共有プールから引く（引いたら消える）
   - 既存handは先にプールへ戻す（ターン更新/リロール）
========================= */
export function drawHand(game: GameState, player: PlayerState) {
  // 既存手札をプールへ戻す（未使用分）
  returnUnusedHandToPool(game, player)

  // コスト制限
  const pool = game.sharedPool.filter((u) => {
  if (u.cost > player.maxPP) return false

  // ヒーローは通常ドローから除外
  if (u.mode === "hero") return false

  // 既に取得済みヒーローも除外
  if (game.claimedHeroes[u.id]) return false

  return true
})

  // シャッフル
  const shuffled = [...pool]
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
  }

  // 最大5枚引く（在庫が足りない時は少ない枚数）
  const drawn = shuffled.slice(0, 5)

  // 手札へ
  player.hand = drawn.map((u) => createUnitInstance(u))

  // 引いた分をプールから削除（物理在庫）
  for (const u of drawn) {
    const idx = game.sharedPool.findIndex((x) => x.id === u.id)
    if (idx !== -1) game.sharedPool.splice(idx, 1)
  }
}

/* =========================
   配置
========================= */
export function placeUnit(player: PlayerState, handIndex: number, boardIndex: number) {
  const unit = player.hand[handIndex]
  if (!unit) return false
  if (player.pp < unit.cost) return false
  if (!canPlaceAt(player.board, boardIndex)) return false
  // 盤面数チェック
  const currentUnits = player.board.filter(u => u !== null).length
  if (currentUnits >= player.maxBoardUnits) return false

  const row = getRowByIndex(boardIndex)
  if (unit.placement === "front_only" && row !== "front") return false

  const battleUnit = createBattleUnit(unit, boardIndex, "p1")

  player.board[boardIndex] = battleUnit
  player.pp -= unit.cost

  if ((unit as any).isHero || unit.mode === "hero") {
    player.activeHeroThisTurn = null
  }

  // 手札から消す（※ プールへは戻さない）
  player.hand.splice(handIndex, 1)
  return true
}

/* =========================
   売却（最終仕様）
   - ユニットカードは共有プールへ戻る（物理在庫）
   - 装備はequipmentStockへ（カードとしては場に残る＝プールへ戻さない）
========================= */
export function sellUnit(game: GameState, player: PlayerState, boardIndex: number) {
  const unit = player.board[boardIndex]
  if (!unit) return false

     // ヒーローは売却不可
  if (unit.mode === "hero") {
  return false
}

   // ★ relicは消滅（プールに戻さない）
  if ((unit as any).ephemeral) {
    player.board[boardIndex] = null
    return true
  }
  for (const equip of unit.equipments) {

    if (equip.ephemeral) {
    continue
  }
    player.equipmentStock.push(equip)
  }

  player.pp = Math.min(player.maxPP, player.pp + unit.cost)
  player.board[boardIndex] = null

  // ユニット本体カードをプールへ返却
  game.sharedPool.push(getTemplateById(unit.unitId))

  return true
}

export const sellUnitWithEquipments = sellUnit
export const sellUnitToEquipmentStock = sellUnit

/* =========================
   Ability収集（Unit側から装備/シナジー分も集める）
========================= */
export function collectAbilitiesFromUnit(unit: Unit, activeSynergies: Unit[] = []): Ability[] {
  const abilities: Ability[] = []

  if (unit.abilities) abilities.push(...unit.abilities)

  for (const eq of unit.equipments ?? []) {
    if (eq.abilities) abilities.push(...eq.abilities)
  }

  for (const synergy of activeSynergies) {
    if (synergy.variants?.synergy?.abilities) {
      abilities.push(...synergy.variants.synergy.abilities)
    }
  }

  return abilities
}

/* =========================
   バトル用盤面生成（BattleUnit → BattleUnit）
========================= */

export function createBattleBoard(
  player: PlayerState,
  side: "p1" | "p2"
): (BattleUnit | null)[] {
  return player.board.map((u, i) => {
    if (!u) return null

    const rowIndex = Math.floor(i / BATTLE_COLS)
    const colIndex = i % BATTLE_COLS

    // =========================
    // 戦闘時の統合盤面
    // 上側: p2 (0..3)
    // 下側: p1 (4..7)
    //
    // 前列が中央寄りになるように配置
    // p2: 3..0
    // p1: 4..7
    // =========================
    const finalR =
      side === "p1"
        ? PLAYER_ROWS + rowIndex          // 4..7
        : PLAYER_ROWS - 1 - rowIndex      // 3..0

    const finalC = colIndex

    const cloned: BattleUnit = structuredClone(u)

    cloned.index = i
    cloned.side = side

    cloned.states = structuredClone(u.states ?? [])
cloned.timedModifiers = []

cloned.hp = cloned.maxHp

    // front/back は元の盤面意味を維持
    cloned.row = u.row ?? getRowByIndex(i)

    cloned.pos = {
      r: finalR,
      c: finalC,
    }

    cloned.prevPos = undefined
    cloned.currentTargetId = undefined
    cloned.isDying = false

    cloned.damageDealt = 0
    cloned.damageTaken = 0

    const safeAS =
      Number.isFinite(cloned.attackSpeed) && cloned.attackSpeed > 0
        ? cloned.attackSpeed
        : 1

    const attackInterval = BASE_INTERVAL / safeAS
    cloned.nextActionTime = Math.random() * attackInterval

    return cloned
  })
}

/* =========================
   リロール（物理在庫）
   - drawHand が「未使用手札を返却→引き直し」までやる
========================= */
export function rerollHand(game: GameState, player: PlayerState) {
  // 無料チャージ優先
  if (player.rerollCharges > 0) {
    player.rerollCharges -= 1
    drawHand(game, player)
    injectHeroAs6th(player)
    return true
  }

  // なければ PP 消費
  if (player.pp < 1) return false
  player.pp -= 1

  drawHand(game, player)
  injectHeroAs6th(player)
  return true
}

function collectSynergyTeamAbilities(player: PlayerState): Ability[] {
  const list: Ability[] = []

  for (const s of player.synergies) {
    const abs = s.variants?.synergy?.abilities ?? []
    for (const a of abs) {
      if (a.scope === "team") list.push(structuredClone(a))
    }
  }
  return list
}

/* =========================
   バトル開始（最新版）
========================= */
export function startBattleVs(game: GameState, p1: PlayerState, p2: PlayerState) {
  p1.phase = "battle"
  p2.phase = "battle"

  const p1BattleBoard = createBattleBoard(p1, "p1")
  const p2BattleBoard = createBattleBoard(p2, "p2")

  const battleLogs: BattleLog[] = []
  const initialBattleBoard: (BattleUnit | null)[] = [
  ...p2BattleBoard.map((u) => (u ? structuredClone(u) : null)),
  ...p1BattleBoard.map((u) => (u ? structuredClone(u) : null)),
]


  const battleState: BattleState = {
    p1Units: p1BattleBoard,
    p2Units: p2BattleBoard,
    p1Player: p1,
    p2Player: p2,
    p1DebugLogs: p1.debugBattleLogs,
    p2DebugLogs: p2.debugBattleLogs,
    battleLogs,
    guard: 0,
    maxTurns: 200,
    finished: false,
    gameState: game,
    now: 0,
    suddenDeath: false,
    winner: null,
    counters: {
      p1: {},
      p2: {},
    },
    abilityTriggerCounts: {},
    firstDeathResolved: false,

    teamAbilities: {
      p1: collectSynergyTeamAbilities(p1),
      p2: collectSynergyTeamAbilities(p2),
    },
  }

const result = runBattle(battleState, battleLogs, p1, p2)

  p1.lastBattleLogs = result.logs
  p2.lastBattleLogs = result.logs

  p1.battleResult = {
    p1: p1BattleBoard.filter((u) => u !== null),
    p2: p2BattleBoard.filter((u) => u !== null),
  }

  p2.battleResult = p1.battleResult

  return {
  ...result,
  initialBoard: initialBattleBoard,
}
}

/* =========================
   オート配置（デバッグ）
   - これは敵AI用。盤面に置くだけ（プール管理は別でやる）
========================= */
export function autoPlace(player: PlayerState, packId: PackId) {
  const units = PACK_UNITS[packId]

  if (!units) {
    throw new Error("Invalid packId: " + packId)
  }

  player.board = player.board.map((_, i) =>
    i < 6
      ? createBattleUnit(
          createUnitInstance(units[i % units.length]),
          i, "p2"
        )
      : null
  )
}
/* =========================
   装備反映（BattleUnitへ即反映）
========================= */
function applyEquipmentToBattleUnit(target: BattleUnit, equip: Unit) {
  // equipment baseStats（恒久加算）
  const bs = equip.variants?.equipment?.baseStats
  if (bs) {
    if (typeof bs.atk === "number" && bs.atk !== 0) {
      target.atk += bs.atk
      target.baseAtk += bs.atk
    }
    if (typeof bs.hp === "number" && bs.hp !== 0) {
      target.hp += bs.hp
      target.maxHp += bs.hp
      target.baseMaxHp += bs.hp
    }
  }

  for (const e of equip.effects ?? []) {
    if (e.kind === "stat") {
      switch (e.stat) {
        case "hp":
          target.hp += e.value
          target.maxHp += e.value
          break
        case "atk":
          target.atk += e.value
          break
        case "attackSpeed":
          target.attackSpeed += e.value
          break
        case "damageReduce":
          addState(target, {
            id: `equip_dr_${Date.now()}_${Math.random()}`,
            type: "damage_reduce",
            value: e.value,
          })
          break
      }
    }

    if (e.kind === "keyword" && e.key === "once") {
      if (e.stat === "damageReduce") {
        addState(target, {
          id: `equip_once_dr_${Date.now()}_${Math.random()}`,
          type: "damage_reduce",
          value: e.value,
          consumeOn: "onDamageTaken",
        })
      }
    }
  }

  if (equip.abilities && equip.abilities.length > 0) {
  const combatAbilities = structuredClone(equip.abilities).filter(
    (a) =>
      a.trigger !== "onEquip"
  )

  if (combatAbilities.length > 0) {
    target.abilities ??= []
    target.abilities.push(...combatAbilities)
  }
}
}

export function getPreviewStat(u: Unit, stat: Stat): number {
  let base = 0
  if (stat === "hp") base = u.hp
  if (stat === "atk") base = u.atk

  let bonus = 0
  for (const e of u.effects ?? []) {
    if (e.kind === "stat" && e.stat === stat) bonus += e.value
  }

  return base + bonus
}

/* =========================
   装備（コスト消費 / Hand→Equip）
   - 手札から消す（※ プールへは戻さない＝在庫から消費済み）
========================= */
export function equipUnitWithCost(player: PlayerState, handIndex: number, boardIndex: number) {
  const base = player.hand[handIndex]
  const target = player.board[boardIndex]
  if (!base || !target) return false
  if (player.pp < base.cost) return false
  if (target.equipments.length >= 3) return false

  player.pp -= base.cost

  const equip = toEquipment(base)
  target.equipments.push(equip)

  // 即反映
  applyEquipmentToBattleUnit(target, equip)

 runAbilities("onEquip", target, {
  allies: player.board.filter((u): u is BattleUnit => u !== null),
  enemies: [],
  now: 0,
  playerState: player
})

  if ((base as any).isHero || base.mode === "hero") {
  player.activeHeroThisTurn = null
}

  // 手札から消す（プールへ戻さない）
  player.hand.splice(handIndex, 1)
  return true
}

/* =========================
   装備ストック → 装備
========================= */
export function equipFromStock(player: PlayerState, stockIndex: number, boardIndex: number) {
  const equip = player.equipmentStock[stockIndex]
  const target = player.board[boardIndex]
  if (!equip || !target) return false
  if (target.equipments.length >= 3) return false

  target.equipments.push(equip)
  applyEquipmentToBattleUnit(target, equip)

  player.equipmentStock.splice(stockIndex, 1)

  runAbilities("onEquip", target, {
    allies: player.board.filter((u): u is BattleUnit => u !== null),
    enemies: [],
    now: 0,
    playerState: player
  })

  return true
}

/* =========================
   シナジー
   - 1ターンに1回だけ貼れる
   - スロット溢れで外れたシナジーはプールへ戻す（物理在庫）
========================= */
export function addSynergy(game: GameState, player: PlayerState, handIndex: number) {
  if (player.synergyUsedThisTurn) return false

  const unit = player.hand[handIndex]
  if (!unit) return false

  const synergy = toSynergy(unit)

  if (player.synergies.length < 2) {
    player.synergies.push(synergy)
  } else {
    const removed = player.synergies.shift()
    if (removed) {
      // removedのidは元ユニットIDなのでテンプレ返却
      game.sharedPool.push(getTemplateById(removed.id))
    }
    player.synergies.push(synergy)
  }

  applySynergyAura(player, synergy)
  rebuildSynergyAbilitiesOnBoard(player)

  if ((unit as any).isHero || unit.mode === "hero") {
  player.activeHeroThisTurn = null
}

  // 手札から消す（プールへ戻さない）
  player.hand.splice(handIndex, 1)

  player.synergyUsedThisTurn = true
  return true
}

function applySynergyAura(player: PlayerState, synergy: Unit) {
  for (const e of synergy.effects ?? []) {
    if (e.kind !== "aura") continue

    for (const unit of player.board) {
      if (!unit) continue

      switch (e.stat) {
        case "hp":
          addState(unit, {
            id: `syn_hp_${Date.now()}_${Math.random()}`,
            type: "hp",
            value: e.value,
          })
          break

        case "atk":
          addState(unit, {
            id: `syn_atk_${Date.now()}_${Math.random()}`,
            type: "atk",
            value: e.value,
          })
          break

        case "attackSpeed":
          addState(unit, {
            id: `syn_as_${Date.now()}_${Math.random()}`,
            type: "as_stack",
            value: e.value,
          })
          break

        case "damageReduce":
          addState(unit, {
            id: `syn_dr_${Date.now()}_${Math.random()}`,
            type: "damage_reduce",
            value: e.value,
          })
          break
      }
    }
  }
}

/* =========================
   変換（ユニット → 装備/シナジー）
========================= */
export function toEquipment(u: Unit): Unit {
  const equipmentVariant = u.variants?.equipment
  if (!equipmentVariant) {
    console.warn("[toEquipment] equipmentVariant is missing:", u.id, u.name)
  }

  return {
    ...u,
    mode: "equipment",
    name: equipmentVariant?.name ?? u.name,
    effects: structuredClone(equipmentVariant?.effects ?? []),
    abilities: structuredClone(equipmentVariant?.abilities ?? []),
    variants: {
      equipment: structuredClone(equipmentVariant)
    },
    hp: 0,
    atk: 0,
    equipments: [],
  }
}

function toSynergy(u: Unit): Unit {
  const synergyVariant = u.variants?.synergy
  const name = synergyVariant?.name ?? `${u.baseName}のシナジー`
  const effects = synergyVariant?.effects ?? [{ kind: "aura", stat: "atk", value: 1 }]

  return {
    ...u,
    mode: "synergy",
    name,
    hp: 0,
    atk: 0,
    effects,
    equipments: [],
  }
}

function rebuildSynergyAbilitiesOnBoard(player: PlayerState) {
  // ① シナジー由来を削除
  for (const u of player.board) {
    if (!u) continue
    u.abilities = (u.abilities ?? []).filter(
      (a) => !(a as any).__fromSynergy
    )
  }

}
