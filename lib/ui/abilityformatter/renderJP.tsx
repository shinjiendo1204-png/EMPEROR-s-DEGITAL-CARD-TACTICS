import React from "react"
import type {
  SemanticAbility,
  SemanticEffect,
  SemanticCondition,
} from "./types"

/* =========================================================
   Tone
========================================================= */
const TONE = {
  buff: "buff",
  debuff: "debuff",
  neutral: "neutral",
} as const

type Tone = (typeof TONE)[keyof typeof TONE]

type EffectLine = {
  segments: { text: string; tone?: Tone }[]
}

/* =========================================================
   Main Renderer
========================================================= */

export function renderAbilityJP(
  s: SemanticAbility,
  ctx?: {
    battleState?: any
    playerState?: any
    side?: "p1" | "p2"
  }
): React.ReactNode{
  const header = buildHeader(s)

  return (
    <>
      {header && (
        <div>
          <strong>{header}：</strong>
        </div>
      )}

      {s.effects.map((e, i) => {
        const line = effectLine(e, {
  ...ctx,
  ability: s
})

        return (
          <div key={i}>
            {line.segments.map((seg, j) => (
              <span
                key={j}
                style={seg.tone ? { color: toneColor(seg.tone) } : {}}
              >
                {seg.text}
              </span>
            ))}
          </div>
        )
      })}
    </>
  )
}

/* =========================================================
   Header
========================================================= */

function buildHeader(s: SemanticAbility): string {
  const trig = triggerShort(s.trigger)
  const cond = conditionShort(s.condition)
  const delay = delayShort((s as any).delay)
  const tick = tickShort((s as any).tick)

  const once = (s as any).once ? "（戦闘につき1回のみ）" : ""

  if (s.trigger === "onDeath") {
    if (cond === "味方死亡") return `味方死亡時${once}`
    if (cond === "敵死亡") return `敵死亡時${once}`
    return `死亡時${once}`
  }

  const parts: string[] = []

  if (delay) {
    parts.push(delay)
  } else if (tick) {
    parts.push(tick)
  }

  // 🔥 ここが重要
  if (trig && !delay && s.trigger !== "auraTick") {
    parts.push(trig)
  }

  if (cond) parts.push(cond)

  const base = parts.join(" ")

  return base + once
}

function delayShort(d?: any): string {
  if (!d) return ""
  if (d.type === "time" && typeof d.value === "number") {
    return `${d.value}秒後`
  }
  return ""
}

function tickShort(tick?: any): string {
  if (!tick) return ""
  if (tick.type === "everySeconds" && typeof tick.seconds === "number") {
    return `${tick.seconds}秒毎`
  }
  return ""
}

/* =========================================================
   Effect Dispatcher
========================================================= */

function effectLine(
  e: SemanticEffect,
  ctx?: {
    battleState?: any
    playerState?: any
    side?: "p1" | "p2"
    ability?: SemanticAbility
  }
): EffectLine {
  switch (e.kind) {
    case "stat_mod":
      return statModLine(e)

    case "add_state":
      return addStateLine(e)

    case "damage":
      return damageLine(e)

    case "damage_from_counter":
      return damageFromCounterLine(e)

    case "damage_split":
      return damageSplitLine(e)

    case "damage_percent":
      return damagePercentLine(e)

    case "heal":
      return healLine(e)

    case "summon":
      return summonLine(e)

    case "summon_limit":
      return summonLimitLine(e)

    case "mod_stat_from_counter":
      return modStatFromCounterLine(e)

    case "create_ancient_weapon":
      return createAncientWeaponLine(e)

    case "taunt_all":
  return tauntAllLine(e)

    case "self_damage":
      return {
        segments: [
          { text: "自傷" },
          { text: `${safeNumber(e.value)}`, tone: TONE.debuff },
        ],
      }

    case "set_attack_range":
      return setRangeLine(e)

    case "remove_state":
      return {
        segments: [
          { text: `${targetShort(e.target)}${stateShort(e.stateType)}解除` },
        ],
      }

    case "increment_counter":
  return incrementCounterLine(e, ctx)

    case "dig_relic":
      return digRelicLine(e)

    case "guard_adjacent":
      return guardAdjacentLine(e)

    case "destroy_equipment":
      return destroyEquipmentLine(e)
    
    default:
      return {
        segments: [{ text: "特殊" }],
      }
  }
}

/* =========================================================
   Effect Handlers
========================================================= */

function statModLine(
  e: Extract<SemanticEffect, { kind: "stat_mod" }>
): EffectLine {
  const dur = durationPrefix(e.duration)
  const tgt = targetShort(e.target)

  const value = safeNumber(e.value)
  const sign = value >= 0 ? "+" : "-"
  const abs = Math.abs(value)
  const tone: Tone = value >= 0 ? TONE.buff : TONE.debuff
  const stat = statShort(e.stat)

  if (e.stat === "attackSpeed") {
    return {
      segments: [
        { text: `${dur}${tgt}${stat}${sign}` },
        { text: `${Math.round(abs * 100)}%`, tone },
      ],
    }
  }

  return {
    segments: [
      { text: `${dur}${tgt}${stat}${sign}` },
      { text: `${abs}`, tone },
    ],
  }
}

function destroyEquipmentLine(
  e: Extract<SemanticEffect, { kind: "destroy_equipment" }>
): EffectLine {
  const tgt = targetShort(e.target)

  if (tgt === "自身 ") {
    return {
      segments: [{ text: "自身の装備を破壊する", tone: TONE.debuff }],
    }
  }

  if (tgt) {
    return {
      segments: [{ text: `${tgt}装備を破壊する`, tone: TONE.debuff }],
    }
  }

  return {
    segments: [{ text: "装備を破壊する", tone: TONE.debuff }],
  }
}

function damageLine(
  e: Extract<SemanticEffect, { kind: "damage" }>
): EffectLine {
  const dur = durationPrefix(e.duration)
  const tgt = targetShort(e.target)
  const value = safeNumber(e.value)
  const ignore = e.ignoreDR ? "（軽減無視）" : ""

  return {
    segments: [
      { text: `${dur}${tgt}` },
      { text: `${value}`, tone: TONE.debuff },
      { text: `ダメージ${ignore}` },
    ],
  }
}

function damageFromCounterLine(
  e: Extract<SemanticEffect, { kind: "damage_from_counter" }>
): EffectLine {
  const dur = durationPrefix(e.duration)
  const tgt = targetShort(e.target) || "敵ユニット全体 "
  const key = counterShort((e as any).key, (e as any).scope)
  const multi = safeNumber((e as any).multiplier)

  return {
    segments: [
      { text: `${dur}${tgt}` },
      { text: `${key}`, tone: TONE.debuff },
      { text: `×${multi}ダメージ` },
    ],
  }
}

function damageSplitLine(
  e: Extract<SemanticEffect, { kind: "damage_split" }>
): EffectLine {
  const dur = durationPrefix((e as any).duration)
  const tgt = targetShort((e as any).target)
  const value = safeNumber((e as any).value)
  const hits = safeNumber((e as any).hits ?? (e as any).count ?? 2)

  return {
    segments: [
      { text: `${dur}${tgt}` },
      { text: `${value}`, tone: TONE.debuff },
      { text: `ダメージを` },
      { text: `${hits}`, tone: TONE.debuff },
      { text: `回に分けて与える` },
    ],
  }
}

function tauntAllLine(
  _e: Extract<SemanticEffect, { kind: "taunt_all" }>
): EffectLine {
  return {
    segments: [
      { text: "すべての味方への攻撃を庇う", tone: TONE.debuff },
    ],
  }
}

function damagePercentLine(
  e: Extract<SemanticEffect, { kind: "damage_percent" }>
): EffectLine {
  const dur = durationPrefix((e as any).duration)
  const tgt = targetShort((e as any).target)
  const percentValue = safeNumber((e as any).value)
  const percent =
    percentValue <= 1 ? Math.round(percentValue * 100) : Math.round(percentValue)

  return {
    segments: [
      { text: `${dur}${tgt}` },
      { text: `${percent}%`, tone: TONE.debuff },
      { text: `ダメージ` },
    ],
  }
}

function healLine(
  e: Extract<SemanticEffect, { kind: "heal" }>
): EffectLine {
  const dur = durationPrefix(e.duration)
  const tgt = targetShort(e.target)

  if ((e as any).percent) {
    return {
      segments: [
        { text: `${dur}${tgt}` },
        {
          text: `${Math.round(safeNumber(e.value) * 100)}%`,
          tone: TONE.buff,
        },
        { text: `回復` },
      ],
    }
  }

  return {
    segments: [
      { text: `${dur}${tgt}` },
      { text: `${safeNumber(e.value)}`, tone: TONE.buff },
      { text: `回復` },
    ],
  }
}

function setRangeLine(
  e: Extract<SemanticEffect, { kind: "set_attack_range" }>
): EffectLine {
  const dur = durationPrefix(e.duration)
  const tgt = targetShort(e.target)

  return {
    segments: [{ text: `${dur}${tgt}射程${rangeValueShort(e.value)}` }],
  }
}

/* =========================================================
   add_state
========================================================= */

function addStateLine(
  e: Extract<SemanticEffect, { kind: "add_state" }>
): EffectLine {
  const dur = durationPrefix(e.duration)
  const tgt = targetShort(e.target)
  const value = typeof e.value === "number" ? e.value : 0

  if (e.consumeOn) {
    const special = consumeMeaning(e.stateType, e.consumeOn, value, dur, tgt)
    if (special) return special
  }

  const state = stateShort(e.stateType)

  const percentStates = new Set([
    "as_stack",
    "damage_taken_amp",
  ])

  let stack = ""

  if (typeof e.value === "number") {
    if (percentStates.has(e.stateType ?? "")) {
      if (e.value >= 0) {
        stack = `+${Math.round(e.value * 100)}%`
      } else {
        stack = `${Math.round(e.value * 100)}%`
      }
    } else {
      if (e.value >= 0) {
        stack = `+${e.value}`
      } else {
        stack = `${e.value}`
      }
    }
  }

  const cap = stackCapShort(e.maxStack, e.maxTotalValue, (e as any).maxTriggers)

  return {
    segments: [
      { text: `${dur}${tgt}${state}` },
      ...(stack ? [{ text: stack, tone: stateTone(e.stateType) }] : []),
      ...(cap ? [{ text: cap }] : []),
    ],
  }
}

function consumeMeaning(
  stateType: string | undefined,
  consumeOn: string,
  value: number,
  dur: string,
  tgt: string
): EffectLine | null {
  if (stateType === "damage_reduce" && consumeOn === "onDamageTaken") {
    return {
      segments: [
        { text: `${dur}${tgt}戦闘中一度だけ受けるダメージを` },
        { text: `${value}`, tone: TONE.buff },
        { text: "軽減する" },
      ],
    }
  }

  if (stateType === "lethal_immunity" && consumeOn === "onDamageTaken") {
    return {
      segments: [
        { text: `${dur}${tgt}戦闘中一度だけ致死ダメージを無効化する` },
      ],
    }
  }

  if (stateType === "ignore_dr_next_attack" && consumeOn === "onAttack") {
    return {
      segments: [
        { text: `${dur}${tgt}次の攻撃はダメージ軽減を無視する` },
      ],
    }
  }

  if (stateType === "first_attack_boost" && consumeOn === "onAttack") {
    return {
      segments: [
        { text: `${dur}${tgt}次の攻撃のダメージを` },
        { text: `${value}`, tone: TONE.buff },
        { text: "増加させる" },
      ],
    }
  }

  if (stateType === "duel" && consumeOn === "onAttack") {
    return {
      segments: [
        { text: `${dur}${tgt}次の攻撃で対象に` },
        { text: `${value}`, tone: TONE.buff },
        { text: "追加ダメージ" },
      ],
    }
  }

  if (consumeOn === "onKill") {
    return {
      segments: [{ text: `${dur}${tgt}撃破すると効果は終了する` }],
    }
  }

  if (consumeOn === "onDeath") {
    return {
      segments: [{ text: `${dur}${tgt}死亡すると効果は終了する` }],
    }
  }

  if (consumeOn === "onDamageTaken") {
    return {
      segments: [{ text: `${dur}${tgt}被ダメージ時に効果は終了する` }],
    }
  }

  if (consumeOn === "onAttack") {
    return {
      segments: [{ text: `${dur}${tgt}攻撃時に効果は終了する` }],
    }
  }

  return null
}

/* =========================================================
   Extra Effect Handlers
========================================================= */

function summonLine(
  e: Extract<SemanticEffect, { kind: "summon" }>
): EffectLine {
  const tgt = targetShort((e as any).target)

  if ((e as any).unitId === "varkesh_ghoul_token") {
    return {
      segments: [{ text: `${tgt}グールを召喚する`, tone: TONE.buff }],
    }
  }

  return {
    segments: [{ text: `${tgt}ユニットを召喚する`, tone: TONE.buff }],
  }
}

function summonLimitLine(
  e: Extract<SemanticEffect, { kind: "summon_limit" }>
): EffectLine {
  const value = safeNumber((e as any).value ?? (e as any).limit ?? 1)

  return {
    segments: [
      { text: `召喚数上限` },
      { text: `${value}`, tone: TONE.neutral },
    ],
  }
}

function modStatFromCounterLine(
  e: Extract<SemanticEffect, { kind: "mod_stat_from_counter" }>
): EffectLine {

  const tgt = targetShort((e as any).target)
  const stat = statShort((e as any).stat)
  const key = counterShort((e as any).key, (e as any).scope)
  const multi = safeNumber((e as any).multiplier)

  return {
    segments: [
      { text: `${tgt}${stat}+` },
      { text: `${key}`, tone: TONE.buff },
      { text: `×${multi}` }
    ],
  }
}
function createAncientWeaponLine(
  _e: Extract<SemanticEffect, { kind: "create_ancient_weapon" }>
): EffectLine {
  return {
    segments: [{ text: "古代兵器を創造する", tone: TONE.buff }],
  }
}

function chainAttackLine(
  e: Extract<SemanticEffect, { kind: "chain_attack" }>
): EffectLine {
  const count = safeNumber((e as any).count ?? (e as any).value ?? 1)
  const tgt = targetShort((e as any).target)

  return {
    segments: [
      { text: `${tgt}` },
      { text: `${count}`, tone: TONE.buff },
      { text: `回連続で攻撃する` },
    ],
  }
}

function critLine(
  e: Extract<SemanticEffect, { kind: "crit" }>
): EffectLine {
  const chanceRaw = safeNumber((e as any).chance ?? (e as any).value)
  const multiRaw = safeNumber((e as any).multiplier ?? (e as any).critMultiplier)

  const chance =
    chanceRaw <= 1 ? Math.round(chanceRaw * 100) : Math.round(chanceRaw)

  return {
    segments: [
      { text: `クリティカル率` },
      { text: `${chance}%`, tone: TONE.buff },
      ...(multiRaw
        ? [
            { text: `、クリティカルダメージ` },
            { text: `×${multiRaw}`, tone: TONE.buff as Tone },
          ]
        : []),
    ],
  }
}

/* =========================================================
   Helpers
========================================================= */

function guardAdjacentLine(
  e: Extract<SemanticEffect, { kind: "guard_adjacent" }>
): EffectLine {
  const dur = durationPrefix(e.duration)
  const tgt = targetShort(e.target)

  if (tgt) {
    return {
      segments: [{ text: `${dur}${tgt}は同じ列の味方を庇う` }],
    }
  }

  return {
    segments: [{ text: `${dur}同じ列の味方を庇う` }],
  }
}

function counterShort(key?: string, scope?: string): string {
  const map: Record<string, string> = {
    teamSelfDamage: "自傷回数",
    dig: "探求",
    teamCurseApplied: "呪印付与数",
    teamOnDeathTriggerCount: "味方死亡数",
    swiftVolley: "連射カウント",
    corpseCount: "死体数",
    equipmentDestroyed: "装備破壊数",
    equipmentForged: "装備数",
    selfDamage: "自傷回数",
    selfEquip: "装備カウント"
  }

  return map[key ?? ""] ?? key ?? "?"

}

function safeNumber(v: unknown): number {
  return typeof v === "number" ? v : 0
}

function toneColor(t: Tone): string {
  if (t === TONE.buff) return "#33d17a"
  if (t === TONE.debuff) return "#ff4d4f"
  return "#d0d0d0"
}

function durationPrefix(d?: any): string {
  if (!d) return ""
  if (d.type === "time" && typeof d.value === "number") {
    return `${d.value}秒間 `
  }
  return ""
}

function triggerShort(t?: string): string {
  const map: Record<string, string> = {
    battleStart: "戦闘開始時",
    onAttack: "攻撃時",
    onKill: "撃破時",
    onDeath: "死亡時",
    onEquip: "装備時",
    onDamageTaken: "被ダメージ時",
    onSelfDamage: "自傷時",
    onAllRolesAbsorbed: "全ロール吸収時",
    onAbsorb_tank: "タンク吸収",
    onAbsorb_bruiser: "ブルーザー吸収",
    onAbsorb_skirmisher: "スカーミッシャー吸収",
    onAbsorb_ranged: "レンジ吸収",
    onAbsorb_support: "サポート吸収",
    auraTick: "一定時間毎",
    firstDeath: "最初の死亡時",
  }
  return map[t ?? ""] ?? ""
}

/* =========================================================
   Condition
========================================================= */

function conditionShort(
  c?: SemanticCondition | string
): string {
  if (!c) return ""

  if (typeof c === "string") {
    const map: Record<string, string> = {
      hasFrontAlly: "前列に味方がいる",
      hasBackAlly: "後列に味方がいる",
      isFront: "前列",
      isBack: "後列",
      deadAlly: "味方死亡",
      deadEnemy: "敵死亡",
    }

    return map[c] ?? ""
  }

  if ((c as any).type === "counter") {
    const key = counterShort((c as any).key)
    const min = (c as any).min ?? 0
    return `${key}が${min}以上だった場合`
  }

  if ((c as any).type === "unitCost") {
    return `コスト${(c as any).value}の場合`
  }

  if ((c as any).type === "forgeEquipCount") {
    return `装備数が${(c as any).value}以上だった場合`
  }

  switch ((c as any).kind) {
    case "dead_ally":
      return "味方死亡"

    case "dead_enemy":
      return "敵死亡"

    case "self_hp_below":
      return `HP${Math.round((c as any).percent * 100)}%未満`

    case "target_hp_below":
      return `対象HP${Math.round((c as any).percent * 100)}%未満`

    case "ally_hp_below":
      return `味方HP${Math.round((c as any).percent * 100)}%未満`

    case "enemy_has_curse":
      return `敵呪印${(c as any).value}+`

    case "target_has_curse":
      return `対象呪印${(c as any).value}+`

    case "dead_role_is":
      return `味方${(c as any).role}死亡`

    case "has_front_ally":
      return "前列に味方がいる"

    case "has_back_ally":
      return "後列に味方がいる"

    case "is_front":
      return "前列"

    case "is_back":
      return "後列"

    case "ally_cross_below":
      return `味方HPが${Math.round((c as any).percent * 100)}%未満になった時`

    case "counter_at_least": {
      const key = counterShort((c as any).key)
      return `${key}${(c as any).min}以上`
    }

    case "has_absorbed_all_roles":
      return "全ロール吸収"

    case "equip_count_at_least":
      return `装備数${(c as any).value}以上`

    default:
      return ""
  }
}

/* =========================================================
   Target
========================================================= */

function targetShort(t?: string): string {
  if (!t) return ""

  if (t.startsWith("type:")) {
    const role = t.split(":")[1] ?? ""
    const roleMap: Record<string, string> = {
      tank: "タンク",
      bruiser: "ブルーザー",
      skirmisher: "スカーミッシャー",
      ranged: "レンジ",
      support: "サポート",
    }
    return `${roleMap[role] ?? role}味方 `
  }

  const map: Record<string, string> = {
    self: "自身 ",
    target: "対象 ",
    all_allies: "味方全体 ",
    all_enemies: "敵全体 ",
    front_allies: "前列の味方 ",
    back_allies: "後列の味方 ",
    random_enemy: "ランダムな敵 ",
    random_ally: "ランダムな味方 ",
    lowest_hp_ally: "HPが最も低い味方 ",
    highest_hp_enemy: "HPが最も高い敵 ",
    highest_atk_ally: "最もATKが高い味方 ",
    highest_hp_ally: "最もHPが高い味方 ",
    all_other_allies: "他の味方全体 ",
    allies_below_hp_percent: "HP以下の味方 ",
    lowest_as_ally: "最もASの低い味方 ",
    highest_range_ally: "最も射程の長い味方 ",
    equipped_allies: "装備状態の味方全て ",
    enemy_column: "対象と同列の敵 ",
    adjacent_enemies: "対象の周囲の敵 ",
    equipped_enemy: "装備中の敵 ",
  }

  return map[t] ?? ""
}

function statShort(stat?: string): string {
  const map: Record<string, string> = {
    atk: "ATK",
    hp: "HP",
    attackSpeed: "AS",
    damageReduce: "ダメージ軽減",
    attackRange: "射程",
  }
  return map[stat ?? ""] ?? (stat ?? "")
}

function stateShort(type?: string): string {
  const map: Record<string, string> = {
    curse_stack: "呪印",
    stun: "スタン",
    damage_amp: "被ダメージ",
    damage_reduce: "ダメージ軽減",
    duel: "決闘",
    as_stack: "AS",
    first_attack_boost: "初撃",
    ignore_dr_next_attack: "次攻撃ダメージ軽減無視",
    lethal_immunity: "致死無効",
    atk: "攻撃",
    hp: "体力",
    absorbed_tank: "タンク吸収",
    absorbed_bruiser: "ブルーザー吸収",
    absorbed_skirmisher: "スカーミッシャー吸収",
    absorbed_ranged: "レンジ吸収",
    absorbed_support: "サポート吸収",
  }
  return map[type ?? ""] ?? (type ?? "")
}

function stateTone(type?: string): Tone {
  const debuff = new Set([
    "curse_stack",
    "stun",
    "damage_taken_amp",
  ])

  const buff = new Set([
    "damage_reduce",
    "as_stack",
    "first_attack_boost",
    "ignore_dr_next_attack",
    "lethal_immunity",
    "atk",
    "hp",
  ])

  if (!type) return TONE.neutral
  if (debuff.has(type)) return TONE.debuff
  if (buff.has(type)) return TONE.buff
  return TONE.neutral
}

function rangeValueShort(v: number | "next"): string {
  if (v === "next") return "+1"
  return `=${v}`
}

function stackCapShort(
  maxStack?: number,
  maxTotalValue?: number,
  maxTrigger?: number
): string {
  const parts: string[] = []

  if (typeof maxStack === "number") {
  parts.push(`最大${maxStack}スタック`)
}

if (typeof maxTotalValue === "number" && !maxStack) {
  parts.push(`最大${Math.round(maxTotalValue * 100)}%`)
}

  if (typeof maxTrigger === "number") {
    parts.push(`最大${maxTrigger}回まで`)
  }

  if (parts.length === 0) return ""

  return `（${parts.join("／")}）`
}

function consumeShort(c?: string): string {
  if (!c) return ""

  const map: Record<string, string> = {
    onAttack: "［攻撃で消費］",
    onDamageTaken: "［被ダメージで消費］",
    onKill: "［撃破で消費］",
    onDeath: "［死亡で消費］",
  }

  return map[c] ?? "［消費］"
}

function incrementCounterLine(
  e: Extract<SemanticEffect, { kind: "increment_counter" }>,
  ctx?: {
    battleState?: any
    playerState?: any
    side?: "p1" | "p2"
    ability?: any // ← 呼び出し側で渡す
  }
): EffectLine {

  const keyRaw = (e as any).key
  const scope = (e as any).scope ?? "match"
  const key = counterShort(keyRaw, scope)
  const value = (e as any).value ?? 1

  const side = ctx?.side ?? "p1"

  let current = 0

  if (scope === "battle") {
    current = ctx?.battleState?.counters?.[side]?.[keyRaw] ?? 0
  }

  if (scope === "match") {
    current = ctx?.playerState?.counters?.match?.[keyRaw] ?? 0
  }

  if (scope === "turn") {
    current = ctx?.playerState?.counters?.turn?.[keyRaw] ?? 0
  }

  /* =========================
     👇 ここが今回の核心
  ========================= */

  const isPerUnit =
    ctx?.ability?.scope === "team" &&
    ctx?.ability?.trigger === "battleStart" &&
    e.kind === "increment_counter" &&
    value === 1 // ← 事故防止（+2とかに誤適用されない）

  return {
    segments: [
      ...(isPerUnit ? [{ text: "味方1体につき " }] : []),
      { text: `${key}` },
      { text: `+${value}`, tone: TONE.buff },
    ],
  }
}

function digRelicLine(
  _e: Extract<SemanticEffect, { kind: "dig_relic" }>
): EffectLine {
  return {
    segments: [{ text: "レリックを発掘する", tone: TONE.buff }],
  }
}