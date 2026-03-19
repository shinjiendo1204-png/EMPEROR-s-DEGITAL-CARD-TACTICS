// src/lib/ui/abilityText.tsx

import { Ability } from "@/types"
import { interpretAbility } from "./abilityformatter/interpret"
import { renderAbilityEN } from "./abilityformatter/renderEN"

export function abilityToLine(
  a: Ability,
  ctx?: {
    battleState?: any
    playerState?: any
    side?: "p1" | "p2"
  }
) {
  const semantic = interpretAbility(a)
  return renderAbilityEN(semantic, ctx)
}
