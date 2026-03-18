export type Phase = "setup" | "battle" | "lose"

export type UnitMode = "unit" | "equipment" | "synergy" | "hero"

export type Row = "front" | "back"

export type BattleSide = "p1" | "p2"

 export type GameState = {
  p1: PlayerState
  p2: PlayerState
  sharedPool: Unit[]
  claimedHeroes: Record<string, "p1" | "p2">
  activePacks: PackId[]
}
export type Stat =
  | "hp"
  | "atk"
  | "attackSpeed"
  | "damageReduce"
  | "attackRange"

 export type AbilityScope = "unit" | "team" | "global"



  // ===== Ability System (NEW) =====

export type Ability = {
  id?: string
  trigger: BattleTrigger;        // いつ発動するか
  effects: AbilityEffect[]; 
  aura?: boolean;
  condition?: AbilityCondition;
  tick?: AbilityTickCondition     // 何が起きるか
  once?: boolean;                // 1戦闘1回
  used?: boolean; 
  duration?: AbilityDuration
  maxTriggers?: number
  priority?: number // ★追加（大きいほど先）
  pack?: PackId
  // ★ auraTick 用内部状態
  __lastTickTime?: number
  __stackCount?: number// 実行済みフラグ（戦闘中のみ使用）
__expiresAt?: number
__remainingTurns?: number
delay?: { type: "time"; value: number }
  scope?: AbilityScope
};

// Ability の発動条件
export type AbilityCondition =
  | "hasFrontAlly"
  | "hasBackAlly"
  | "isFront"
  | "isBack"
  | "allyCrossBelow50"
  | "deadAlly"
  | "deadEnemy"
  | { type: "onEquipCount"; value: number }
  | { type: "forgeEquipCount"; value: number }
  | {
      type: "counter"
      key: string
      scope: "battle" | "match" | "turn"
      min: number
    }
  | {
      type: "enemyHasCurse"
      value: number
    }
  | {
    type:"boardCount"
    pack?:PackId
    role?:string
    min:number
  }
  | {type: "ancientWeaponCountBelow"; value: number}
  | { type: "targetHasCurse"; value: number }
  | { type: "deadRoleIs"; value: BattleRole }
  | { type: "hasAbsorbedAllRoles"; value: number }
  | { type: "targetHpBelowPercent"; value: number }
  | { type: "selfHpBelowPercent"; value: number }
  | { type: "allyHpBelowPercent"; value: number }
  | { 
      type: "customBoardCount";
      requiredPack: string;
      requiredCount: number;
      additionalPacks: string[];
      additionalMin: number;
      totalMin: number;
    }
  |{
      type: "boardCost",
      pack?: PackId
      min: number
    }
 | {
     type: "unitFullEquipCount"
     min: number
   }
  |{
  type: "unitCost"
  value: number
}
type AbilityDuration =
  | { type: "turn"; value: number }
  | { type: "time"; value: number } // seconds


export type AbilityTickCondition =
  | {
      type: "everySeconds"
      seconds: number
      maxStack?: number
    }


export type Effect =
  | {
      kind: "stat"
      stat: Stat
      value: number
    }
  | {
      kind: "aura"
      stat: Stat
      value: number
    }
  | {
      kind: "keyword"
      key: "once"
      stat: Stat
      value: number
    }

export type BattleUnit = {
  instanceId: string
  unitId: string
  unitName: string
  prevHp?: number
  // ★ setupで必要（売却/表示/制約）
  cost: number
  owner: "p1" | "p2"
  equipments: Unit[] // 装備実体
  states?: BattleStateEffect[]
  mode: UnitMode
  ephemeral?: boolean
  index: number
  pack: PackId
  currentTargetId?: string
  ancientForgeComplete?: boolean

  hp: number
  maxHp: number
  atk: number

  attackSpeed: number

  baseAtk: number
  baseMaxHp: number
  baseAttackSpeed: number
  baseDamageReduce: number

  row: "front" | "back"
  pos?: {
  r: number
  c: number
}

prevPos?: {
  r: number
  c: number
}
  role: BattleRole
  attackRange: AttackRange

  nextActionTime: number
  side: "p1" | "p2"

  damageDealt: number
  damageTaken: number

  // ★ once は必ずここ
  abilities?: Ability[]
  isDying?: boolean

  guardAdjacent?: {
  once?: boolean
  used?: boolean
}
timedModifiers?: TimedStatModifier[]
}

export type TimedStatModifier = {
  stat: Stat
  value: number
  expiresAt: number
  __restoreRange?: AttackRange
}


export type BattleRole =
  | "tank"
  | "bruiser"
  | "skirmisher"
  | "ranged"
  | "support"

  export type AbsorbTrigger = `onAbsorb_${BattleRole}`

 export type AttackRange = number

 /* =========================
   スキル（今は未使用・差し込み口）
========================= */
export type Skill = {
  trigger: "onAttack" | "battleStart" | "onKill" | "battleEnd"
  once?: boolean
  used?: boolean
  effects: Effect[]
}

/* =========================
   パック
==========================*/
export type PackId =
  | "Varkesh"
  | "Knightsteel"
  | "Antiqua"

/* =========================
   ユニット本体
========================= */
export type Unit = {
  id: string
  baseName: string
  name: string
  mode: UnitMode
  cost: number
  role: BattleRole
  pack: PackId,
  // 既存ステータス（変更しない）
  hp: number
  atk: number
  attackRange: AttackRange
  abilities?: Ability[];
  // 既存効果
  effects: Effect[]
  heroTiming?: "battleStart" | "battleEnd" | "turnStart" // いつ判定するか
  // 装備スロット
  equipments: Unit[]
  ephemeral?: boolean

  // 装備・シナジー変換先（既存思想の核）
  variants?: {
    equipment?: {
      name: string
      baseStats?: Partial<Record<Stat, number>>
      abilities?: Ability[];
      effects: Effect[]
    }
    synergy?: {
      name: string
      abilities?: Ability[];
      effects: Effect[]
    }
  }

  // 盤面配置用（将来拡張用）
  row?: Row
  placement?: "front_only" | "any"

  
}

export type AbilityTarget =
  | "self"
  | "all_allies"
  | "all_enemies"
  | "front_allies"
  | "back_allies"
  | "type:ranged"
  | "type:tank"
  | "lowest_hp_ally"
  | "random_enemy"
  | "equipped_allies"
  | "target"
  | "random_ally"
  | "highest_range_ally"
  | "lowest_as_ally"
  | "all_other_allies"
  | "front_tanks"
  | "all_units"
  | "highest_hp_enemy"
  | "highest_atk_ally"
  | "allies_below_hp_percent"
  | "adjacent_enemies"
  | "enemy_column"
  | "equipped_enemy"



type AbilityEffectBase = {
  target?: AbilityTarget
  duration?: AbilityDuration  
  targetHpPercent?: number
}

export type AbilityEffect =
  | (AbilityEffectBase & {
      type: "MOD_STAT"
      stat: Stat
      value: number
    })
  | (AbilityEffectBase & {
      type: "HEAL"          // ★追加
      value: number
    })
  | (AbilityEffectBase & {
      type: "GUARD_ADJACENT"   // ★追加
      once?: boolean          // 各戦闘1回など
    })
  | (AbilityEffectBase &{
      type: "HEAL_PERCENT"
      value: number 
      target?: AbilityTarget
    })
  | (AbilityEffectBase & {
      type: "SET_ATTACK_RANGE"
      value: number |"next"
      target?: AbilityTarget
    })
  | (AbilityEffectBase & {
    type: "MOD_STAT_PERCENT"
    stat: Stat
    value: number
  })

  | (AbilityEffectBase & {
    type: "SELF_DAMAGE"
    value: number
  })

  | (AbilityEffectBase & {
    type: "EXECUTE"
    ignoreLethalImmunity?: boolean // 任意：処刑が無敵を貫通するか
    ignoreDR?: boolean             // 任意：一応持たせてもいい（基本不要）
  })

    | (AbilityEffectBase & {
      type: "DAMAGE_FROM_STATE"
      stateType: "self_damage_count" | "curse_stack" | "as_stack" | "atk" | "hp"
      multiplier: number
      ignoreDR?: boolean
    })
    | (AbilityEffectBase & {
      type: "MOD_STAT_FROM_COUNTER"
      stat: Stat
      key: string
      scope?: "battle" | "match"
      multiplier: number
    })
  | (AbilityEffectBase & {
    type: "REMOVE_STATE"
    stateType: BattleStateEffect["type"]
  })
  | (AbilityEffectBase & {
  type: "TAUNT_ALL"
})
  | (AbilityEffectBase & {
  type: "SUMMON"
  unitId: string
  maxSummons?: number
})


  | (AbilityEffectBase & {
      type: "DAMAGE"
      value: number
      ignoreDR?: boolean 
    }
  )
  | (AbilityEffectBase & {
  type: "DIG_RELIC"
  })
  | (AbilityEffectBase & {
  type: "DESTROY_EQUIPMENT"
  counterKey?: string
})
  | (AbilityEffectBase & {
    type: "CREATE_ANCIENT_WEAPON"
  })
  | (AbilityEffectBase & {
  type: "ADD_STATE"
  stateType:
    | "damage_amp"
    | "damage_taken_amp"
    | "damage_reduce"
    | "lethal_immunity"
    | "duel"
    | "first_attack_boost"
    | "as_stack"
    | "curse_stack"
    | "stun"
    | "atk"
    | "hp"
    | "self_damage_count"
    | "ignore_dr_next_attack"
    | "absorbed_tank"
    | "absorbed_bruiser"
    | "absorbed_skirmisher"
    | "absorbed_ranged"
    | "absorbed_support"
  value?: number
  stacks?: number
  duration?: AbilityDuration
  maxStack?: number
  maxTotalValue?: number
  consumeOn?:
    | "onDamageTaken"
    | "onAttack"
    | "onKill"
})

| (AbilityEffectBase & {
  type: "INCREMENT_COUNTER"
  key: string
  scope?: "battle" | "match"
  value?: number
})

| (AbilityEffectBase & {
  type: "DAMAGE_FROM_COUNTER"
  key: string
  scope?: "battle" | "match"
  multiplier: number
})

| (AbilityEffectBase & {
  type: "CLAIM_HERO"
  heroId: string
})




export type BattleTrigger =
  | "battleStart"
  | "onAttack"
  | "onKill"
  | "battleEnd"
  | "onDeath"
  | "auraTick"
  | "onDamageTaken"
  | "onEquip"
  | "firstDeath"
  | "onSelfDamage"
  | "onAllRolesAbsorbed"
  | AbsorbTrigger



export type BattleStateEffect = {
  id: string
  type:
    | "duel"
    | "damage_amp"
    | "lethal_immunity"
    | "as_stack"
    | "aura_presence"
    | "first_attack_boost"
    // ★追加（MOD_STAT用）
    | "atk"
    | "hp"
    | "damage_reduce"
    | "damage_taken_amp"
    | "curse_stack"
    | "stun"
    | "self_damage_count"
    | "ignore_dr_next_attack"
    | "absorbed_tank"
    | "absorbed_bruiser"
    | "absorbed_skirmisher"
    | "absorbed_ranged"
    | "absorbed_support"
    | "taunt"
  value?: number
  expiresAt?: number
  stacks?: number
  targetId?: string

  // ★追加（将来：1回消費系に使う）
  consumeOn?: "onDamageTaken" | "onAttack" | "onKill" | null
}



/* =========================
   バトルイベント・ログ
========================= */
export type BattleEvent =
  | { type: "battleStart" }
  | { type: "attack"; from: string; to: string; damage: number } // ← instanceId
  | { type: "skill"; instanceId: string; unitName: string; trigger: BattleTrigger }
  | { type: "death"; instanceId: string; unitName: string }
  | { type: "kill"; instanceId: string; unitName: string }
  | { type: "battleEnd" }



export type BattleLog = {
  action:
  | "move"
  | "attack"
  | "damage"
  | "heal"
  | "death"
  | "kill"
  | "skill"
  | "curse"
  side?: "p1" | "p2"
  unitId?: string
  unitName?: string
  instanceId?: string
  value?: number

  damage?: number

  from?: { r: number; c: number }
  to?: { r: number; c: number }

  text?: string
  message?: string

  trigger?: BattleTrigger

  time: number
}

export type AttackRangeStep = "next"


/* =========================
   プレイヤー
========================= */
export type PlayerState = {
  board: (BattleUnit | null)[]
  packId: PackId
  hand: Unit[]
  pp: number
  maxPP: number
  maxBoardUnits: number
  synergies: Unit[]
  equipmentStock: Unit[]
  ancientWeapons?: string[]
  hero?: Unit
  hp: number
  phase: Phase
  lastBattleLogs: BattleLog[]
  debugBattleLogs: string[]
  turn: number
  synergyUsedThisTurn: boolean
  battleResult?: {
  p1: BattleUnit[]
  p2: BattleUnit[]
} | null
rerollCharges: number
maxRerollCharges: number
counters: {
  match: Record<string, number>
  turn: Record<string, number>
  battle: Record<string, number>
}
pendingHero?: Unit | null
activeHeroThisTurn?: Unit | null
}

export type BattleResult = {
  winner: "p1" | "p2"
  p1Survivors: number
  p2Survivors: number
  logs: BattleLog[]
  initialBoard?: (BattleUnit | null)[]
}


export type PreBattlePhase =
  | "packSelect"
  | "ready"

export type PreBattleState = {
  p1Pack: PackId | null
  p2Pack: PackId | null
  phase: "packSelect" | "p2Selecting" | "fusion" | "ready"
}

export type CombatTelemetry = {
  damageDealt: Record<string, number>
  damageTaken: Record<string, number>
  healing: Record<string, number>
  kills: Record<string, number>
}