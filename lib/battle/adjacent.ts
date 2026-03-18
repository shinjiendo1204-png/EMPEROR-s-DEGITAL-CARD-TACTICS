import { BattleUnit } from "@/types"

export function isAdjacent(a: BattleUnit, b: BattleUnit): boolean {
  if (a.side !== b.side) return false
  if (a.row !== b.row) return false

  // instanceId に index を含めている前提
  const ai = Number(a.instanceId.split("-")[1])
  const bi = Number(b.instanceId.split("-")[1])

  return Math.abs(ai - bi) === 1
}
