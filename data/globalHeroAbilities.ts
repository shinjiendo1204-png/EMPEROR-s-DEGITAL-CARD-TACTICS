import { Ability } from "@/types"

export const GLOBAL_HERO_ABILITIES: Ability[] = [
  /* =========================
       Varkesh ヒーロー
  ========================= */
  {
    id: "unlock_hero_blood_oni_emperor",
    trigger: "battleEnd",
    pack: "Varkesh",
    condition: { type: "counter", key: "selfDamage", scope: "match", min: 20 },
    effects: [{ type: "CLAIM_HERO", heroId: "hero_blood_oni_emperor" }]
  },
  {
    id: "unlock_hero_yamato",
    trigger: "battleEnd",
    pack: "Varkesh",
    condition: { type: "counter", key: "onDeath", scope: "match", min: 20 },
    effects: [{ type: "CLAIM_HERO", heroId: "hero_yamato" }]
  },
  {
    id: "unlock_hero_shikome",
    trigger: "battleEnd",
    pack: "Varkesh",
    condition: { type: "counter", key: "teamCurseApplied", scope: "match", min: 32 },
    effects: [{ type: "CLAIM_HERO", heroId: "hero_shikome" }]
  },

  /* =========================
       Nightsteel ヒーロー
  ========================= */
  {
    id: "unlock_the_hope_alux",
    trigger: "battleEnd",
    pack: "Knightsteel",
    condition: {
    type: "boardCost",
    pack: "Knightsteel",
    min: 15                  // 合計で 6 体以上
  },
    effects: [{ type: "CLAIM_HERO", heroId: "the_hope_alux" }]
  },
 {
  id: "unlock_hero_nightsteel_guard",
  trigger: "battleEnd",
  pack: "Knightsteel",
  condition: {
    type: "counter",
    key: "damageReduce",
    scope: "match",
    min: 15
  },
  effects: [{ type: "CLAIM_HERO", heroId: "hero_nightsteel_guard" }]
},
  {
    id: "unlock_hero_nightsteel_swift",
    trigger: "battleEnd",
    pack: "Knightsteel",
    condition: { type: "counter", key: "as_stack", scope: "match", min: 18 },
    effects: [{ type: "CLAIM_HERO", heroId: "hero_nightsteel_swift" }]
  },

  /* =========================
       Antiqua ヒーロー
  ========================= */
  {
    id: "unlock_hero_antiqua_dig_relic",
    trigger: "battleEnd",
    pack: "Antiqua",
    condition: { type: "counter", key: "dig", scope: "match", min: 22 },
    effects: [{ type: "CLAIM_HERO", heroId: "hero_antiqua_dig_relic" }]
  },
      {
    id:"unlock_hero_antiqua_devourer",
    trigger:"battleStart",
    pack:"Antiqua",
    condition:{
      type:"counter",
      key:"equipmentDestroyed",
      scope:"match",
      min:9
    },
    effects:[
      { type:"CLAIM_HERO", heroId:"hero_antiqua_devourer" }
    ]
    },
      {
 id:"unlock_hero_antiqua_overlord",
 trigger:"battleStart",
 pack:"Antiqua",
 condition:{
   type:"unitFullEquipCount",
   min:3
 },
 effects:[
  { type:"CLAIM_HERO", heroId:"hero_antiqua_overlord" }
 ]
},
]