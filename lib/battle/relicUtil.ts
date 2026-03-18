import { PlayerState } from "@/types"
import {
  ANTIQUA_RELICS_T1,
  ANTIQUA_RELICS_T2,
  ANTIQUA_RELICS_T3
} from "@/data/relics"
import { toEquipment } from "@/lib/game" // ← 追加

export function generateRelicByTier(playerState: PlayerState) {

  const dig = playerState.counters.match["digTotal"] ?? 0

  let pool = ANTIQUA_RELICS_T1

  if (dig >= 20) pool = ANTIQUA_RELICS_T3
  else if (dig >= 10) pool = ANTIQUA_RELICS_T2

  const relic = pickRandom(pool)

  return relic ? toEquipment(structuredClone(relic)) : null
}

function pickRandom<T>(arr: T[]): T | null {
  if (!arr.length) return null
  return arr[Math.floor(Math.random() * arr.length)]
}

export function tryDigRelic(playerState: PlayerState) {

  const dig = playerState.counters.match["dig"] ?? 0
  if (dig < 3) return

  const count = Math.floor(dig / 3)

  playerState.counters.match["dig"] = dig - count * 3

  for (let i = 0; i < count; i++) {

    const relic = generateRelicByTier(playerState)

    if (!relic) break

    playerState.equipmentStock.push(relic)
  }
}