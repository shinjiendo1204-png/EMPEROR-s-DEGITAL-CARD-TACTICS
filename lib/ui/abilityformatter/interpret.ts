import { Ability, AbilityEffect } from "@/types"
import type { SemanticAbility, SemanticEffect, SemanticCondition } from "./types"

/* =========================================================
   interpret（完全版）
========================================================= */

export function interpretAbility(a: Ability): SemanticAbility {

  const effects: SemanticEffect[] = (a.effects ?? [])
    .filter((e): e is AbilityEffect => !!e && !!e.type)
    .map((e: AbilityEffect): SemanticEffect => {

      switch (e.type) {

        /* =========================
           STAT
        ========================= */
        case "MOD_STAT":
          return {
            kind: "stat_mod",
            stat: e.stat,
            value: e.value,
            percent: false,
            target: e.target,
            duration: e.duration
          }

        case "MOD_STAT_PERCENT":
          return {
            kind: "stat_mod",
            stat: e.stat,
            value: e.value,
            percent: true,
            target: e.target,
            duration: e.duration
          }

        case "MOD_STAT_FROM_COUNTER":
          return {
            kind: "mod_stat_from_counter",
            stat: (e as any).stat,
            key: (e as any).key,
            multiplier: (e as any).multiplier,
            target: e.target
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
            duration: e.duration
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
            duration: e.duration
          }

        
  

        case "DAMAGE_FROM_COUNTER":
          return {
            kind: "damage_from_counter",
            key: (e as any).key,
            multiplier: (e as any).multiplier,
            target: e.target,
            duration: e.duration
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
            duration: e.duration
          }

        case "HEAL_PERCENT":
          return {
            kind: "heal",
            value: e.value,
            target: e.target,
            percent: true,
            duration: e.duration
          }

        /* =========================
           SPECIAL DAMAGE
        ========================= */
        case "SELF_DAMAGE":
          return {
            kind: "self_damage",
            value: e.value
          }

        /* =========================
           RANGE
        ========================= */
        case "SET_ATTACK_RANGE":
          return {
            kind: "set_attack_range",
            value: e.value,
            target: e.target,
            duration: e.duration
          }
        /* =========================
           SUMMON
        ========================= */
        case "SUMMON":
          return {
            kind: "summon",
            unitId: (e as any).unitId,
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
            duration: e.duration
          }

        /* =========================
           FALLBACK
        ========================= */
        default:
          console.error("Unknown ability effect:", e)
          return { kind: "unknown" } as any
      }
    })

  return {
    trigger: a.trigger,
    effects,
    condition: convertCondition(a.condition),
    once: a.once,
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

  if (typeof c === "string") {
    if (c === "deadAlly") return { kind: "dead_ally" }
    if (c === "deadEnemy") return { kind: "dead_enemy" }
    return undefined
  }

  switch (c.type) {

    case "unitCost":
  return { type: "unitCost", value: Number(c.value) } as any
  
    case "selfHpBelowPercent":
      return { kind: "self_hp_below", percent: Number(c.value) }

    case "targetHpBelowPercent":
      return { kind: "target_hp_below", percent: Number(c.value) }

    case "allyHpBelowPercent":
      return { kind: "ally_hp_below", percent: Number(c.value) }

    case "enemyHasCurse":
      return { kind: "enemy_has_curse", value: Number(c.value) }

    case "targetHasCurse":
      return { kind: "target_has_curse", value: Number(c.value) }

    case "counter":
      return {
        kind: "counter_at_least",
        key: c.key,
        min: Number(c.min),
        scope: c.scope
      }

    case "onEquipCount":
      return { kind: "equip_count_at_least", value: Number(c.value) }

    case "deadRoleIs":
      return { kind: "dead_role_is", role: c.value }

    case "hasAbsorbedAllRoles":
      return { kind: "has_absorbed_all_roles" }

    case "boardCount":
      return {
        kind: "board_count_at_least",
        pack: c.pack,
        role: c.role,
        min: Number(c.min)
      } as any

    default:
      return undefined
  }
}