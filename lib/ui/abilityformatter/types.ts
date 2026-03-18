/* =========================================================
   Semantic Types（完全版）
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
  | { kind: "counter_at_least"; scope?: string; key: string; min: number }
  | { kind: "has_absorbed_all_roles" }
  | { kind: "equip_count_at_least"; value: number }
  | { kind: "board_count_at_least"; pack?: string; role?: string; min: number }
  | { kind: "unknown"; raw: any }

export type SemanticEffect =
  /* =========================
     STAT
  ========================= */

  | {
      kind: "stat_mod"
      stat: string
      percent?: boolean
      value: number
      target?: string
      duration?: any
    }

  | {
      kind: "mod_stat_from_counter"
      stat: string
      key: string
      multiplier: number
      target?: string
    }

  /* =========================
     STATE
  ========================= */

  | {
      kind: "add_state"
      stateType: string
      value?: number
      target?: string
      consumeOn?: string
      duration?: any
      maxStack?: number
      maxTotalValue?: number
    }

  | {
      kind: "remove_state"
      stateType: string
      target?: string
    }

  /* =========================
     DAMAGE
  ========================= */

  | {
      kind: "damage"
      value: number
      target?: string
      ignoreDR?: boolean
      duration?: any
    }

  | {
      kind: "damage_percent"
      value: number
      target?: string
      duration?: any
    }

  | {
      kind: "damage_split"
      value: number
      hits?: number
      target?: string
      duration?: any
    }

  | {
      kind: "damage_from_counter"
      key: string
      multiplier: number
      target?: string
      duration?: any
    }

  /* =========================
     HEAL
  ========================= */

  | {
      kind: "heal"
      value: number
      target?: string
      percent?: boolean
      duration?: any
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
      target?: string
      duration?: any
    }

  /* =========================
     SUMMON
  ========================= */

  | {
      kind: "summon"
      unitId?: string
      target?: string
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
      target?: string
      duration?: any
    }

  /* =========================
     COUNTER
  ========================= */

  | {
      kind: "increment_counter"
      key: string
      value?: number
      scope?: "self" | "team" | "battle" | "match" | "turn"
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
      target?: string
    }

  /* =========================
     FALLBACK
  ========================= */

  | {
      kind: "unknown"
    }

export type SemanticAbility = {
  trigger?: string
  effects: SemanticEffect[]
  condition?: SemanticCondition
  once?: boolean
  delay?: any
  aura?: boolean
  tick?: any
  scope?: string
}
