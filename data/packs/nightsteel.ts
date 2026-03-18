// src/data/units.ts
import { Unit } from "@/types";
import { ensureAbilityIds } from "@/lib/utils/autoAbilityId"

export const NIGHTSTEEL_PACK: Unit[] = ensureAbilityIds([

   /* =====================================================
     1コスト
  ===================================================== */

  /* =========================
     未来の要
  ========================= */
  {
  id: "future_core",
  baseName: "未来の要",
  name: "未来の要",
  mode: "unit",
  pack: "Nightsteel",
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
      once:true,

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
      name: "手編みの鎖帷子",
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
      name: "戦場への憧れ",
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
    name: "仲間思いの大楯持ち",
    mode: "unit",
    pack: "Nightsteel",
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
        name: "二人分の盾",
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
        name: "たとえこの身が滅びても",
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
    name: "王都の斥候",
    mode: "unit",
    pack: "Nightsteel",
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
        name: "磨かれた短剣",
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
        name: "情報伝達",
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
    name: "見習い槍兵",
    mode: "unit",
    pack: "Nightsteel",
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
            type: "MOD_STAT",
            stat: "atk",
            value: 1,
            target: "self",
          },
        ],
      },
    ],

    variants: {
      equipment: {
        name: "細身の槍",
        baseStats:{
          atk: 3,
        },
        effects: [],
        abilities: [],
      },
      synergy: {
        name: "針の糸を通す",
        effects: [],
        abilities: [
          {
            id: "trainee_lancer_synergy",
            scope: "team",
            trigger: "battleStart",
            condition: "hasFrontAlly",
            effects: [
              {
                type: "MOD_STAT",
                stat: "atk",
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
    name: "働き者の補給兵",
    mode: "unit",
    pack: "Nightsteel",
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
        name: "最低限の物資",
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
        name: "命を繋ぐ",
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
    name: "認められた弓手",
    mode: "unit",
    pack: "Nightsteel",
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
        name: "託された弓",
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
        name: "弓手の立ち回り",
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
    name: "機密を知る者",
    mode: "unit",
    pack: "Nightsteel",
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
        name: "秘密の足跡",
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
                type: "MOD_STAT",
                stat: "atk",
                value: 2,
                target: "self",
              },
            ],
          },
        ],
      },
      synergy: {
        name: "消された伝承",
        effects: [],
        abilities: [
          {
            id: "secret_keeper_synergy",
            scope: "team",
            trigger: "battleStart",
            effects: [
              { type: "MOD_STAT", stat: "atk", value: 1, target: "all_allies" },
              { type: "MOD_STAT", stat: "hp", value: 1, target: "all_allies" },
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
    name: "母思いの炊き出し係",
    mode: "unit",
    pack: "Nightsteel",
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
      trigger: "battleStart",
      delay: { type: "time", value: 10 },
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
        name: "出来立て並の保存食",
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
  name: "求める者への炊き出し",
  effects: [],
  abilities: [
    {
      id: "soup_kitchen_once",      // ★必須（teamAbilityUsedのキー）
      scope: "team",               // ★必須
      trigger: "onDamageTaken",
      condition: "allyCrossBelow50",
      once: true,
      effects: [
        { type: "HEAL_PERCENT", value: 1.0, target: "target" },
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
    name: "血豆だらけの見習い職人",
    mode: "unit",
    pack: "Nightsteel",
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
    { type: "MOD_STAT", stat: "atk", value: 2, target: "self" },
    { type: "MOD_STAT", stat: "hp", value: 1, target: "self" },
  ],
}
,
    ],

    variants: {
      equipment: {
        name: "聖剣の模倣品",
        baseStats:{
          hp: 2,
          atk: 2
        },
        effects: [],
        abilities: [],
      },
      synergy: {
        name: "日々の鍛錬",
        effects: [],
        abilities: [
          {
            id: "bloody_apprentice_synergy",
            scope: "team",
            trigger: "battleStart",
            effects: [
              { type: "MOD_STAT", stat: "atk", value: 1, target: "all_allies" },
              { type: "MOD_STAT", stat: "hp", value: 1, target: "all_allies" },
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
    name: "戦場の嫌われ者",
    mode: "unit",
    pack: "Nightsteel",
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
        name: "深夜の雄叫び",
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
        name: "戦場の混乱",
        effects: [],
        abilities: [
          {
            id: "battlefield_chaos",
            scope: "team",
            trigger: "battleStart",
            effects: [
              { type: "MOD_STAT", stat: "atk", value: 2, target: "random_ally" },
              { type: "MOD_STAT", stat: "hp", value: 3, target: "random_enemy" },
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
    name: "戦いを告げる鐘鳴らし",
    mode: "unit",
    pack: "Nightsteel",
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
        name: "黄金の鐘",
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
        name: "響き渡る警鐘",
        effects: [],
        abilities: [
          {
            id: "warbell_ringer_synergy",
            scope: "team",
            trigger: "onKill",
            effects: [
              {
                type: "ADD_STATE",
                stateType: "as_stack",
                value: 0.15,
                maxStack: 1,
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
  name: "古参の門番",
  mode: "unit",
  pack: "Nightsteel",
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
      name: "豪華な門",
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
      name: "門前防衛",
      effects: [],
      abilities: [
        {
          id: "veteran_gatekeeper_synergy",
          scope: "team",
          trigger: "battleStart",
          effects: [
            {
              type: "MOD_STAT",
              stat: "hp",
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
  name: "決闘場のチャンピオン",
  mode: "unit",
  pack: "Nightsteel",
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
      type: "MOD_STAT",
      stat: "damageReduce",
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
      name: "決闘の証",
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
            { type: "MOD_STAT", stat: "atk", value: 3, target: "self" },
          ],
        },
      ],
    },

    /* =========================
       シナジー：名誉の一騎打ち
       全員が決闘状態に入る
    ========================= */
    synergy: {
      name: "名誉の一騎打ち",
      effects: [],
      abilities: [
        {
          id: "arena_champion_synergy",
            scope: "team",
          trigger: "onAttack",
          once: true,
          effects: [
            { type: "MOD_STAT", stat: "atk", value: 2, target: "self" },
            { type: "MOD_STAT", stat: "damageReduce", value: -2, target: "self" },
          ],
        },
      ],
    },
  },
},
{
  id: "royal_intelligence_agent",
  baseName: "王族直属密偵",
  name: "王族直属密偵",
  mode: "unit",
  pack: "Nightsteel",
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
        { type: "MOD_STAT", stat: "atk", value: 2, target: "random_ally" },
        { type: "MOD_STAT", stat: "hp", value: 2, target: "random_ally" },
      ],
    },
  ],

  variants: {
    /* =========================
       装備：偽装装備
       ランダム敵を一時弱体化
    ========================= */
    equipment: {
      name: "偽装装備",
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
              type: "MOD_STAT",
              stat: "atk",
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
      name: "錯乱工作",
      effects: [],
      abilities: [
        {
          id: "royal_interigence__synergy",
            scope: "global",
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
  name: "流浪の吟遊詩人",
  mode: "unit",
  pack: "Nightsteel",
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
      name: "涙を止める戦歌",
      baseStats:{
          atk: 2,
          hp: 3
        },
      effects: [],
      abilities: [
        {
          trigger: "onDeath",
          effects: [
            { type: "MOD_STAT", stat: "atk", value: 2, target: "all_allies" },
          ],
        },
      ],
    },

    /* =========================
       シナジー：難民たちの奮起
       味方全体のHP上昇
    ========================= */
    synergy: {
      name: "難民たちの奮起",
      effects: [],
      abilities: [
        {
          id: "wandering_bard_synergy",
            scope: "team",
          trigger: "battleStart",
          effects: [
            { type: "MOD_STAT", stat: "hp", value: 3, target: "all_allies" },
          ],
        },
      ],
    },
  },
},
{
  id: "power_hungry_investigator",
  baseName: "権力好きの内部調査官",
  name: "権力好きの内部調査官",
  mode: "unit",
  pack: "Nightsteel",
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
          type: "MOD_STAT",
          stat: "atk",
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
      name: "税務帳簿",
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
              type: "MOD_STAT",
              stat: "atk",
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
      name: "財務監査",
      effects: [],
      abilities: [
        {
          id: "power_hungry_investigator_synergy",
          scope: "global",
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
  name: "即答の測量士",
  mode: "unit",
  pack: "Nightsteel",
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
          type: "MOD_STAT",
          stat: "atk",
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
      name: "天性の距離感",
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
      name: "戦域拡張",
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
  name: "戦旗将校",
  mode: "unit",
  pack: "Nightsteel",
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
      name: "王国大戦旗",
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
      name: "全速全軍",
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
  name: "王国一の重装兵",
  mode: "unit",
  pack: "Nightsteel",
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
  name: "装甲一式",
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
      name: "絶対不屈",
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
  name: "危険な突撃隊長",
  mode: "unit",
  pack: "Nightsteel",
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
          type: "MOD_STAT",
          stat: "damageReduce",
          value: -2,
          target: "target",
        },
      ],
    },
  ],

  variants: {
    /* 血で育つ剣 */
    equipment: {
      name: "血で育つ剣",
      baseStats:{
          atk: 6,
        },
      effects: [],
      abilities: [
        {
          trigger: "onAttack",
          effects: [
            {
              type: "MOD_STAT",
              stat: "damageReduce",
              value: -2,
              target: "target",
            },
          ],
        },
      ],
    },

    /* 一点突破 */
    synergy: {
      name: "一点突破",
      effects: [],
      abilities: [
        {
          id: "reckless_charge_captain_synergy",
          scope: "team",
          trigger: "battleStart",
          effects: [
            {
              type: "MOD_STAT",
              stat: "atk",
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
  name: "伝説を語る司祭",
  mode: "unit",
  pack: "Nightsteel",
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
          value: 10,
          target: "front_allies",
        },
      ],
    },
  ],

  variants: {
    /* 選ばれし聖印 */
    equipment: {
      name: "選ばれし聖印",
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
      name: "祝福の儀式",
      effects: [],
      abilities: [
        {
          id: "legendary_priest_synergy",
          scope: "team",
          trigger: "battleStart",
          effects: [
            {
              type: "MOD_STAT",
              stat: "hp",
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
  name: "不滅の騎士",
  mode: "unit",
  pack: "Nightsteel",
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
      name: "不死の誓い",
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
      name: "不滅の付与",
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
  name: "勝利の軍師",
  mode: "unit",
  pack: "Nightsteel",
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
      name: "輝く知恵の書",
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
      name: "全軍最適化",
      effects: [],
      abilities: [
        {
          id: "victory_strategist_synergy",
          scope: "team",
          trigger: "auraTick",
          tick: { type: "everySeconds", seconds: 3 },
          effects: [
            {
              type: "ADD_STATE",
              stateType: "as_stack",
              value: 0.1,
              maxStack: 5,
              maxTotalValue: 0.5,
              target: "all_allies",
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
  name: "戦場を乱す者",
  mode: "unit",
  pack: "Nightsteel",
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
        { type: "MOD_STAT", stat: "atk", value: 2, target: "self" },
      ],
    },
  ],

  variants: {
    equipment: {
      baseStats:{
          atk: 8,
          hp: 2
        },
      name: "遊撃長の双刃",
      effects: [],
      abilities: [
        {
          trigger: "onAttack",
          effects: [
            { type: "MOD_STAT", stat: "atk", value: 1, target: "self" },
          ],
        },
      ],
    },

    synergy: {
      name: "積み上がる屍",
      effects: [],
      abilities: [
        {
          id: "battle_field_disrupter_synergy",
            scope: "team",
          trigger: "onKill",
          effects: [
            { type: "MOD_STAT", stat: "atk", value: 1, target: "all_allies" },
          ],
        },
      ],
    },
  },
},



])