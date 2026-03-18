// src/lib/ui/abilityFormatter/dictionaries.ts

/* =========================
   Trigger
========================= */

export const TRIGGER_JP: Record<string, string> = {
  battleStart: "戦闘開始時",
  onAttack: "攻撃時",
  onKill: "撃破時",
  onDeath: "死亡時",
  onDamageTaken: "被ダメージ時",
  auraTick: "一定時間毎",
  firstDeath: "最初の死亡時",
  onEquip: "装備時",
  onSelfDamage: "自傷時",
  onAllRolesAbsorbed: "全ロール吸収時",
  onAbsorb_tank: "タンク吸収時",
  onAbsorb_bruiser: "ブルーザー吸収時",
  onAbsorb_skirmisher: "スカーミッシャー吸収時",
  onAbsorb_ranged: "レンジ吸収時",
  onAbsorb_support: "サポート吸収時",
}

export const TRIGGER_EN: Record<string, string> = {
  battleStart: "At the start of battle",
  onAttack: "On attack",
  onKill: "On kill",
  onDeath: "On death",
  onDamageTaken: "When damaged",
  auraTick: "Periodically",
  firstDeath: "At the first death",
  onEquip: "On equip",
  onSelfDamage: "When self-damaged",
  onAllRolesAbsorbed: "When all roles absorbed",
  onAbsorb_tank: "When tank absorbed",
  onAbsorb_bruiser: "When bruiser absorbed",
  onAbsorb_skirmisher: "When skirmisher absorbed",
  onAbsorb_ranged: "When ranged absorbed",
  onAbsorb_support: "When support absorbed",
}

/* =========================
   Stats
========================= */

export const STAT_JP: Record<string, string> = {
  atk: "ATK",
  hp: "HP",
  attackSpeed: "AS",
  damageReduce: "DR",
  attackRange: "射程",
}

export const STAT_EN: Record<string, string> = {
  atk: "Attack",
  hp: "HP",
  attackSpeed: "Attack Speed",
  damageReduce: "Damage Reduction",
  attackRange: "Range",
}

/* =========================
   State
========================= */

export const STATE_JP: Record<string, string> = {
  damage_reduce: "ダメージ軽減",
  damage_taken_amp: "被ダメージ増加",
  duel: "決闘状態",
  as_stack: "攻撃速度上昇",
  curse_stack: "呪印",
  stun: "行動不能",
  lethal_immunity: "致死無効",
  first_attack_boost: "初撃強化",
  ignore_dr_next_attack: "次の攻撃が軽減無視",
  teamSelfDamage: "味方全体の自傷回数"
}

export const STATE_EN: Record<string, string> = {
  damage_reduce: "Damage Reduction",
  damage_taken_amp: "Damage Taken Increase",
  duel: "Duel State",
  as_stack: "Attack Speed Boost",
  curse_stack: "Curse Stack",
  stun: "Stun",
  lethal_immunity: "Lethal Immunity",
  first_attack_boost: "First Attack Boost",
  ignore_dr_next_attack: "Next Attack Ignores DR",
  teamSelfDamage: "teamSelfDamage"
}

/* =========================
   Target
========================= */

export const TARGET_JP: Record<string, string> = {
  self: "自身",
  all_allies: "味方全体",
  all_enemies: "敵全体",
  front_allies: "前列の味方",
  back_allies: "後列の味方",
  random_enemy: "ランダムな敵",
  random_ally: "ランダムな味方",
  lowest_hp_ally: "最もHPが低い味方",
  highest_hp_enemy: "最もHPが高い敵",
  highest_range_ally: "最も射程が長い味方",
  all_other_allies: "自身以外の味方",
  target: "対象",
  lowest_as_ally: "最もASの低い味方",
}

export const TARGET_EN: Record<string, string> = {
  self: "self",
  all_allies: "all allies",
  all_enemies: "all enemies",
  front_allies: "front allies",
  back_allies: "back allies",
  random_enemy: "a random enemy",
  random_ally: "a random ally",
  lowest_hp_ally: "the lowest HP ally",
  highest_hp_enemy: "the highest HP enemy",
  highest_range_ally: "the ally with the longest range",
  all_other_allies: "all other allies",
  target: "the target",
  lowest_as_ally: "the ally with the lowest_as_ally",
}

/* =========================
   Condition
========================= */

export const CONDITION_JP: Record<string, string> = {
  isFront: "前列にいる場合",
  isBack: "後列にいる場合",
  hasFrontAlly: "前列に味方がいる場合",
  hasBackAlly: "後列に味方がいる場合",
  hpBelow50: "HPが50%未満の場合",
  allyCrossBelow50: "味方のHPが50%未満になった時",
  deadAlly: "味方が死亡した場合",
  deadEnemy: "敵が死亡した場合",
}

export const CONDITION_EN: Record<string, string> = {
  isFront: "while in the front row",
  isBack: "while in the back row",
  hasFrontAlly: "if there is a front ally",
  hasBackAlly: "if there is a back ally",
  hpBelow50: "if HP is below 50%",
  allyCrossBelow50: "when an ally falls below 50% HP",
  deadAlly: "if an ally dies",
  deadEnemy: "if an enemy dies",
}

export const COUNTER_JP: Record<string,string> = {
  dig: "発掘",
  teamSelfDamage: "味方自傷回数"
}