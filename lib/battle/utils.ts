import { BattleUnit } from "@/types"

export function getEffectiveAttackSpeed(unit: BattleUnit): number {
  let speed = unit.attackSpeed

  if (!unit.states) return speed

  const asStacks = unit.states.filter(s => s.type === "as_stack")

  for (const stack of asStacks) {
    if (typeof stack.value === "number") {
      speed += stack.value
    }
  }

  // 上限下限処理
  if (speed < 0.05) speed = 0.05
  if (speed > 2.5) speed = 5

  return speed
}
