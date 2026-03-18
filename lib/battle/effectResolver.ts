import { Ability, BattleUnit } from "@/types"
import { runAbilities } from "./abilityRunner"

export function resolveAbilityEffects(
  trigger: Ability["trigger"],
  unit: BattleUnit,
  context: {
    allies: BattleUnit[]
    enemies: BattleUnit[]
    now: number
    target?: BattleUnit
  }
) {
  // abilityRunner に一本化
  runAbilities(trigger, unit, context)
}
