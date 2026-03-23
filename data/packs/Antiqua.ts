import { Unit } from "@/types"

import { ensureAbilityIds } from "@/lib/utils/autoAbilityId"

export const ANTIQUA_PACK: Unit[] = ensureAbilityIds([

/* =========================
   遺跡の探索者
========================= */

{
  id: "ruin_explorer",
  baseName: "父を追う冒険家",
  name: "父を追う冒険家",
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
      name: "採掘スコップ",
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
      name: "好かれる才能",
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
  name: "夢見る精霊使い",
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
      name: "レリックグローブ",
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
      name: "里からの教え",
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
  name: "怪しげな研究家",
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
          target: "random_ally"
        },
        ],
      }
  ],

  variants: {

    equipment: {
      name: "ふわっと浮かべる靴",
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
      name: "レリック研究所",
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
  name: "襲い来る曲芸師",
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
      name: "ハートの4",
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
      name: "君のものは僕のもの",
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
  name: "忘却の滝の管理人",
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
      name: "癒しの水",
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
      name: "リラックスモード ",
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
  name: "崩れたゴーレム",
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
      name: "過去から届いた石ころ",
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
      name: "主死すとも誓う忠誠",
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
    name: "鼓舞する発掘隊長",
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
        name: "妻からの手紙",
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
        name: "探す理由があるならば",
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
    name: "秘密を埋められた岩石",
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
        name: "石核装甲",
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
        name: "進化する人類",
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
    name: "頼れる解析担当者",
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
        name: "解析レンズ",
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
        name: "彼女は常に早歩き",
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
    name: "付け狙うハンター",
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
        name: "十年物のライフル",
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
        name: "狩りの報酬",
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
    name: "バーサークヒーラー",
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
        name: "恵みの庇護",
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
        name: "セーブスポット",
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
    name: "自己分解者",
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
        name: "肉削りの刃",
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
        name: "自己犠牲の錬成",
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
  name: "セブンスアクセラレーター",
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
      name: "加速装置",
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
      name: "未来からの呼び声",
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
  name: "模倣を受け入れし存在",
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
      name: "突貫作業",
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
      name: "描かれた真実",
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
  name: "遺物的応体",
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
      name: "強化装甲",
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
      name: "守護の記憶",
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
  name: "ポックル族の狙撃手",
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
      name: "誰でも使える粘土玉",
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
      name: "ポックル族の秘技",
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
  name: "古代守護巨兵",
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
      name: "巨兵装甲",
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
      name: "防衛前線",
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
  name: "蘇った剣聖",
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
      name: "マガタナブレード",
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
      name: "振れば振るほど思い出す",
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
  name: "器用な武器使い",
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
      name: "人間武器庫",
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
      name: "持てば何でも武器になる",
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
  name: "レリックソルジャー",
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
      name: "起動ボタン",
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
        name: "レリックの危険性",
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
  name: "謎を知る者",
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
      name: "戦いの石板",
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
      name: "過去が語る未来",
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
  name: "グランドテンペスター",
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
 trigger:"auraTick",
 condition:{ type:"onEquipCount", value:3 },
 tick:{ type:"everySeconds", seconds:3 },
 effects:[
  {
   type: "DAMAGE",
   value: 5,
   target:"all_enemies"
  }
 ]
}

],

  variants: {
    equipment: {
      name: "嵐を呼ぶ声",
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
      name: "地を割る戦い",
      effects: [],
      abilities: [
        {
          id: "antiqua_relic_tempest_synergy",
          scope: "team",
          trigger: "battleStart",
          effects: [
            {
              type: "ADD_STATE",
              stateType: "atk",
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
  name: "伝説の冒険家",
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
      name: "穏やかに怒る拳",
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
      name: "光と闇の伝承",
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
  name: "夢を喰らう邪",
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
    effects: [
      {
        type: "DESTROY_EQUIPMENT",
        target: "self"
      },
    ]
  },

  {
    trigger: "battleStart",
    condition:{
      type:"counter",
      key:"equipmentDestroyed",
      scope:"match",
      min:5
    },
    effects: [
      {
        type: "ADD_STATE",
        stateType: "atk",
        value: -3,
        target: "all_enemies"
      },
      {
        type: "ADD_STATE",
        stateType: "hp",
        value: -3,
        target: "all_enemies"
      },
      
    ]
  }
],

  variants: {
    equipment: {
      name: "邪同化",
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
      name: "目覚めの前兆",
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
