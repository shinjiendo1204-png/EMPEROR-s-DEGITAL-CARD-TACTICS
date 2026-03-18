// src/lib/battle/engine.ts
import { BattleState } from "./state"
import {
  BattleLog,
  Ability,
  BattleUnit,
  BattleResult,
  PlayerState,
  AbilityEffect,
} from "@/types"
import { stepBattle } from "./step"
import { runBattleStart } from "./battleStart"
import { runAbilities, type AbilityContext } from "./abilityRunner"
import { GLOBAL_HERO_ABILITIES } from "@/data/globalHeroAbilities"
import { HERO_UNITS } from "@/data/heroes"
import { checkCondition } from "./condition"

export function runBattle(
  state: BattleState,
  battleLogs: BattleLog[],
  p1: PlayerState,
  p2: PlayerState
): BattleResult {
  runBattleStart(state, battleLogs)

  // battleStart ヒーローチェック
  runGlobalHeroChecks("battleStart", state, p1, p2)

  let safety = 0
  const MAX_STEPS = 20000

  while (!state.finished) {
    safety++

    if (safety > MAX_STEPS) {
      console.log("BATTLE SAFETY BREAK", { now: state.now, safety })
      state.finished = true
      state.winner = "p1"
      break
    }

    const prevNow = state.now
    const progressed = stepBattle(state, battleLogs, p1, p2)

    if (!progressed && state.finished) break

    if (!state.suddenDeath && state.now >= 30000) {
      state.suddenDeath = true
      battleLogs.push({ text: "🔥 suddenDeath 発動（30s）" } as any)
    }

    if (!Number.isFinite(state.now)) {
      console.log("NOW IS NOT FINITE", { prevNow, now: state.now, safety })
      state.finished = true
      state.winner = "p1"
      break
    }

    if (!state.finished && state.now <= prevNow) {
      console.log("NOW NOT INCREASING", { prevNow, now: state.now, safety })
      console.log("P1 times", state.p1Units.map(u => u?.nextActionTime))
      console.log("P2 times", state.p2Units.map(u => u?.nextActionTime))
      state.finished = true
      state.winner = "p1"
      break
    }

    if (safety % 2000 === 0) {
      console.log("step", safety, "now", state.now)
    }
  }

  runBattleEnd(state, battleLogs, p1, p2)

  // battleEnd ヒーローチェック
  runGlobalHeroChecks("battleEnd", state, p1, p2)

  const p1Alive = state.p1Units.filter(u => u && u.hp > 0).length
  const p2Alive = state.p2Units.filter(u => u && u.hp > 0).length

  return {
    winner: state.winner!,
    p1Survivors: p1Alive,
    p2Survivors: p2Alive,
    logs: battleLogs,
  }
}

function runBattleEnd(
  state: BattleState,
  battleLogs: BattleLog[],
  p1: PlayerState,
  p2: PlayerState
) {
  for (const u of [...state.p1Units, ...state.p2Units]) {
  if (!u) continue
  if ((u as any).startPos) {
  u.pos = { ...(u as any).startPos }
} else if (!u.pos) {
  u.pos = { r: 0, c: 0 }
}
}
  const p1Units: BattleUnit[] = state.p1Units.filter(
    (u): u is BattleUnit => u !== null
  )

  const p2Units: BattleUnit[] = state.p2Units.filter(
    (u): u is BattleUnit => u !== null
  )

  const allUnits: BattleUnit[] = [...p1Units, ...p2Units]

  for (const unit of allUnits) {
    const playerState = unit.side === "p1" ? p1 : p2

    runAbilities("battleEnd", unit, {
      allies: unit.side === "p1" ? p1Units : p2Units,
      enemies: unit.side === "p1" ? p2Units : p1Units,
      now: state.now,
      battleState: state,
      playerState,
      gameState: state.gameState,
    })
  }

  for (const unit of allUnits) {
    unit.abilities?.forEach((ability: Ability) => {
      ability.used = false
      ability.__lastTickTime = undefined
      ability.__stackCount = undefined
      ability.__expiresAt = undefined
      ability.__remainingTurns = undefined
    })
  }
}



function runGlobalHeroChecks(
  trigger: "battleStart" | "battleEnd",
  state: BattleState,
  p1: PlayerState,
  p2: PlayerState
) {
  runGlobalHeroChecksForSide(trigger, "p1", state, p1, p2)
  runGlobalHeroChecksForSide(trigger, "p2", state, p2, p1)
}

function runGlobalHeroChecksForSide(
  trigger: "battleStart" | "battleEnd",
  side: "p1" | "p2",
  state: BattleState,
  playerState: PlayerState,
  enemyPlayerState: PlayerState
) {
  const allies: BattleUnit[] =
    side === "p1"
      ? state.p1Units.filter((u): u is BattleUnit => u !== null)
      : state.p2Units.filter((u): u is BattleUnit => u !== null)

  const enemies: BattleUnit[] =
    side === "p1"
      ? state.p2Units.filter((u): u is BattleUnit => u !== null)
      : state.p1Units.filter((u): u is BattleUnit => u !== null)

  // 死亡済みでも side 判定や condition 評価の土台に使えるよう non-null で拾う
  const checkUnit =
    allies[0] ??
    enemies[0] ??
    ({
      instanceId: `hero_dummy_${side}`,
      unitName: `hero_dummy_${side}`,
      name: `hero_dummy_${side}`,
      baseName: `hero_dummy_${side}`,
      id: `hero_dummy_${side}`,
      side,
      hp: 1,
      maxHp: 1,
      atk: 0,
      cost: 0,
      row: "front",
      role: "support",
      attackRange: "melee",
      abilities: [],
      states: [],
      effects: [],
      equipments: [],
    } as unknown as BattleUnit)

  const context: AbilityContext = {
    allies,
    enemies,
    now: state.now,
    battleState: state,
    playerState,
    gameState: state.gameState,
  }

  for (const ability of GLOBAL_HERO_ABILITIES) {
    if (
  ability.pack &&
  !state.gameState.activePacks?.includes(ability.pack)
) {
  continue
}
    if (ability.trigger !== trigger) continue
    if (!checkCondition(checkUnit, ability.condition, context)) continue

    console.log(
      "HERO CHECK PASS",
      side,
      ability.id,
      playerState.counters.match
    )

    for (const effect of ability.effects ?? []) {
      applyGlobalHeroEffect(effect, side, playerState, state)
    }
  }
}

function applyGlobalHeroEffect(
  effect: AbilityEffect,
  side: "p1" | "p2",
  playerState: PlayerState,
  state: BattleState
) {
  if (effect.type !== "CLAIM_HERO") return

  console.log("CLAIM HERO TRY", side, effect.heroId)

  const hero = HERO_UNITS.find(h => h.id === effect.heroId)
  if (!hero) return

  if (state.gameState.claimedHeroes[hero.id]) return
  if (playerState.pendingHero) return

  playerState.pendingHero = hero
  state.gameState.claimedHeroes[hero.id] = side

  console.log("CLAIM HERO SUCCESS", side, hero.id)
}