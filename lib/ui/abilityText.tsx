// src/lib/ui/abilityText.tsx

import { Ability } from "@/types"
import { interpretAbility } from "./abilityformatter/interpret"
import { renderAbilitiesJPFromRaw } from "./abilityformatter/renderJP"

export function abilityToLine(
  a: Ability,
  ctx?: {
    battleState?: any
    playerState?: any
    side?: "p1" | "p2"
  }
) {
  return renderAbilitiesJPFromRaw([a], ctx)
}