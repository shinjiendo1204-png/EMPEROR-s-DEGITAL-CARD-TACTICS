import { Unit } from "@/types"

import { ensureAbilityIds } from "@/lib/utils/autoAbilityId"

export const VARKESH_PACK: Unit[] = ensureAbilityIds([
  /* =====================================================
     1コスト
  ===================================================== */

  /* =========================
     鬼軍の若大将（鬼）
     - 短期火力 / 自傷
  ========================= */
  {
    id: "young_oni_general",
    baseName: "鬼軍の若大将",
    name: "鬼軍の若大将",
    mode: "unit",
    pack: "Varkesh",
    cost: 1,

    hp: 3,
    atk: 3,
    attackRange: 1,
    role: "bruiser",

    effects: [],
    equipments: [],

    abilities: [
      // 攻撃するたび自傷
      {
        trigger: "onAttack",
        effects: [{ type: "SELF_DAMAGE", value: 1, target: "self" }],
      },
    ],

    variants: {
      equipment: {
        name: "鬼の金棒",
        baseStats: { 
          atk: 2,
        
         },
        effects: [],
        abilities: [
          {
        trigger: "onAttack",
        effects: [{ type: "SELF_DAMAGE", value: 1, target: "self" }],
      },
        ],
      },
      synergy: {
        name: "血の渇望",
        effects: [],
        abilities: [
          {
            id: "varkesh_blood_initiate_synergy",
            scope: "team",
            trigger: "battleStart",
            effects: [
              { type: "ADD_STATE", stateType: "atk", value: 1, target: "all_allies" },
              { type: "ADD_STATE", stateType: "damage_reduce", value: -1, target: "all_allies" },
            ],
          },
        ],
      },
    },
  },

  /* =========================
     裂傷の鬼童（鬼）
     - 超尖り / 自傷
  ========================= */
  {
    id: "varkesh_rift_berserker",
    baseName: "血吸いの徘徊者",
    name: "血吸いの徘徊者",
    mode: "unit",
    pack: "Varkesh",
    cost: 1,

    hp: 1,
    atk: 3,
    attackRange: 1,
    role: "tank",

    effects: [],
    equipments: [],

    abilities: [
  {
    trigger: "onDeath",
    effects: [
      { type: "DAMAGE", value: 2, target: "random_enemy" },
    ],
  },
    ],

    variants: {
      equipment: {
        name: "赤き牙",
        baseStats: { 
          hp: 2,
          atk: 1
        },
        effects: [],
        abilities: [
          {
            trigger: "onDeath",
            effects: [
              { type: "DAMAGE", value: 1, target: "random_enemy" },
            ],
          },
        ],
      },
      synergy: {
        name: "飢餓連鎖",
        effects: [],
        abilities: [
          {
            id: "varkesh_rift_berserker_synergy",
            scope: "team",
            trigger: "battleStart",
            effects: [
              { type: "ADD_STATE", stateType: "hp", value: 1, target: "all_allies" },
            ],
          },
        ],
      },
    },
  },

  /* =========================
     屍肉あさり（グール）
     - 味方死亡で成長
  ========================= */
  {
    id: "varkesh_grave_forager",
    baseName: "裏街の屍肉あさり",
    name: "裏街の屍肉あさり",
    mode: "unit",
    pack: "Varkesh",
    cost: 1,

    hp: 3,
    atk: 1,
    attackRange: 2,
    role: "skirmisher",

    effects: [],
    equipments: [],

    abilities: [
      // 味方が倒れるたびATK+1
      {
        trigger: "onDeath",
        condition: "deadAlly",
        effects: [{ type: "ADD_STATE", stateType: "atk", value: 1, target: "self" }],
      },
    ],

    variants: {
      equipment: {
        name: "腐肉の欠片",
        baseStats: { 
          hp: 2,
          atk: 1

        },
        effects: [],
        abilities: [
          {
            trigger: "onDeath",
            condition: "deadAlly",
            effects: [
              { type: "HEAL", value: 1, target: "self" },
            ],
          },
        ],
      },
      synergy: {
        name: "屍の宴",
        effects: [],
        abilities: [
          {
            id: "varkesh_grave_forager_synergy",
            scope: "team",
            trigger: "battleStart",
            effects: [{ type: "ADD_STATE", stateType: "hp", value: 1, target: "all_allies" }],
          },
        ],
      },
    },
  },
  /* =========================
     血吸いの徘徊者（グール）
     - キルで回復（スノーボール）
  ========================= */
  {
    id: "varkesh_blood_oni",
    baseName: "烈傷の鬼童",
    name: "烈傷の鬼童",
    mode: "unit",
    pack: "Varkesh",
    cost: 1,

    hp: 4,
    atk: 2,
    attackRange: 1,
    role: "tank",

    effects: [],
    equipments: [],

    abilities: [
      {
        trigger: "onKill",
        effects: [{ type: "HEAL", value: 2, target: "self" }],
      },
      {
        trigger: "onKill",
        effects: [{ type: "SELF_DAMAGE", value: 1, target: "self" }],
      },
    ],

    variants: {
      equipment: {
        name: "裂界の大鎌",
        baseStats: {  
          atk: 2
        },
        effects: [],
        abilities: [
          {
            trigger: "onKill",
            effects: [{ type: "HEAL", value: 1, target: "self" }],
          },
        ],
      },
      synergy: {
        name: "痛覚共鳴",
        effects: [],
        abilities: [
          {
            id: "varkesh_blood_ghoul_synergy",
            scope: "team",
            trigger: "onKill",
            effects: [{ type: "ADD_STATE", stateType: "atk", value: 1, target: "random_ally"}],
          },
        ],
      },
    },
  },

  /* =========================
  ========================= */
  {
    id: "varkesh_hex_priestess",
    baseName: "呪姫",
    name: "呪姫",
    mode: "unit",
    pack: "Varkesh",
    cost: 1,

    hp: 4,
    atk: 0,
    attackRange: 3,
    role: "support",

    effects: [],
    equipments: [],

    abilities: [
      {
        trigger: "onAttack",
        effects: [
          {
            type: "ADD_STATE",
            stateType: "curse_stack",
            value: 1,
            target: "target",
          },
        ],
      },
    ],

    variants: {
      equipment: {
        name: "ガラスの仮面",
        baseStats: { hp: 3 },
        effects: [],
        abilities: [
          // 初動加速：開幕で呪印+2
          {
            trigger: "battleStart",
            effects: [
              {
                type: "ADD_STATE",
                stateType: "curse_stack",
                value: 2,
                target: "random_enemy",
              },
            ],
          },
        ],
      },
      synergy: {
        name: "刻印拡散",
        effects: [],
        abilities: [
          {
            id: "varkesh_hex_priestess_synergy",
            scope: "team",
            trigger: "auraTick",
            tick: { type: "everySeconds", seconds: 2},
            effects: [
              {
                type: "ADD_STATE",
                stateType: "curse_stack",
                value: 1,
                target: "random_enemy",
              },
            ],
          },
        ],
      },
    },
  },

  /* =========================
     友を呪う者（呪術：拡散）
     - 毎秒 random_enemy に呪印+1
     - 開幕自傷（軽い歪み）
  ========================= */
  {
    id: "varkesh_rift_whisperer",
    baseName: "友を呪う者",
    name: "友を呪う者",
    mode: "unit",
    pack: "Varkesh",
    cost: 1,

    hp: 3,
    atk: 0,
    attackRange: 3,
    role: "support",

    effects: [],
    equipments: [],

    abilities: [
      {
        trigger: "auraTick",
        tick: { type: "everySeconds", seconds: 1 },
        effects: [
          {
            type: "ADD_STATE",
            stateType: "curse_stack",
            value: 1,
            target: "random_enemy",
          },
        ],
      },
    ],

    variants: {
      equipment: {
        name: "呪いの言葉",
        baseStats: { hp: 2, atk: 1},
        effects: [],
        abilities: [
          // さらに事故りやすく：被ダメ増
          {
            trigger: "battleStart",
            effects: [
              { type: "ADD_STATE", stateType: "damage_reduce", value: -1, target: "self" },
            ],
          },
        ],
      },
      synergy: {
        name: "友は一人ではない。",
        effects: [],
        abilities: [
          {
            id: "varkesh_rift_whisperer_synergy",
            scope: "team",
            trigger: "battleStart",
            effects: [
              {
                type: "ADD_STATE",
                stateType: "curse_stack",
                value: 1,
                target: "all_enemies",
              },
            ],
          },
        ],
      },
    },
  },
  //2コストユニット
  {
  id: "varkesh_blood_vanguard",
  baseName: "先陣鬼",
  name: "先陣鬼",
  mode: "unit",
  pack: "Varkesh",
  cost: 2,

  hp: 5,
  atk: 3,
  attackRange: 1,
  role: "bruiser",

  effects: [],
  equipments: [],

  abilities: [
    {
      id: "varkesh_vanguard_stun",
      trigger: "battleStart",
      once: true,
      effects: [
        {
          type: "ADD_STATE",
          stateType: "stun",
          value: 1,
          target: "random_enemy",
          duration: { type: "time", value: 1 },
        }
      ]
    }
  ],

  variants: {
    equipment: {
      name: "血染めの鎧",
      baseStats: { hp: 3, atk: 2 },
      effects: [],
      abilities: [
        {
          trigger: "battleStart",
          once: true,
          effects: [
            {
              type: "ADD_STATE",
              stateType: "atk",
              value: 1,
              target: "all_allies",
              duration: { type: "time", value: 3 }
            }
          ]
        }
      ]
    },
    synergy: {
      name: "戦端の咆哮",
      effects: [],
      abilities: [
        {
          id: "varkesh_vanguard_synergy",
          scope: "team",
          trigger: "battleStart",
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
    }
  }
},

{
  id: "varkesh_bloodshot_archer",
  baseName: "ブラッドバレットガンマン",
  name: "ブラッドバレットガンマン",
  mode: "unit",
  pack: "Varkesh",
  cost: 2,

  hp: 5,
  atk: 2,
  attackRange: 4,
  role: "ranged",

  effects: [],
  equipments: [],

  abilities: [
    {
      trigger: "onAttack",
      effects: [
        { type: "SELF_DAMAGE", value: 1, target: "self" },
        {
          type: "ADD_STATE",
          stateType: "atk",
          value: 1,
          target: "self",
        }
      ]
    }
  ],

  variants: {
    equipment: {
      name: "赤血の弾丸",
      baseStats: { hp: 3, atk: 2 },
      effects: [],
      abilities: [
        {
          trigger: "onAttack",
          effects: [
            {
              type: "ADD_STATE",
              stateType: "atk",
              value: 1,
              target: "self",
              duration: { type: "time", value: 2 }
            }
          ]
        }
      ]
    },
    synergy: {
      name: "血の代償",
      effects: [],
      abilities: [
        {
          id: "varkesh_oni_synergy",
          scope: "team",
          trigger: "battleStart",
          effects: [
            {
              type: "ADD_STATE",
              stateType: "as_stack",
              value: 0.25,
              target: "random_ally",
              duration: { type: "time", value: 2 }
            }
          ]
        }
      ]
    }
  }
},

{
  id: "varkesh_curse_warden",
  baseName: "呪いの器",
  name: "呪いの器",
  mode: "unit",
  pack: "Varkesh",
  cost: 2,

  hp: 7,
  atk: 1,
  attackRange: 1,
  role: "tank",

  effects: [],
  equipments: [],

  abilities: [
    {
      trigger: "onDamageTaken",
      effects: [
        {
          type: "ADD_STATE",
          stateType: "curse_stack",
          value: 1,
          target: "target"
        }
      ]
    }
  ],

  variants: {
    equipment: {
      name: "首元の印",
      baseStats: { hp: 4, atk: 1 },
      effects: [],
      abilities: [
  {
    trigger: "battleStart",
    effects: [
      {
        type: "ADD_STATE",
        stateType: "curse_stack",
        value: 2,
        target: "self"
      },
      {
        type: "ADD_STATE",
        stateType: "atk",
        value: 2,
        target: "self"
      },
    ]
  }
]
    },
    synergy: {
      name: "撒き散る邪悪",
      effects: [],
      abilities: [
        {
          id: "varkesh_warden_synergy",
          scope: "team",
          trigger: "battleStart",
          effects: [
            {
              type: "ADD_STATE",
              stateType: "curse_stack",
              value: 2,
              target: "random_enemy"
            }
          ]
        }
      ]
    }
  }
},

{
  id: "varkesh_curse_priest",
  baseName: "時占いの呪術師",
  name: "時占いの呪術師",
  mode: "unit",
  pack: "Varkesh",
  cost: 2,

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
          type: "ADD_STATE",
          stateType: "curse_stack",
          value: 1,
          target: "all_enemies"
        }
      ]
    }
  ],

  variants: {
    equipment: {
      name: "命の砂時計",
      baseStats: { hp: 4, atk: 1 },
      effects: [],
      abilities: [
        {
          trigger: "auraTick",
          tick: { type: "everySeconds", seconds: 3 },
          effects: [
            {
              type: "ADD_STATE",
              stateType: "curse_stack",
              value: 1,
              target: "highest_hp_enemy"
            }
          ]
        }
      ]
    },
    synergy: {
      name: "呪潮",
      effects: [],
      abilities: [
        {
          id: "varkesh_priest_synergy",
          scope: "team",
          trigger: "auraTick",
          tick: { type: "everySeconds", seconds: 1 },
          condition: { type: "enemyHasCurse", value: 5 },
          effects: [
            { type: "DAMAGE", value: 1, target: "random_enemy" }
          ]
        }
      ]
    }
  }
},

    {
      id: "varkesh_death_pulser",
      baseName: "死線の鼓動者",
      name: "死線の鼓動者",
      mode: "unit",
      pack: "Varkesh",
      cost: 2,

      hp: 4,
      atk: 2,
      attackRange: 4,
      role: "ranged",

      effects: [],
      equipments: [],

      abilities: [
        {
          trigger: "onDeath",
          condition: "deadAlly",
          effects: [
            {
              type: "ADD_STATE",
              stateType: "first_attack_boost",
              value: 2,
              target: "self",
              consumeOn: "onAttack"
            }
          ]
        }
      ],

      variants: {
        equipment: {
          name: "乾いた心臓",
          baseStats: { hp: 4, atk: 2},
          effects: [],
          abilities: [
            {
              trigger: "onDeath",
              condition: "deadAlly",
              effects: [
                {
                  type: "ADD_STATE",
                  stateType: "first_attack_boost",
                  value: 1,
                  target: "self",
                  consumeOn: "onAttack"
                }
              ]
            }
          ]
        },
        synergy: {
          name: "死線をくぐれ",
          effects: [],
          abilities: [
            {
              scope: "team",
              trigger: "battleStart",
              effects: [
                {
                  type: "ADD_STATE",
                  stateType: "as_stack",
                  value: 0.15,
                  target: "all_allies",
                  duration: { type: "time", value: 2 }
                }
              ]
            }
          ]
        }
      }
    },

    {
  id: "varkesh_feast_keeper",
  baseName: "腐宴の導き手",
  name: "腐宴の導き手",
  mode: "unit",
  pack: "Varkesh",
  cost: 2,

  hp: 5,
  atk: 1,
  attackRange: 3,
  role: "support",

  effects: [],
  equipments: [],

  /* =========================
     本体能力
     - 味方キルで“他者”回復（自己は回復しない）
  ========================= */
  abilities: [
    {
      trigger: "onKill",
      effects: [
        {
          type: "HEAL",
          value: 2,
          target: "all_other_allies"
        }
      ]
    }
  ],

  variants: {

    /* =========================
       装備
       - 死亡時に最低HPを少量回復
       - 本体より弱い思想（1回復）
    ========================= */
    equipment: {
      name: "腐宴の盃",
      baseStats: { hp: 4, atk: 1 },
      effects: [],
      abilities: [
        {
          trigger: "onDeath",
          condition: "deadAlly",
          effects: [
            {
              type: "HEAL",
              value: 1,
              target: "lowest_hp_ally"
            }
          ]
        }
      ]
    },

    /* =========================
       シナジー
    ========================= */
    synergy: {
      name: "屍の再分配",
      effects: [],
      abilities: [
        {
          id: "varkesh_feast_synergy",
          scope: "team",
          trigger: "battleStart",
          effects: [
            {
              type: "ADD_STATE",
              stateType: "hp",
              value: -2,
              target: "random_enemy"
            }
          ]
        }
      ]
    }
  }
},

/* =====================================================
   VARKESH 3コスト
===================================================== */

{
  id: "varkesh_blood_tyrant",
  baseName: "修羅の使い",
  name: "修羅の使い",
  mode: "unit",
  pack: "Varkesh",
  cost: 3,

  hp: 8,
  atk: 3,
  attackRange: 1,
  role: "bruiser",

  effects: [],
  equipments: [],

  abilities: [
  {
    trigger: "onAttack",
    effects: [
      { type: "SELF_DAMAGE", value: 1, target: "self" }
    ]
  },
  {
    trigger: "onAttack",
    condition: { type: "selfHpBelowPercent", value: 0.5 },
    effects: [
      {
        type: "ADD_STATE",
        stateType: "atk",
        value: 2,
        target: "self"
      }
    ]
  }
],

  variants: {
    equipment: {
      name: "狂戦士の強制",
      baseStats: { hp: 4, atk: 2 },
      effects: [],
      abilities: [
        {
          trigger: "onAttack",
          effects: [
            { type: "SELF_DAMAGE", value: 1, target: "self" },
            { type: "ADD_STATE", stateType: "atk", value: 1, target: "self" }
          ]
        }
      ]
    },
    synergy: {
      name: "力の増幅",
      effects: [],
      abilities: [
        {
          id: "blood_tyrant_synergy",
          scope: "team",
          trigger: "battleStart",
          effects: [
            {
              type: "ADD_STATE",
              stateType: "atk",
              value: 3,
              target: "all_allies",
            },
            {
              type: "ADD_STATE",
              stateType: "hp",
              value: -3,
              target: "all_allies",
            }
          ]
        }
      ]
    }
  }
},

{
  id: "varkesh_ghoul_overlord",
  baseName: "クライ・グール",
  name: "クライ・グール",
  mode: "unit",
  pack: "Varkesh",
  cost: 3,

  hp: 7,
  atk: 2,
  attackRange: 3,
  role: "support",

  effects: [],
  equipments: [],

  abilities: [
    {
      trigger: "onDeath",
      condition: "deadAlly",
      effects: [
        {
          type: "DAMAGE",
          value: 1,
          target: "all_enemies"
        },
        {
          type: "HEAL",
          value: 1,
          target: "self"
        }
      ]
    }
  ],

  variants: {
    equipment: {
      name: "叫ぶ魂",
      baseStats: { hp: 5, atk: 1 },
      effects: [],
      abilities: [
        {
          trigger: "onDeath",
          condition: "deadAlly",
          effects: [
            { type: "HEAL", value: 2, target: "self" }
          ]
        }
      ]
    },
    synergy: {
      name: "死肉転生",
      effects: [],
      abilities: [
        {
          id: "ghoul_overlord_synergy",
          scope: "team",
          trigger: "auraTick",
          tick: { type: "everySeconds", seconds: 3 },
          effects: [
            { type: "HEAL", value: 2, target: "lowest_hp_ally" }
          ]
        }
      ]
    }
  }
},

{
  id: "varkesh_curse_warlord",
  baseName: "嘲笑う呪詛師",
  name: "嘲笑う呪詛師",
  mode: "unit",
  pack: "Varkesh",
  cost: 3,

  hp: 7,
  atk: 2,
  attackRange: 1,
  role: "bruiser",

  effects: [],
  equipments: [],

  abilities: [
  // 呪印付与
  {
    trigger: "onAttack",
    effects: [
      { type: "ADD_STATE", stateType: "curse_stack", value: 1, target: "target" }
    ]
  },

  // 呪印5以上なら爆発
  {
    trigger: "onAttack",
    condition: { type: "enemyHasCurse", value: 5 },
    effects: [
      {
        type: "DAMAGE",
        value: 6,
        target: "target",
        ignoreDR: true
      }
    ]
  }
],

  variants: {
    equipment: {
      name: "呪印の発現",
      baseStats: { hp: 3, atk: 2 },
      effects: [],
      abilities: [
        {
          trigger: "battleStart",
          effects: [
            { type: "ADD_STATE", stateType: "curse_stack", value: 1, target: "self" },
            { type: "ADD_STATE", stateType: "atk", value: 4, target: "self" }
          ]
        }
      ]
    },
    synergy: {
      name: "代償の強制",
      effects: [],
      abilities: [
        {
          id: "curse_warlord_synergy",
          scope: "team",
          trigger: "auraTick",
          tick: { type: "everySeconds", seconds: 2 },
          condition: { type: "enemyHasCurse", value: 1 },
          effects: [
            { type: "DAMAGE", value: 2, target: "random_enemy" }
          ]
        }
      ]
    }
  }
},

{
  id: "varkesh_executioner",
  baseName: "フレンジーフィニッシャー",
  name: "フレンジーフィニッシャー",
  mode: "unit",
  pack: "Varkesh",
  cost: 3,

  hp: 5,
  atk: 3,
  attackRange: 1,
  role: "skirmisher",

  effects: [],
  equipments: [],

  abilities: [
    {
  trigger: "onAttack",
  condition: { type: "targetHpBelowPercent", value: 0.2 },
  effects: [
    {
      type: "DAMAGE",
      value: 10,
      target: "target",
      ignoreDR: true
    }
  ]
}
   
  ],

  variants: {
    equipment: {
      name: "紅の両刃",
      baseStats: { hp: 2, atk: 3 },
      effects: [],
      abilities: [
        {
          trigger: "onAttack",
          effects: [
            { type: "SELF_DAMAGE", value: 1, target: "self" },
            {
              type: "ADD_STATE",
              stateType: "atk",
              value: 2,
              target: "self",
              duration: { type: "time", value: 3 }
            }
          ]
        }
      ]
    },
    synergy: {
      name: "公開処刑",
      effects: [],
      abilities: [
        {
          id: "executioner_synergy",
          scope: "team",
          trigger: "battleStart",
          effects: [
            {
              type: "ADD_STATE",
              stateType: "atk",
              value: 1,
              target: "all_allies",
            }
          ]
        }
      ]
    }
  }
},

{
  id: "varkesh_feast_lord",
  baseName: "血宴の主宰者",
  name: "血宴の主宰者",
  mode: "unit",
  pack: "Varkesh",
  cost: 3,

  hp: 7,
  atk: 2,
  attackRange: 3,
  role: "support",

  effects: [],
  equipments: [],

  abilities: [
  {
    trigger: "onKill",
    effects: [
      { type: "HEAL", value: 1, target: "all_other_allies" }
    ]
  },

  {
    trigger: "onDeath",
    condition: "deadAlly",
    effects: [
      {
        type: "ADD_STATE",
        stateType: "as_stack",
        value: 0.1,
        maxStack: 4,
        maxTotalValue: 0.4,
        target: "all_allies",
      }
    ]
  }
],

  variants: {
    equipment: {
      name: "豪血ドリンク",
      baseStats: { hp: 5 },
      effects: [],
      abilities: [
        {
          trigger: "onDeath",
          effects: [
            {
              type: "ADD_STATE",
              stateType: "atk",
              value: 2,
              target: "all_allies",
            }
          ]
        }
      ]
    },
    synergy: {
      name: "朝まで狂おうぜ",
      effects: [],
      abilities: [
        {
          id: "feast_lord_synergy",
          scope: "team",
          trigger: "battleStart",
          effects: [
            {
              type: "ADD_STATE",
              stateType: "hp",
              value: -1,
              target: "all_enemies",
            },           
          ]
        }
      ]
    }
  }
},

/* =====================================================
   VARKESH 4コスト 完成版
===================================================== */

{
  id: "varkesh_blood_pact_king",
  baseName: "転生の覇王",
  name: "転生の覇王",
  mode: "unit",
  pack: "Varkesh",
  cost: 4,

  hp: 11,
  atk: 3,
  attackRange: 1,
  role: "bruiser",

  effects: [],
  equipments: [],

  abilities: [
    {
        trigger: "onDamageTaken",
        effects: [
          {
            type: "SELF_DAMAGE", 
            value: 1, 
            target: "self"
          },

          {
            type: "DAMAGE",
            value: 1,
            target: "all_enemies"
          },
        ]
      }
  ],

  variants: {
    equipment: {
      name: "転生者の力",
      baseStats: { hp: 3, atk: 2 },
      effects: [],
      abilities: [
        {
          trigger: "onDamageTaken",
          effects: [
            { type: "DAMAGE", value: 1, target: "all_enemies" }
          ]
        }
      ]
    },
    synergy: {
      name: "高揚する戦い",
      effects: [],
      abilities: [
        {
          id: "blood_pact_synergy",
          scope: "team",
          trigger: "auraTick",
          tick: { type: "everySeconds", seconds: 3 },
          effects: [
            {
              type: "DAMAGE",
              value: 1,
              target: "all_enemies",
            },
            {
              type: "DAMAGE",
              value: 1,
              target: "all_allies",
            }

          ]
        }
      ]
    }
  }
},

{
  id: "varkesh_hex_grand_inquisitor",
  baseName: "パンデミックプリースト",
  name: "パンデミックプリースト",
  mode: "unit",
  pack: "Varkesh",
  cost: 4,

  hp: 12,
  atk: 2,
  attackRange: 3,
  role: "support",

  effects: [],
  equipments: [],

  abilities: [
    {
        trigger: "onAttack",
        effects: [
          {
            type: "ADD_STATE",
            stateType: "curse_stack",
            value: 1,
            target: "all_enemies",
          },
        ],
      },
    {
      trigger: "auraTick",
      tick: { type: "everySeconds", seconds: 2 },
      condition: { type: "enemyHasCurse", value: 5 },
      effects: [
        {
          type: "MOD_STAT",
          stat: "attackSpeed",
          value: -0.2,
          target: "all_enemies",

        }
      ]
    },
  ],

  variants: {
    equipment: {
      name: "禁書の鎖",
      baseStats: { hp: 6, atk: 1 },
      effects: [],
      abilities: [
        {
          trigger: "onAttack",
          effects: [
            { type: "ADD_STATE", stateType: "curse_stack", value: 2, target: "random_enemy" }
          ]
        }
      ]
    },
    synergy: {
      name: "神経衰弱",
      effects: [],
      abilities: [
        {
          id: "hex_domination_synergy",
          scope: "team",
          trigger: "auraTick",
          tick: { type: "everySeconds", seconds: 3 },
          condition: { type: "enemyHasCurse", value: 5 },
          effects: [
            {
              type: "ADD_STATE",
              stateType: "damage_reduce",
              value: -1,
              target: "all_enemies",
            }
          ]
        }
      ]
    }
  }
},

{
  id: "varkesh_death_conductor",
  baseName: "牙を剥く臆病者",
  name: "牙を剥く臆病者",
  mode: "unit",
  pack: "Varkesh",
  cost: 4,

  hp: 13,
  atk: 2,
  attackRange: 1,
  role: "bruiser",

  effects: [],
  equipments: [],

  abilities: [
    {
      trigger: "onDeath",
      condition: "deadAlly",
      effects: [
        {
          type: "ADD_STATE",
          stateType: "as_stack",
          value: 0.4,
          target: "highest_atk_ally",
          duration: { type: "time", value: 1 }
        }
      ]
    }
  ],

  variants: {
    equipment: {
      name: "拒む意志",
      baseStats: { hp: 7 },
      effects: [],
      abilities: [
        {
          trigger: "onDeath",
          condition: "deadAlly",
          effects: [
            {
              type: "MOD_STAT",
              stat: "attackSpeed",
              value: -0.2,
              target: "all_enemies",
              duration: { type: "time", value: 1 }
            }
          ]
        }
      ]
    },
    synergy: {
      name: "屍を超えていけ",
      effects: [],
      abilities: [
        {
          id: "death_pulse_synergy",
          scope: "team",
          trigger: "auraTick",
          tick: { type: "everySeconds", seconds: 5 },
          effects: [
            {
              type: "HEAL",
              value: 5,
              target: "random_ally",
            }
          ]
        }
      ]
    }
  }
},

{
  id: "varkesh_lowlife_judge",
  baseName: "マッドサイエンター",
  name: "マッドサイエンター",
  mode: "unit",
  pack: "Varkesh",
  cost: 4,

  hp: 13,
  atk: 2,
  attackRange: 1,
  role: "skirmisher",

  effects: [],
  equipments: [],

  abilities: [
    {
      trigger: "onDamageTaken",
      condition: { type:"selfHpBelowPercent", value:0.2 },
      effects: [
        {
          type:"ADD_STATE",
          stateType:"atk",
          value:3,
          target:"all_allies",
        }
      ]
    }
  ],

  variants: {
    equipment: {
      name: "超増強剤",
      baseStats: { hp: 4, atk: 3 },
      effects: [],
      abilities: [
        {
          trigger: "onAttack",
          effects: [
            { type: "SELF_DAMAGE", value: 1, target: "self" }
          ]
        }
      ]
    },
    synergy: {
      name: "瀕死のドーパミン",
      effects: [],
      abilities: [
        {
          id: "lowlife_party_synergy",
          scope: "team",
          trigger: "auraTick",
          tick: { type: "everySeconds", seconds: 3 },
          effects: [
            {
              type: "ADD_STATE",
              stateType: "atk",
              value: 5,
              target: "allies_below_hp_percent",
              targetHpPercent: 0.10,
            }
          ]
        }
      ]
    }
  }
},

{
  id: "blood_realm_oni_god",
  baseName: "鬼神・帝釈",
  name: "鬼神・帝釈",
  mode: "unit",
  pack: "Varkesh",
  cost: 5,

  hp: 14,
  atk: 4,
  attackRange: 1,
  role: "bruiser",

  effects: [],
  equipments: [],

  abilities: [

    {
      trigger: "auraTick",
      tick: { type: "everySeconds", seconds: 1 },
      effects:
         [{ type: "SELF_DAMAGE", value: 1, target: "self" }],            
    },    
    {
      trigger: "auraTick",
      tick: { type: "everySeconds", seconds: 5 },
      effects: [
        {
          type: "DAMAGE_FROM_COUNTER",
          key: "selfDamage",
          scope: "battle",
          multiplier: 2,
          target: "all_enemies"
        }
      ]
    }
  ],

  variants: {
    equipment: {
      name: "金剛白象",
      baseStats: { hp: 2, atk: 6 },
      effects: [],
      abilities: [
        {
          trigger: "onSelfDamage",
          effects: [
            {
              type: "ADD_STATE",
              stateType: "ignore_dr_next_attack",
              value: 1,
              target: "self",
              consumeOn: "onAttack"
            }
          ]
        }
      ]
    },

    synergy: {
      name: "鬼軍の進軍",
      effects: [],
      abilities: [
        {
          id: "blood_dance_synergy",
          scope: "team",
          trigger: "battleStart",
          effects: [
            {
              type: "ADD_STATE",
              stateType: "damage_reduce",
              value: -3,
              duration: { type: "time", value: 3 },
              target: "all_enemies"
            }
          ]
        }
      ]
    }
  }
},
{
  id: "corpse_feast_king",
  baseName: "封印されし屍王",
  name: "封印されし屍王",
  mode: "unit",
  pack: "Varkesh",
  cost: 5,

  hp: 10,
  atk: 2,
  attackRange: 4,
  role: "ranged",

  effects: [],
  equipments: [],

  abilities: [

  /* =========================
     死体吸収
  ========================= */

  {
    trigger: "onDeath",
    condition: "deadAlly",
    effects: [
      { type: "ADD_STATE", stateType: "atk", value: 2, target: "self" },
      { type: "ADD_STATE", stateType: "hp", value: 2, target: "self" },
      { type: "ADD_STATE", stateType: "as_stack", value: 0.1, target: "self" }
    ]
  },


],
  variants: {
    equipment: {
      name: "五行封印",
      baseStats: { hp: 10, atk: 2 },
      effects: [],
      abilities: [
        {
          trigger: "onDeath",
          condition: "deadAlly",
          effects: [
            {
              type: "HEAL",
              value: 3,
              target: "lowest_hp_ally"
            }
          ]
        }
      ]
    },

    synergy: {
      name: "死界からの一撃",
      effects: [],
      abilities: [
        {
          id: "five_roles_funeral",
          scope: "team",
          trigger: "onDeath",
          condition: "deadAlly",
          effects: [
            {
              type: "ADD_STATE",
              stateType: "first_attack_boost",
              value: 4,
              target: "highest_atk_ally",
              consumeOn: "onAttack"
            }
          ]
        }
      ]
    }
  }
},

{
  id: "curse_realm_executioner",
  baseName: "呪界の断罪者",
  name: "呪界の断罪者",
  mode: "unit",
  pack: "Varkesh",
  cost: 5,

  hp: 17,
  atk: 3,
  attackRange: 1,
  role: "bruiser",

  effects: [],
  equipments: [],

  abilities: [
    // 呪印5以上に追加ダメージ
    {
      trigger: "onAttack",
      condition: { type: "targetHasCurse", value: 3 },
      effects: [
        {
          type: "DAMAGE",
          value: 5,
          ignoreDR: true,
          target: "target"
        }
      ]
    },

    // 呪印5以上が存在する間、敵全体被ダメ増加
    {
      trigger: "auraTick",
      tick: { type: "everySeconds", seconds: 1 },
      condition: { type: "enemyHasCurse", value: 5 },
      effects: [
        {
          type: "ADD_STATE",
          stateType: "damage_amp",
          value: 1,
          target: "all_enemies"
        }
      ]
    }
  ],

  variants: {
    equipment: {
      name: "呪印コントロール",
      baseStats: { hp:4, atk: 5 },
      effects: [],
      abilities: [
        {
          trigger: "onAttack",
          condition: { type: "targetHasCurse", value: 5 },
          effects: [
            {
              type: "ADD_STATE",
              stateType: "stun",
              value: 2,
              duration: { type: "time", value: 1 },
              target: "target"
            }
          ]
        }
      ]
    },

    synergy: {
      name: "力の代償",
      effects: [],
      abilities: [
        {
          id: "curse_isolation",
          scope: "team",
          trigger: "auraTick",
          tick: { type: "everySeconds", seconds: 3 },
          condition: { type: "enemyHasCurse", value: 5 },
          effects: [
            {
              type: "ADD_STATE",
              stateType: "stun",
              value: 1,
              target: "all_enemies"
            }
          ]
        }
      ]
    }
  }
}

])