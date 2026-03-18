import { Unit } from "@/types"

let autoId = 0

function genId(prefix: string) {
  autoId++
  return `${prefix}_${autoId}`
}

export function ensureAbilityIds(units: Unit[]) {

  for (const unit of units) {

    /* unit abilities */
    for (const ab of unit.abilities ?? []) {
      if (!ab.id) ab.id = genId(unit.id)
    }

    /* equipment */
    const eq = unit.variants?.equipment
    if (eq?.abilities) {
      for (const ab of eq.abilities) {
        if (!ab.id) ab.id = genId(unit.id + "_equip")
      }
    }

    /* synergy */
    const syn = unit.variants?.synergy
    if (syn?.abilities) {
      for (const ab of syn.abilities) {
        if (!ab.id) ab.id = genId(unit.id + "_syn")
      }
    }

  }

  return units
}