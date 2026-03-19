import type { Stat, BattleTrigger, AbilityTarget} from "@/types"


export type CounterScope =
  | "self"
  | "team"
  | "battle"
  | "match"
  | "turn"

export type Duration =
  | { type: "instant" }
  | { type: "time"; value: number }
  | { type: "until_death" }
  | { type: "next_attack" }
  | { type: "permanent" }

/* =========================================================
   Condition
========================================================= */

export type SemanticCondition =
  | { kind: "dead_ally" }
  | { kind: "dead_enemy" }
  | { kind: "self_hp_below"; percent: number }
  | { kind: "target_hp_below"; percent: number }
  | { kind: "ally_hp_below"; percent: number }
  | { kind: "enemy_has_curse"; value: number }
  | { kind: "target_has_curse"; value: number }
  | { kind: "dead_role_is"; role: string }
  | { kind: "has_front_ally" }
  | { kind: "has_back_ally" }
  | { kind: "is_front" }
  | { kind: "is_back" }
  | { kind: "ally_cross_below"; percent: number }
  | { kind: "counter_at_least"; scope?: CounterScope; key: string; min: number }
  | { kind: "has_absorbed_all_roles" }
  | { kind: "equip_count_at_least"; value: number }
  | { kind: "board_count_at_least"; pack?: string; role?: string; min: number }
  | { kind: "unknown"; raw: any }
  | {
    kind: "unit_cost"
    value: number
  }

/* =========================================================
   Effect
========================================================= */

export type SemanticEffect =
  /* =========================
     STAT
  ========================= */

  | {
      kind: "stat_mod"
      stat: Stat
      percent?: boolean
      value: number
      target?: AbilityTarget
      duration?: Duration
    }

  | {
      kind: "mod_stat_from_counter"
      stat: Stat
      key: string
      multiplier: number
      target?: AbilityTarget
      maxStack: number
    }

  /* =========================
     STATE
  ========================= */

  | {
      kind: "add_state"
      stateType: string
      value?: number
      target?: AbilityTarget
      consumeOn?: string
      duration?: Duration
      maxStack?: number
      maxTotalValue?: number
    }

  | {
      kind: "remove_state"
      stateType: string
      target?: AbilityTarget
    }

  /* =========================
     DAMAGE
  ========================= */

  | {
      kind: "damage"
      value: number
      target?: AbilityTarget
      ignoreDR?: boolean
      duration?: Duration
    }

  | {
      kind: "damage_percent"
      value: number
      target?: AbilityTarget
      duration?: Duration
    }

  | {
      kind: "damage_split"
      value: number
      hits?: number
      target?: AbilityTarget
      duration?: Duration
    }

  | {
      kind: "damage_from_counter"
      key: string
      multiplier: number
      target?: AbilityTarget
      duration?: Duration
    }

  /* =========================
     HEAL
  ========================= */

  | {
      kind: "heal"
      value: number
      target?: AbilityTarget
      percent?: boolean
      duration?: Duration
    }

  /* =========================
     SPECIAL DAMAGE
  ========================= */

  | {
      kind: "self_damage"
      value: number
    }

  /* =========================
     RANGE
  ========================= */

  | {
      kind: "set_attack_range"
      value: number | "next"
      target?: AbilityTarget
      duration?: Duration
    }

  /* =========================
     SUMMON
  ========================= */

  | {
      kind: "summon"
      unitId?: string
      target?: AbilityTarget
      count?: number
    }

  | {
      kind: "summon_limit"
      value?: number
    }

  /* =========================
     SPECIAL
  ========================= */

  | {
      kind: "create_ancient_weapon"
    }

  | {
      kind: "guard_adjacent"
      target?: AbilityTarget
      duration?: Duration
    }

  /* =========================
     COUNTER
  ========================= */

  | {
      kind: "increment_counter"
      key: string
      value?: number
      scope?: CounterScope
    }

  | { kind: "taunt_all" }

  /* =========================
     DIG
  ========================= */

  | {
      kind: "dig_relic"
      count?: number
    }

  /* =========================
     EQUIPMENT
  ========================= */

  | {
      kind: "destroy_equipment"
      target?: AbilityTarget
    }

  /* =========================
     FALLBACK
  ========================= */

  | {
      kind: "unknown"
    }

/* =========================================================
   Ability
========================================================= */

export type SemanticAbility = {
  trigger?: BattleTrigger

  effects: SemanticEffect[]

  condition?: SemanticCondition

  once?: boolean

  delay?: Duration

  aura?: boolean

  tick?: { type: "everySeconds"; seconds: number }

  scope?: "self" | "team"
}