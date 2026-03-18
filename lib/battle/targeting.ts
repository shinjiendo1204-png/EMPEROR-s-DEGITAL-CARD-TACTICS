// src/lib/battle/targeting.ts

import { BattleUnit } from "@/types"
import { COMBAT_ROWS, BATTLE_COLS } from "./boardsize"

/* =========================
   基本ユーティリティ
========================= */
function hexDistance(a: BattleUnit, b: BattleUnit) {

  if (!a.pos || !b.pos) return 999

  const ac = a.pos.c
  const ar = a.pos.r

  const bc = b.pos.c
  const br = b.pos.r

  const dx = bc - ac
  const dy = br - ar

  return Math.max(
    Math.abs(dx),
    Math.abs(dy),
    Math.abs(dx - dy)
  )
}


function inRange(attacker: BattleUnit, target: BattleUnit) {
  return hexDistance(attacker, target) <= attacker.attackRange
}

function rolePriority(unit: BattleUnit) {
  switch (unit.role) {
    case "tank": return 4
    case "bruiser": return 3
    case "skirmisher": return 2
    case "ranged": return 1
    case "support": return 0
    default: return 0
  }
}

function frontlineTanks(
  attacker: BattleUnit,
  enemies: BattleUnit[]
) {
  const tanks = enemies.filter(e =>
    e.role === "tank" &&
    e.hp > 0 &&
    e.pos
  )

  if (!tanks.length) return null

  let best = tanks[0]
  let bestDist = forwardDist(attacker, best)

  for (const t of tanks) {
    const d = forwardDist(attacker, t)
    if (d < bestDist) {
      best = t
      bestDist = d
    }
  }

  return best
}

/* =========================
   遮蔽判定（同じ列）
========================= */

function isBlocked(
  attacker: BattleUnit,
  target: BattleUnit,
  enemies: BattleUnit[]
) {
  if (!attacker.pos || !target.pos) return false

  const dir = attacker.side === "p1" ? -1 : 1

  const targetForward =
    (target.pos.r - attacker.pos.r) * dir

  for (const e of enemies) {
    if (!e.pos || e.instanceId === target.instanceId) continue

    const eForward =
      (e.pos.r - attacker.pos.r) * dir

    if (
      e.pos.c === target.pos.c &&
      eForward >= 0 &&
      eForward < targetForward
    ) {
      return true
    }
  }

  return false
}
/* =========================
   GuardAdjacent
========================= */

function findGuard(
  target: BattleUnit,
  enemies: BattleUnit[]
) {
  if (!target.pos) return null

  for (const e of enemies) {
    const guard = (e as any).guardAdjacent
    if (!guard || guard.used) continue
    if (!e.pos) continue

    const d = hexDistance(e, target)

    if (d === 1) return e
  }

  return null
}

/* =========================
   ターゲット選択
========================= */

export function selectTarget(
  enemies: BattleUnit[],
  attacker: BattleUnit
): BattleUnit | null {

  if (!attacker.pos) return null

  const alive = enemies.filter(e => e.hp > 0 && e.pos)
  if (!alive.length) return null

  /* =========================
   TAUNT
========================= */

const taunts = alive.filter(e =>
  (e.states ?? []).some(s => s.type === "taunt")
)

if (taunts.length) {

  taunts.sort((a,b)=>
    hexDistance(attacker,a) - hexDistance(attacker,b)
  )

  const chosen = taunts[0]

  attacker.currentTargetId = chosen.instanceId

  return chosen
}

  /* =========================
     Target Stickiness
  ========================= */

  if (attacker.currentTargetId) {
    const keep = alive.find(
      e => e.instanceId === attacker.currentTargetId
    )

    if (keep && inRange(attacker, keep)) {
      return keep
    }
  }

  /* =========================
     Frontline Tank Lock
  ========================= */

  const frontlineTank = frontlineTanks(attacker, alive)

  if (frontlineTank && inRange(attacker, frontlineTank)) {
    attacker.currentTargetId = frontlineTank.instanceId
    return frontlineTank
  }

  // ① 射程内
  let candidates = alive.filter(e => inRange(attacker, e))
  if (!candidates.length) return null

  // ② 遮蔽除外
  candidates = candidates.filter(e =>
    !isBlocked(attacker, e, alive)
  )
  if (!candidates.length) return null

  candidates.sort((a, b) => {

    // ① 前方向距離
    const front =
      forwardDist(attacker, a) -
      forwardDist(attacker, b)
    if (front !== 0) return front

    // ② 同列優先
    const col =
      Math.abs(a.pos!.c - attacker.pos!.c) -
      Math.abs(b.pos!.c - attacker.pos!.c)
    if (col !== 0) return col

    // ③ 距離
    const dist =
      hexDistance(attacker, a) -
      hexDistance(attacker, b)
    if (dist !== 0) return dist

    // ④ tank優先
    return rolePriority(b) - rolePriority(a)
  })

  let chosen = candidates[0]

  // Guard override
  const guard = findGuard(chosen, alive)
  if (guard) chosen = guard

  attacker.currentTargetId = chosen.instanceId

  return chosen
}

/* =========================
   前方向距離
========================= */

function forwardDist(attacker: BattleUnit, target: BattleUnit) {
  if (!attacker.pos || !target.pos) return 999

  const dir = attacker.side === "p1" ? -1 : 1
  const d = (target.pos.r - attacker.pos.r) * dir

  return d >= 0 ? d : 999
}

/* =========================
   移動（Pathfinding）
========================= */

export function moveToward(
  actor: BattleUnit,
  enemies: BattleUnit[],
  occupied: Set<string>
) {
  if (!actor.pos) return

  const alive = enemies.filter(e => e.hp > 0 && e.pos)
  if (!alive.length) return

  const dir = actor.side === "p1" ? -1 : 1

  let closest = alive[0]
  let min = hexDistance(actor, closest)

  for (const e of alive) {
    const d = hexDistance(actor, e)
    if (d < min) {
      min = d
      closest = e
    }
  }

  const moves = [
  { r: actor.pos.r + 1, c: actor.pos.c },
  { r: actor.pos.r - 1, c: actor.pos.c },
  { r: actor.pos.r, c: actor.pos.c + 1 },
  { r: actor.pos.r, c: actor.pos.c - 1 },
  { r: actor.pos.r + 1, c: actor.pos.c - 1 },
  { r: actor.pos.r - 1, c: actor.pos.c + 1 }
]

let bestMove = null
let bestDist = Infinity

for (const m of moves) {

  if (
    m.r < 0 || m.r >= COMBAT_ROWS ||
    m.c < 0 || m.c >= BATTLE_COLS
  ) continue

  if (occupied.has(`${m.r}-${m.c}`)) continue

  const d =
    hexDistance({ ...actor, pos: m } as BattleUnit, closest)

  if (d < bestDist) {
    bestMove = m
    bestDist = d
  }
}

  if (bestMove) {
    actor.prevPos = { ...actor.pos }
    actor.pos.r = bestMove.r
    actor.pos.c = bestMove.c
  }
}