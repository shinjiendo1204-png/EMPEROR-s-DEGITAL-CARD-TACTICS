// src/lib/battle/abilityRunner.ts
import {
  Unit,
  Ability,
  AbilityEffect,
  AbilityTarget,
  BattleTrigger,
  BattleUnit,
  BattleStateEffect,
  PlayerState,
  GameState,
  BattleLog,
} from "@/types"
import { checkCondition } from "./condition"
import { addState } from "./stateEffects"
import { calculateFinalStats } from "./statCalculator"
import {BattleState} from "./state"
import { HERO_UNITS } from "@/data/heroes"
import {
  ANTIQUA_RELICS_T1,
  ANTIQUA_RELICS_T2,
  ANTIQUA_RELICS_T3
} from "@/data/relics"
import { generateRelicByTier } from "./relicUtil"
import { BATTLE_COLS } from "./boardsize"
import { VARKESH_TOKENS } from "@/data/tokens/varkeshTokens"
import { createBattleUnit } from "@/lib/game"
import { incrementCounter, getCounter } from "./counterManager"
import { ANCIENT_WEAPONS } from "@/data/ancientWeapons"
import { toEquipment } from "@/lib/game"

const relicPoolT1 = ANTIQUA_RELICS_T1
const relicPoolT2 = ANTIQUA_RELICS_T2
const relicPoolT3 = ANTIQUA_RELICS_T3
/* =========================
   Context
========================= */
export type AbilityContext = {
  actor?: BattleUnit
  target?: BattleUnit
  allies: BattleUnit[]
  enemies: BattleUnit[]
  deadUnit?: BattleUnit
  now: number
  battleState?: BattleState
  playerState?: PlayerState
  gameState?: GameState
  battleLogs?: BattleLog[]
  isTeam?: boolean
  leader?: BattleUnit
}

const MIN_AS = 0.05
const MAX_AS = 5

const MAX_LOG = 300

function pushLog(context: AbilityContext, log: any) {
  if (!context.battleLogs) return

  if (context.battleLogs.length >= 400) {
    context.battleLogs.shift()
  }

  context.battleLogs.push(log)
}


function abilityKey(unit: BattleUnit, ability: Ability, index: number) {
  const aid = ability.id ?? `idx_${index}`
  return `${unit.instanceId}_${aid}`
}

function pickRandom<T>(arr: T[]): T | null {
  if (!arr.length) return null
  return arr[Math.floor(Math.random() * arr.length)]
}

function isAlive(u: BattleUnit) {
  return u.hp > 0
}


/* =========================
   ★ 吸収完成チェック用
========================= */

const ABSORB_ROLE_STATES = [
  "absorbed_tank",
  "absorbed_bruiser",
  "absorbed_skirmisher",
  "absorbed_ranged",
  "absorbed_support",
] as const

function hasStateType(u: BattleUnit, type: string) {
  return (u.states ?? []).some(s => s.type === type)
}

function hasAllAbsorbedRoles(u: BattleUnit) {
  return ABSORB_ROLE_STATES.every(t => hasStateType(u, t))
}

/* =========================
   Main Runner
========================= */
export function runAbilities(
  trigger: BattleTrigger,
  unit: BattleUnit,
  context: AbilityContext
) {
  
  const t: BattleTrigger = trigger

  // =========================
  // abilities構築
  // =========================
  let abilities: Ability[] = [...(unit.abilities ?? [])]

  if (!abilities.length) return

  // =========================
  // 再帰ガード
  // =========================
  ;(unit as any).__abilityDepth = (unit as any).__abilityDepth ?? 0
;(unit as any).__abilityDepth++

try {
  if ((unit as any).__abilityDepth > 5) {
    return
  }

    if (t !== "onDeath" && t !== "battleEnd" && !isAlive(unit)) return

  

for (let i = 0; i < abilities.length; i++) {
  const ability = abilities[i]
  // trigger一致
  if (ability.trigger !== t) continue

  if (t === "battleStart" && (unit as any).__abilityDepth > 1) {
    continue
  }

  if (ability.trigger !== trigger) continue
      if (ability.scope === "team") {
   
      if (context.leader && unit.instanceId !== context.leader.instanceId) {
        continue
      }

      if (!context.isTeam) continue
    }

      if (ability.once && ability.used) continue

      // =========================
      // 🔥 auraTick（最優先）
      // =========================
      if (t === "auraTick" && ability.tick) {
        const tick = ability.tick

        const tickKey = `__tick_${ability.id ?? i}`
        const last = (unit as any)[tickKey] ?? 0
        const interval = tick.seconds * 1000

        if (context.now - last < interval) continue

        if (
          tick.maxStack !== undefined &&
          (ability.__stackCount ?? 0) >= tick.maxStack
        ) continue

        ;(unit as any)[tickKey] = context.now
        ability.__stackCount = (ability.__stackCount ?? 0) + 1
      }

      // =========================
      // condition
      // =========================
      if (!checkCondition(unit, ability.condition, context)) continue

      // =========================
      // onDeath counter
      // =========================
      if (t === "onDeath") {
        const isSelfDeath = context.deadUnit?.instanceId === unit.instanceId
        const isOtherDeath = context.deadUnit && context.deadUnit.instanceId !== unit.instanceId

        // --- ここを修正 ---
        // 1. 条件なし（遺言）なのに、死んだのが自分じゃないならスキップ
        if (!ability.condition && !isSelfDeath) continue

        // 2. deadAlly 条件なのに、死んだのが他人じゃないならスキップ
        if (ability.condition === "deadAlly" && !isOtherDeath) continue
        incrementCounter(context, unit.side, "onDeath", "match", 1)
        incrementCounter(context, unit.side, "onDeath", "battle", 1)

        pushLog(context, {
          action: "counter",
          key: "onDeath",
          value: 1,
          scope: "battle",
          instanceId: unit.instanceId,
          time: context.now,
          side: unit.side,
        })
      }
      // =========================
      // maxTriggers
      // =========================
      if (ability.maxTriggers && context.battleState) {
        const k = abilityKey(unit, ability, i)

        const count =
          context.battleState.abilityTriggerCounts[k] ?? 0

        if (count >= ability.maxTriggers) continue

        context.battleState.abilityTriggerCounts[k] = count + 1
      }

      // =========================
      // duration init
      // =========================
      if (
        ability.duration &&
        ability.__expiresAt === undefined &&
        ability.__remainingTurns === undefined
      ) {
        const d = ability.duration
        if (d.type === "time") ability.__expiresAt = context.now + d.value
        if (d.type === "turn") ability.__remainingTurns = d.value
      }

      // delay
      if (ability.delay?.type === "time") {
        if (context.now < ability.delay.value) continue
      }

      // duration check
      if (ability.__expiresAt !== undefined) {
        if (context.now >= ability.__expiresAt) continue
      }
      if (ability.__remainingTurns !== undefined) {
        if (ability.__remainingTurns <= 0) continue
      }

      // 生存チェック
      if (t !== "onDeath" && t !== "battleEnd" && !isAlive(unit)) {
        break;
      }

      // =========================
      // ログ（auraTickは除外）
      // =========================
      if (t !== "auraTick") {
        pushLog(context, {
          action: "ability",
          abilityId: ability.id,
          unit: unit.unitName,
          trigger: t,
          side: unit.side,
          time: context.now
        })
      }

      // =========================
      // 実行
      // =========================
      if (ability.scope === "team") {
        const effects = ability.effects ?? []

        const groupEffects = effects.filter(e => isGroupTarget(e.target))
        if (groupEffects.length > 0) {
          applyAbilityEffects(
            { ...ability, effects: groupEffects },
            unit,
            unit,
            context
          )
        }

        const perAllyEffects = effects.filter(e => !isGroupTarget(e.target))
        if (perAllyEffects.length > 0) {
          for (const ally of context.allies) {
            if (!isAlive(ally)) continue
            applyAbilityEffects(
              { ...ability, effects: perAllyEffects },
              unit,
              ally,
              context
            )
          }
        }
      } else {
        applyAbilityEffects(ability, unit, unit, context)
      }

      // turn duration
      if (ability.duration?.type === "turn") {
        if (ability.__remainingTurns !== undefined) {
          ability.__remainingTurns -= 1
        }
      }

      if (ability.once) ability.used = true
    }

  } finally {
    ;(unit as any).__abilityDepth--
  }
}
/* =========================
   Effect Wrapper
========================= */

// ★ target不要effect判定（ここで一元管理）
function isNonTargetEffect(effect: AbilityEffect): boolean {
  return (
    effect.type === "INCREMENT_COUNTER" ||
    effect.type === "CLAIM_HERO" ||
    effect.type === "DIG_RELIC"
  )
}

// abilityRunner.ts 内

// abilityRunner.ts 内

function applyAbilityEffects(
  ability: Ability,
  source: BattleUnit,
  baseTarget: BattleUnit,
  context: AbilityContext
) {
  for (const effect of ability.effects ?? []) {
    if (isNonTargetEffect(effect)) {
      applyAbilityEffect(effect, source, source, context)
      continue
    }

    const targets = resolveTargets(effect.target, baseTarget, context, effect)
     
    for (const t of targets) {
      // ★ ここを修正！！
      // 修正前: if (!isAlive(t)) continue;
      // 修正後: 
      // 1. 攻撃対象(t)が生きていることは必須（死体に追い打ちはしない）
      // 2. ただし、自分(source)が死んでいるかどうかは、onDeathの時は無視する
      
      if (!isAlive(t)) continue; 

      applyAbilityEffect(effect, source, t, context);
    }
  }
}

export function applyExpiredTimedModifiers(unit: BattleUnit, now: number) {
  if (!unit.timedModifiers?.length) return

  unit.timedModifiers = unit.timedModifiers.filter(mod => {
    if (now < mod.expiresAt) return true

    if (mod.stat === "attackRange" && mod.__restoreRange) {
      unit.attackRange = mod.__restoreRange
    }

    return false
  })
}

function isGroupTarget(t?: AbilityTarget): boolean {
  const tt = t ?? "self"

  return (
    tt === "all_allies" ||
    tt === "all_enemies" ||
    tt === "all_units" ||
    tt === "front_allies" ||
    tt === "back_allies" ||
    tt === "type:ranged" ||
    tt === "type:tank" ||
    tt === "front_tanks" ||
    tt === "all_other_allies" ||
    tt === "equipped_allies" 

  )
}

/* =========================
   Target Resolver
========================= */
function resolveTargets(
  target: AbilityTarget | undefined,
  source: BattleUnit,
  context: AbilityContext,
  effect?: AbilityEffect
): BattleUnit[] {
  const t = target ?? "self"

  switch (t) {
    case "self":
      return [source]

    case "target":
      return context.target ? [context.target] : []

    case "all_allies":
      return context.allies

    case "all_enemies":
      return context.enemies

    case "all_units":
      return [...context.allies, ...context.enemies]

    case "front_allies":
      return context.allies.filter(u => u.row === "front")

    case "back_allies":
      return context.allies.filter(u => u.row === "back")

    case "type:ranged":
      return context.allies.filter(u => u.role === "ranged")

    case "type:tank":
      return context.allies.filter(u => u.role === "tank")

    case "front_tanks":
      return context.allies.filter(u => u.row === "front" && u.role === "tank")

    case "random_enemy": {
      const alive = context.enemies.filter(isAlive)
      const picked = pickRandom(alive)
      return picked ? [picked] : []
    }

    case "random_ally": {
      const alive = context.allies.filter(isAlive)
      const picked = pickRandom(alive)
      return picked ? [picked] : []
    }

    case "lowest_hp_ally": {
      const alive = context.allies.filter(isAlive)
      if (!alive.length) return []
      return [alive.reduce((a, b) => (a.hp < b.hp ? a : b))]
    }

    case "lowest_as_ally": {
      const alive = context.allies.filter(isAlive)
      if (!alive.length) return []
      return [
        alive.reduce((a, b) => {
          const aAS = calculateFinalStats(a, context.now).attackSpeed
          const bAS = calculateFinalStats(b, context.now).attackSpeed
          return aAS < bAS ? a : b
        }),
      ]
    }

    case "allies_below_hp_percent": {
      const percent = effect?.targetHpPercent ?? 0.5
      return context.allies.filter(u => isAlive(u) && u.hp <= u.maxHp * percent)
    }

    case "highest_atk_ally": {
      const alive = context.allies.filter(isAlive)
      if (!alive.length) return []

      return [
        alive.reduce((a, b) => {
          const aAtk = calculateFinalStats(a, context.now).atk
          const bAtk = calculateFinalStats(b, context.now).atk
          return aAtk >= bAtk ? a : b
        }),
      ]
    }
    case "equipped_enemy": {
  return context.enemies.filter(
    u => isAlive(u) && (u.equipments?.length ?? 0) > 0
  )
}
case "equipped_allies": {
  return context.allies.filter(
    u => isAlive(u) && (u.equipments?.length ?? 0) > 0
  )
}

    case "enemy_column": {

  const base = context.target
  if (!base || !base.pos) return []

  const col = base.pos.c

  return context.enemies.filter(e =>
    e.pos && e.pos.c === col && isAlive(e)
  )
}

    case "adjacent_enemies": {

      const base = context.target
      if (!base || !base.pos) return []

      const baseRow = base.pos.r
      const baseCol = base.pos.c

      return context.enemies.filter(e => {

        if (!e.pos) return false
        if (e.instanceId === base.instanceId) return false

        const r = e.pos.r
        const c = e.pos.c

        return (
          Math.abs(r - baseRow) <= 1 &&
          Math.abs(c - baseCol) <= 1 &&
          isAlive(e)
        )

      })
    }
    case "highest_range_ally": {
      const alive = context.allies.filter(isAlive)
      if (!alive.length) return []

      const bestRank = Math.max(
        ...alive.map(u => u.attackRange )
      )

      const candidates = alive.filter(
        u => u.attackRange === bestRank
      )

      const picked = pickRandom(candidates)
      return picked ? [picked] : []
    }

    case "highest_hp_enemy": {
      const alive = context.enemies.filter(isAlive)
      if (!alive.length) return []
      return [alive.reduce((a, b) => (a.hp > b.hp ? a : b))]
    }

    

    case "all_other_allies":
      return context.allies.filter(u => u.instanceId !== source.instanceId)

    default:
      return [source]
  }
}
function pushDamageLog(
  context: AbilityContext,
  target: BattleUnit,
  value: number,
  source?: string
) {
  if (value <= 0) return

  pushLog(context, {
    action: "damage",
    instanceId: target.instanceId,
    value,
    source,
    time: context.now,
    side: target.side,
  })
}

function pushHealLog(
  context: AbilityContext,
  target: BattleUnit,
  value: number,
  source?: string
) {
  if (value <= 0) return

  pushLog(context, {
    action: "heal",
    instanceId: target.instanceId,
    value,
    source,
    time: context.now,
    side: target.side,
  })
}
/* =========================
   Effect Applier
========================= */
function applyAbilityEffect(
  effect: AbilityEffect,
  source: BattleUnit,
  target: BattleUnit,
  context: AbilityContext
) {
  switch (effect.type) {
    
  case "CLAIM_HERO": {


  if (!context.playerState) break
  if (!context.gameState) break

  const hero = HERO_UNITS.find(h => h.id === effect.heroId)
  if (!hero) break

  // 既に誰かが取得している
  if (context.gameState.claimedHeroes[hero.id]) break

  // 既にこのプレイヤーがヒーロー保留している
  if (context.playerState.pendingHero) break

  context.playerState.pendingHero = hero
  context.gameState.claimedHeroes[hero.id] = source.side

  // 🔥 これを追加
  context.gameState.sharedPool =
    context.gameState.sharedPool.filter(u => u.id !== hero.id)
  break
}

    /* =========================
       通常ステータス変更（state化）
    ========================= */
 
    case "MOD_STAT": {
      const v = effect.value
      const expiresAt =
        effect.duration?.type === "time"
          ? context.now + effect.duration.value
          : undefined

      const toStateType = (
        stat: typeof effect.stat
      ): BattleStateEffect["type"] | null => {
        switch (stat) {
          case "atk": return "atk"
          case "hp": return "hp"
          case "attackSpeed": return "as_stack"
          case "damageReduce": return "damage_reduce"
          default: return null
        }
      }

      const stateType = toStateType(effect.stat)
      if (!stateType) break

      addState(target, {
        id: `mod_${stateType}_${Date.now()}_${Math.random()}`,
        type: stateType,
        value: v,
        expiresAt,
      })

      pushLog(context, {
        action: "add_state",
        instanceId: target.instanceId,
        stateType,
        value: v,
        time: context.now,
        side: target.side,
      })
      break
    }

    /* =========================
       ADD_STATE
    ========================= */
    case "ADD_STATE": {
  if (effect.stateType === "curse_stack") {
    const added = effect.value ?? 0

    const existing = (target.states ?? [])
      .filter(s => s.type === "curse_stack")
      .reduce((sum, s) => sum + (s.value ?? 0), 0)

    const next = Math.min(existing + added, 99)

    // 既存curse削除
    target.states = (target.states ?? []).filter(
      s => s.type !== "curse_stack"
    )

    addState(target, {
      id: `curse_${Date.now()}_${Math.random()}`,
      type: "curse_stack",
      value: next,
    })

    if (context.battleState) {
      incrementCounter(context, source.side, "teamCurseApplied", "battle", added)
      incrementCounter(context, source.side, "teamCurseApplied", "match", added)

      pushLog(context, {
        action: "counter",
        key: "teamCurseApplied",
        value: added,
        scope: "battle",
        instanceId: source.instanceId,
        time: context.now,
        side: source.side,
      })
    }

    break
  }

      const stateType = effect.stateType
      const value = effect.value ?? 0

      const expiresAt =
        effect.duration?.type === "time"
          ? context.now + effect.duration.value
          : undefined

      const existing = target.states?.filter(s => s.type === stateType) ?? []

      // 最大回数（例：最大3回）
      if (effect.maxStack !== undefined) {
        if (existing.length >= effect.maxStack) break
      }

      let valueToAdd = value

// ===== maxStack =====
if (effect.maxStack !== undefined) {
  if (existing.length >= effect.maxStack) break
}

// ===== maxTotalValue =====
if (effect.maxTotalValue !== undefined) {

  const total = existing.reduce((sum, s) => sum + (s.value ?? 0), 0)

  const remain = effect.maxTotalValue - total

  if (remain <= 0) break

  valueToAdd = Math.min(valueToAdd, remain)
}


if (valueToAdd <= 0) break

      const isAbsorbState =
        typeof stateType === "string" && stateType.startsWith("absorbed_")
      const isSelfTarget = target.instanceId === source.instanceId

      // 追加前に「完成してたか」
      const preAll =
        isAbsorbState && isSelfTarget ? hasAllAbsorbedRoles(target) : false

      // 「このロールをすでに吸収済みか」（= 吸収トリガーを1回だけにするため）
      const preHadThis =
        isAbsorbState && isSelfTarget ? existing.length > 0 : false

      addState(target, {
        id: `${stateType}_${Date.now()}_${Math.random()}`,
        type: stateType,
        value: valueToAdd,
        expiresAt,
        targetId: context.target?.instanceId,
        consumeOn: (effect as any).consumeOn ?? null,
      })

      if (stateType === "hp") {
        target.baseMaxHp = (target.baseMaxHp ?? 0) + valueToAdd;
        target.hp += valueToAdd; 
      }

      if (stateType === "atk") {
        target.baseAtk = (target.baseAtk ?? 0) + valueToAdd;
      }
      if (stateType === "damage_reduce" && target.side === source.side) {
    incrementCounter(context, source.side, "damageReduce", "match")
  }

  if (stateType === "as_stack" && target.side === source.side) {
    incrementCounter(context, source.side, "as_stack", "match")
  }


      // 吸収ごとの専用トリガー（数値はユニット側で自由に）
      // 例: absorbed_tank → onAbsorb_tank
      if (isAbsorbState && isSelfTarget) {
        const roleKey = String(stateType).replace("absorbed_", "")
        const absorbTrigger = `onAbsorb_${roleKey}`
        runAbilities(absorbTrigger as BattleTrigger, target, context)
      }

      // 全ロール吸収 完成トリガー
      if (isAbsorbState && isSelfTarget) {
        const postAll = hasAllAbsorbedRoles(target)
        if (!preAll && postAll) {
          runAbilities("onAllRolesAbsorbed" as BattleTrigger, target, context)
        }
      }

      pushLog(context, {
        action: "add_state",
        instanceId: target.instanceId,
        stateType,
        value: valueToAdd,
        time: context.now,
        side: target.side,
      })

      break
    }

    case "REMOVE_STATE": {
      target.states = (target.states ?? []).filter(
        s => s.type !== effect.stateType
      )
      break
    }

    case "DAMAGE_FROM_STATE": {
      const total = (source.states ?? [])
        .filter(s => s.type === effect.stateType)
        .reduce((sum, s) => sum + (s.value ?? 0), 0)

      const damage = total * effect.multiplier
      if (damage <= 0) break

      target.prevHp = target.hp
      target.hp -= damage

      pushLog(context, {
        action: "damage",
        instanceId: target.instanceId,
        damage: damage,

        unitId: source.unitId,
        unitName: source.unitName,
        side: source.side,

        time: context.now
      })

      if (target.hp < 0) target.hp = 0
      break
    }

   case "INCREMENT_COUNTER": {

  const value = effect.value ?? 1
  const scope = effect.scope ?? "battle"

  incrementCounter(context, source.side, effect.key, scope, value)

  pushLog(context, {
  action: "counter",
  key: effect.key,
  value,
  scope,
  instanceId: source.instanceId,
  time: context.now,
  side: source.side
})

  /* ===== Antiqua Dig System ===== */

  if (scope === "match" && effect.key === "dig") {

    if (!context.playerState) break

    const counters = context.playerState.counters.match

    counters["digProgress"] = (counters["digProgress"] ?? 0) + value
    counters["digTotal"] = (counters["digTotal"] ?? 0) + value

    while ((counters["digProgress"] ?? 0) >= 3) {

      counters["digProgress"] -= 3

      const relic = generateRelicByTier(context.playerState)

      if (relic) {
        context.playerState.equipmentStock.push(structuredClone(relic))
      }
    }
  }

  break
}

  case "DAMAGE_FROM_COUNTER": {

  const scope = effect.scope ?? "battle"
  const key = effect.key

  const count = getCounter(context, source.side, key, scope)

  // ★ これを一時的に入れてください
  console.log("--- DAMAGE_FROM_COUNTER DEBUG ---", {
    unit: source.unitId,
    side: source.side,
    key: key,
    count: count,
    multiplier: effect.multiplier,
    finalDamage: count * effect.multiplier
  });
  const damage = count * effect.multiplier
  if (damage <= 0) break

  target.prevHp = target.hp
  target.hp -= damage

  const isTeamBased = key === "teamSelfDamage" // ★ここ

  pushLog(context, {
    action: "damage",
    instanceId: target.instanceId,
    damage: damage,

    unitId: isTeamBased
      ? "team_self_damage"
      : source.unitId,

    unitName: isTeamBased
      ? "自傷ダメージ"
      : source.unitName,

    side: source.side,
    source: isTeamBased ? "team" : "unit",

    time: context.now
  })

  if (target.hp < 0) target.hp = 0

  break
}
case "MOD_STAT_FROM_COUNTER": {

  const key = effect.key
  const scope = effect.scope ?? "battle"

  let counter = 0

  if (scope === "battle") {
    counter = context.battleState?.counters?.[source.side]?.[key] ?? 0
  }

  if (scope === "match") {
    const player =
      source.side === "p1"
        ? context.battleState?.p1Player
        : context.battleState?.p2Player

    counter = player?.counters?.match?.[key] ?? 0
  }

  const raw = counter

const capped = effect.maxStack !== undefined
  ? Math.min(raw, effect.maxStack)
  : raw

const amount = capped * (effect.multiplier ?? 1)
  if (amount === 0) break

  // ★ ここにそのまま持ってくる
  const toStateType = (
    stat: typeof effect.stat
  ): BattleStateEffect["type"] | null => {
    switch (stat) {
      case "atk":
        return "atk"
      case "hp":
        return "hp"
      case "attackSpeed":
        return "as_stack"
      case "damageReduce":
        return "damage_reduce"
      default:
        return null
    }
  }

  const stateType = toStateType(effect.stat)
  if (!stateType) break

  addState(target, {
    id: `counter_${stateType}_${Date.now()}_${Math.random()}`,
    type: stateType,
    value: amount
  })

  break
}
  
    case "HEAL": {

  const amount = effect.value ?? 0

  const before = target.hp

  target.hp = Math.min(target.maxHp, target.hp + amount)

  const healed = target.hp - before

  if (healed > 0) {
  pushLog(context, {
    action: "heal",
    instanceId: target.instanceId,
    value: healed,
    time: context.now
  })
}

  break
}
     case "SELF_DAMAGE": {
  const amount = effect.value ?? 0

  source.hp -= amount
  if (source.hp < 0) source.hp = 0

  incrementCounter(context, source.side, "selfDamage", "match", 1)
  incrementCounter(context, source.side, "selfDamage", "battle", 1)

  pushLog(context, {
    action: "self_damage", 
    value: amount,         
    instanceId: source.instanceId,
    time: context.now,
    side: source.side,
  })

  runAbilities("onSelfDamage", source, context)
  break
}
      case "DESTROY_EQUIPMENT": {
  const unit = target

  if (!unit.equipments?.length) break

  const removed = unit.equipments

  for (const eq of removed) {

    const bs = eq.variants?.equipment?.baseStats

    if (bs?.atk) {
      unit.atk -= bs.atk
      unit.baseAtk -= bs.atk
    }

    if (bs?.hp) {
      unit.maxHp -= bs.hp
      unit.baseMaxHp -= bs.hp
      if (unit.hp > unit.maxHp) unit.hp = unit.maxHp
    }

    // ability削除
    if (eq.abilities?.length && unit.abilities) {
      const ids = new Set(eq.abilities.map(a => a.id))
      unit.abilities = unit.abilities.filter(a => !ids.has(a.id))
    }
  }

  // equip由来state削除
  unit.states = (unit.states ?? []).filter(
    s => !s.id.startsWith("equip_")
  )

  const count = removed.length
  unit.equipments = []

  incrementCounter(
    context,
    source.side,
    effect.counterKey ?? "equipmentDestroyed",
    "match",
    count
  )

  break
}

case "CREATE_ANCIENT_WEAPON": {
  if (!context.playerState) break

  const owned = context.playerState.ancientWeapons ?? []

  // 3枚揃ったら終了
  if (owned.length >= 3) break

  const available = ANCIENT_WEAPONS.filter(w => !owned.includes(w.id))
  if (!available.length) break

  const pick =
    available[Math.floor(Math.random() * available.length)]

  const equip = toEquipment(structuredClone(pick))
  context.playerState.equipmentStock.push(equip)

  owned.push(pick.id)
  context.playerState.ancientWeapons = owned

  if (owned.length >= 3) {
    source.ancientForgeComplete = true
  }

  break
}
  
      case "HEAL_PERCENT": {

  const amount = Math.floor(target.maxHp * effect.value)

  const before = target.hp

  target.hp = Math.min(target.maxHp, target.hp + amount)

  const healed = target.hp - before

  if (healed > 0) {

    pushLog(context, {
      action: "heal",
      instanceId: target.instanceId,
      value: healed,
      time: context.now
    })

  }

  break
}
    case "GUARD_ADJACENT": {
      ;(target as any).guardAdjacent = {
        once: (effect as any).once,
        used: false,
      }
      break
    }
    case "TAUNT_ALL": {

      addState(target, {
        id: `taunt_${Date.now()}_${Math.random()}`,
        type: "taunt"
      })

      break
    }

    case "SET_ATTACK_RANGE": {

  const prev = target.attackRange

  if (effect.value === "next") {
    target.attackRange += 1
  } else {
    target.attackRange = effect.value
  }

  if (effect.duration?.type === "time") {

    const expiresAt = context.now + effect.duration.value

    target.timedModifiers ??= []

    target.timedModifiers.push({
      stat: "attackRange",
      value: 0,
      expiresAt,
      __restoreRange: prev,
    })
  }

  break
}
    case "DAMAGE": {

  const raw = effect.value ?? 0

  const tStats = calculateFinalStats(target, context.now)
  const dr = tStats.damageReduce ?? 0

  const dealt = Math.max(0, raw - dr)

  target.prevHp = target.hp
  target.hp -= dealt
  if (target.hp < 0) target.hp = 0

  pushLog(context, {
    action: "damage",
    instanceId: target.instanceId,
    damage: dealt,

    unitId: source.unitId,      
    unitName: source.unitName,  
    side: source.side,          

    time: context.now
  })

  break
}
 case "DIG_RELIC": {

  if (!context.playerState) break

  const relic = generateRelicByTier(context.playerState)

  if (relic) {
    context.playerState.equipmentStock.push(relic)
  }

  break
}
case "SUMMON": {
  if (effect.type !== "SUMMON") break;
  const state = context.battleState as any;
  if (!state) break;

  const side = context.target?.side ?? source.side;
  const unitData = VARKESH_TOKENS.find((u: Unit) => u.id === effect.unitId);
  if (!unitData) break;

  // 1. 召喚先の配列を特定
  const targetUnits = side === "p1" ? state.p1Units : state.p2Units;
  let emptyIndex = -1;

  // 2. 【改善】死んだユニットの場所をまずチェックする
  const deadPos = context.target?.pos;
  const preferredIdx = deadPos ? (deadPos.r * BATTLE_COLS + deadPos.c) : -1;

  if (preferredIdx !== -1 && !targetUnits[preferredIdx]) {
    // 死んだ場所が空いていればそこを使う
    emptyIndex = preferredIdx;
  } else {
    // 空いていなければ、配列の「後ろから（自分の陣地の手前から）」探す
    // これで「相手の一番奥」から出る現象を防ぎます
    for (let i = targetUnits.length - 1; i >= 0; i--) {
      if (!targetUnits[i]) {
        emptyIndex = i;
        break;
      }
    }
  }

  if (emptyIndex === -1) break; // 満員なら終了

  // 3. ユニット生成
  const summoned = createBattleUnit(unitData, emptyIndex, side);
  summoned.pos = {
    r: Math.floor(emptyIndex / BATTLE_COLS),
    c: emptyIndex % BATTLE_COLS
  };
  summoned.prevPos = { ...summoned.pos }; // アニメーション用
  summoned.index = emptyIndex;

  // 4. 内部状態の更新（配列のコピーを作成して代入）
  if (side === "p1") {
    state.p1Units = [...state.p1Units];
    state.p1Units[emptyIndex] = summoned;
  } else {
    state.p2Units = [...state.p2Units];
    state.p2Units[emptyIndex] = summoned;
  }

  // 5. ログの発行 (GameViewへ通知)
  const logs = state.logs || (context as any).logs || (state as any).battleLogs;
  if (logs) {
    logs.push({
      time: (context as any).currentTime || 0,
      action: "summon",
      instanceId: summoned.instanceId,
      side: side,
      unit: JSON.parse(JSON.stringify(summoned)), 
    });
  }
  break;
}
  }}