import type { Unit } from "@/types"
import { setDefaultAutoSelectFamilyAttemptTimeout } from "net"

export const HERO_UNITS: Unit[] = [
  {
  id: "the_hope_alux",
  baseName: "希望の勇者 アルクス",
  name: "希望の勇者 アルクス",
  mode: "hero",
  pack: "Nightsteel",
  cost: 0,

  hp: 20,
  atk: 7,
  attackRange: 1,
  role: "skirmisher",

  effects: [],
  equipments: [],

  abilities: [
    {
      id: "alux_blessing_of_hope",
      trigger: "battleStart",
      effects: [
        {
          type: "MOD_STAT",
          stat: "hp",
          value: 6,
          target: "all_allies"
        },
        {
          type: "MOD_STAT",
          stat: "atk",
          value: 6,
          target: "all_allies"
        }
      ]
    }
  ],

  variants: {
    equipment: {
      name: "伝説の剣 ラージライト",
      baseStats: {
        atk: 10,
        hp: 10
      },
      effects: [],
      abilities: [
        {
          id: "largelight_heal_on_kill",
          trigger: "onKill",
          effects: [
            {
              type: "HEAL",
              value: 5,
              target: "self"
            }
          ]
        }
      ]
    },

    synergy: {
      name: "舞い降りる光",
      effects: [],
      abilities: [
        {
          id: "light_descends",
          trigger: "onDeath",
          condition: "deadAlly",
          effects: [
            {
              type: "HEAL",
              value: 10,
              target: "lowest_hp_ally"
            }
          ]
        }
      ]
    }
  }
},
{
  id: "hero_nightsteel_guard",
  baseName: "国繋ぐ守護者 バルガン",
  name: "国繋ぐ守護者 バルガン",
  mode: "hero",
  pack: "Nightsteel",
  cost: 0,

  hp: 30,
  atk: 2,
  attackRange: 1,
  role: "tank",

  effects: [],
  equipments: [],

  abilities: [
    {
      trigger: "battleStart",
      effects: [
        {
          type: "TAUNT_ALL"
        },
      ]
    },
    {
      trigger: "onDamageTaken",
      effects: [
        {
          type: "ADD_STATE",
          stateType: "atk",
          value: 2,
          maxStack: 30
        },
        {
          type: "ADD_STATE",
          stateType: "damage_reduce",
          value: 2,
          maxStack: 10
        }
      ]
    }
  ],

  variants: {
    equipment: {
      name: "白銀の盾 エヴァラック",
      baseStats: {
        hp: 12,
        atk: 3
      },
      effects: [],
      abilities: [
        {
          id:"eva_weapon",
          trigger: "onDamageTaken",
          effects: [
            {
              type: "ADD_STATE",
              stateType: "damage_reduce",
              value: 2,
              maxStack: 10,
            }
          ]
        }
      ]
    },

    synergy: {
      name: "鉄壁の陣",
      effects: [],
      abilities: [
        {
          id: "eva_synergey",
          trigger: "battleStart",
          effects: [
            {
              type: "MOD_STAT",
              stat: "hp",
              value: 8,
              target: "all_allies"
            },
            {
              type: "MOD_STAT",
              stat: "damageReduce",
              value: 2,
              target: "all_allies"
            }
          ]
        }
      ]
    }
  }
},
{
  id: "hero_nightsteel_swift",
  baseName: "蒼嵐の速射手 シルヴァ",
  name: "蒼嵐の速射手 シルヴァ",
  mode: "hero",
  pack: "Nightsteel",
  cost: 0,

  hp: 18,
  atk: 7,
  attackRange: 5,
  role: "ranged",

  effects: [],
  equipments: [],

  abilities: [

    /* 全体ASブースト */
    {
      id: "swift_ability",
      trigger: "battleStart",
      effects: [
        {
          type: "ADD_STATE",
          stateType: "as_stack",
          value: 0.3,
          target: "all_allies"
        }
      ]
    },

    /* 攻撃するほど速くなる */
    {
      id: "rapid_focus",
      trigger: "onAttack",
      effects: [
        {
          type: "ADD_STATE",
          stateType: "as_stack",
          value: 0.25,
          target: "self",
          maxStack: 20,
          maxTotalValue: 5,
        }
      ]
    },
     /* 攻撃カウンター */
    {
      id: "swift_counter",
      trigger: "onAttack",
      effects: [
        {
          type: "INCREMENT_COUNTER",
          key: "swiftVolley",
          scope: "battle"
        }
      ]
    },

    /* 連射スキル */
    {
      id: "storm_volley",
      trigger: "onAttack",
      condition: {
        type: "counter",
        key: "swiftVolley",
        scope: "battle",
        min: 5
      },
      effects: [
        {
          type: "DAMAGE",
          value: 5,
          target: "random_enemy"
        },
        {
          type: "DAMAGE",
          value: 5,
          target: "random_enemy"
        }
      ]
    },
  ],

  variants: {

    equipment: {
      name: "大長弓 ヴァレスト",
      baseStats: {
        atk: 10,
        hp: 6
      },
      effects: [],
      abilities: [
        {
          id: "swift_weapon",
          trigger: "onAttack",
          effects: [
            {
              type: "ADD_STATE",
              stateType: "as_stack",
              value: 0.08,
              target: "self",
              maxStack: 20
            }
          ]
        }
      ]
    },

    synergy: {
      name: "風嵐の狩り",
      effects: [],
      abilities: [
        {
          id: "swift_synergey",
          trigger: "onKill",
          effects: [
            {
              type: "ADD_STATE",
              stateType: "as_stack",
              value: 0.3,
              maxStack: 3,
              maxTotalValue: 0.9,
              target: "self"
            }
          ]
        }
      ]
    }
  }
},
{
  id: "hero_yamato",
  baseName: "白髪の黒王 ヤマト ",
  name: "白髪の黒王 ヤマト",
  mode: "hero",
  pack: "Varkesh",
  cost: 0,

  hp: 18,
  atk: 3,
  attackRange: 4,
  role: "support",

  effects: [],
  equipments: [],

  abilities: [

    /* =========================
       死亡 → グール召喚
    ========================= */

    {
      id: "yamato_ability",
      trigger: "onDeath",
      condition: "deadAlly",
      maxTriggers: 6,
      effects: [
        {
          type: "SUMMON",
          unitId: "varkesh_ghoul_token"
        }
      ]
    },

    /* =========================
       死亡カウント
    ========================= */

    {
      id: "yamato_ability2",
      trigger: "onDeath",
      effects: [
        {
          type: "INCREMENT_COUNTER",
          key: "corpseCount",
          scope: "battle"
        }
      ]
    },

    /* =========================
       10秒後ネクロ爆発
    ========================= */

    {
      id: "yamato_ability3",
      trigger: "auraTick",
      delay: { type: "time", value: 10 },
      maxTriggers: 1,
      effects: [
        {
          type: "DAMAGE_FROM_COUNTER",
          key: "corpseCount",
          scope: "battle",
          multiplier: 2,
          target: "all_enemies"
        }
      ]
    }

  ],
  variants: {
  equipment: {
  name: "黒を纏う叢雲",
  baseStats: {
    atk: 8,
    hp: 6
  },

  effects: [],

  abilities: [

    /* 味方死亡 → 即爆発 */

    {
      id: "yamato_weapon",
      trigger: "onDeath",
      condition: "deadAlly",
      effects: [
        {
          type: "DAMAGE",
          value: 3,
          target: "random_enemy"
        }
      ]
    },

    /* 死亡 → 自身強化 */

    {
      id: "yamato_wepon2",
      trigger: "onDeath",
      condition: "deadAlly",
      effects: [
        {
          type: "ADD_STATE",
          stateType: "atk",
          value: 2,
          target: "self",
          maxStack: 20
        }
      ]
    }

  ]
},
synergy: {
  name: "神への反乱",
  effects: [],
  abilities: [
    {
      id: "yamato_synergey",
      trigger: "onDeath",
      condition: "deadAlly",
      effects: [
        {
          type: "ADD_STATE",
          stateType: "atk",
          value: 2,
          target: "all_allies",
          maxStack: 10
        }
      ]
    }

  ]
}
  }
},
{
  id: "hero_blood_oni_emperor",
  baseName: "鬼の頭領 酒呑童子",
  name: "鬼の頭領 酒呑童子",
  mode: "hero",
  pack: "Varkesh",
  cost: 0,

  hp: 22,
  atk: 5,
  attackRange: 1,
  role: "bruiser",

  effects: [],
  equipments: [],

  abilities: [

    /* 血戦成長 */

    {
      id: "shuran_ability",
      trigger: "battleStart",
      effects: [
        {
          type: "MOD_STAT_FROM_COUNTER",
          stat: "atk",
          key: "selfDamage",
          scope: "match",
          multiplier: 1,
          target: "self"
        },
        {
          type: "MOD_STAT_FROM_COUNTER",
          stat: "hp",
          key: "selfDamage",
          scope: "match",
          multiplier: 1.5,
          target: "self"
        }
      ]
    },

    /* 修羅覚醒 */

    {
      id: "shuran_ability2",
      trigger: "battleStart",
      condition: {
        type: "counter",
        key: "selfDamage",
        scope: "match",
        min: 15
      },
      effects: [
        {
          type: "ADD_STATE",
          stateType: "as_stack",
          value: 0.4,
          target: "self"
        },
        {
          type: "MOD_STAT",
          stat: "atk",
          value: 8,
          target: "self"
        }
      ]
    },

    /* 鬼神覚醒 */

    {
      id: "shuran_ability3",
      trigger: "battleStart",
      condition: {
        type: "counter",
        key: "selfDamage",
        scope: "match",
        min: 25
      },
      effects: [
        {
          type: "MOD_STAT",
          stat: "atk",
          value: 12,
          target: "self"
        },
        {
          type: "MOD_STAT",
          stat: "hp",
          value: 10,
          target: "self"
        },
        {
          type: "ADD_STATE",
          stateType: "damage_reduce",
          value: 2,
          target: "self"
        }
      ]
    },

    /* 神殺し */

    {
      id: "shuran_ability4",
      trigger: "battleStart",
      condition: {
        type: "counter",
        key: "selfDamage",
        scope: "match",
        min: 30
      },
      effects: [
        {
          type: "DAMAGE",
          value: 7,
          ignoreDR: true,
          target: "target"
        }
      ]
    }
  ],

  variants: {

    /* =========================
       装備（かなり強い）
    ========================= */

    equipment: {
      name: "格別の酒 鬼殺し",
      baseStats: {
        atk: 10,
        hp: 8
      },

      effects: [],

      abilities: [

        /* 自傷でさらに強くなる */

        {
          id: "shuran_weapon",
          trigger: "onSelfDamage",
          effects: [
            {
              type: "ADD_STATE",
              stateType: "atk",
              value: 5,
              target: "self",
              maxStack: 50
            }
          ]
        },


        {
          id: "shuran_weapon2",
          trigger: "onSelfDamage",
          effects: [
            {
              type: "ADD_STATE",
              stateType: "ignore_dr_next_attack",
              target: "self"
            }
          ]
        }
      ]
    },

    /* =========================
       シナジー（弱め）
    ========================= */

    synergy: {
      name: "押し寄せる怒り",

      effects: [],

      abilities: [

        {
          id: "shuran_synergy",
          trigger: "onSelfDamage",
          effects: [
            {
              type: "ADD_STATE",
              stateType: "as_stack",
              value: 0.1,
              target: "all_allies",
              maxStack: 5
            }
          ]
        }
      ]
    }
  }
},
{
  id: "hero_shikome",
  baseName: "呪いの女神 シコメ",
  name: "呪いの女神 シコメ",
  mode: "hero",
  pack: "Varkesh",
  cost: 0,

  hp: 18,
  atk: 8,
  attackRange: 3,
  role: "skirmisher",

  effects: [],
  equipments: [],

  abilities: [

    /* =========================
       呪界契約
    ========================= */

    {
      id: "curse_pact",
      trigger: "battleStart",
      once: true,
      effects: [
        {
          type: "ADD_STATE",
          stateType: "curse_stack",
          value: 6,
          target: "all_other_allies"
        },
        {
          type: "ADD_STATE",
          stateType: "atk",
          value: 8,
          target: "all_other_allies"
        },
        {
          type: "ADD_STATE",
          stateType: "hp",
          value: 12,
          target: "all_other_allies"
        },
        {
          type: "ADD_STATE",
          stateType: "as_stack",
          value: 0.25,
          target: "all_other_allies"
        }
      ]
    },

    /* =========================
       呪界制圧
    ========================= */

    {
      id: "curse_domination",
      trigger: "auraTick",
      tick: { type: "everySeconds", seconds: 4},
      effects: [
        {
          type: "ADD_STATE",
          stateType: "stun",
          value: 1,
          target: "all_enemies",
          duration: { type: "time", value: 1 },
          maxStack: 1
        }
      ]
    }

  ],

  variants: {

    /* =========================
       装備
    ========================= */

    equipment: {
      name: "呪いの口づけ",

      baseStats: {
        hp: 10,
        atk: 5
      },

      effects: [],

      abilities: [

        /* 呪印軍団強化 */

        {
          id: "hero_sikome_weapon",
          trigger: "battleStart",
          effects: [
            {
              type: "MOD_STAT",
              stat: "atk",
              value: 4,
              target: "all_allies"
            }
          ]
        },

        /* 呪印臨界 */

        {
          id: "hero_sikome_weapon2",
          trigger: "auraTick",
          tick: { type: "everySeconds", seconds: 4},
          effects: [
            {
              type: "ADD_STATE",
              stateType: "stun",
              value: 1,
              target: "random_enemy",
              duration: { type: "time", value: 1 },
              maxStack: 1
            }
          ]
        }

      ]
    },

    /* =========================
       シナジー
    ========================= */

    synergy: {
      name: "過剰な愛情",
      effects: [],
      abilities: [

        {
          id: "hero_shikome_synergy",
          trigger: "battleStart",
          effects: [
            {
              type: "ADD_STATE",
              stateType: "curse_stack",
              value: 2,
              target: "all_allies"
            }
          ]
        },

        {
          trigger: "auraTick",
          tick: { type: "everySeconds", seconds: 2},
          maxTriggers: 3,
          effects: [
            {
              type: "ADD_STATE",
              stateType: "as_stack",
              value: 0.15,
              target: "all_allies",
              maxStack: 3
            }
          ]
        }

      ]
    }

  }
},
{
  id: "hero_antiqua_dig_relic",
  baseName: "秘宝 アースレリック",
  name: "秘宝 アースレリック",
  mode: "hero",
  pack: "Antiqua",
  cost: 0,

  hp: 6,
  atk: 0,
  attackRange: 1,
  role: "support",

  effects: [],
  equipments: [],

  abilities: [

    /* 置き物防御 */

    {
       id: "hero_relic_ability",
      trigger: "battleStart",
      effects: [
        {
          type: "ADD_STATE",
          stateType: "damage_reduce",
          value: 5,
          target: "self"
        }
      ]
    }

  ],

  variants: {

    equipment: {
      name: "光輝く魂",

      baseStats: {
        atk: 4,
        hp: 4
      },

      effects: [],

      abilities: [

        /* digパワー */

        {
           id: "hero_relic_weapon1",
          trigger: "battleStart",
          effects: [
            {
              type: "MOD_STAT_FROM_COUNTER",
              stat: "atk",
              key: "dig",
              scope: "match",
              multiplier: 0.6,
              target: "self"
            },
            {
              type: "MOD_STAT_FROM_COUNTER",
              stat: "hp",
              key: "dig",
              scope: "match",
              multiplier: 0.5,
              target: "self"
            }
          ]
        },

        /* 1コスト覚醒 */

        {
          id: "hero_relic_weapon2",
          trigger: "battleStart",
          condition: {
            type: "unitCost",
            value: 1
          },
          effects: [
            {
              type: "MOD_STAT",
              stat: "atk",
              value: 12,
              target: "self"
            },
            {
              type: "MOD_STAT",
              stat: "hp",
              value: 18,
              target: "self"
            },
            {
              type: "ADD_STATE",
              stateType: "as_stack",
              value: 0.5,
              target: "self"
            }
          ]
        },

        /* relic共鳴 */

        {
          id: "hero_relic_weapon3",
          trigger: "onAttack",
          effects: [
            {
              type: "DAMAGE",
              value: 3,
              target: "adjacent_enemies"
            }
          ]
        }

      ]
    },

    synergy: {
      name: "伝承を超えた戦い",

      effects: [],

      abilities: [

        {
          id: "hero_relic_synergy",
          trigger: "battleStart",
          effects: [
            {
              type: "MOD_STAT_FROM_COUNTER",
              stat: "atk",
              key: "dig",
              scope: "match",
              multiplier: 0.4,
              target: "all_allies"
            }
          ]
        }

      ]
    }

  }
},
{
 id: "hero_antiqua_devourer",
 baseName: "過ちの先 テンタクル",
 name: "過ちの先 テンタクル",
 mode: "hero",
 pack: "Antiqua",
 cost: 0,

 hp: 22,
 atk: 4,
 attackRange: 1,
 role: "bruiser",
 effects: [],
 equipments: [],

 abilities: [

{
  id: "hero_dark_destroy",
  trigger: "onEquip",
  effects: [
    { type: "DESTROY_EQUIPMENT", target: "self" },
  ]
},

{
  id: "hero_dark_scale",
  trigger: "onEquip",
  effects: [
    {
      type: "ADD_STATE",
      stateType: "atk",
      target: "self",
      value: 5
    },
    {
      type: "ADD_STATE",
      stateType: "hp",
      target: "self",
      value: 5,
    }
  ]
},

{
  id: "hero_dark_ability",
  trigger: "onAttack",
  effects: [
    {
      type: "ADD_STATE",
      stateType: "atk",
      value: -4,
      maxStack: -12,
      target: "equipped_enemy"
    },
    {
      type: "ADD_STATE",
      stateType: "as_stack",
      value: -0.15,
      maxStack: -0.45,
      target: "equipped_enemy"
    }
  ]
}

],

 variants: {

    equipment: {
      name: "漆黒のレリック",

      baseStats: {
        atk: 15,
        hp: 15
      },

      effects: [],

      abilities: [],
    },

    synergy: {
      name: "覆い尽くす闇",

      effects: [],

      abilities: [

        {
          id: "hero_dark_synergy",
          trigger: "battleStart",
          effects: [
            {
              type: "ADD_STATE",
              stateType: "atk",
              value: -5,
              target: "equipped_enemy"
            },
            {
              type: "ADD_STATE",
              stateType: "as_stack",
              value: -0.2,
              target: "equipped_enemy"
            }
          ]
        }

      ]
    }

  }
},
 {
  id: "hero_antiqua_overlord",
  baseName: "辿り着いた未来 ルクタンテ",
  name: "辿り着いた未来 ルクタンテ",
  mode: "hero",
  pack: "Antiqua",
  cost: 0,

  hp: 10,
  atk: 10,
  attackRange: 1,
  role: "skirmisher",

  effects: [],
  equipments: [],

  abilities: [
    {
    id: "hero_antiqua_overlord_ability",
  trigger: "onEquip",
  condition: {
    type: "forgeEquipCount",
    value: 3
  },
  effects: [
    {
      type: "DESTROY_EQUIPMENT",
      target: "self",
      counterKey: "equipmentForged"
    },
    {
      type: "CREATE_ANCIENT_WEAPON"
    }
  ]
}
  ],

   variants: {

    equipment: {
      name: "希望のレリック",

      baseStats: {
        atk: 15,
        hp: 15
      },

      effects: [],

      abilities: [],
    },

    synergy: {
      name: "一寸先の光",

      effects: [],

      abilities: [

        {
          id: "hero_antiqua_synergy",
          trigger: "battleStart",
          effects: [
            {
              type: "ADD_STATE",
              stateType: "atk",
              value: -5,
              target: "equipped_enemy"
            },
            {
              type: "ADD_STATE",
              stateType: "as_stack",
              value: -0.2,
              target: "equipped_enemy"
            }
          ]
        }

      ]
    }

  }
},


]