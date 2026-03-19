import { Unit } from "@/types"

import { ensureAbilityIds } from "@/lib/utils/autoAbilityId"

export const ANCIENT_WEAPONS: Unit[] = ensureAbilityIds( [

{
  id: "ancient_weapon_pluto",
  baseName: "天下の冥砲 プルートゥ",
  name: "Pluto, Abyssal Worldcannon",
  mode: "unit",
  pack: "Antiqua",
  cost: 0,
  role: "support",

  hp: 0,
  atk: 0,
  attackRange: 1,
  effects: [],
  equipments: [],

  variants: {
    equipment: {
      name: "Pluto, Abyssal Worldcannon",
      baseStats: { atk: 16, hp: 8, },
      effects: [],
      abilities: [

    {
      id: "ancient_weapon_pluto_weapon",
      trigger: "onAttack",
      effects: [
        {
          type: "DAMAGE",
          value: 8,
          target: "adjacent_enemies"
        }
      ]
    },

    {
      trigger: "onKill",
      effects: [
        {
          type: "ADD_STATE",
          stateType: "atk",
          value: 4,
          target: "self"
        }
      ]
    }
  ]
  }
}
},
{
  id: "ancient_weapon_epsilon",
  baseName: "星喰らう衣 エプシロン",
  name: "Epsilon, Star-Eater Mantle",
  mode: "unit",
  pack: "Antiqua",
  cost: 0,
  role: "support",

  hp: 0,
  atk: 0,
  attackRange: 1,
  effects: [],
  equipments: [],

  variants: {
    equipment: {
      name: "Epsilon, Star-Eater Mantle",
      baseStats: { atk: 10, hp: 20},
      effects: [],
      abilities: [

    {
      id: "ancient_weapon_epsilon_weapon",
      trigger: "auraTick",
      tick: { type: "everySeconds", seconds: 3 },

      effects: [
        {
          type: "HEAL",
          value: 10,
          target: "self"
        }
      ]
    }

  ]
}
}
},
{
  id: "ancient_weapon_atom",
  baseName: "調和の天秤 アトム",
  name: "Atom, Scales of Equilibrium",
  mode: "unit",
  pack: "Antiqua",
  cost: 0,
  role: "support",

  hp: 0,
  atk: 0,
  attackRange: 1,
  effects: [],
  equipments: [],

  variants: {
    equipment: {
      name: "Atom, Scales of Equilibrium",
      baseStats: { atk: 14, hp: 12 },
      effects: [],
      abilities: [

{
  id: "ancient_weapon_atom_weapon",
  trigger: "onAttack",
  effects: [
    {
      type: "ADD_STATE",
      stateType: "atk",
      value: -4,
      target: "target"
    },
    {
      type: "ADD_STATE",
      stateType: "atk",
      value: 4,
      target: "self"
    }
  ]
},

{
  id: "ancient_weapon_atom_weapon2",
  trigger: "onAttack",
  effects: [
    {
      type: "ADD_STATE",
      stateType: "as_stack",
      value: -0.2,
      target: "target"
    },
  ]
  }
  ]
  }
}
}
])