import { BattleUnit, BattleStateEffect } from "@/types"

export function addState(unit: BattleUnit, state: BattleStateEffect) {
  unit.states ??= []
  if (!state.id) {
    ;(state as any).id = `st_${Date.now()}_${Math.random()}`
  }
  unit.states.push(state)
}

export function hasState(unit: BattleUnit, type: BattleStateEffect["type"]) {
  return unit.states?.some(s => s.type === type)
}
export function removeState(
  unit: BattleUnit,
  type: BattleStateEffect["type"]
) {
  if (!unit.states) return
  unit.states = unit.states.filter(s => s.type !== type)
}

export function getState(
  unit: BattleUnit,
  type: BattleStateEffect["type"]
) {
  return unit.states?.find(s => s.type === type)
}

export function removeStateById(
  unit: BattleUnit,
  id: string
) {
  if (!unit.states) return
  unit.states = unit.states.filter(s => s.id !== id)
}


export function removeExpiredStates(unit: BattleUnit, now: number) {
  if (!unit.states || unit.states.length === 0) return

  unit.states = unit.states.filter(state => {
    if (!state.expiresAt) return true
    return now < state.expiresAt
  })
}

export function consumeStates(
  unit: BattleUnit,
  trigger: string,
  now: number
): number {
  if (!unit.states?.length) return 0

  let total = 0
  const remaining: BattleStateEffect[] = []

  for (const s of unit.states) {
    const active = s.expiresAt === undefined || s.expiresAt > now
    if (!active) continue

    if (s.consumeOn === trigger) {
      total += s.value ?? 0

      // 🔥 stacks を減らす
      if (s.stacks && s.stacks > 1) {
        remaining.push({
          ...s,
          stacks: s.stacks - 1,
        })
      }

      continue
    }

    remaining.push(s)
  }

  unit.states = remaining
  return total
}
export function removeStatesLinkedToDeadUnit(
  units: BattleUnit[],
  deadId: string
) {
  for (const u of units) {
    if (!u.states) continue

    u.states = u.states.filter(
      s => s.targetId !== deadId
    )
  }
}