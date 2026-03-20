import { Unit } from "@/types"

import { ensureAbilityIds } from "@/lib/utils/autoAbilityId"

export const ANTIQUA_PACK: Unit[] = ensureAbilityIds([

/* =========================
   遺跡の探索者
========================= */

{
  id: "ruin_explorer",
  baseName: "父を追う冒険家",
  name: "Fatherbound Explorer",
  mode: "unit",
  pack: "Antiqua",
  cost: 1,

  hp: 5,
  atk: 1,
  attackRange: 1,
  role: "skirmisher",

  effects: [],
  equipments: [],

  abilities: [
{
 trigger:"onAttack",
 effects:[
  {
   type:"INCREMENT_COUNTER",
   key:"dig",
   scope:"match",
   value:1
  }
 ]
},
{
 trigger:"battleStart",
 condition:{ type:"counter", key:"dig", scope:"match", min:3 },
 effects:[
  { type:"ADD_STATE", stateType:"atk", value:2, target:"self" }
 ]
}
],

  variants: {

    equipment: {
      name: "Mining Shovel",
      baseStats: { hp: 1, atk: 1 },
      effects: [],
      abilities: [
        {
          trigger: "onAttack",
          effects: [
            {
              type: "INCREMENT_COUNTER",
              key: "dig",
              scope: "match",
              value: 1
            }
          ]
        }
      ]
    },

    synergy: {
      name: "Natural Charisma",
      effects: [],
      abilities: [
        {
          id: "ruin_explorer_synergy",
          scope: "team",
          trigger: "battleStart",
          effects: [
            {
              type: "ADD_STATE",
              stateType: "atk",
              value: -1,
              target: "random_enemy"
              
            }
          ]
        }
      ]
    }
  }
},

/* =========================
   遺物の担い手
========================= */

{
  id: "relic_bearer",
  baseName: "夢見る精霊使い",
  name: "Dreaming Spiritcaller",
  mode: "unit",
  pack: "Antiqua",
  cost: 1,

  hp: 2,
  atk: 2,
  attackRange: 4,
  role: "ranged",

  effects: [],
  equipments: [],

  abilities: [
    {
      trigger:"onKill",
      effects:[
        {
        type:"INCREMENT_COUNTER",
        key:"dig",
        scope:"match",
        value:1
        }
      ]
      },
   {
    trigger:"onAttack",
    condition: { type: "onEquipCount", value: 1 },
    effects:[
      { type:"DAMAGE", value:1, target:"target"}
      
    ]
  }
  ],

  variants: {

    equipment: {
      name: "Relic Gloves",
      baseStats: { hp: 2 },
      effects: [],

      abilities: [
        {
          trigger:"onDeath",
          effects:[
            {
            type:"INCREMENT_COUNTER",
            key:"dig",
            scope:"match",
            value:1
            }
          ]
          }
      ]
    },

    synergy: {
      name: "Village Teachings",
      effects: [],
      abilities: [
        {
          id: "relic_bearer_synergy",
          scope: "team",
          trigger: "battleStart",
          effects: [
            {
              type: "ADD_STATE",
              stateType: "as_stack",
              value: 0.05,
              maxStack: 1,
              target: "equipped_allies"
            }
          ]
        }
      ]
    }
  }
},

/* =========================
   古代装置技師
========================= */

{
  id: "ancient_engineer",
  baseName: "怪しげな研究家",
  name: "Eccentric Researcher",
  mode: "unit",
  pack: "Antiqua",
  cost: 1,

  hp: 3,
  atk: 1,
  attackRange: 3,
  role: "support",

  effects: [],
  equipments: [],

  abilities: [
      {
        trigger: "onEquip",
        effects: [
        {
          type: "DESTROY_EQUIPMENT",
          target: "self"
        },
        {
          type: "ADD_STATE",
          stateType: "hp",
          value: 2,
          target: "self"
        },
        ],
      }
  ],

  variants: {

    equipment: {
      name: "Levitation Boots",
      baseStats: { atk: 1 },
      effects: [],
      abilities: [
        {
          trigger: "onKill",
          effects: [
            {
              type: "ADD_STATE",
              stateType: "as_stack",
              value: 0.1,
              target: "self"
            }
          ]
        }
      ]
    },

    synergy: {
      name: "Relic Lab",
      effects: [],
      abilities: [
        {
          id: "ancient_engineer_synergy",
          scope: "team",
          trigger: "battleStart",
          effects: [
            {
              type: "ADD_STATE",
              stateType: "as_stack",
              value: 0.1,
              target: "equipped_allies"
            }
          ]
        }
      ]
    }
  }
},

/* =========================
   遺跡の回収者
========================= */

{
  id: "relic_salvager",
  baseName: "襲い来る曲芸師",
  name: "Ambush Trickster",
  mode: "unit",
  pack: "Antiqua",
  cost: 1,

  hp: 3,
  atk: 2,
  attackRange: 1,
  role: "bruiser",

  effects: [],
  equipments: [],

  abilities: [
    {
      trigger:"onKill",
      effects:[
        {
        type:"ADD_STATE",
        stateType:"as_stack",
        value:0.10,
        maxStack: 3,
        maxTotalValue: 0.3,
        target:"self"
        }
      ]
      }
  ],

  variants: {

    equipment: {
      name: "Four of Hearts",
      baseStats: { atk: 2 },
      effects: [],
      abilities: [
        {
          trigger:"onKill",
          effects:[
            {
            type:"ADD_STATE",
            stateType:"atk",
            value:1,
            target:"self"
            }
          ]
          }
      ]
    },

    synergy: {
      name: "What's Yours is Mine",
      effects: [],
      abilities: [
        {
          id: "relic_salvager_synergy",
          scope:"team",
          trigger:"battleStart",
          effects:[
            {
            type:"ADD_STATE",
            stateType:"atk",
            value:2,
            target:"random_ally"
            }
          ]
          }
      ]
    }
  }
},

/* =========================
   古代炉の管理者
========================= */

{
  id: "ancient_furnace_keeper",
  baseName: "忘却の滝の管理人",
  name: "Keeper pf the Forgotten Falls",
  mode: "unit",
  pack: "Antiqua",
  cost: 1,

  hp: 4,
  atk: 1,
  attackRange: 3,
  role: "support",

  effects: [],
  equipments: [],

  abilities: [
    {
      trigger: "auraTick",
      tick: { type: "everySeconds", seconds: 3 },
      effects: [
        {
          type: "HEAL",
          value: 2,
          target: "random_ally"
        }
      ]
    }
  ],

  variants: {

    equipment: {
      name: "Healing Water",
      baseStats: { hp: 2 },
      effects: [],
      abilities: [
        {
          trigger: "onDamageTaken",
          effects: [
            {
              type: "HEAL",
              value: 1,
              target: "self"
            }
          ]
        }
      ]
    },

    synergy: {
      name: "Relax Mode",
      effects: [],
      abilities: [
        {
          id: "ancient_furnace_keeper_synergy",
          scope: "team",
          trigger: "auraTick",
          tick: { type: "everySeconds", seconds: 3 },
          effects: [
            {
              type: "HEAL",
              value: 1,
              target: "lowest_hp_ally"
            }
          ]
        }
      ]
    }
  }
},
{
  id: "ancient_sentinel",
  baseName: "崩れたゴーレム",
  name: "Collapsed Golem",
  mode: "unit",
  pack: "Antiqua",
  cost: 1,

  hp: 4,
  atk: 1,
  attackRange: 1,
  role: "tank",

  effects: [],
  equipments: [],

  abilities: [
    {
      trigger: "battleStart",
      effects: [
        {
          type: "ADD_STATE",
          stateType: "damage_reduce",
          value: 2,
          target: "self",
          duration: { type: "time", value: 1 }
        }
      ]
      
    }
  ],

  variants: {

    equipment: {
      name: "Ancient Pebble",
      baseStats: { hp: 3 },
      effects: [],
      abilities: [
        {
          trigger: "onDamageTaken",
          effects: [
            {
              type: "INCREMENT_COUNTER",
              key: "dig",
              scope: "match",
              value: 1
            }
          ]
        }
      ]
    },

    synergy: {
      name: "Even If the Master Falls",
      effects: [],
      abilities: [
        {
          id: "ancient_sentinel_synergy",
          scope: "team",
          trigger: "battleStart",
          effects: [
            {
              type: "ADD_STATE",
              stateType: "damage_reduce",
              value: 1,
              target: "front_allies",
              duration: { type: "time", value: 3 }
            }
          ]
        }
      ]
    }
  }
},
  /* =========================
     遺跡の発掘隊長
  ========================= */
  {
    id: "excavation_captain",
    baseName: "鼓舞する発掘隊長",
    name: "Inspiring Captain",
    mode: "unit",
    pack: "Antiqua",
    cost: 2,

    hp: 6,
    atk: 2,
    attackRange: 1,
    role: "bruiser",

    effects: [],
    equipments: [],

    abilities: [
      {
        trigger: "onEquip",
        effects: [
          { type: "ADD_STATE", stateType: "atk", value: 1, target: "all_allies" },
        ],
      },
    ],

    variants: {
      equipment: {
        name: "Letter From Home",
        baseStats: { hp: 3, atk: 1 },
        effects: [],
        abilities: [
          {
            trigger: "battleStart",
            effects: [
              { type: "ADD_STATE", stateType: "atk", value: 1, target: "equipped_allies" },
            ],
          },
        ],
      },

      synergy: {
        name: "A Reason to Search",
        effects: [],
        abilities: [
          {
            id: "excavation_captain_synergy",
            scope: "team",
            trigger: "battleStart",
            effects: [
              { type: "ADD_STATE", stateType: "hp", value: 2, target: "equipped_allies" },
            ],
          },
        ],
      },
    },
  },

  /* =========================
     古代守護ゴーレム
  ========================= */
  {
    id: "ancient_golem",
    baseName: "秘密を埋められた岩石",
    name: "Buried Secret Golem",
    mode: "unit",
    pack: "Antiqua",
    cost: 2,

    hp: 8,
    atk: 1,
    attackRange: 1,
    role: "tank",

    effects: [],
    equipments: [],

    abilities: [
      {
        trigger: "onDamageTaken",
        maxTriggers: 5,
        effects: [
          {
            type: "INCREMENT_COUNTER",
            key: "dig",
            scope: "match",
            value: 1,
          },
        ],
      },
      {
        trigger: "onDeath",
        effects: [
          {
            type: "ADD_STATE",
            stateType: "hp",
            target: "all_allies",
            value: 2,
          },
        ],
      },
    ],

    variants: {
      equipment: {
        name: "Corestone Armor",
        baseStats: { hp: 4 },
        effects: [],
        abilities: [
          {
            trigger: "battleStart",
            effects: [
              {
                type: "ADD_STATE",
                stateType: "damage_reduce",
                value: 1,
                target: "self",
              },
            ],
          },
        ],
      },

      synergy: {
        name: "Evolving Humanity",
        effects: [],
        abilities: [
          {
            id: "ancient_golem_synergy",
            scope: "team",
            trigger: "battleStart",
            effects: [
              {
            type: "ADD_STATE",
            stateType: "hp",
            value: 1,
            target: "equipped_allies"
          },
           {
            type: "ADD_STATE",
            stateType: "atk",
            value: 1,
            target: "equipped_allies"
          },
            ],
          },
        ],
      },
    },
  },

  /* =========================
     遺物解析者
  ========================= */
  {
    id: "relic_analyst",
    baseName: "頼れる解析担当者",
    name: "Trusted Analyst",
    mode: "unit",
    pack: "Antiqua",
    cost: 2,

    hp: 5,
    atk: 2,
    attackRange: 3,
    role: "support",

    effects: [],
    equipments: [],

    abilities: [
      {
        trigger: "onEquip",
        condition:{ type:"onEquipCount", value:3 },
        effects: [
          {
            type: "INCREMENT_COUNTER",
            key: "dig",
            scope: "match",
            value: 5,
          },
        {
          type: "DESTROY_EQUIPMENT",
          target: "self"
        },
        {
          type: "ADD_STATE",
          stateType: "atk",
          value: 3,
          target: "self"
        },
        ],
      },
    ],

    variants: {
      equipment: {
        name: "Analysis Lens",
        baseStats: { atk: 1 },
        effects: [],
        abilities: [
          {
            trigger: "battleStart",
            effects: [
              {
            type: "INCREMENT_COUNTER",
            key: "dig",
            scope: "match",
            value: 3,
          },
            ],
          },
        ],
      },

      synergy: {
        name: "Always in a Hurry",
        effects: [],
        abilities: [
          {
            id: "relic_analyst_synergy",
            scope: "team",
            trigger: "battleStart",
            effects: [
              {
                type: "ADD_STATE",
                stateType: "as_stack",
                value: 0.15,
                target: "equipped_allies",
              },
            ],
          },
        ],
      },
    },
  },

  /* =========================
     遺跡の略奪者
  ========================= */
  {
    id: "ruin_raider",
    baseName: "付け狙うハンター",
    name: "Stalking Hunter",
    mode: "unit",
    pack: "Antiqua",
    cost: 2,

    hp: 6,
    atk: 2,
    attackRange: 1,
    role: "skirmisher",

    effects: [],
    equipments: [],

    abilities: [
      {
        trigger: "onKill",
        effects: [{ type: "ADD_STATE", stateType: "atk", value: 1, target: "self" }],
      },
    ],

    variants: {
      equipment: {
        name: "Old Rifle",
        baseStats: { atk: 2 },
        effects: [],
        abilities: [
          {
            trigger: "onKill",
            effects: [{ type: "HEAL", value: 2, target: "self" }],
          },
        ],
      },

      synergy: {
        name: "Hunter's Reward",
        effects: [],
        abilities: [
          {
            id: "ruin_raider_synergy",
            scope: "team",
            trigger: "battleStart",
            effects: [
              { type: "ADD_STATE", stateType: "hp", value: 3, target: "random_ally" },
            ],
          },
        ],
      },
    },
  },

  /* =========================
     古代装置司祭
  ========================= */
  {
    id: "ancient_priest",
    baseName: "バーサークヒーラー",
    name: "Berserk Healer",
    mode: "unit",
    pack: "Antiqua",
    cost: 2,

    hp: 2,
    atk: 4,
    attackRange: 3,
    role: "support",

    effects: [],
    equipments: [],

    abilities: [
      {
        trigger: "auraTick",
        tick: { type: "everySeconds", seconds: 3 },
        effects: [{ type: "HEAL", value: 2, target: "random_ally" }],
      },
    ],

    variants: {
      equipment: {
        name: "Blessed Guard",
        baseStats: { hp: 3 },
        effects: [],
        abilities: [
          {
            trigger: "onDamageTaken",
            effects: [{ type: "HEAL", value: 2, target: "self" }],
          },
        ],
      },

      synergy: {
        name: "Save Point",
        effects: [],
        abilities: [
          {
            id: "ancient_priest_synergy",
            scope: "team",
            trigger: "auraTick",
            tick: { type: "everySeconds", seconds: 3 },
            effects: [{ type: "HEAL", value:  1, target: "all_allies" }],
          },
        ],
      },
    },
  },

  /* =========================
     自己分解者
     - 身体を削って発掘（自傷→dig）
  ========================= */
  {
    id: "self_dismantler",
    baseName: "自己分解者",
    name: "Self Dismantler",
    mode: "unit",
    pack: "Antiqua",
    cost: 2,

    hp: 8,
    atk: 2,
    attackRange: 1,
    role: "tank",

    effects: [],
    equipments: [],

    abilities: [
      {
        trigger: "onAttack",
        maxTriggers: 3,
        effects: [
          { type: "SELF_DAMAGE", value: 1 },
        ],
      },
      {
      trigger: "onSelfDamage",
      effects: [
        { type: "INCREMENT_COUNTER", key: "dig", scope: "match", value: 1 },
      ],

      },
    ],

    variants: {
      equipment: {
        name: "Fleshcarver Blade",
        baseStats: { atk: 2  },
        effects: [],
        abilities: [
          {
            trigger: "onAttack",
            effects: [
              { type: "SELF_DAMAGE", value: 1 },
            ],
          },
          {trigger: "onSelfDamage",
            effects: [
              { type: "INCREMENT_COUNTER", key: "dig", scope: "match", value: 1 },
            ]
          }
        ],
      },

      synergy: {
        name: "Sacrificial Alchemy",
        effects: [],
        abilities: [
          {
            id: "self_dismantler_synergy",
            scope: "team",
            trigger: "battleStart",
            effects: [
              { type: "DAMAGE", value: 2, target: "all_enemies",  },
              { type: "DAMAGE", value: 1, target: "all_allies",  },
            ],
          },
        ],
      },
    },
  },
  /* =====================================================
   Antiqua 3 Cost
===================================================== */

/* =========================
   遺跡の装備師
   equipバフエンジン
========================= */

{
  id: "antiqua_armorer",
  baseName: "セブンスアクセラレーター",
  name: "Seventh Acceralator",
  mode: "unit",
  pack: "Antiqua",
  cost: 3,

  hp: 5,
  atk: 2,
  attackRange: 2,
  role: "skirmisher",

  effects: [],
  equipments: [],

  abilities: [
    {
      trigger: "onEquip",
      effects: [
        { type: "ADD_STATE", stateType: "as_stack", value: 0.1, target: "random_ally" },
      ]
    }
  ],

  variants: {

    equipment: {
      name: "Acceleration Device",
      baseStats: { atk: 2, hp:1 },
      effects: [],
      abilities: [
        {
          trigger: "battleStart",
          effects: [
            {
              type: "ADD_STATE",
              stateType: "as_stack",
              value: 0.1,
              target: "self"
            }
          ]
        }
      ]
    },

    synergy: {
      name: "Call from the Future",
      effects: [],
      abilities: [
        {
          id: "antiqua_armorer_synergy",
          scope: "team",
          trigger: "battleStart",
          effects: [
            {
              type: "ADD_STATE",
              stateType: "as_stack",
              value: 0.20,
              target: "random_ally"
            }
          ]
        }
      ]
    }
  }
},

/* =========================
   発掘覚醒体
   digスケール
========================= */

{
  id: "excavation_awakened",
  baseName: "模倣を受け入れし存在",
  name: "Imitation Awakened",
  mode: "unit",
  pack: "Antiqua",
  cost: 3,

  hp: 8,
  atk: 3,
  attackRange: 1,
  role: "bruiser",

  effects: [],
  equipments: [],

  abilities: [

{
 trigger:"battleStart",
 condition:{ type:"counter", key:"dig", scope:"match", min:6 },
 effects:[
  { type:"ADD_STATE", stateType:"atk", value:4, target:"self"},
  { type:"ADD_STATE", stateType:"hp", value:4, target:"self"}
 ]
},
{
 trigger:"battleStart",
 condition:{ type:"counter", key:"dig", scope:"match", min:10 },
 effects:[
  { type:"ADD_STATE", stateType:"as_stack", value:0.3, target:"self"}
 ]
}

],

  variants: {

    equipment: {
      name: "Rush Operation",
      baseStats: { hp: 3, atk: 1 },
      effects: [],
      abilities:[
        {
        trigger: "onDeath",
        condition: "deadAlly",
        effects:[
          { type:"ADD_STATE", stateType:"atk", value:1, target:"self"},
          { type:"INCREMENT_COUNTER", key:"dig", scope:"match", value:1}
        ]
        }
        ]
    },

    synergy: {
      name: "Drawn Truth",
      effects: [],
      abilities:[
        {
        id: "excavation_awakened_synergy",
        scope:"team",
        trigger:"battleStart",
        condition:{ type:"counter", key:"dig", scope:"match", min:3 },
        effects:[
          { type:"ADD_STATE", stateType:"hp", value:2, target:"all_allies"}
        ]
        },
        {
        scope:"team",
        trigger:"battleStart",
        condition:{ type:"counter", key:"dig", scope:"match", min:6 },
        effects:[
          { type:"ADD_STATE", stateType:"hp", value:2, target:"all_allies"},
          { type:"ADD_STATE", stateType:"atk", value:1, target:"all_allies"}
        ]
        }
        ]
    }
  }
},

/* =========================
   遺物適応体
   装備で成長
========================= */

{
  id: "relic_adapter",
  baseName: "遺物的応体",
  name: "Relic Adapter",
  mode: "unit",
  pack: "Antiqua",
  cost: 3,

  hp: 9,
  atk: 2,
  attackRange: 2,
  role: "skirmisher",

  effects: [],
  equipments: [],

  abilities: [
    {
      trigger: "onEquip",
      effects: [
        { type:"ADD_STATE",stateType: "atk",value: 2,target: "self"},
        { type:"ADD_STATE", stateType:"as_stack", value:0.1, target:"self"}
      ]
    },
    {
      trigger:"battleStart",
      condition:{ type:"onEquipCount", value:2 },
      effects:[
        { type:"ADD_STATE", stateType:"hp", value:3, target:"self"}
      ]
      }
  ],

  variants: {

    equipment: {
      name: "Reinforced Armor",
      baseStats: { hp: 4 },
      effects: [],
      abilities: [
        {
          trigger:"onDamageTaken",
          effects:[
            { type:"ADD_STATE", stateType:"atk", value:1, target:"self"},
            { type:"ADD_STATE", stateType:"as_stack", value:0.05, target:"self"}
          ]
          }
      ]
    },

    synergy: {
      name: "Memory of Protection",
      effects: [],
      abilities: [
        {
          id: "relic_adapter_synergy",
          scope:"team",
          trigger:"battleStart",
          effects:[
            { type:"ADD_STATE", stateType:"hp", value:5, target:"random_ally"},
            { type:"ADD_STATE", stateType:"as_stack", value:0.1, target:"random_ally"}
          ]
          }
      ]
    }
  }
},

/* =========================
   遺跡の探索射手
   装備で射程強化
========================= */

{
  id: "ruin_marksman",
  baseName: "ポックル族の狙撃手",
  name: "Pokkuru Blowgun Sniper",
  mode: "unit",
  pack: "Antiqua",
  cost: 3,

  hp: 5,
  atk: 2,
  attackRange: 4,
  role: "ranged",

  effects: [],
  equipments: [],

  abilities: [
    {
      trigger:"onEquip",
      effects:[
        { type:"ADD_STATE", stateType:"as_stack", value:0.1, target:"self"}
      ]
      },
      {
      trigger:"onAttack",
      condition:{ type:"onEquipCount", value:2 },
      effects:[
        { type:"DAMAGE", value:1, target:"enemy_column"}
      ]
      }
  ],

  variants: {

    equipment: {
      name: "Clay Ammo",
      baseStats: { atk: 3 },
      effects: [],
      abilities: [
        {
          trigger:"onAttack",
          effects:[
            { type: "ADD_STATE", stateType:"atk", value:2, target:"self"}
          ]
          }
      ]
    },

    synergy: {
      name: "Pokkru Technique",
      effects: [],
      abilities: [
        {
          id: "ruin_marksman_synergy",
          scope: "team",
          trigger: "battleStart",
          effects: [
            {
              type: "ADD_STATE",
              stateType: "as_stack",
              value: -0.15,
              target: "random_enemy"
            }
          ]
        }
      ]
    }
  }
},

/* =========================
   古代守護巨兵
   装備タンク
========================= */

{
  id: "ancient_guardian",
  baseName: "古代守護巨兵",
  name: "Ancient Guadian Colossus",
  mode: "unit",
  pack: "Antiqua",
  cost: 3,

  hp: 11,
  atk: 2,
  attackRange: 1,
  role: "tank",

  effects: [],
  equipments: [],

  abilities: [
    {
      trigger: "onEquip",
      effects: [
        {
          type: "ADD_STATE",
          stateType: "damage_reduce",
          value: 1,
          maxStack: 3,
          target: "self"
        }
      ]
    },
    {
      trigger:"onDamageTaken",
      effects:[
        {
        type:"DAMAGE",
        value:1,
        target:"target"
        }
      ]
      }
  ],

  variants: {

    equipment: {
      name: "Titan Armor",
      baseStats: { hp: 5 },
      effects: [],
      abilities: [
        {
          trigger: "onDamageTaken",
          effects: [
            {
              type: "ADD_STATE",
              stateType: "damage_reduce",
              value: 3,
              consumeOn: "onDamageTaken",
              stacks: 1,
            }
          ]
        }
      ]
    },

    synergy: {
      name: "Defensive Line",
      effects: [],
      abilities: [
        {
          id: "ancient_guardian_synergy",
          scope: "team",
          trigger: "battleStart",
          effects: [
            {
              type: "ADD_STATE",
              stateType: "damage_reduce",
              value: 1,
              target: "front_allies",
            }
          ]
        }
      ]
    }
  }
},
{
  id: "antiqua_blade_reclaimer",
  baseName: "蘇った剣聖",
  name: "Revived Sword Saint",
  mode: "unit",
  pack: "Antiqua",
  cost: 4,

  hp: 11,
  atk: 4,
  attackRange: 1,
  role: "bruiser",

  effects: [],
  equipments: [],

  abilities: [
    {
      trigger: "onAttack",
      condition: { type: "onEquipCount", value: 1 },
      effects: [
        { type: "DAMAGE", value: 2, target: "adjacent_enemies" }
      ]
    }
  ],

  variants: {
    equipment: {
      name: "Magatana Blade",
      baseStats: { atk: 4 },
      effects: [],
      abilities: [
        {
          trigger: "onAttack",
          effects: [
            { type: "DAMAGE", value: 2, target: "enemy_column" }
          ]
        }
      ]
    },

    synergy: {
      name: "Muscle Memory",
      effects: [],
      abilities: [
        {
          id: "antiqua_blade_reclaimer_synergy",
          scope: "team",
          trigger: "auraTick",
          tick: { type: "everySeconds", seconds: 1 },
          effects: [
            { type: "ADD_STATE", 
              stateType: "as_stack", 
              value: 0.05, 
              target: "all_allies",
              maxStack: 6,
              maxTotalValue: 0.3}
          ]
        }
      ]
    }
  }
},
{
  id: "antiqua_relic_collector",
  baseName: "器用な武器使い",
  name: "Versatile Weapon Master",
  mode: "unit",
  pack: "Antiqua",
  cost: 4,

  hp: 10,
  atk: 4,
  attackRange: 2,
  role: "skirmisher",

  effects: [],
  equipments: [],

  abilities: [
    {
      trigger: "onEquip",
      effects: [
        { type: "ADD_STATE", stateType: "atk", value: 2, target: "self" },
        { type: "ADD_STATE", stateType: "hp", value: 2, target: "self" },
      ]
    }
  ],

  variants: {
    equipment: {
      name: "Living Arsenal",
      baseStats: { hp: 5 },
      effects: [],
      abilities: [
        {
          trigger: "onDeath",
          condition: "deadAlly",
          effects: [
            { type: "ADD_STATE", stateType: "atk", value: 2, target: "self" },
            { type: "ADD_STATE", stateType: "hp", value: 2, target: "self" }
          ]
        }
      ]
    },

    synergy: {
      name: "Everything is a Weapon",
      effects: [],
      abilities: [
        {
          id: "antiqua_relic_collector_synergy",
          scope: "team",
          trigger: "battleStart",
          effects: [
            { type: "ADD_STATE", stateType: "atk", value: 2, target: "all_allies"}
          ]
        }
      ]
    }
  }
},
{
  id: "antiqua_relic_ascendant",
  baseName: "レリックソルジャー",
  name: "Relic Soldier",
  mode: "unit",
  pack: "Antiqua",
  cost: 4,

  hp: 13,
  atk: 3,
  attackRange: 1,
  role: "bruiser",

  effects: [],
  equipments: [],

  abilities: [
    {
      trigger: "battleStart",
      condition: { type: "onEquipCount", value: 3 },
      effects: [
        { type: "ADD_STATE", stateType: "atk", value: 4, target: "self" },
        { type: "ADD_STATE", stateType: "as_stack", value: 0.3, target: "self" },
        { type: "ADD_STATE", stateType: "damage_reduce", value: 2, target: "self" }
      ]
    }
  ],

  variants: {
    equipment: {
      name: "Activation Switch",
      baseStats: { atk: 3, hp: 3 },
      effects: [],
      abilities: [
        {
          trigger: "battleStart",
          effects: [
            { type: "ADD_STATE", stateType: "as_stack", value: 0.15, target: "self" }
          ]
        }
      ]
    },

    synergy: {
        name: "Relic Hazard",
        effects: [],
        abilities: [
          {
            id: "antiqua_relic_ascendant_synergy",
            scope: "team",
            trigger: "battleStart",
            condition: { type: "onEquipCount", value: 1 },
            effects: [
              {
                type: "ADD_STATE",
                stateType: "atk",
                value: 1,
                target: "all_allies"
              }
            ]
          },
          {
            id: "antiqua_relic_ascendant_synergy2",
            scope: "team",
            trigger: "battleStart",
            condition: { type: "onEquipCount", value: 3 },
            effects: [
              {
                type: "ADD_STATE",
                stateType: "atk",
                value: 3,
                target: "all_allies"
              }
            ]
          }
        ]
      }
  }
},
{
  id: "antiqua_relic_digger",
  baseName: "謎を知る者",
  name: "Knower of Secrets",
  mode: "unit",
  pack: "Antiqua",
  cost: 4,

  hp: 11,
  atk: 3,
  attackRange: 3,
  role: "support",

  effects: [],
  equipments: [],

  abilities: [
    {
      trigger: "battleStart",
      effects: [
        {
          type: "INCREMENT_COUNTER",
          key: "dig",
          scope: "match",
          value: 3
        }
      ]
    },
    {
      trigger: "battleStart",
      condition: { type: "counter", key: "dig", scope: "match", min: 5 },
      effects: [
        { type:"DAMAGE", value:3, target:"all_enemies"}
      ]
    },
  ],

  variants: {
    equipment: {
      name: "War Tablet",
      baseStats: { atk: 2, hp: 4 },
      effects: [],
      abilities: [
        {
          trigger: "battleStart",
          effects: [
            {
          type: "INCREMENT_COUNTER",
          key: "dig",
          scope: "match",
          value: 3
        }
          ]
        }
      ]
    },

    synergy: {
      name: "Past Reveals Future",
      effects: [],
      abilities: [
        {
          id: "antiqua_relic_digger_synergy",
          scope: "team",
          trigger: "battleStart",
          effects: [
            {
          type: "ADD_STATE",
          stateType: "stun",
          value: 1.5,
          target:"random_enemy"
        }
          ]
        }
      ]
    }
  }
},

{
  id: "antiqua_relic_tempest",
  baseName: "グランドテンペスター",
  name: "Grand Tempester",
  mode: "unit",
  pack: "Antiqua",
  cost: 5,

  hp: 12,
  atk: 2,
  attackRange: 4,
  role: "ranged",

  effects: [],
  equipments: [],

  abilities: [

{
 trigger:"onEquip",
 effects:[
  {
   type:"INCREMENT_COUNTER",
   key:"selfEquip",
   scope:"match",
   value:1
  }
 ]
},

{
 trigger:"auraTick",
 tick:{ type:"everySeconds", seconds:4 },
 effects:[
  {
   type:"DAMAGE_FROM_COUNTER",
   key:"selfEquip",
   scope:"battle",
   multiplier:2,
   target:"all_enemies"
  }
 ]
}

],

  variants: {
    equipment: {
      name: "Stormcaller Voice",
      baseStats: { atk: 3, hp: 4 },
      effects: [],
      abilities: [
        {
          trigger: "battleStart",
          effects: [
            { type: "ADD_STATE", stateType: "as_stack", value: 0.30, target: "equipped_allies" }
          ]
        }
      ]
    },

    synergy: {
      name: "Earthshatter Battle",
      effects: [],
      abilities: [
        {
          id: "antiqua_relic_tempest_synergy",
          scope: "team",
          trigger: "battleStart",
          effects: [
            {
              type: "MOD_STAT",
              stat: "atk",
              value: 4,
              target: "equipped_allies"
            },
            {
              type: "ADD_STATE",
              stateType: "as_stack",
              value: 0.1,
              target: "equipped_allies"
            }
          ]
        }
      ]
    }
  }
},
{
  id: "antiqua_master_excavator",
  baseName: "伝説の冒険家",
  name: "Legendary Adventurer",
  mode: "unit",
  pack: "Antiqua",
  cost: 5,

  hp: 11,
  atk: 3,
  attackRange: 1,
  role: "support",

  effects: [],
  equipments: [],

  abilities: [
    {
      trigger: "battleStart",
      condition: { type: "counter", key: "dig", scope: "match", min: 6 },
      effects: [
        { type: "DIG_RELIC" },
        { type: "DIG_RELIC" }
      ]
    },
    {
      trigger: "battleStart",
      condition: { type: "counter", key: "dig", scope: "match", min: 12 },
      effects: [
        { type: "DIG_RELIC" },
      ]
    }
  ],

  variants: {
    equipment: {
      name: "Calm Fury Fist",
      baseStats: { atk: 2, hp: 5 },
      effects: [],
      abilities: [
        {
          trigger: "onAttack",
          condition: { type: "counter", key: "dig", scope: "match", min: 12 },
          effects: [
            
              { type: "DAMAGE", value: 3, target: "adjacent_enemies" },
              { type: "DAMAGE", value: 4, target: "enemy_column" }
            
          ]
        }
      ]
    },

    synergy: {
      name: "Legacy of Light and Dark",
      effects: [],
      abilities: [
        {
          id: "antiqua_master_excavator_synergy",
          scope: "team",
          trigger: "battleStart",
          effects: [
            {
              type: "INCREMENT_COUNTER",
              key: "dig",
              scope: "match",
              value: 1
            }
          ]
        }
      ]
    }
  }
},
{
  id: "antiqua_relic_devourer",
  baseName: "夢を喰らう邪",
  name: "Dream Devourer",
  mode: "unit",
  pack: "Antiqua",
  cost: 5,

  hp: 14,
  atk: 4,
  attackRange: 2,
  role: "bruiser",

  effects: [],
  equipments: [],

  abilities: [
  {
    trigger: "onEquip",
    condition: { type: "onEquipCount", value: 1 },
    effects: [
      {
        type: "DESTROY_EQUIPMENT",
        target: "self"
      },
    ]
  },

  {
    trigger: "battleStart",
    effects: [
      {
        type: "MOD_STAT_FROM_COUNTER",
        stat: "atk",
        key: "equipmentDestroyed",
        scope: "match",
        multiplier: -1,
        maxStack: 3,
        target: "all_enemies"
      },
      {
        type: "MOD_STAT_FROM_COUNTER",
        stat: "hp",
        key: "equipmentDestroyed",
        scope: "match",
        multiplier: -1,
        maxStack: 3,
        target: "all_enemies"
      }
    ]
  }
],

  variants: {
    equipment: {
      name: "Corrupt Assimilation",
      baseStats: { atk: 4, hp: 4 },
      effects: [],
      abilities: [
        {
          trigger: "onKill",
          effects: [
            {
              type: "ADD_STATE",
              stateType: "atk",
              value: 3,
              target: "self"
            },
            {
              type: "ADD_STATE",
              stateType: "hp",
              value: 3,
              target: "self"
            },
          ]
        }
      ]
    },

    synergy: {
      name: "Awakening Omen",
      effects: [],
      abilities: [
        {
          id: "antiqua_relic_devourer_synergy",
          scope: "team",
          trigger: "battleStart",
          effects: [
            {
              type: "ADD_STATE",
              stateType: "hp",
              value: 5,
              target: "all_allies"
            }
          ]
        }
      ]
    }
  }
}
])
