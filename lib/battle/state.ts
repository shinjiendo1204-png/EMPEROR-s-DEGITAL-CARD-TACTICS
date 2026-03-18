import { BattleUnit, BattleLog, Ability, PlayerState,GameState, CombatTelemetry } from "@/types"


// battle/state.ts

export type ActiveAura = {
  source: BattleUnit
  ability: Ability
}
export type BattleState = {
  p1Units: (BattleUnit | null)[]
  p2Units: (BattleUnit | null)[]
  p1Player: PlayerState
  p2Player: PlayerState
  p1DebugLogs: string[]
  p2DebugLogs: string[]
  battleLogs: BattleLog[]
  gameState: GameState
  guard: number
  maxTurns: number
  finished: boolean
  suddenDeath: boolean
  firstDeathResolved: boolean
  winner: "p1" | "p2" | null
  suddenApplied?: boolean
  now: number
  abilityTriggerCounts: Record<string, number>
  counters: {
  p1: Record<string, number>
  p2: Record<string, number>
}
  teamAbilities: {
  p1: Ability[]
  p2: Ability[]
}
}
