import { AbilityContext } from "./abilityRunner"


function isMySide(context: AbilityContext, side: "p1" | "p2") {
  if (!context.battleState || !context.playerState) return false

  const mySide =
    context.playerState === context.battleState.p1Player
      ? "p1"
      : "p2"

  return side === mySide
}

export function incrementCounter(
  context: AbilityContext,
  side: "p1" | "p2",
  key: string,
  scope: "battle" | "match" | "turn" = "battle",
  value: number = 1
) {


  if (scope === "battle" && context.battleState) {
  const old = context.battleState.counters[side]

  context.battleState.counters[side] = {
    ...old,
    [key]: (old[key] ?? 0) + value
  }

  return
}

if (scope === "match" && context.playerState) {
  const old = context.playerState.counters.match

  context.playerState.counters.match = {
    ...old,
    [key]: (old[key] ?? 0) + value
  }

  return
}

  if (scope === "turn" && context.playerState) {
    const table = context.playerState.counters.turn
    table[key] = (table[key] ?? 0) + value
  }

}

export function getCounter(
  context: AbilityContext,
  side: "p1" | "p2",
  key: string,
  scope: "battle" | "match" | "turn"
): number {

  if (scope === "battle") {
    return context.battleState?.counters?.[side]?.[key] ?? 0
  }

  if (scope === "match") {
    return context.playerState?.counters?.match?.[key] ?? 0
  }

  if (scope === "turn") {
    return context.playerState?.counters?.turn?.[key] ?? 0
  }

  return 0
}