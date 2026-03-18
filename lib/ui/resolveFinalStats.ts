// src/lib/ui/resolveFinalStats.ts
import { Unit, Ability } from "@/types"

const BASE_AS_BY_ROLE: Record<string, number> = {
  tank: 0.45,
  bruiser: 0.65,
  skirmisher: 0.85,
  ranged: 1.0,
  support: 0.75,
}

type StatResult = {
  atk: number
  hp: number
  attackSpeed: number
}

export function resolveFinalStats(
  unit: Unit,
  opts: {
    includeEquipment?: boolean
    includeSynergy?: boolean
  } = {}
): StatResult {
  const baseAtk = (unit as any).atk ?? 0
    const baseHP = (unit as any).hp ?? 0
    const baseAS = BASE_AS_BY_ROLE[(unit as any).role] ?? 1

    let atk = baseAtk
    let hp = baseHP
    let attackSpeed = baseAS


  const variants: any = (unit as any).variants

  const applyAbilities = (abilities?: Ability[]) => {
    if (!abilities) return
    for (const a of abilities) {
      for (const e of a.effects ?? []) {
        if (e.type === "MOD_STAT") {
          if (e.stat === "atk") {
            atk += Number(e.value ?? 0)
          }
          if (e.stat === "hp") {
            hp += Number(e.value ?? 0)
          }
          if (e.stat === "attackSpeed") {
            attackSpeed += Number(e.value ?? 0)
          }
        }
      }
    }
  }

  const applyStatEffects = (effects?: any[]) => {
    if (!effects) return
    for (const e of effects) {
      if (e.kind === "stat") {
        if (e.stat === "atk") atk += e.value
      }
    }
  }

 if (opts.includeEquipment && variants?.equipment) {

  // ===== baseStats =====
  if (variants.equipment.baseStats) {
    const baseStats = variants.equipment.baseStats

    if (baseStats.atk) {
      atk += baseStats.atk
    }

    if (baseStats.hp) {
      hp += baseStats.hp
    }
  }

  applyStatEffects(variants.equipment.effects)
  applyAbilities(variants.equipment.abilities)
}


  if (opts.includeSynergy && variants?.synergy) {
    applyAbilities(variants.synergy.abilities)
  }

  return {
    atk,
    hp,
    attackSpeed: Number(attackSpeed.toFixed(2)),
  }
}
