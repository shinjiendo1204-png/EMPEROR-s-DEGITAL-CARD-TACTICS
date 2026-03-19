import { Ability, AbilityEffect, Stat } from "@/types"
import type {
  SemanticAbility,
  SemanticEffect,
  SemanticCondition
} from "./types"

export function interpretAbility(a: Ability): SemanticAbility {

  const effects: SemanticEffect[] = (a.effects ?? [])
    .filter((e): e is AbilityEffect => !!e && !!e.type)
    .map((e): SemanticEffect => {

      switch (e.type) {

        /* =========================
           STAT
        ========================= */
        case "MOD_STAT":
          return {
            kind: "stat_mod",
            stat: e.stat as Stat,
            value: e.value,
            percent: false,
            target: e.target,
            duration: convertDuration(e.duration)
          }

        case "MOD_STAT_PERCENT":
          return {
            kind: "stat_mod",
            stat: e.stat as Stat,
            value: e.value,
            percent: true,
            target: e.target,
            duration: convertDuration(e.duration)}

        case "MOD_STAT_FROM_COUNTER":
          return {
            kind: "mod_stat_from_counter",
            stat: e.stat as Stat,
            key: (e as any).key,
            multiplier: (e as any).multiplier,
            target: e.target,
            maxStack: (e as any).maxStack ?? 999,
            scope: e.scope
          }

        /* =========================
           STATE
        ========================= */
        case "ADD_STATE":
          return {
            kind: "add_state",
            stateType: e.stateType,
            value: e.value,
            target: e.target,
            consumeOn: e.consumeOn,
            maxStack: e.maxStack,
            maxTotalValue: e.maxTotalValue,
            duration: convertDuration(e.duration)
          }

        case "REMOVE_STATE":
          return {
            kind: "remove_state",
            stateType: e.stateType,
            target: e.target
          }

        /* =========================
           DAMAGE
        ========================= */
        case "DAMAGE":
          return {
            kind: "damage",
            value: e.value,
            target: e.target,
            ignoreDR: (e as any).ignoreDR,
            duration: convertDuration(e.duration)
          }

        case "DAMAGE_FROM_COUNTER":
          return {
            kind: "damage_from_counter",
            key: (e as any).key,
            multiplier: (e as any).multiplier,
            target: e.target,
            duration: convertDuration(e.duration),
            scope: e.scope,

          }

        /* =========================
           HEAL
        ========================= */
        case "HEAL":
          return {
            kind: "heal",
            value: e.value,
            target: e.target,
            percent: false,
            duration: convertDuration(e.duration)
          }

        case "HEAL_PERCENT":
          return {
            kind: "heal",
            value: e.value,
            target: e.target,
            percent: true,
            duration: convertDuration(e.duration)
          }

        /* =========================
           SPECIAL
        ========================= */
        case "SELF_DAMAGE":
          return {
            kind: "self_damage",
            value: e.value
          }

        case "SET_ATTACK_RANGE":
          return {
            kind: "set_attack_range",
            value: e.value,
            target: e.target,
            duration: convertDuration(e.duration)
          }

        /* =========================
           SUMMON
        ========================= */
        case "SUMMON":
          return {
            kind: "summon",
            unitId: (e as any).unitId,
            count: (e as any).count ?? 1,
            target: e.target
          }

        case "CREATE_ANCIENT_WEAPON":
          return {
            kind: "create_ancient_weapon"
          }

        /* =========================
           COUNTER
        ========================= */
        case "INCREMENT_COUNTER":
          return {
            kind: "increment_counter",
            key: (e as any).key,
            value: (e as any).value ?? 1,
            scope: (e as any).scope ?? "match"
          }

        /* =========================
           DIG
        ========================= */
        case "DIG_RELIC":
          return {
            kind: "dig_relic",
            count: (e as any).count ?? 1
          }

        /* =========================
           EQUIPMENT
        ========================= */
        case "DESTROY_EQUIPMENT":
          return {
            kind: "destroy_equipment",
            target: e.target
          }

        /* =========================
           GUARD
        ========================= */
        case "GUARD_ADJACENT":
          return {
            kind: "guard_adjacent",
            target: e.target,
            duration: convertDuration(e.duration)
          }

        default:
          console.error("Unknown ability effect:", e)
          return { kind: "unknown" }
      }
    })

  return {
    trigger: a.trigger,
    effects,
    condition: convertCondition(a.condition),
    once: (a as any).once,
    delay: (a as any).delay,
    aura: (a as any).aura,
    tick: (a as any).tick,
    scope: (a as any).scope
  }
}
/* =========================================================
   Condition変換
========================================================= */
function convertCondition(c: any): SemanticCondition | undefined {
  if (!c) return undefined

  switch (c.type) {

    case "unitCost":
      return { kind: "unit_cost", value: Number(c.value) }

    case "selfHpBelowPercent":
      return { kind: "self_hp_below", percent: Number(c.value) }

    case "targetHpBelowPercent":
      return { kind: "target_hp_below", percent: Number(c.value) }

    case "allyHpBelowPercent":
      return { kind: "ally_hp_below", percent: Number(c.value) }
    
      case "forgeEquipCount":
        return {
          kind: "equip_count_at_least",
          value: Number(c.value)
        }
    case "counter":
      return {
        kind: "counter_at_least",
        key: c.key,
        min: Number(c.min),
        scope: c.scope
      }

    case "onEquipCount":
      return { kind: "equip_count_at_least", value: Number(c.value) }

    case "hasAbsorbedAllRoles":
      return { kind: "has_absorbed_all_roles" }

    default:
      return undefined
  }
}

function convertDuration(d?: any): any {
  if (!d) return undefined

  switch (d.type) {
    case "time":
      return { type: "time", value: d.value }

    case "turn":
      // 🔥 UIにはturn概念がないので変換
      return {
        type: "time",
        value: d.value * 1 // ← とりあえず1ターン=1秒扱い
      }

    default:
      return undefined
  }
}