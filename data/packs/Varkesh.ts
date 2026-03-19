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
    name: "Young Oni Warlord",
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
        name: "Oni Warclub",
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
        name: "Bloodlust",
        effects: [],
        abilities: [
          {
            id: "varkesh_blood_initiate_synergy",
            scope: "team",
            trigger: "battleStart",
            effects: [
              { type: "MOD_STAT", stat: "atk", value: 1, target: "all_allies" },
              { type: "MOD_STAT", stat: "damageReduce", value: -1, target: "all_allies" },
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
    name: "Blooddrinker Stalker",
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
        name: "Crimson Fang",
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
        name: "Chain of Hunger",
        effects: [],
        abilities: [
          {
            id: "varkesh_rift_berserker_synergy",
            scope: "team",
            trigger: "onDeath",
            condition: "deadAlly",
            effects: [
              { type: "MOD_STAT", stat: "atk", value: 1, target: "all_allies" },
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
    name: "Backstreet Corpse Forager",
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
        effects: [{ type: "MOD_STAT", stat: "atk", value: 1, target: "self" }],
      },
    ],

    variants: {
      equipment: {
        name: "Rotting Flesh Shard",
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
        name: "Feast of the Dead",
        effects: [],
        abilities: [
          {
            id: "varkesh_grave_forager_synergy",
            scope: "team",
            trigger: "onDeath",
            effects: [{ type: "HEAL", value: 1, target: "all_allies" }],
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
    name: "Rift-Torn Oni Child",
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
        name: "Riftreaper Scythe",
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
        name: "Pain Resonance",
        effects: [],
        abilities: [
          {
            id: "varkesh_blood_ghoul_synergy",
            scope: "team",
            trigger: "onKill",
            effects: [{ type: "MOD_STAT", stat: "atk", value: 1, target: "self"}],
          },
        ],
      },
    },
  },

  /* =========================
     呪刻の巫女（呪術：集中）
     - 毎秒 highest_hp_enemy に呪印+1
  ========================= */
  {
    id: "varkesh_hex_priestess",
    baseName: "呪姫",
    name: "Hex Maiden",
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
        name: "Glass Mask",
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
        name: "Curse Spread",
        effects: [],
        abilities: [
          {
            id: "varkesh_hex_priestess_synergy",
            scope: "team",
            trigger: "auraTick",
            tick: { type: "everySeconds", seconds: 1},
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
    name: "CurseBound Whisperer",
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
        name: "Cursed Words",
        baseStats: { hp: 2, atk: 1},
        effects: [],
        abilities: [
          // さらに事故りやすく：被ダメ増
          {
            trigger: "battleStart",
            effects: [
              { type: "MOD_STAT", stat: "damageReduce", value: -1, target: "self" },
            ],
          },
        ],
      },
      synergy: {
        name: "Not Just One Person.",
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
  name: "Vanguard Oni",
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
      name: "Bloodstained Armor",
      baseStats: { hp: 3, atk: 2 },
      effects: [],
      abilities: [
        {
          trigger: "battleStart",
          once: true,
          effects: [
            {
              type: "MOD_STAT",
              stat: "atk",
              value: 1,
              target: "all_allies",
              duration: { type: "time", value: 3 }
            }
          ]
        }
      ]
    },
    synergy: {
      name: "Opening Warcry",
      effects: [],
      abilities: [
        {
          id: "varkesh_vanguard_synergy",
          scope: "team",
          trigger: "battleStart",
          once: true,
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
  name: "Bloodshot Gunslinger",
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
          type: "MOD_STAT",
          stat: "atk",
          value: 1,
          target: "self",
        }
      ]
    }
  ],

  variants: {
    equipment: {
      name: "Crimson Bullet",
      baseStats: { hp: 3, atk: 2 },
      effects: [],
      abilities: [
        {
          trigger: "onAttack",
          effects: [
            {
              type: "MOD_STAT",
              stat: "atk",
              value: 1,
              target: "self",
              duration: { type: "time", value: 2 }
            }
          ]
        }
      ]
    },
    synergy: {
      name: "Blood Price",
      effects: [],
      abilities: [
        {
          id: "varkesh_oni_synergy",
          scope: "team",
          trigger: "onDamageTaken",
          effects: [
            {
              type: "ADD_STATE",
              stateType: "as_stack",
              value: 0.1,
              target: "target",
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
  name: "Vessel of Curses",
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
      name: "Neckmark Sigil",
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
      name: "Spreading Corruption",
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
  name: "Chrono Hexer",
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
      name: "Hourglass of Life",
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
      name: "Curse Tide",
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
      name: "Deathline Pulsar",
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
          name: "Dried Heart",
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
          name: "Walk the Deathline",
          effects: [],
          abilities: [
            {
              scope: "team",
              trigger: "onDeath",
              condition: "deadAlly",
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
  name: "Feastcaller of Rot",
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
      scope: "team",
      effects: [
        {
          type: "HEAL",
          value: 1,
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
      name: "Chalice of Rot",
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
       - 死亡時に最低HPを2回復
       - グール死亡軸の完成ピース
    ========================= */
    synergy: {
      name: "Corpse Redistribution",
      effects: [],
      abilities: [
        {
          id: "varkesh_feast_synergy",
          scope: "team",
          trigger: "onDeath",
          condition: "deadAlly",
          effects: [
            {
              type: "HEAL",
              value: 2,
              target: "lowest_hp_ally"
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
  name: "Avatar of Carnage",
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
        type: "MOD_STAT",
        stat: "atk",
        value: 2,
        target: "self"
      }
    ]
  }
],

  variants: {
    equipment: {
      name: "Berserker's Compulsion",
      baseStats: { hp: 4, atk: 2 },
      effects: [],
      abilities: [
        {
          trigger: "onAttack",
          effects: [
            { type: "SELF_DAMAGE", value: 1, target: "self" },
            { type: "MOD_STAT", stat: "atk", value: 1, target: "self" }
          ]
        }
      ]
    },
    synergy: {
      name: "Power Amplification",
      effects: [],
      abilities: [
        {
          id: "blood_tyrant_synergy",
          scope: "team",
          trigger: "onDamageTaken",
          effects: [
            {
              type: "MOD_STAT",
              stat: "atk",
              value: 1,
              target: "random_ally",
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
  name: "Crying Ghoul",
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
      name: "Screaming Soul",
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
      name: "Flesh Rebirth",
      effects: [],
      abilities: [
        {
          id: "ghoul_overlord_synergy",
          scope: "team",
          trigger: "onDeath",
          condition: "deadAlly",
          effects: [
            { type: "HEAL", value: 1, target: "lowest_hp_ally" }
          ]
        }
      ]
    }
  }
},

{
  id: "varkesh_curse_warlord",
  baseName: "嘲笑う呪詛師",
  name: "Mocking Hexcaller",
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
      name: "Curse Manifestation",
      baseStats: { hp: 3, atk: 2 },
      effects: [],
      abilities: [
        {
          trigger: "battleStart",
          effects: [
            { type: "ADD_STATE", stateType: "curse_stack", value: 1, target: "self" },
            { type: "MOD_STAT", stat: "atk", value: 4, target: "self" }
          ]
        }
      ]
    },
    synergy: {
      name: "Forced Sacrifice",
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
  name: "Fernzy Finisher",
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
  condition: { type: "targetHpBelowPercent", value: 0.1 },
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
      name: "Crimson Twinblades",
      baseStats: { hp: 2, atk: 3 },
      effects: [],
      abilities: [
        {
          trigger: "onAttack",
          effects: [
            { type: "SELF_DAMAGE", value: 1, target: "self" },
            {
              type: "MOD_STAT",
              stat: "atk",
              value: 2,
              target: "self",
              duration: { type: "time", value: 3 }
            }
          ]
        }
      ]
    },
    synergy: {
      name: "Public Excution",
      effects: [],
      abilities: [
        {
          id: "executioner_synergy",
          scope: "team",
          trigger: "onKill",
          effects: [
            {
              type: "MOD_STAT",
              stat: "atk",
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
  name: "Lord of the Blood Feast",
  mode: "unit",
  pack: "Varkesh",
  cost: 3,

  hp: 8,
  atk: 1,
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
        value: 0.05,
        maxStack: 4,
        maxTotalValue: 0.2,
        target: "all_allies",
      }
    ]
  }
],

  variants: {
    equipment: {
      name: "Bloodbrew Elixir",
      baseStats: { hp: 5 },
      effects: [],
      abilities: [
        {
          trigger: "onDeath",
          effects: [
            {
              type: "MOD_STAT",
              stat: "atk",
              value: 2,
              target: "all_allies",
            }
          ]
        }
      ]
    },
    synergy: {
      name: "Dance Till Dawn",
      effects: [],
      abilities: [
        {
          id: "feast_lord_synergy",
          scope: "team",
          trigger: "onDeath",
          condition: "deadAlly",
          effects: [
            {
              type: "MOD_STAT",
              stat: "atk",
              value: 2,
              target: "random_ally",
            }
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
  name: "Reincarnated Overlord",
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
      name: "Power of Rebirth",
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
      name: "Battle Frenzy",
      effects: [],
      abilities: [
        {
          id: "blood_pact_synergy",
          scope: "team",
          trigger: "onDeath",
          condition: "deadAlly",
          effects: [
            {
              type: "DAMAGE",
              value: 1,
              target: "all_enemies",
            },
            {
              type: "SELF_DAMAGE",
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
  name: "Pandemic Priest",
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
      name: "Forbidden Tome Chains",
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
      name: "Nerve Collapse",
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
              type: "MOD_STAT",
              stat: "damageReduce",
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
  name: "Fanged Coward",
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
      name: "Defiant Will",
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
      name: "Rise Beyond the Dead",
      effects: [],
      abilities: [
        {
          id: "death_pulse_synergy",
          scope: "team",
          trigger: "onDeath",
          condition: "deadAlly",
          effects: [
            {
              type: "MOD_STAT",
              stat: "hp",
              value: 2,
              target: "all_allies",
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
  name: "Mad Augmenter",
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
          type:"MOD_STAT",
          stat:"atk",
          value:3,
          target:"all_allies",
        }
      ]
    }
  ],

  variants: {
    equipment: {
      name: "Hyper Augment Serum",
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
      name: "Near-Death Dopamine",
      effects: [],
      abilities: [
        {
          id: "lowlife_party_synergy",
          scope: "team",
          trigger: "onDamageTaken",
          effects: [
            {
              type: "ADD_STATE",
              stateType: "atk",
              value: 4,
              target: "allies_below_hp_percent",
              targetHpPercent: 0.2,
              duration: { type: "time", value: 2 }
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
  name: "Oni Deity Taishaku",
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
      tick: { type: "everySeconds", seconds: 3 },
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
      name: "Diamond White Elephant",
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
      name: "Oni War March",
      effects: [],
      abilities: [
        {
          id: "blood_dance_synergy",
          scope: "team",
          trigger: "onSelfDamage",
          effects: [
            {
              type: "ADD_STATE",
              stateType: "as_stack",
              value: 0.1,
              duration: { type: "time", value: 2 },
              target: "all_allies"
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
  name: "Sealed Corpse king",
  mode: "unit",
  pack: "Varkesh",
  cost: 5,

  hp: 13,
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
    condition: { type: "deadRoleIs", value: "tank" },
    effects: [
      { type: "ADD_STATE", stateType: "absorbed_tank" }
    ]
  },

  {
    trigger: "onDeath",
    condition: { type: "deadRoleIs", value: "bruiser" },
    effects: [
      { type: "ADD_STATE", stateType: "absorbed_bruiser" }
    ]
  },

  {
    trigger: "onDeath",
    condition: { type: "deadRoleIs", value: "skirmisher" },
    effects: [
      { type: "ADD_STATE", stateType: "absorbed_skirmisher" }
    ]
  },

  {
    trigger: "onDeath",
    condition: { type: "deadRoleIs", value: "ranged" },
    effects: [
      { type: "ADD_STATE", stateType: "absorbed_ranged" }
    ]
  },

  {
    trigger: "onDeath",
    condition: { type: "deadRoleIs", value: "support" },
    effects: [
      { type: "ADD_STATE", stateType: "absorbed_support" }
    ]
  },

  /* =========================
     各ロール吸収強化
  ========================= */

  {
    trigger: "onAbsorb_tank",
    effects: [
      { type: "MOD_STAT", stat: "hp", value: 4 }
    ]
  },

  {
    trigger: "onAbsorb_bruiser",
    effects: [
      { type: "MOD_STAT", stat: "atk", value: 3 }
    ]
  },

  {
    trigger: "onAbsorb_skirmisher",
    effects: [
      { type: "ADD_STATE", stateType: "as_stack", value: 0.2 }
    ]
  },

  {
    trigger: "onAbsorb_ranged",
    effects: [
      { type: "SET_ATTACK_RANGE", value: "next" }
    ]
  },

  {
    trigger: "onAbsorb_support",
    effects: [
      { type: "MOD_STAT", stat: "damageReduce", value: 2 }
    ]
  },

  /* =========================
     完全覚醒
  ========================= */

  {
    trigger: "onAllRolesAbsorbed",
    once: true,
    effects: [
      { type: "MOD_STAT", stat: "atk", value: 6 },
      { type: "MOD_STAT", stat: "hp", value: 6 },
      { type: "ADD_STATE", stateType: "as_stack", value: 0.4 }
    ]
  }

],
  variants: {
    equipment: {
      name: "Fivefold Seal",
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
      name: "Strike from the Dead Realm",
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
  name: "Executioner of the Cursed Realm",
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
      name: "Curse Control",
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
      name: "Cost of Power",
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