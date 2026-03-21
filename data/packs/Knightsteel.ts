// src/data/units.ts
import { Unit } from "@/types";
import { ensureAbilityIds } from "@/lib/utils/autoAbilityId"

export const KNIGHTSTEEL_PACK: Unit[] = ensureAbilityIds([

   /* =====================================================
     1コスト
  ===================================================== */

  /* =========================
     未来の要
  ========================= */
  {
  id: "future_core",
  baseName: "未来の要",
  name: "Core Of Tomorrow",
  mode: "unit",
  pack: "Knightsteel",
  cost: 1,

  hp: 5,
  atk: 1,
  attackRange: 1,
  role: "tank",

  effects: [],
  equipments: [],

  abilities: [
    {
      id: "future_core_self_shield",
      trigger: "battleStart",

      condition: "isFront",
      effects: [
        {
          type: "ADD_STATE",
          stateType: "damage_reduce",
          value: 1,
          target: "self",
          consumeOn: "onDamageTaken",
        },
      ],
    },
  ],

  variants: {
    equipment: {
      name: "Handwoven Chainmail",
      baseStats: {
        hp: 4,
      },
      effects: [],
      abilities: [
        {
          id: "future_core_equipment_shield",
          trigger: "battleStart",
          once: true,
          effects: [
            {
              type: "ADD_STATE",
              stateType: "damage_reduce",
              value: 1,
              target: "self",
              consumeOn: "onDamageTaken"
            },
          ],
        },
      ],
    },

    synergy: {
      name: "Yearning for Battle",
      effects: [],
      abilities: [
        {
          id: "future_core_synergy",
          scope: "team",
          once: true,
          trigger: "battleStart",
          effects: [
            {
              type: "ADD_STATE",
              stateType: "damage_reduce",
              value: 1,
              target: "front_allies",
              consumeOn: "onDamageTaken"
            },
          ],
        },
      ],
    },
  },
},

  /* =========================
     仲間思いの大楯持ち
  ========================= */
  {
    id: "greatshield_guard",
    baseName: "仲間思いの大楯持ち",
    name: "Shieldbearer of the Fallen",
    mode: "unit",
    pack: "Knightsteel",
    cost: 1,

    hp: 6,
    atk: 0,
    attackRange: 1,
    role: "tank",

    effects: [],
    equipments: [],

    
    abilities: [
      {
        trigger: "battleStart",
        effects: [{ type: "GUARD_ADJACENT" }],
      },
    ],

    variants: {
      equipment: {
        name: "Shield for ally",
        baseStats:{
        hp: 4
        },
        effects: [],
        abilities: [
          {
            trigger: "battleStart",
            effects: [{ type: "GUARD_ADJACENT", once: true }],
          },
        ],
      },
      synergy: {
        name: "Even If I Fall",
        effects: [],
        abilities: [
          {
            id: "greatshield_synergy",
            scope: "team",
            trigger: "battleStart",
            effects: [
              { type: "GUARD_ADJACENT", target: "type:tank" }
            ],
          },
        ],
      },

    },
  },

  /* =========================
     王都の斥候
  ========================= */
  {
    id: "royal_scout",
    baseName: "王都の斥候",
    name: "Royal Vanguard Scout",
    mode: "unit",
    pack: "Knightsteel",
    cost: 1,

    hp: 2,
    atk: 2,
    attackRange: 2,
    role: "skirmisher",

    effects: [],
    equipments: [],

    abilities: [
      {
        trigger: "battleStart",
        effects: [
          {
          type: "ADD_STATE",
          stateType: "as_stack",
          value: 0.1, 
          target: "all_allies"
        }
        ],
      },
    ],

    variants: {
      equipment: {
        name: "Polished Dagger",
        baseStats:{
          atk: 2,
        },
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
            ],
          },
        ],
      },
      synergy: {
        name: "Signal Relay",
        effects: [],
        abilities: [
          {
            id: "royal_scout_synergy",
            scope: "team",
            trigger: "battleStart",
            effects: [
         {
          type: "ADD_STATE",
          stateType: "as_stack",
          value: 0.05,
          target: "all_allies"
        }
            ],
          },
        ],
      },

    },
  },

  /* =========================
     見習い槍兵
  ========================= */
  {
    id: "trainee_lancer",
    baseName: "見習い槍兵",
    name: "Novice Lancer",
    mode: "unit",
    pack: "Knightsteel",
    cost: 1,

    hp: 2,
    atk: 2,
    attackRange: 2,
    role: "skirmisher",

    effects: [],
    equipments: [],

    abilities: [
      {
        trigger: "battleStart",
        condition: "hasFrontAlly",
        effects: [
          {
            type: "ADD_STATE",
            stateType: "atk",
            value: 1,
            target: "self",
          },
        ],
      },
    ],

    variants: {
      equipment: {
        name: "Slim Spear",
        baseStats:{
          atk: 3,
        },
        effects: [],
        abilities: [],
      },
      synergy: {
        name: "Thread the Needle",
        effects: [],
        abilities: [
          {
            id: "trainee_lancer_synergy",
            scope: "team",
            trigger: "battleStart",
            condition: "hasFrontAlly",
            effects: [
              {
                type: "ADD_STATE",
                stateType: "atk",
                value: 1,
                target: "all_allies",
              },
            ],
          },
        ],
      },
    },
  },

  /* =========================
     働き者の補給兵
  ========================= */
  {
    id: "supply_soldier",
    baseName: "働き者の補給兵",
    name: "Tireless Quartermaster",
    mode: "unit",
    pack: "Knightsteel",
    cost: 1,

    hp: 4,
    atk: 1,
    attackRange: 3,
    role: "support",

    effects: [],
    equipments: [],

    // ※ 本来は常時オーラ（将来 aura 化）
    abilities: [
      {
        trigger: "battleStart",
        condition: "hasBackAlly",
        effects: [
           {
          type: "ADD_STATE",
          stateType: "damage_reduce",
          value: 1,
          target: "back_allies",
        },
        ],
      },
    ],

    variants: {
      equipment: {
        name: "Basic Supplies",
        baseStats:{
        hp: 3
        },
        effects: [],
        abilities: [
          {
            trigger: "battleStart",
            effects: [
          {
          type: "ADD_STATE",
          stateType: "damage_reduce",
          value: 1,
          target: "back_allies"
           },
            ],
          },
        ],
      },
      synergy: {
        name: "Keep Them Alive",
        effects: [],
        abilities: [
          {
            id: "supply_soldier_synergy",
            scope: "team",
            trigger: "battleStart",
            effects: [
               {
                type: "ADD_STATE",
                stateType: "damage_reduce",
                value: 1,
                target: "back_allies",
              },
            ],
          },
        ],
      },
    },
  },

  /* =========================
     認められた弓手
  ========================= */
  {
    id: "approved_archer",
    baseName: "認められた弓手",
    name: "Proven Archer",
    mode: "unit",
    pack: "Knightsteel",
    cost: 1,

    hp: 1,
    atk: 2,
    attackRange: 4,
    role: "ranged",

    effects: [],
    equipments: [],

    abilities: [
      {
        trigger: "battleStart",
        condition: "hasFrontAlly",
        effects: [
          {
          type: "ADD_STATE",
          stateType: "as_stack",
          value: 0.15,
          target: "self"
        }
        ],
      },
    ],

    variants: {
      equipment: {
        name: "Inherited Bow",
        baseStats:{
          atk: 2
        },
        effects: [],
        abilities: [
          {
            trigger: "battleStart",
            effects: [
              {
                type: "SET_ATTACK_RANGE",
                value: "next",
                target: "self",
              },
            ],
          },
        ],
      },
      synergy: {
        name: "Archer's Discipline",
        effects: [],
        abilities: [
          {
            id: "approved_archer_synergy",
            scope: "team",
            trigger: "battleStart",
            effects: [
              {
          type: "ADD_STATE",
          stateType: "as_stack",
          value: 0.2,
          target: "type:ranged"
        }
            ],
          },
        ],
      },
    },
  },

  /* =====================================================
     2コスト
  ===================================================== */

  /* =========================
     機密を知る者
  ========================= */
  {
    id: "secret_keeper",
    baseName: "機密を知る者",
    name: "Keeper of Secrets",
    mode: "unit",
    pack: "Knightsteel",
    cost: 2,

    hp: 5,
    atk: 2,
    attackRange: 2,
    role: "skirmisher",

    effects: [],
    equipments: [],

    abilities: [
      {
        trigger: "battleStart",
        once: true,
        effects: [
          {
          type: "ADD_STATE",
          stateType: "as_stack",
          value: 1,
          target: "lowest_as_ally",
          duration: { type: "time", value: 2 }
        }
        ]
}

    ],

    variants: {
      equipment: {
        name: "Hidden Footsteps",
        baseStats:{
          hp: 2,
          atk: 2
        },
        effects: [],
        abilities: [
          {
            trigger: "onAttack",
            once: true,
            effects: [
              {
                type: "ADD_STATE",
                stateType: "atk",
                value: 2,
                target: "self",
              },
            ],
          },
        ],
      },
      synergy: {
        name: "Erased Legacy",
        effects: [],
        abilities: [
          {
            id: "secret_keeper_synergy",
            scope: "team",
            trigger: "battleStart",
            effects: [
              { type: "ADD_STATE", stateType: "atk", value: 1, target: "random_ally" },
              { type: "ADD_STATE", stateType: "hp", value: 2, target: "random_ally" },
            ],
          },
        ],
      },
    },
  },

    /* =========================
     母思いの炊き出し係
  ========================= */
  {
    id: "soup_kitchen_helper",
    baseName: "母思いの炊き出し係",
    name: "Kindhearted Cook",
    mode: "unit",
    pack: "Knightsteel",
    cost: 2,

    hp: 8,
    atk: 1,
    attackRange: 3,
    role: "support",

    effects: [],
    equipments: [],

    // 戦闘開始から10秒後、最もHPが低い味方を100%回復
    abilities: [
    {
      trigger: "auraTick",
      tick: { type: "everySeconds", seconds: 10 }, 
      once: true,
      effects: [
        {
          type: "HEAL_PERCENT",
          value: 0.5,
          target: "lowest_hp_ally"
        }
      ]
    }

   ],

    variants: {
      equipment: {
        name: "Fresh Rations",
        baseStats:{
          hp: 4
        },
        effects: [],
        abilities: [
          {
            trigger: "auraTick",
            tick: { type: "everySeconds", seconds: 1 },
            effects: [
              { type: "HEAL", value: 1, target: "self" },
            ],
          },
        ],
       },
        synergy: {
  name: "Meal For the Needy",
  effects: [],
  abilities: [
    {
      id: "soup_kitchen_once",      // ★必須（teamAbilityUsedのキー）
      scope: "team",               // ★必須
      trigger: "auraTick",
      tick: {type: "everySeconds", seconds: 1},
      effects: [
        { type: "HEAL", value: 1, target: "random_ally" },
      ],
    },
  ],
},
    },
  },
  /* =========================
     血豆だらけの見習い職人
  ========================= */
  {
    id: "bloody_apprentice",
    baseName: "血豆だらけの見習い職人",
    name: "Bloodied Apprentice",
    mode: "unit",
    pack: "Knightsteel",
    cost: 2,

    hp: 5,
    atk: 2,
    attackRange: 1,
    role: "bruiser",

    effects: [],
    equipments: [],

    abilities: [
      {
  trigger: "onEquip",
  effects: [
    { type: "ADD_STATE", stateType: "atk", value: 2, target: "self" },
    { type: "ADD_STATE", stateType: "hp", value: 1, target: "self" },
  ],
}
,
    ],

    variants: {
      equipment: {
        name: "Imitation Holy Sword",
        baseStats:{
          hp: 2,
          atk: 2
        },
        effects: [],
        abilities: [],
      },
      synergy: {
        name: "Daily Training",
        effects: [],
        abilities: [
          {
            id: "bloody_apprentice_synergy",
            scope: "team",
            trigger: "battleStart",
            effects: [
              { type: "ADD_STATE", stateType: "atk", value: 1, target: "equipped_allies" },
              { type: "ADD_STATE", stateType: "hp", value: 1, target: "equipped_allies" },
            ],
          },
        ],
      },
    },
  },


  /* =========================
     戦場の嫌われ者
  ========================= */
  {
    id: "battlefield_outcast",
    baseName: "戦場の嫌われ者",
    name: "Battlefield Outcast",
    mode: "unit",
    pack: "Knightsteel",
    cost: 2,

    hp: 3,
    atk: 4,
    attackRange: 1,
    role: "skirmisher",

    effects: [],
    equipments: [],

    // 自身とランダムな敵のAS-50%
    abilities: [
      {
  trigger: "battleStart",
  effects: [
    {
      type: "MOD_STAT",
      stat: "attackSpeed",
      value: -0.5,
      target: "self"
    },
    {
      type: "MOD_STAT",
      stat: "attackSpeed",
      value: -0.5,
      target: "random_enemy"
          }
        ]      
      }
    ],

    variants: {
      equipment: {
        name: "Midnight Roar",
        effects: [],
        baseStats:{
          hp: 2,
          atk: 3
        },
        abilities: [
          {
            trigger: "onDamageTaken",
            effects: [
              {
                type: "MOD_STAT",
                stat: "attackSpeed",
                value: -0.5,
                target: "target", // 攻撃してきた相手（context対応後に有効）
              },
              {
                type: "MOD_STAT",
                stat: "attackSpeed",
                value: -0.5,
                target: "self", // 攻撃してきた相手（context対応後に有効）
              },
            ],
          },
        ],
      },
      synergy: {
        name: "Battlefield Chaos",
        effects: [],
        abilities: [
          {
            id: "battlefield_chaos",
            scope: "team",
            trigger: "battleStart",
            effects: [
              { type: "ADD_STATE", stateType: "atk", value: 2, target: "random_ally" },
              { type: "ADD_STATE", stateType: "hp", value: 3, target: "random_enemy" },
            ],
          },
        ],
      },
    },
  },


  /* =========================
     戦いを告げる鐘鳴らし
  ========================= */
  {
    id: "war_bell_ringer",
    baseName: "戦いを告げる鐘鳴らし",
    name: "War Bell Herald",
    mode: "unit",
    pack: "Knightsteel",
    cost: 2,

    hp: 6,
    atk: 2,
    attackRange: 4,
    role: "ranged",

    effects: [],
    equipments: [],

    abilities: [
      {
        trigger: "onKill",
        effects: [
         {
          type: "ADD_STATE",
          stateType: "as_stack",
          value: 0.1, 
          target: "all_allies"
        }
        ],
      },
    ],

    variants: {
      equipment: {
        name: "Golden Bell",
        baseStats:{
          hp: 5
        },
        effects: [],
        abilities: [
          {
            trigger: "onKill",
            effects: [
              {
          type: "ADD_STATE",
          stateType: "as_stack",
          value: 0.05, 
          maxStack: 6,
          maxTotalValue: 0.3,
          target: "all_allies"
        }
            ],
          },
        ],
      },
      synergy: {
        name: "Ringing Alarm",
        effects: [],
        abilities: [
          {
            id: "warbell_ringer_synergy",
            scope: "team",
            trigger: "battleStart",
            effects: [
              {
                type: "ADD_STATE",
                stateType: "as_stack",
                value: 0.10,
                target: "all_allies"
              }
            ],
          },
        ],
      },
    },
  },

  /* =========================
     古参の門番
  ========================= */
  {
  id: "veteran_gatekeeper",
  baseName: "古参の門番",
  name: "Veteran Gatekeeper",
  mode: "unit",
  pack: "Knightsteel",
  cost: 2,

  hp: 7,
  atk: 2,
  attackRange: 1,
  role: "tank",

  effects: [],
  equipments: [],

  abilities: [
    {
      id: "veteran_gatekeeper_self_shield",
      trigger: "battleStart",
      effects: [
        {
          type: "ADD_STATE",
          stateType: "damage_reduce",
          value: 2,
          target: "self",
          consumeOn: "onDamageTaken"

        },
      ],
    },
  ],

  variants: {
    equipment: {
      name: "Grand Gate",
      baseStats: {
        hp: 6,
      },
      effects: [],
      abilities: [
        {
          id: "veteran_gatekeeper_equipment_shield",
          trigger: "battleStart",
          effects: [
            {
              type: "ADD_STATE",
              stateType: "damage_reduce",
              value: 2,
              target: "self",
              consumeOn: "onDamageTaken"
            },
          ],
        },
      ],
    },

    synergy: {
      name: "Gate Defense",
      effects: [],
      abilities: [
        {
          id: "veteran_gatekeeper_synergy",
          scope: "team",
          trigger: "battleStart",
          effects: [
            {
              type: "ADD_STATE",
              stateType: "hp",
              value: 2,
              target: "front_allies",
            },
          ],
        },
      ],
    },
  },
},

  {
  id: "arena_champion",
  baseName: "決闘場のチャンピオン",
  name: "Arena Champion",
  mode: "unit",
  pack: "Knightsteel",
  cost: 3,

  hp: 9,
  atk: 3,
  attackRange: 1,
  role: "bruiser",

  effects: [],
  equipments: [],

  abilities: [
      {
  trigger: "onAttack",
  once: true,
  effects: [
    {
      type: "ADD_STATE",
      stateType: "atk",
      value: 5,
      target: "self",
    },
    {
      type: "ADD_STATE",
      stateType: "damage_reduce",
      value: -2,
      target: "self",
    },
      ],
    },
  ],

  variants: {
    /* =========================
       装備：決闘の証
       最初の一撃を超強化
    ========================= */
    equipment: {
      name: "Mark of Duel",
      baseStats:{
          hp: 3,
          atk: 2
        },
      effects: [],
      abilities: [
        {
          trigger: "onAttack",
          once: true,
          effects: [
            { type: "ADD_STATE", stateType: "atk", value: 3, target: "self" },
          ],
        },
      ],
    },

    /* =========================
       シナジー：名誉の一騎打ち
       全員が決闘状態に入る
    ========================= */
    synergy: {
      name: "Duel of Honor",
      effects: [],
      abilities: [
        {
          id: "arena_champion_synergy",
            scope: "team",
          trigger: "battleStart",
          effects: [
            { type: "ADD_STATE", stateType: "atk", value: 4, target: "random_ally" },
            { type: "ADD_STATE", stateType: "damage_reduce", value: -2, target: "random_ally" },
          ],
        },
      ],
    },
  },
},
{
  id: "royal_intelligence_agent",
  baseName: "王族直属密偵",
  name: "Royal Shadow Agent",
  mode: "unit",
  pack: "Knightsteel",
  cost: 3,

  hp: 8,
  atk: 2,
  attackRange: 2,
  role: "skirmisher",

  effects: [],
  equipments: [],

  // 戦闘開始時、ランダムな味方を強化
  abilities: [
    {
      trigger: "battleStart",
      effects: [
        { type: "ADD_STATE", stateType: "atk", value: 2, target: "random_ally" },
        { type: "ADD_STATE", stateType: "hp", value: 2, target: "random_ally" },
      ],
    },
  ],

  variants: {
    /* =========================
       装備：偽装装備
       ランダム敵を一時弱体化
    ========================= */
    equipment: {
      name: "Disguise Kit",
      baseStats:{
          atk: 2,
          hp: 3
        },
      effects: [],
      abilities: [
        {
          trigger: "battleStart",
          effects: [
            {
              type: "ADD_STATE",
              stateType: "atk",
              value: -3,
              target: "random_enemy",
              duration: { type: "time", value: 5 },
            },
            {
              type: "MOD_STAT",
              stat: "attackSpeed",
              value: -0.3,
              target: "random_enemy",
              duration: { type: "time", value: 5 },
            },
          ],
        },
      ],
    },

    /* =========================
       シナジー：錯乱工作
       敵全体のASを一時低下
    ========================= */
    synergy: {
      name: "Disrupton Tactics",
      effects: [],
      abilities: [
        {
          id: "royal_interigence__synergy",
            scope: "team",
          trigger: "battleStart",
          effects: [
            {
              type: "MOD_STAT",
              stat: "attackSpeed",
              value: -0.1,
              target: "all_enemies",
              duration: { type: "time", value: 3 },
            },
          ],
        },
      ],
    },
  },
},
{
  id: "wandering_bard",
  baseName: "流浪の吟遊詩人",
  name: "Wandering Bard",
  mode: "unit",
  pack: "Knightsteel",
  cost: 3,

  hp: 9,
  atk: 1,
  attackRange: 3,
  role: "support",

  effects: [],
  equipments: [],

  // 最初の死亡時に一度だけ全体バフ（近似）
  abilities: [
  {
    trigger: "firstDeath",
    condition: "deadAlly",
    effects: [
      {
          type: "ADD_STATE",
          stateType: "as_stack",
          value: 0.15, 
          target: "all_allies"
        }
    ],
  },
  {
    trigger: "firstDeath",
    condition: "deadEnemy",
    effects: [
      {
        type: "MOD_STAT",
        stat: "attackSpeed",
        value: -0.15,
        target: "all_enemies",
      },
    ],
  },
],



  variants: {
    /* =========================
       装備：涙を止める戦歌
       装備者死亡時、味方ATK上昇
    ========================= */
    equipment: {
      name: "War Song of Resolve",
      baseStats:{
          atk: 2,
          hp: 3
        },
      effects: [],
      abilities: [
        {
          trigger: "onDeath",
          effects: [
            { type: "ADD_STATE", stateType: "atk", value: 2, target: "all_allies" },
          ],
        },
      ],
    },

    /* =========================
       シナジー：難民たちの奮起
       味方全体のHP上昇
    ========================= */
    synergy: {
      name: "Refugee Uprising",
      effects: [],
      abilities: [
        {
          id: "wandering_bard_synergy",
            scope: "team",
          trigger: "battleStart",
          effects: [
            { type: "ADD_STATE", stateType: "hp", value: 2, target: "all_allies" },
          ],
        },
      ],
    },
  },
},
{
  id: "power_hungry_investigator",
  baseName: "権力好きの内部調査官",
  name: "Power-Hungry Inspector",
  mode: "unit",
  pack: "Knightsteel",
  cost: 3,

  hp: 12,
  atk: 0,
  attackRange: 1,
  role: "tank",

  effects: [],
  equipments: [],

  // 攻撃するたびに敵を弱体化し、自分を強化
  abilities: [
    {
      trigger: "onAttack",
      effects: [
        {
          type: "MOD_STAT",
          stat: "attackSpeed",
          value: -0.05,
          target: "target",
        },
        {
          type: "ADD_STATE",
          stateType: "atk",
          value: 1,
          target: "self",
        },
      ],
    },
  ],

  variants: {
    /* =========================
       装備：税務帳簿
       最初の攻撃で強力な監査
    ========================= */
    equipment: {
      name: "Ledger of Judgment",
      baseStats:{
          atk: 4,
          hp: 2
        },
      effects: [],
      abilities: [
        {
          trigger: "onAttack",
          once: true,
          effects: [
            {
              type: "ADD_STATE",
              stateType: "atk",
              value: -3,
              target: "target",
              duration: { type: "time", value: 5 },
            },
          ],
        },
      ],
    },

    /* =========================
       シナジー：財務監査
       開幕で敵一体を機能不全に
    ========================= */
    synergy: {
      name: "Financial Audit",
      effects: [],
      abilities: [
        {
          id: "power_hungry_investigator_synergy",
          scope: "team",
          trigger: "battleStart",
          effects: [
            {
              type: "MOD_STAT",
              stat: "attackSpeed",
              value: -0.3,
              target: "random_enemy",
              duration: { type: "time", value: 3 },
            },
          ],
        },
      ],
    },
  },
},
{
  id: "instant_surveyor",
  baseName: "即答の測量士",
  name: "Swift Surveyor",
  mode: "unit",
  pack: "Knightsteel",
  cost: 3,

  hp: 9,
  atk: 2,
  attackRange: 3,
  role: "support",

  effects: [],
  equipments: [],

  /* =========================
     本体
     最も射程の長い味方のATKを上昇
  ========================= */
  abilities: [
    {
      trigger: "battleStart",
      effects: [
        {
          type: "ADD_STATE",
          stateType: "atk",
          value: 2, 
          target: "highest_range_ally",
        },
      ],
    },
  ],

  variants: {
    /* =========================
       装備：天性の距離感
       装備者自身の射程昇格
    ========================= */
    equipment: {
      name: "Natural Range Ssense",
      baseStats:{
          atk: 3,
          hp: 4
        },
      effects: [],
      abilities: [
        {
          trigger: "battleStart",
          effects: [
            {
              type: "SET_ATTACK_RANGE",
              value: "next",
              target: "self",
            },
          ],
        },
      ],
    },

    /* =========================
       シナジー：戦域拡張
       前列全体の射程を昇格
    ========================= */
    synergy: {
      name: "Expanded Front",
      effects: [],
      abilities: [
        {
          id: "instant_surveior_synergy",
          scope: "team",
          trigger: "battleStart",
          effects: [
            {
              type: "SET_ATTACK_RANGE",
              value: "next",
              target: "back_allies",
            },
          ],
        },
      ],
    },
  },
},
{
  id: "banner_officer",
  baseName: "戦旗将校",
  name: "Banner Officer",
  mode: "unit",
  pack: "Knightsteel",
  cost: 4,

  hp: 9,
  atk: 1,
  attackRange: 4,
  role: "ranged",

  effects: [],
  equipments: [],

  abilities: [
    {
      trigger: "onAttack",
      condition: "hasFrontAlly",
      effects: [
        {
          type: "ADD_STATE",
          stateType: "as_stack",
          value: 0.1,
          maxStack: 3,
          maxTotalValue: 0.3, // 30%
          target: "all_allies"
        }

      ]
    }
  ],


  variants: {
    /* 王国大戦旗 */
    equipment: {
      name: "Royal War Banner",
      baseStats:{
          atk: 3,
          hp: 4
        },
      effects: [],
      abilities: [
        {
          trigger: "battleStart",
          effects: [
            {
          type: "ADD_STATE",
          stateType: "as_stack",
          value: 0.2, 
          target: "all_allies"
        }
          ],
        },
      ],
    },

    /* 全速全軍 */
    synergy: {
      name: "Full Advance",
      effects: [],
      abilities: [
        {
          id: "banner_global_synergy",
          scope: "team",
          trigger: "auraTick",
          tick: { type: "everySeconds", seconds: 2 },
          effects: [
            {
              type: "ADD_STATE",
              stateType: "as_stack",
              value: 0.15, 
              target: "random_ally"
            }
          ],
        },
      ],
    },

  },
},
{
  id: "kingdom_heavy_guard",
  baseName: "王国一の重装兵",
  name: "Kingdom's Heavy Guard",
  mode: "unit",
  pack: "Knightsteel",
  cost: 4,

  hp: 15,
  atk: 3,
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
          target: "self"
        },
    ],
  },

  {
    trigger: "onDamageTaken",
    effects: [
      {
        type: "DAMAGE",
        value: 2,
        target: "target",
      },
    ],
  },
],

  variants: {
    /* 装甲一式 */
    equipment: {
  name: "Full Armor Set",
  baseStats:{
          atk: 2,
          hp: 8
        },
  effects: [],
  abilities: [
    {
      trigger: "battleStart",
      effects: [
        {
          type: "ADD_STATE",
          stateType: "lethal_immunity",
          target: "self",
        },
      ],
    },
  ],
},


    /* 絶対不屈 */
    synergy: {
      name: "Unbreakable Resolve",
      effects: [],
      abilities: [
        {
          id: "kingdom_heavy_guard_synergy",
          scope: "team",
          trigger: "battleStart",
          effects: [
            {
              type: "ADD_STATE",
              stateType: "damage_reduce",
              value: 8,
              consumeOn: "onDamageTaken",
              target: "front_allies",
            },
          ],
        },
      ],
    },
  },
},
{
  id: "reckless_charge_captain",
  baseName: "危険な突撃隊長",
  name: "Reckless Charge Captain",
  mode: "unit",
  pack: "Knightsteel",
  cost: 4,

  hp: 13,
  atk: 4,
  attackRange: 1,
  role: "bruiser",

  effects: [],
  equipments: [],

  abilities: [
    {
      trigger: "onAttack",
      effects: [
        {
          type: "ADD_STATE",
          stateType: "damage_reduce",
          value: -2,
          target: "target",
        },
      ],
    },
  ],

  variants: {
    /* 血で育つ剣 */
    equipment: {
      name: "Bloodforged Blade",
      baseStats:{
          atk: 6,
        },
      effects: [],
      abilities: [
        {
          trigger: "onAttack",
          effects: [
            {
              type: "ADD_STATE",
              stateType: "damage_reduce",
              value: -2,
              target: "target",
            },
          ],
        },
      ],
    },

    /* 一点突破 */
    synergy: {
      name: "Breakthrough Strike",
      effects: [],
      abilities: [
        {
          id: "reckless_charge_captain_synergy",
          scope: "team",
          trigger: "battleStart",
          effects: [
            {
              type: "ADD_STATE",
              stateType: "atk",
              value: 2,
              target: "all_allies",
            },
          ],
        },
      ],
    },
  },
},
{
  id: "legendary_priest",
  baseName: "伝説を語る司祭",
  name: "Priest of Legends",
  mode: "unit",
  pack: "Knightsteel",
  cost: 4,

  hp: 12,
  atk: 2,
  attackRange: 3,
  role: "support",

  effects: [],
  equipments: [],

  abilities: [
    {
      trigger: "onDamageTaken",
      once: true,
      condition: { type: "targetHpBelowPercent", value: 0.5 },
      effects: [
        {
          type: "HEAL",
          value: 5,
          target: "front_allies",
        },
      ],
    },
  ],

  variants: {
    /* 選ばれし聖印 */
    equipment: {
      name: "Chosen Sigil",
      baseStats:{
          hp: 7
        },
      effects: [],
      abilities: [
        {
          trigger: "auraTick",
          tick: { type: "everySeconds", seconds: 1 },
          effects: [
            {
              type: "HEAL",
              value: 3,
              target: "self",
            },
          ],
        },
      ],
    },

    /* 祝福の儀式 */
    synergy: {
      name: "Blessing Rite",
      effects: [],
      abilities: [
        {
          id: "legendary_priest_synergy",
          scope: "team",
          trigger: "auraTick",
          tick: { type: "everySeconds", seconds: 3 },
          effects: [
            {
              type: "HEAL",
              value: 3,
              target: "all_allies",
            },
          ],
        },
      ],
    },
  },
},
{
  id: "immortal_knight",
  baseName: "不滅の騎士",
  name: "Immortal Knight",
  mode: "unit",
  pack: "Knightsteel",
  cost: 5,

  hp: 18,
  atk: 3,
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
          target: "all_allies"
        },
  ],
},
],


  variants: {
    equipment: {
      name: "Oath of Immortality",
      baseStats:{
          atk: 4,
          hp: 10
        },
      effects: [],
      abilities: [
        {
          trigger: "onDeath",
          condition: "deadAlly",
          effects: [
            { type: "HEAL", value: 3, target: "self" },
          ],
        },
      ],
    },

    synergy: {
      name: "Gift of Immortality",
      effects: [],
      abilities: [
        {
          id: "immortal_knight_synergy",
          scope: "team",
          trigger: "battleStart",
          once: true,
          effects: [
            {
              type: "ADD_STATE",
              stateType: "lethal_immunity",
              target: "front_allies",
            },
          ],
        }

      ],
    },
  },
},
{
  id: "victory_strategist",
  baseName: "勝利の軍師",
  name: "Strategist of Victory",
  mode: "unit",
  pack: "Knightsteel",
  cost: 5,

  hp: 14,
  atk: 3,
  attackRange: 4,
  role: "ranged",

  effects: [],
  equipments: [],

  abilities: [
    {
      trigger: "auraTick",
      tick: { type: "everySeconds", seconds: 2 },
      effects: [
        {
          type: "ADD_STATE",
          stateType: "as_stack",
          value: 0.2,
          maxStack: 3,
          maxTotalValue: 0.6,
          target: "all_allies",
        },
      ],
    },
  ],

  variants: {
    equipment: {
      name: "Tome of Radiant Wisdom",
      baseStats:{
          atk: 5,
          hp: 5
        },
      effects: [],
      abilities: [
        {
          trigger: "auraTick",
          tick: { type: "everySeconds", seconds: 5 },
          effects: [
            {
              type: "ADD_STATE",
              stateType: "as_stack",
              value: 0.3,
              maxStack: 3,
              maxTotalValue: 0.9,
              target: "self",
            },
          ],
        },
      ],
    },

    synergy: {
      name: "Army Optimization",
      effects: [],
      abilities: [
        {
          id: "victory_strategist_synergy",
          scope: "team",
          trigger: "auraTick",
          tick: { type: "everySeconds", seconds: 4 },
          effects: [
            {
              type: "ADD_STATE",
              stateType: "as_stack",
              value: -0.15,
              maxStack: 3,
              maxTotalValue: -0.45,
              target: "all_enemies",
            },
          ],
        },
      ],
    },
  },
},
{
  id: "battlefield_disruptor",
  baseName: "戦場を乱す者",
  name: "Battlefield Disruptor",
  mode: "unit",
  pack: "Knightsteel",
  cost: 5,

  hp: 12,
  atk: 4,
  attackRange: 1,
  role: "skirmisher",

  effects: [],
  equipments: [],

  abilities: [
    {
      trigger: "onAttack",
      effects: [
        { type: "ADD_STATE", stateType: "atk", value: 2, target: "self" },
      ],
    },
  ],

  variants: {
    equipment: {
      baseStats:{
          atk: 8,
          hp: 2
        },
      name: "Twin Blades of the Vanguard",
      effects: [],
      abilities: [
        {
          trigger: "onAttack",
          effects: [
            { type: "ADD_STATE", stateType: "atk", value: 1, target: "self" },
          ],
        },
      ],
    },

    synergy: {
      name: "Mounting Corpses",
      effects: [],
      abilities: [
        {
          id: "battle_field_disrupter_synergy",
            scope: "team",
          trigger: "battleStart",
          effects: [
            { type: "ADD_STATE", stateType: "atk", value: 3, target: "all_allies" },
          ],
        },
      ],
    },
  },
},



])