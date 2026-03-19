import { Unit } from "@/types"

import { ensureAbilityIds } from "@/lib/utils/autoAbilityId"

export const ANTIQUA_RELICS_T1: Unit[] = ensureAbilityIds( [

{
  id: "relic_atk",
  baseName: "炎のレリック",
  name: "Flame Relic",
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
      name: "Flame Relic",
      baseStats: { atk: 2 },
      effects: [],
      abilities: []
    }
  }
},

{
  id: "relic_hp",
  baseName: "水のレリック",
  name: "Aqua Relic",
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
      name: "Aqua Relic",
      baseStats: { hp: 3 },
      effects: [],
      abilities: []
    }
  }
},

{
  id: "relic_as",
  baseName: "風のレリック",
  name: "Gale Relic",
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
      name: "Gale Relic",
      baseStats: { attackSpeed: 0.08 },
      effects: [],
      abilities: []
    }
  }
},

{
  id: "relic_regen",
  baseName: "土のレリック",
  name: "Terra Relic",
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
      name: "Terra Relic",
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
  name: "Ember Core",
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
      name: "Ember Core",
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
  name: "Tide Core",
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
      name: "Tide Core",
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
  name: "Storm Core",
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
      name: "Storm Core",
      baseStats: { attackSpeed: 0.15 },
      effects: [],
      abilities: []
    }
  }
},
{
  id: "relic_t2_regen_core",
  baseName: "土神核",
  name: "Earthshard Core",
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
      name: "Earthshard Core",
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
  name: "Phoenix Soul",
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
      name: "Phoenix Soul",
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
  name: "Tiger Soul",
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
      name: "Tiger Soul",
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
  name: "Turtle Soul",
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
      name: "Turtle Soul",
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
  name: "Dragon Soul",
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
      name: "Dragon Soul",
      baseStats: { hp: 3 },

      effects: [],
      abilities: [
        {
          trigger: "battleStart",
          effects: [
            { type: "MOD_STAT", stat: "atk", value: 2, target: "self" },
            { type: "MOD_STAT", stat: "attackSpeed", value: 0.1, target: "self" }
          ]
        }
      ]
    }
  }
}

])