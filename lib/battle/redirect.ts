import { BattleUnit } from "@/types"

export function redirectDamage(
  target: BattleUnit,
  allies: BattleUnit[]
): BattleUnit {
  const guard = allies.find(u =>
    u.hp > 0 &&
    u.row === target.row && // 同列
    u.guardAdjacent &&
    (!u.guardAdjacent.once || !u.guardAdjacent.used)
  )

  if (!guard) return target

  if (guard.guardAdjacent?.once) {
    guard.guardAdjacent.used = true
  }

  return guard
}
