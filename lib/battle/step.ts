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
  return units.filter((u): u is BattleUnit => {
    return u !== null && u !== undefined && u.hp > 0;
  });
}

// src/lib/battle/step.ts

function updateUnitFinalStats(unit: BattleUnit, now: number) {
  const final = calculateFinalStats(unit, now);
  const nextMax = final.maxHp ?? unit.baseMaxHp ?? 0;

  // 1. 最大HPが増えるなら、現在HPもその差分だけ必ず増やす
  // 以前の値を `unit.maxHp` から直接取るのではなく、
  // 計算機が適用される前の「生の値」と比較するのがコツです。
  const currentMax = unit.maxHp ?? unit.baseMaxHp ?? 0;

  if (nextMax > currentMax) {
    const bonus = nextMax - currentMax;
    unit.hp += bonus; 
   
  }

  // 2. 基本ステータスの同期
  unit.maxHp = nextMax;
  unit.atk = final.atk ?? unit.baseAtk;
  unit.attackSpeed = final.attackSpeed ?? unit.baseAttackSpeed;

  // 3. 安全装置（バフが切れて最大HPが減った時用）
  if (unit.hp > unit.maxHp) {
    unit.hp = unit.maxHp;
  }
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

const MOVE_TIME = BASE_INTERVAL * 0.9
const STUN_WAIT = BASE_INTERVAL
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
  const allAlive = [...p1Alive, ...p2Alive]

  /* --- 勝敗判定 --- */
  if (p1Alive.length === 0 && p2Alive.length === 0) {
    if (state.suddenDeath) {
      state.finished = true
      state.winner = "p1"
      battleLogs.push({ text: "🏆 P1 WIN (Draw)" } as any)
      return false
    }
  }

  if (p1Alive.length === 0) {
    state.finished = true
    state.winner = "p2"
    battleLogs.push({ text: "🏆 P2 WIN" } as any)
    return false
  }

  if (p2Alive.length === 0) {
    state.finished = true
    state.winner = "p1"
    battleLogs.push({ text: "🏆 P1 WIN" } as any)
    return false
  }

  /* --- 行動者決定 --- */
  const actor = allAlive.reduce((a, b) =>
    a.nextActionTime < b.nextActionTime ? a : b
  )

  const prevNow = state.now
  state.now = actor.nextActionTime

  if (!Number.isFinite(state.now) || state.now <= prevNow) {
    state.now = prevNow + MIN_ADVANCE
    actor.nextActionTime = state.now
  }

  /* --- ステータス更新 & 状態異常処理 --- */
  for (const u of allAlive) {
    processCurseDot(u, state.now, battleLogs)
    applyExpiredTimedModifiers(u, state.now)
    removeExpiredStates(u, state.now)
    updateUnitFinalStats(u, state.now)
  }

  // stunチェック
  const isStunned = (actor.states ?? []).some(
    s => s.type === "stun" && (s.expiresAt === undefined || s.expiresAt > state.now)
  )

  if (isStunned) {
    actor.nextActionTime = Math.max(actor.nextActionTime, state.now + STUN_WAIT)
    return true
  }

  const allies = actor.side === "p1" ? p1Alive : p2Alive
  const enemies = actor.side === "p1" ? p2Alive : p1Alive

  /* --- auraTick --- */
  for (const unit of allAlive) {
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
      updateUnitFinalStats(unit, state.now)
    }
  }

  for (const side of ["p1", "p2"] as const) {
    const teamAbilities = state.teamAbilities?.[side] ?? []
    if (!teamAbilities.some(a => a.trigger === "auraTick")) continue
    const teamAllies = side === "p1" ? p1Alive : p2Alive
    const leader = teamAllies[0]
    if (!leader) continue
   
    runAbilities("auraTick", { ...leader, abilities: teamAbilities } as any, {
      allies: teamAllies,
      enemies: side === "p1" ? p2Alive : p1Alive,
      now: state.now,
      battleState: state,
      playerState: side === "p1" ? p1 : p2,
      battleLogs,
      isTeam: true,
      leader,
    })
  }

  if (enemies.length === 0) return true

  /* --- ターゲット & 移動判定 --- */
  const target = selectTarget(enemies, actor)

  // ✅ target がいない場合は移動処理、いる場合は攻撃処理へ
  if (!target) {
    const occupied = new Set<string>()
    for (const u of allAlive) {
      if (u.pos) occupied.add(`${u.pos.r}-${u.pos.c}`)
    }
    const oldPos = actor.pos ? { ...actor.pos } : null
    moveToward(actor, enemies, occupied)

    if (oldPos && actor.pos && (oldPos.r !== actor.pos.r || oldPos.c !== actor.pos.c)) {
      battleLogs.push({
        action: "move",
        instanceId: actor.instanceId,
        from: oldPos,
        to: { ...actor.pos },
        time: state.now
      })
      actor.nextActionTime = state.now + MOVE_TIME
      return true
    }
    // 移動も攻撃もできない場合は時間を進める
    actor.nextActionTime = state.now + MIN_ADVANCE
    return true
  }

  /* --- 攻撃処理 --- */
  const defenders = target.side === "p1" ? p1Alive : p2Alive
  const realTarget = redirectDamage(target, defenders)

  // ✅ realTarget の存在チェックを追加して TypeScript エラーを回避
  if (realTarget) {
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

    const events = attackOnce(actor, realTarget)

    runAbilities("onDamageTaken", realTarget, {
      allies: realTarget.side === "p1" ? p1Alive : p2Alive,
      enemies: realTarget.side === "p1" ? p2Alive : p1Alive,
      now: state.now,
      target: actor,
      battleState: state,
      playerState: realTarget.side === "p1" ? p1 : p2,
      battleLogs,
      isTeam: true,
      leader: allies[0],
    })

    const attackEvent = events.find(e => e.type === "attack")
    if (attackEvent && attackEvent.type === "attack") {
      logAttackEvent(
        battleLogs,
        actor,
        realTarget,
        attackEvent.damage,
        `🗡 ${actor.unitName} (ATK:${Math.round(actor.atk)}) が ${realTarget.unitName} に ${attackEvent.damage} ダメージ`,
        state.now
      )
    }

    /* --- 死亡処理 --- */
    const didDie = events.some(e => e.type === "death")
    if (didDie) {
      realTarget.isDying = true
      logDeathEvent(battleLogs, realTarget, `${realTarget.unitName} dies`, state.now)
      logKillEvent(battleLogs, actor, realTarget, state.now)

      const aliveP1Now = getAliveUnits(state.p1Units)
      const aliveP2Now = getAliveUnits(state.p2Units)

      const ctx = {
  allies: realTarget.side === "p1" ? aliveP1Now : aliveP2Now,
  enemies: realTarget.side === "p1" ? aliveP2Now : aliveP1Now,
  now: state.now,
  target: realTarget,
  battleState: state,
  playerState: realTarget.side === "p1" ? p1 : p2,
  battleLogs,
  deadUnit: realTarget,
}

// ① 死んだ本人
runAbilities("onDeath", realTarget, ctx)

// ② 🔥 全ユニットに通知（これが足りてない）
const allUnits = [...state.p1Units, ...state.p2Units]
  .filter((u): u is BattleUnit => !!u)

for (const u of allUnits) {
  runAbilities("onDeath", u, ctx)
}
      removeStatesLinkedToDeadUnit([...p1Alive, ...p2Alive], realTarget.instanceId)

      const units = realTarget.side === "p1" ? state.p1Units : state.p2Units
      const index = units.findIndex(u => u?.instanceId === realTarget.instanceId)
      if (index !== -1) units[index] = null
    }
  }

  /* --- 最終確定 --- */
  for (const u of getAliveUnits([...state.p1Units, ...state.p2Units])) {
    updateUnitFinalStats(u, state.now)
  }

  const safeAS = actor.attackSpeed > 0 ? actor.attackSpeed : 1
  actor.nextActionTime = state.now + (BASE_INTERVAL / safeAS)

  state.p1Units = [...state.p1Units]
  state.p2Units = [...state.p2Units]

  syncBoardHP(state.p1Units, p1)
  syncBoardHP(state.p2Units, p2)

  return true
}

function processCurseDot(unit: BattleUnit, now: number, battleLogs: BattleLog[]) {
  const curseStates = (unit.states ?? []).filter(s => s.type === "curse_stack")
  if (!curseStates.length) return
  const stack = curseStates.reduce((sum, s) => sum + (s.value ?? 0), 0)
  const interval = 1000
  const last = (unit as any).__lastCurseTick ?? 0
  if (now - last < interval) return

  const damage = Math.floor(stack / 2)
  if (damage <= 0) return

  unit.hp = Math.max(0, unit.hp - damage)

  battleLogs.push({
    action: "damage",
    instanceId: unit.instanceId,
    damage: damage,
    unitId: "team_curse",
    unitName: "Curse Damage",
    side: unit.side,
    source: "curse",
    time: now
  } as any)

  ;(unit as any).__lastCurseTick = now
}