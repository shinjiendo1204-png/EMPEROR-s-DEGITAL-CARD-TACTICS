// src/lib/ui/equipmentSummary.ts

import type { Ability } from "@/types"

export function equipmentToSummary(
  abilities?: Ability[]
): { stat: string; value: number }[] {
  if (!abilities) return []

  const totals: Record<string, number> = {}

  for (const ability of abilities) {
    if (ability.trigger !== "onEquip") continue

    for (const effect of ability.effects ?? []) {
      if (effect.type === "MOD_STAT") {
        const stat = effect.stat
        const value = Number(effect.value ?? 0)

        if (!totals[stat]) totals[stat] = 0
        totals[stat] += value
      }
    }
  }

  return Object.entries(totals).map(([stat, value]) => ({
    stat,
    value,
  }))
}
