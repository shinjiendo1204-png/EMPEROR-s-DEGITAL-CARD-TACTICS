// src/lib/ui/abilityText.tsx

import { Ability } from "@/types"
import { interpretAbility } from "./abilityformatter/interpret"
import { renderAbilityJP } from "./abilityformatter/renderJP"

export function abilityToLine(
  a: Ability,
  ctx?: {
    battleState?: any
    playerState?: any
    side?: "p1" | "p2"
  }
) {
  const semantic = interpretAbility(a)
  return renderAbilityJP(semantic, ctx)
}
function getUICounter(
  ctx: any,
  key: string,
  scope: "battle" | "match" | "turn" = "match"
) {
  if (!ctx) return 0

  if (scope === "battle") {
    return ctx.battleState?.counters?.[ctx.side ?? "p1"]?.[key] ?? 0
  }

  if (scope === "match") {
    return ctx.playerState?.counters?.match?.[key] ?? 0
  }

  if (scope === "turn") {
    return ctx.playerState?.counters?.turn?.[key] ?? 0
  }

  return 0
}