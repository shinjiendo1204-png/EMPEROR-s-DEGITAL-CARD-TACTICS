// src/lib/battle/step.ts
import { BattleState } from "./state"
import { selectTarget, moveToward } from "./targeting"
import { attackOnce } from "./core"
import { BattleLog, BattleUnit, PlayerState } from "@/types"
import { BASE_INTERVAL } from "./constants"
import { logAttackEvent, logDeathEvent, logKillEvent } from "./logging"
import { redirectDamage } from "./redirect"
import { runAbilities, applyExpiredTimedModifiers } from "./abilityRunner"
import { removeExpiredStates, removeStatesLinkedToDeadUnit } from "./stateEffects"
import { calculateFinalStats } from "./statCalculator"

/* =========================
   Utility
========================= */
function getAliveUnits(units: (BattleUnit | null)[]) {
  return units.filter((u): u is BattleUnit => u !== null && u.hp > 0)
}

function syncBoardHP(
  units: (BattleUnit | null)[],
  player: PlayerState
) {
  for (const u of units) {
    if (!u) continue

    const boardUnit = player.board[u.index]

    if (!boardUnit) continue

    boardUnit.hp = u.hp
  }
}
const MOVE_TIME = BASE_INTERVAL * 0.9   // 900ms
const STUN_WAIT = BASE_INTERVAL         // 1000ms
const MIN_ADVANCE = 0.1

/* =========================
   Step Battle
========================= */
export function stepBattle(
  state: BattleState,
  battleLogs: BattleLog[],
  p1: PlayerState,
  p2: PlayerState
): boolean {
 
  if (state.finished) return false

  const p1Alive = getAliveUnits(state.p1Units)
  const p2Alive = getAliveUnits(state.p2Units)

  /* =========================
     勝敗判定
  ========================= */
  if (p1Alive.length === 0 && p2Alive.length === 0) {
    if (state.suddenDeath) {
      state.finished = true
      state.winner = "p1"
      battleLogs.push({ text: "🏆 P1 WIN" } as BattleLog)
      return false
    }
  }

  if (p1Alive.length === 0) {
    state.finished = true
    state.winner = "p2"
    battleLogs.push({ text: "🏆 P2 WIN" } as BattleLog)
    return false
  }

  if (p2Alive.length === 0) {
    state.finished = true
    state.winner = "p1"
    battleLogs.push({ text: "🏆 P1 WIN" } as BattleLog)
    return false
  }

  /* =========================
     行動者決定
  ========================= */
  const actor = [...p1Alive, ...p2Alive].reduce((a, b) =>
    a.nextActionTime < b.nextActionTime ? a : b
  )

  // ✅ actorのnextActionTimeが壊れてたら強制終了（無限フリーズ防止）
  if (!Number.isFinite(actor.nextActionTime)) {
    console.log("BAD ACTOR nextActionTime", actor.unitName, actor.role, actor.nextActionTime)
    console.log("P1 times", state.p1Units.map(u => u?.nextActionTime))
    console.log("P2 times", state.p2Units.map(u => u?.nextActionTime))
    state.finished = true
    state.winner = "p1"
    return false
  }

  const prevNow = state.now

  // ✅ ここが本命修正：まず actor の時間を state.now に反映する
  state.now = actor.nextActionTime

  // ✅ now が戻った/止まった場合も最低限進める（固着対策）
  if (!Number.isFinite(state.now) || state.now <= prevNow) {
    state.now = prevNow + MIN_ADVANCE
    actor.nextActionTime = state.now
  }

  for (const u of [...p1Alive, ...p2Alive]) {
  processCurseDot(u, state.now, battleLogs)
}

  // ★ stunチェック（stunはここだけで止める）
  const isStunned = (actor.states ?? []).some(
    s =>
      s.type === "stun" &&
      (s.expiresAt === undefined || s.expiresAt > state.now)
  )

  if (isStunned) {
  actor.nextActionTime = Math.max(
    actor.nextActionTime,
    state.now + STUN_WAIT
  )
  return true
}
  const allies = actor.side === "p1" ? p1Alive : p2Alive
  const enemies = actor.side === "p1" ? p2Alive : p1Alive

  /* =========================
     auraTick + duration解除
  ========================= */
  for (const unit of [...p1Alive, ...p2Alive]) {
  applyExpiredTimedModifiers(unit, state.now)
  removeExpiredStates(unit, state.now)

  const unitAllies = unit.side === "p1" ? p1Alive : p2Alive
  const unitEnemies = unit.side === "p1" ? p2Alive : p1Alive

  if (unit.abilities?.some(a => a.trigger === "auraTick" && a.scope !== "team")) {
    runAbilities("auraTick", unit, {
      allies: unitAllies,
      enemies: unitEnemies,
      now: state.now,
      battleState: state,
      playerState: unit.side === "p1" ? p1 : p2,
      battleLogs,
      leader: unitAllies[0],
    })
  }
}

for (const side of ["p1", "p2"] as const) {
  const teamAbilities = state.teamAbilities?.[side] ?? []
  if (!teamAbilities.some(a => a.trigger === "auraTick")) continue

  const teamAllies = side === "p1" ? p1Alive : p2Alive
  const teamEnemies = side === "p1" ? p2Alive : p1Alive
  const leader = teamAllies[0]
  if (!leader) continue

  const teamUnit = {
    ...leader,
    abilities: teamAbilities,
  }

  runAbilities("auraTick", teamUnit, {
    allies: teamAllies,
    enemies: teamEnemies,
    now: state.now,
    battleState: state,
    playerState: side === "p1" ? p1 : p2,
    battleLogs,
    isTeam: true,
    leader,
  })
}

  if (enemies.length === 0) {
    state.finished = true
    battleLogs.push(
      { text: actor.side === "p1" ? "🏆 P1 WIN" : "🏆 P2 WIN" } as BattleLog
    )
    return false
  }

  /* =========================
     移動判定
  ========================= */
  const occupied = new Set<string>()

  for (const u of [...p1Alive, ...p2Alive]) {
    if (u.pos) occupied.add(`${u.pos.r}-${u.pos.c}`)
  }

  const target = selectTarget(enemies, actor)

  if (!target) {

  const oldPos = actor.pos ? { ...actor.pos } : null

  moveToward(actor, enemies, occupied)

  if (oldPos && actor.pos) {
    battleLogs.push({
      action: "move",
      instanceId: actor.instanceId,
      from: oldPos,
      to: { ...actor.pos },
      time: state.now
    })
  }
  actor.nextActionTime = state.now + MOVE_TIME
  return true
}

  const defenders = target.side === "p1" ? p1Alive : p2Alive
  const realTarget = redirectDamage(target, defenders)

  /* =========================
     攻撃前 Ability
  ========================= */
  runAbilities("onAttack", actor, {
    allies,
    enemies,
    now: state.now,
    target: realTarget,
    battleState: state,
    playerState: actor.side === "p1" ? p1 : p2,
    battleLogs,
    isTeam: true,
  leader: allies[0],
  })
 

  /* =========================
     攻撃処理
  ========================= */
  const events = attackOnce(actor, realTarget)

  /* =========================
     被弾 Ability
  ========================= */
  const realTargetAllies = realTarget.side === "p1" ? p1Alive : p2Alive
  const realTargetEnemies = realTarget.side === "p1" ? p2Alive : p1Alive

  runAbilities("onDamageTaken", realTarget, {
    allies: realTargetAllies,
    enemies: realTargetEnemies,
    now: state.now,
    target: actor,
    battleState: state,
    playerState: realTarget.side === "p1" ? p1 : p2,
    battleLogs,
    isTeam: true,
  leader: allies[0],
  })


  /* =========================
     ログ
  ========================= */
  const attackEvent = events.find(e => e.type === "attack")
  if (attackEvent && attackEvent.type === "attack") {
    const actorStats = calculateFinalStats(actor, state.now)

    logAttackEvent(
      battleLogs,
      actor,
      realTarget,
      attackEvent.damage,
      `🗡 ${actor.unitName}（AS:${actorStats.attackSpeed.toFixed(2)}）が ` +
        `${realTarget.unitName} に ${attackEvent.damage} ダメージ`,
      state.now
    )
  }

  /* =========================
     死亡処理
  ========================= */
  const didDie = events.some(e => e.type === "death")

  if (didDie) {
    realTarget.isDying = true

    logDeathEvent(
      battleLogs,
      realTarget,
      `${realTarget.unitName} dies`,
      state.now
    )

    logKillEvent(battleLogs, actor, realTarget, state.now)

    runAbilities("onKill", actor, {
      allies,
      enemies,
      now: state.now,
      target: realTarget,
      battleState: state,
      playerState: actor.side === "p1" ? p1 : p2,
      battleLogs,
      isTeam: true,
      leader: allies[0],
    })
    if (state.counters) {
      const side = realTarget.side
      const counters = state.counters[side]
      counters["teamOnDeathTriggerCount"] =
        (counters["teamOnDeathTriggerCount"] ?? 0) + 1
    }

    const aliveP1Now = getAliveUnits(state.p1Units)
    const aliveP2Now = getAliveUnits(state.p2Units)

    const contextForP1Death = {
      allies: aliveP1Now,
      enemies: aliveP2Now,
      now: state.now,
      target: realTarget,
      battleState: state,
      playerState: p1,
      battleLogs,
      deadUnit: realTarget,
    }

    const contextForP2Death = {
      allies: aliveP2Now,
      enemies: aliveP1Now,
      now: state.now,
      target: realTarget,
      battleState: state,
      playerState: p2,
      battleLogs,
      deadUnit: realTarget,
    }

    for (const u of aliveP1Now)
  runAbilities("onDeath", u, {
    ...contextForP1Death,
    isTeam: true,
    leader: aliveP1Now[0],
  })

for (const u of aliveP2Now)
  runAbilities("onDeath", u, {
    ...contextForP2Death,
    isTeam: true,
    leader: aliveP2Now[0],
  })
    removeStatesLinkedToDeadUnit(
      [...p1Alive, ...p2Alive],
      realTarget.instanceId
    )

    if (!state.firstDeathResolved) {
      state.firstDeathResolved = true

      const p1Alive2 = getAliveUnits(state.p1Units)
      const p2Alive2 = getAliveUnits(state.p2Units)

      const contextForP1 = {
        allies: p1Alive2,
        enemies: p2Alive2,
        now: state.now,
        target: realTarget,
        battleState: state,
        playerState: p1,
        battleLogs,
      }

      const contextForP2 = {
        allies: p2Alive2,
        enemies: p1Alive2,
        now: state.now,
        target: realTarget,
        battleState: state,
        playerState: p2,
        battleLogs,
      }

      for (const u of p1Alive2) runAbilities("firstDeath", u, contextForP1)
      for (const u of p2Alive2) runAbilities("firstDeath", u, contextForP2)
    }

    const units = realTarget.side === "p1" ? state.p1Units : state.p2Units
    const index = units.findIndex(u => u?.instanceId === realTarget.instanceId)
    if (index !== -1) units[index] = null
  }

  /* =========================
   次行動時間更新
========================= */
const actorStats = calculateFinalStats(actor, state.now)

const rawAS = actorStats.attackSpeed
const safeAS = Number.isFinite(rawAS) && rawAS > 0 ? rawAS : 1

const attackInterval = BASE_INTERVAL / safeAS

actor.nextActionTime = state.now + attackInterval

// HP同期
syncBoardHP(state.p1Units, p1)
syncBoardHP(state.p2Units, p2)

  return true
}

function processCurseDot(
  unit: BattleUnit,
  now: number,
  battleLogs: BattleLog[]
) {
  const curseStates = (unit.states ?? []).filter(s => s.type === "curse_stack")
  if (!curseStates.length) return

  const stack = curseStates.reduce((sum, s) => sum + (s.value ?? 0), 0)

  const interval = 1000
  const last = (unit as any).__lastCurseTick ?? 0
  if (now - last < interval) return

  const damage = Math.floor(stack / 2)
  if (damage <= 0) return

  unit.prevHp = unit.hp
  unit.hp -= damage
  if (unit.hp < 0) unit.hp = 0

  battleLogs.push({
  action: "damage",

  instanceId: unit.instanceId,
  damage: damage,

  unitId: "team_curse",       // ★固定ID
  unitName: "Ability Damage",   // ★表示名
  side: unit.side,            // ★ここ重要

  source: "curse",
  time: now
} as any)

  ;(unit as any).__lastCurseTick = now
}