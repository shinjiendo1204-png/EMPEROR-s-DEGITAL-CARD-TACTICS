import { BattleUnit } from "@/types"

/* =========================
   基本ユーティリティ
========================= */

export function isAdjacent(a: BattleUnit, b: BattleUnit): boolean {
  if (!a.pos || !b.pos) return false

  const dr = Math.abs(a.pos.r - b.pos.r)
  const dc = Math.abs(a.pos.c - b.pos.c)

  return dr + dc === 1
}

export function getAdjacentUnits(
  actor: BattleUnit,
  units: BattleUnit[]
): BattleUnit[] {
  return units.filter(
    u => u.hp > 0 && u.pos && isAdjacent(actor, u)
  )
}

export function getUnitsInRange(
  actor: BattleUnit,
  units: BattleUnit[],
  range: number
): BattleUnit[] {
  if (!actor.pos) return []

  return units.filter(u => {
    if (!u.pos || u.hp <= 0) return false
    const dr = Math.abs(actor.pos!.r - u.pos!.r)
    const dc = Math.abs(actor.pos!.c - u.pos!.c)
    return dr + dc <= range
  })
}

export function getSameColumnUnits(
  actor: BattleUnit,
  units: BattleUnit[]
): BattleUnit[] {
  if (!actor.pos) return []
  return units.filter(
    u => u.hp > 0 && u.pos && u.pos.c === actor.pos!.c
  )
}

export function getSameRowUnits(
  actor: BattleUnit,
  units: BattleUnit[]
): BattleUnit[] {
  if (!actor.pos) return []
  return units.filter(
    u => u.hp > 0 && u.pos && u.pos.r === actor.pos!.r
  )
}
