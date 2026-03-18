import { BattleRole } from "@/types"

export const BASE_INTERVAL = 1000 // ms

export const ROLE_AS: Record<BattleRole, number> = {
  tank: 0.55,
  bruiser: 0.65,
  skirmisher: 0.8,
  ranged: 0.85,
  support: 0.75,
}
