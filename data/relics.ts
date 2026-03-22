import { Unit } from "@/types"

import { ensureAbilityIds } from "@/lib/utils/autoAbilityId"

export const ANTIQUA_RELICS_T1: Unit[] = ensureAbilityIds( [

{
  id: "relic_atk",
  baseName: "炎のレリック",
  name: "炎のレリック",
  mode: "unit",
  pack: "Antiqua",
  cost: 0,
  role: "support",

  hp: 0,
  atk: 0,
  attackRange: 1,
  effects: [],
  equipments: [],
  ephemeral: true,

  variants: {
    equipment: {
      name: "炎のレリック",
      baseStats: { atk: 2 },
      effects: [],
      abilities: []
    }
  }
},

{
  id: "relic_hp",
  baseName: "水のレリック",
  name: "水のレリック",
  mode: "unit",
  pack: "Antiqua",
  cost: 0,
  role: "support",

  hp: 0,
  atk: 0,
  attackRange: 1,

  effects: [],
  equipments: [],
  ephemeral: true,

  variants: {
    equipment: {
      name: "水のレリック",
      baseStats: { hp: 3 },
      effects: [],
      abilities: []
    }
  }
},

{
  id: "relic_as",
  baseName: "風のレリック",
  name: "風のレリック",
  mode: "unit",
  pack: "Antiqua",
  cost: 0,
  role: "support",

  hp: 0,
  atk: 0,
  attackRange: 1,

  effects: [],
  equipments: [],
  ephemeral: true,

  variants: {
    equipment: {
      name: "風のレリック",
      baseStats: { attackSpeed: 0.08 },
      effects: [],
      abilities: []
    }
  }
},

{
  id: "relic_regen",
  baseName: "土のレリック",
  name: "土のレリック",
  mode: "unit",
  pack: "Antiqua",
  cost: 0,
  role: "support",

  hp: 0,
  atk: 0,
  attackRange: 1,

  effects: [],
  equipments: [],
  ephemeral: true,

  variants: {
    equipment: {
      name: "土のレリック",
      baseStats: {hp: 1},
      effects: [],
      abilities: [
        {
          trigger: "auraTick",
          tick: { type: "everySeconds", seconds: 3 },
          effects: [
            {
              type: "HEAL",
              value: 1,
              target: "self"
            }
          ]
        }
      ]
    }
  }
}

])

export const ANTIQUA_RELICS_T2: Unit[] = ensureAbilityIds([
  {
  id: "relic_t2_flame_core",
  baseName: "炎神核",
  name: "炎神核",
  mode: "unit",
  pack: "Antiqua",
  cost: 0,
  role: "support",

  hp: 0,
  atk: 0,
  attackRange: 1,
  effects: [],
  equipments: [],
  ephemeral: true,

  variants: {
    equipment: {
      name: "炎神核",
      baseStats: { atk: 3 },
      effects: [],
      abilities: [
        {
          trigger: "onAttack",
          effects: [
            { type: "DAMAGE", value: 1, target: "adjacent_enemies" }
          ]
        }
      ]
    }
  }
},
{
  id: "relic_t2_ancient_crystal",
  baseName: "水神核",
  name: "水神核",
  mode: "unit",
  pack: "Antiqua",
  cost: 0,
  role: "support",

  hp: 0,
  atk: 0,
  attackRange: 1,
  effects: [],
  equipments: [],
  ephemeral: true,

  variants: {
    equipment: {
      name: "水神核",
      baseStats: { hp: 5 },
      effects: [],
      abilities: [
        {
          trigger: "onDamageTaken",
          effects: [
            { type: "HEAL", value: 1, target: "self" }
          ]
        }
      ]
    }
  }
},
{
  id: "relic_t2_wind_core",
  baseName: "風神核",
  name: "風神核",
  mode: "unit",
  pack: "Antiqua",
  cost: 0,
  role: "support",

  hp: 0,
  atk: 0,
  attackRange: 1,
  effects: [],
  equipments: [],
  ephemeral: true,

  variants: {
    equipment: {
      name: "風神核",
      baseStats: { attackSpeed: 0.15 },
      effects: [],
      abilities: []
    }
  }
},
{
  id: "relic_t2_regen_core",
  baseName: "土神核",
  name: "土神核",
  mode: "unit",
  pack: "Antiqua",
  cost: 0,
  role: "support",

  hp: 0,
  atk: 0,
  attackRange: 1,
  effects: [],
  equipments: [],
  ephemeral: true,

  variants: {
    equipment: {
      name: "土神核",
      baseStats: { hp: 3 },
      effects: [],
      abilities: [
        {
          trigger: "auraTick",
          tick: { type: "everySeconds", seconds: 2 },
          effects: [
            { type: "HEAL", value: 1, target: "self" }
          ]
        }
      ]
    }
  }
},

])
export const ANTIQUA_RELICS_T3: Unit[] = ensureAbilityIds( [
  {
  id: "relic_t3_ancient_core",
  baseName: "フェニックスソウル",
  name: "フェニックスソウル",
  mode: "unit",
  pack: "Antiqua",
  cost: 0,
  role: "support",

  hp: 0,
  atk: 0,
  attackRange: 1,
  effects: [],
  equipments: [],
  ephemeral: true,

  variants: {
    equipment: {
      name: "フェニックスソウル",
      baseStats: { atk: 4, hp: 4 },
      effects: [],
      abilities: [
        {
          trigger: "auraTick",
          tick: { type: "everySeconds", seconds: 3 },
          effects: [
            { type: "DAMAGE", value: 1, target: "all_enemies" }
          ]
        }
      ]
    }
  }
},
{
  id: "relic_t3_ancient_crown",
  baseName: "タイガーソウル",
  name: "タイガーソウル",
  mode: "unit",
  pack: "Antiqua",
  cost: 0,
  role: "support",

  hp: 0,
  atk: 0,
  attackRange: 1,
  effects: [],
  equipments: [],
  ephemeral: true,

  variants: {
    equipment: {
      name: "タイガーソウル",
      baseStats: { atk: 3, hp: 6 },
      effects: [],
      abilities: [
        {
          trigger: "battleStart",
          effects: [
            { type: "MOD_STAT", stat: "attackSpeed", value: 0.2, target: "self" }
          ]
        }
      ]
    }
  }
},
{
  id: "relic_t3_guardian_stone",
  baseName: "タートルソウル",
  name: "タートルソウル",
  mode: "unit",
  pack: "Antiqua",
  cost: 0,
  role: "support",

  hp: 0,
  atk: 0,
  attackRange: 1,
  effects: [],
  equipments: [],
  ephemeral: true,

  variants: {
    equipment: {
      name: "タートルソウル",
      baseStats: { hp: 6 },
      effects: [],
      abilities: [
        {
          trigger: "battleStart",
          effects: [
            { type: "ADD_STATE", stateType: "damage_reduce", value: 2, target: "self" }
          ]
        }
      ]
    }
  }
},
{
  id: "relic_t3_reactor",
  baseName: "ドラゴンソウル",
  name: "ドラゴンソウル",
  mode: "unit",
  pack: "Antiqua",
  cost: 0,
  role: "support",

  hp: 0,
  atk: 0,
  attackRange: 1,
  effects: [],
  equipments: [],
  ephemeral: true,

  variants: {
    equipment: {
      name: "ドラゴンソウル",
      baseStats: { atk: 5 ,hp: 6 },

      effects: [],
      abilities: [

      ]
    }
  }
}

])