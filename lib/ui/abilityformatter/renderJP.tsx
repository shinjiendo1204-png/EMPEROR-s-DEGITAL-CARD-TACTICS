import React from "react"
import type {
  SemanticAbility,
  SemanticEffect,
  SemanticCondition,
} from "./types"
import { Ability } from "@/types"

/* =========================================================
   Tone
========================================================= */
const TONE = {
  buff: "buff",
  debuff: "debuff",
  neutral: "neutral",
} as const

function groupAbilities(abilities: SemanticAbility[]) {
  const map = new Map<string, SemanticAbility[]>()

  for (const a of abilities) {
    const key = `${a.trigger ?? ""}|${JSON.stringify(a.condition ?? {})}`

    if (!map.has(key)) {
      map.set(key, [])
    }

    map.get(key)!.push(a)
  }

  return Array.from(map.entries()).map(([_, group]) => group)
}
type Tone = (typeof TONE)[keyof typeof TONE]

type EffectLine = {
  trigger?: string
  condition?: string
  target?: string
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
): React.ReactNode {

  const groups = groupAbilities([s])

  return (
    <>
      {groups.map((group, gi) => {
        const first = group[0]
        const effects = group.flatMap(g => g.effects ?? [])

        const groupedByTarget = new Map<string, SemanticEffect[]>()

          for (const e of effects) {
            const scope = (e as any).scope ?? "none"
            const t = `${(e as any).target ?? "__no_target__"}|${scope}`

            if (!groupedByTarget.has(t)) {
              groupedByTarget.set(t, [])
            }
            groupedByTarget.get(t)!.push(e)
          }

        return (
          <div key={gi} style={{ marginBottom: 6 }}>

            {/* 🔷 Trigger / Condition */}
            <div style={{ display: "flex", gap: 6, marginBottom: 2 }}>
              {first.trigger && (
                <span className="tag trigger">
                  {buildHeader(first)}
                </span>
              )}
            </div>

            {/* 🔻 Effects（targetごとにまとめる） */}
            {Array.from(groupedByTarget.entries()).map(([targetKey, effects], i) => {

  // ★ 追加：stat統合
  const merged: SemanticEffect[] = []
const used = new Set<number>()

const hasDestroy = effects.some(e => e.kind === "destroy_equipment")
const hasCreate = effects.some(e => e.kind === "create_ancient_weapon")

// 🔥 comboを最初に処理
if (hasDestroy && hasCreate) {
  merged.push({
    kind: "forge_ancient_combo",
  } as any)

  // ★ destroy / create を完全に除外
  effects.forEach((e, idx) => {
    if (
      e.kind === "destroy_equipment" ||
      e.kind === "create_ancient_weapon"
    ) {
      used.add(idx)
    }
  })
}

for (let i2 = 0; i2 < effects.length; i2++) {
  if (used.has(i2)) continue

  const e = effects[i2]

  // 🔥 これ追加（保険）
  if (
    hasDestroy &&
    hasCreate &&
    (e.kind === "destroy_equipment" ||
     e.kind === "create_ancient_weapon")
  ) {
    continue
  }

  if (e.kind === "mod_stat_from_counter") {
    const group = [e]
    used.add(i2)

    for (let j = i2 + 1; j < effects.length; j++) {
      const e2 = effects[j]

      if (
        e2.kind === "mod_stat_from_counter" &&
        e2.key === e.key &&
        e2.multiplier === e.multiplier &&
        e2.target === e.target &&
        e2.scope === e.scope
      ) {
        group.push(e2)
        used.add(j)
      }
    }

    if (group.length > 1) {
      merged.push({
        ...e,
        stat: group.map(g => g.stat).join("+"),
      } as any)
    } else {
      merged.push(e)
    }

  } else {
    merged.push(e)
    used.add(i2)
  }
}
  const firstLine = effectLine(merged[0], { ...ctx, ability: first })

  return (
    <div key={i} style={{ display: "flex", gap: 6 }}>

      {/* 🎯 Target */}
      {firstLine.target && (
        <span className="tag target">
          {firstLine.target}
        </span>
      )}

      {/* 📄 Effectまとめ */}
      <span>
        {merged.map((e, j) => {
          const line = effectLine(e, { ...ctx, ability: first })

          return (
            <span key={j}>
              {j > 0 && "、 "}
              {line.segments.map((seg, k) => (
                <span
                  key={k}
                  style={
                    seg.tone ? { color: toneColor(seg.tone) } : {}
                  }
                >
                  {seg.text}
                </span>
              ))}
            </span>
          )
        })}
      </span>

    </div>
  )
})}
          </div>
        )
      })}
    </>
  )
}
export function renderAbilitiesJPFromRaw(
  abilities: Ability[],
  ctx?: any
): React.ReactNode {

  const semanticAbilities = abilities.map(convertAbility)
  const groups = groupAbilities(semanticAbilities)

  return (
    <>
      {groups.map((group, gi) => {
        const first = group[0]
        const effects = group.flatMap(g => g.effects ?? [])

        // 🎯 targetごとにまとめる
        const groupedByTarget = new Map<string, SemanticEffect[]>()

        for (const e of effects) {
          const scope = (e as any).scope ?? "none"
          const t = `${(e as any).target ?? "__no_target__"}|${scope}`

          if (!groupedByTarget.has(t)) {
            groupedByTarget.set(t, [])
          }
          groupedByTarget.get(t)!.push(e)
        }

        return (
          <div key={gi} style={{ marginBottom: 6 }}>

            {/* 🔷 Trigger / Condition */}
            <div style={{ display: "flex", gap: 6, marginBottom: 2 }}>
              {first.trigger && (
                <span className="tag trigger">
                  {triggerShort(first.trigger, first)}
                </span>
              )}
              {first.condition && (
                <span className="tag condition">
                  {conditionShort(first.condition)}
                </span>
              )}
            </div>

            {/* 🔻 Effects（統合版） */}
            {Array.from(groupedByTarget.entries()).map(([targetKey, effects], i) => {

              // ★ stat統合
              const merged: SemanticEffect[] = []
              const used = new Set<number>()

              for (let i2 = 0; i2 < effects.length; i2++) {
                if (used.has(i2)) continue

                const e = effects[i2]

                if (e.kind === "mod_stat_from_counter") {
                  const group = [e]
                  used.add(i2)

                  for (let j = i2 + 1; j < effects.length; j++) {
                    const e2 = effects[j]

                    if (
                      e2.kind === "mod_stat_from_counter" &&
                      e2.key === e.key &&
                      e2.multiplier === e.multiplier &&
                      e2.target === e.target
                    ) {
                      group.push(e2)
                      used.add(j)
                    }
                  }

                  if (group.length > 1) {
                    merged.push({
                      ...e,
                      stat: group.map(g => g.stat).join("+"),
                    } as any)
                  } else {
                    merged.push(e)
                  }

                } else {
                  merged.push(e)
                  used.add(i2)
                }
              }

              const firstLine = effectLine(merged[0], { ...ctx, ability: first })

              return (
                <div key={i} style={{ display: "flex", gap: 6 }}>

                  {/* 🎯 Target */}
                  {firstLine.target && (
                    <span className="tag target">
                      {firstLine.target}
                    </span>
                  )}

                  {/* 📄 Effectまとめ */}
                  <span>
                    {merged.map((e, j) => {
                      const line = effectLine(e, { ...ctx, ability: first })

                      return (
                        <span key={j}>
                          {j > 0 && "、 "}
                          {line.segments.map((seg, k) => (
                            <span
                              key={k}
                              style={
                                seg.tone ? { color: toneColor(seg.tone) } : {}
                              }
                            >
                              {seg.text}
                            </span>
                          ))}
                        </span>
                      )
                    })}
                  </span>

                </div>
              )
            })}
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
  const trig = triggerShort(s.trigger, s)
  const cond = conditionShort(s.condition)
  const delay = delayShort((s as any).delay)
  const tick = tickShort((s as any).tick)
  const once = (s as any).once ? "（戦闘中1回）" : ""

  // 死亡系（ENロジック維持しつつ日本語）
  if (s.trigger === "onDeath") {
    if (cond.includes("味方")) return `${cond}${once}`
    if (cond.includes("敵")) return `${cond}${once}`
    return `死亡時${once}`
  }

  const parts: string[] = []

  // ENと同じ順序（重要）
  if (delay) parts.push(delay)
  if (tick) parts.push(tick)
  if (trig && s.trigger !== "auraTick") parts.push(trig)
  if (cond) parts.push(cond)

  return parts.join(" ") + once
}
function delayShort(d?: any): string {
  if (!d) return ""
  if (d.type === "time") return `${d.value}秒後`
  return ""
}

function tickShort(t?: any): string {
  if (!t) return ""
  if (t.type === "everySeconds") return `${t.seconds}秒毎`
  return ""
}
function convertEffect(e: any): SemanticEffect {
  switch (e.type) {

    /* =========================
       ステータス
    ========================= */

    case "MOD_STAT":
      return {
        kind: "stat_mod",
        stat: e.stat,
        value: e.value,
        target: e.target,
        duration: e.duration,
      }

      case "DAMAGE_FROM_COUNTER":
      return {
        kind: "damage_from_counter",
        key: e.key,
        multiplier: e.multiplier,
        target: e.target,
        scope: (e as any).scope,
      }

      case "MOD_STAT_FROM_COUNTER":
      return {
        kind: "mod_stat_from_counter",
        stat: e.stat,
        key: e.key,
        multiplier: e.ratio ?? e.multiplier,
        target: e.target,
        maxStack: e.maxStack,
        scope: (e as any).scope,
      }

    case "SET_ATTACK_RANGE":
      return {
        kind: "set_attack_range",
        value: e.value,
        target: e.target,
      }
    
      case "CREATE_ANCIENT_WEAPON":
  return {
    kind: "create_ancient_weapon",
  }

    case "HEAL_PERCENT":
      return {
        kind: "heal",
        value: e.value,
        target: e.target,
        percent: true, 
      }
    /* =========================
       回復 / ダメージ
    ========================= */

    case "HEAL":
      return {
        kind: "heal",
        value: e.value,
        target: e.target,
      }
    case "DAMAGE":
      return {
        kind: "damage",
        value: e.value,
        target: e.target,
        ignoreDR: e.ignoreDR,
      }

    case "DAMAGE_PERCENT":
      return {
        kind: "damage_percent",
        value: e.value,
        target: e.target,
      }

    case "SELF_DAMAGE":
      return {
        kind: "self_damage",
        value: e.value,
      }


    /* =========================
       状態異常
    ========================= */

    case "ADD_STATE":
      return {
        kind: "add_state",
        stateType: e.stateType,
        value: e.value,
        target: e.target,
        duration: e.duration,
        maxStack: e.maxStack,
        consumeOn: e.consumeOn,
        maxTotalValue: e.maxtotalValue
      }

    /* =========================
       カウンター
    ========================= */

    case "INCREMENT_COUNTER":
      return {
        kind: "increment_counter",
        key: e.key,
        value: e.value,
        scope: e.scope,
      }

    case "DIG_RELIC":
  return {
    kind: "dig_relic",
  }

    /* =========================
       特殊
    ========================= */

    case "SUMMON":
      return {
        kind: "summon",
        unitId: e.unitId,
        count: e.count ?? 1,
        
      }

    case "DESTROY_EQUIPMENT":
      return {
        kind: "destroy_equipment",
        target: e.target,
      }

    case "GUARD_ADJACENT":
      return {
        kind: "guard_adjacent",
        target: e.target,
      }

    /* =========================
       fallback
    ========================= */

    default:
      console.log("UNSUPPORTED EFFECT:", e)
      return {
        kind: "unknown",
        raw: e,
      } as any
  }
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

  let base: EffectLine

  switch (e.kind) {
    case "stat_mod":
      base = statModLine(e)
      break

case "add_state":
      base = addStateLine(e)
      break

  break
    case "damage":
      base = damageLine(e)
      break

    case "damage_from_counter":
      base = damageFromCounterLine(e)
      break

    case "damage_split":
      base = damageSplitLine(e)
      break

    case "damage_percent":
      base = damagePercentLine(e)
      break

    case "heal":
      base = healLine(e)
      break

    case "summon":
      base = summonLine(e)
      break

    case "summon_limit":
      base = summonLimitLine(e)
      break

    case "mod_stat_from_counter":
      base = modStatFromCounterLine(e)
      break

    case "create_ancient_weapon":
      base = createAncientWeaponLine(e)
      break

    case "taunt_all":
      base = tauntAllLine(e)
      break

    case "self_damage":
      base = {
        target: targetShort("self"),
        segments: [
          { text: "" },
          { text: `${safeNumber(e.value)}`, tone: TONE.debuff },
          { text: "自傷ダメージ" },
        ],
      }
      break

    case "forge_ancient_combo":
      base = {
        segments: [
          { text:"古代兵器を一つ生成する", tone: TONE.buff },
          { text: "（最大3回まで）", tone: TONE.neutral }
        ],
      }
      break

    case "set_attack_range":
      base = {
        target: targetShort(e.target),
        segments: [
          { text: `射程を+1する` },
        ],
      }
      break

    case "remove_state":
      base = {
        target: targetShort(e.target),
        segments: [
          { text: `${stateShort(e.stateType)}を解除`, tone: stateTone(e.stateType) },
        ],
      }
      break

    case "increment_counter":
      base = incrementCounterLine(e, ctx)
      break

    case "dig_relic":
      base = {
        segments: [
          { text: "遺物を発掘する", tone: TONE.buff },
        ],
      }
      break

    case "guard_adjacent":
      base = guardAdjacentLine(e)
      break

    case "destroy_equipment":
      base = destroyEquipmentLine(e)
      break

    default:
      base = {
        segments: [{ text: "特殊効果" }],
      }
  }

  return {
    ...base,
    trigger: triggerShort(ctx?.ability?.trigger),
    condition: conditionShort(ctx?.ability?.condition),
  }
}

function addStateLine(
  e: Extract<SemanticEffect, { kind: "add_state" }>
): EffectLine {
  const tgt = targetShort(e.target)

  const state = stateShort(e.stateType)
  const tone = stateTone(e.stateType)

  const percentStates = new Set([
    "as_stack",
    "damage_taken_amp",
  ])

  let valueText = ""

  if (typeof e.value === "number") {
    if (percentStates.has(e.stateType ?? "")) {
      const percent = Math.round(e.value * 100)
      valueText = e.value >= 0 ? `+${percent}%` : `${percent}%`
    } else {
      valueText = e.value >= 0 ? `+${e.value}` : `${e.value}`
    }
  }

  const duration =
    e.duration?.type === "time"
      ? ` ${e.duration.value}秒間`
      : ""

  const cap = stackCapShort(
    e.maxStack,
    e.maxTotalValue,
    (e as any).maxTriggers
  )

  const consume = (e as any).consumeOn
    ? consumeMeaning(e.stateType, (e as any).consumeOn, e.value ?? 0, duration, tgt)
    : null

  if (consume) return consume

  return {
  target: tgt,
  segments: [
    ...(valueText
      ? [{ text: `${state}${valueText}`, tone }] 
      : [{ text: `${state}`, tone }]),

    ...(duration ? [{ text: duration }] : []),
    ...(cap ? [{ text: ` ${cap}` }] : []),
  ],
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
  const percent = Math.round(abs * 100)

  return {
    target: tgt,
    segments: [
      ...(dur ? [{ text: `${dur}` }] : []),
      { text: `${stat}` },                      // ← 先にAS
      { text: `${sign}${percent}%`, tone },     // ← 後に+10%
    ],
  }
}
  return {
    target: tgt,
    segments: [
      ...(dur ? [{ text: `${dur}` }] : []),
      { text: `${stat} ${sign}` },
      { text: `${abs}`, tone },
    ],
  }
}

function destroyEquipmentLine(
  e: Extract<SemanticEffect, { kind: "destroy_equipment" }>
): EffectLine {
  const tgt = targetShort(e.target)

  if (tgt === "Self") {
    return {
      target: tgt,
      segments: [{ text: "装備を破壊する", tone: TONE.debuff }],
    }
  }

  if (tgt) {
    return {
      target: tgt,
      segments: [{ text: "装備を破壊する", tone: TONE.debuff }],
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
  return {
    target: tgt,
    segments: [
      ...(dur ? [{ text: dur }] : []),
      { text: "" },
      { text: `${e.value}`, tone: TONE.debuff },
      { text: "ダメージ" + (e.ignoreDR ? "（軽減無視）" : "") },
    ],
  }
}
function damageFromCounterLine(
  e: Extract<SemanticEffect, { kind: "damage_from_counter" }>
): EffectLine {
  const dur = durationPrefix(e.duration)
  const tgt = targetShort(e.target) || "敵全体"
  const key = counterShort((e as any).key, e.scope)
  const multi = safeNumber((e as any).multiplier)

  return {
    target: tgt,
    segments: [
      ...(dur ? [{ text: dur }] : []),
      { text: "" },
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
    target: tgt,
    segments: [
      ...(dur ? [{ text: dur }] : []),
      { text: "" },
      { text: `${e.value}`, tone: TONE.debuff },
      { text: `ダメージを${hits}回に分けて与える` },
    ],
  }
}

function tauntAllLine(
  _e: Extract<SemanticEffect, { kind: "taunt_all" }>
): EffectLine {
  return {
    target: "Self",
    segments: [
      { text: "全ての味方を庇う", tone: TONE.buff },
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
    target: tgt,
    segments: [
      ...(dur ? [{ text: `${dur}` }] : []),
      { text: "" },
      { text: `${percent}%`, tone: TONE.debuff },
      { text: " ダメージを" },
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
      target: tgt,
      segments: [
        ...(dur ? [{ text: `${dur}` }] : []),
        { text: "HEAL " },
        {
          text: `${Math.round(safeNumber(e.value) * 100)}%`,
          tone: TONE.buff,
        },
        { text: " HP" },
      ],
    }
  }

  return {
    target: tgt,
    segments: [
      ...(dur ? [{ text: `${dur}` }] : []),
      { text: "HEAL " },
      { text: `${safeNumber(e.value)}`, tone: TONE.buff },
      { text: " HP" },
    ],
  }
}

function setRangeLine(
  e: Extract<SemanticEffect, { kind: "set_attack_range" }>
): EffectLine {
  const dur = durationPrefix(e.duration)
  const tgt = targetShort(e.target)

  return {
    target: tgt,
    segments: [
      ...(dur ? [{ text: `${dur}` }] : []),
      { text: `射程+ ${rangeValueShort(e.value)}` },
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
      target: tgt,
      segments: [
        ...(dur ? [{ text: dur }] : []),
        { text: "次に受けるダメージを" },
        { text: `${value}`, tone: TONE.buff },
        { text: "軽減（この戦闘中1回）" },
      ],
    }
  }

  if (stateType === "lethal_immunity" && consumeOn === "onDamageTaken") {
    return {
      target: tgt,
      segments: [
        ...(dur ? [{ text: dur }] : []),
        { text: "致死ダメージを無効化（この戦闘中1回）", tone: TONE.buff },
      ],
    }
  }

  if (stateType === "ignore_dr_next_attack" && consumeOn === "onAttack") {
    return {
      target: tgt,
      segments: [
        ...(dur ? [{ text: dur }] : []),
        { text: "次の攻撃はダメージ軽減を無視", tone: TONE.buff },
      ],
    }
  }

  if (stateType === "first_attack_boost" && consumeOn === "onAttack") {
    return {
      target: tgt,
      segments: [
        ...(dur ? [{ text: dur }] : []),
        { text: "次の攻撃ダメージ+" },
        { text: `${value}`, tone: TONE.buff },
      ],
    }
  }

  if (stateType === "duel" && consumeOn === "onAttack") {
    return {
      target: tgt,
      segments: [
        ...(dur ? [{ text: dur }] : []),
        { text: "次の攻撃で追加ダメージ+" },
        { text: `${value}`, tone: TONE.buff },
      ],
    }
  }

  if (consumeOn === "onKill") {
    return {
      target: tgt,
      segments: [
        ...(dur ? [{ text: dur }] : []),
        { text: "撃破で効果終了" },
      ],
    }
  }

  if (consumeOn === "onDeath") {
    return {
      target: tgt,
      segments: [
        ...(dur ? [{ text: dur }] : []),
        { text: "死亡時に効果終了" },
      ],
    }
  }

  if (consumeOn === "onDamageTaken") {
    return {
      target: tgt,
      segments: [
        ...(dur ? [{ text: dur }] : []),
        { text: "被ダメージで効果終了" },
      ],
    }
  }

  if (consumeOn === "onAttack") {
    return {
      target: tgt,
      segments: [
        ...(dur ? [{ text: dur }] : []),
        { text: "攻撃時に効果終了" },
      ],
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
  const tgt = targetShort(e.target)

  if ((e as any).unitId === "varkesh_ghoul_token") {
    return {
      target: tgt,
      segments: [{ text: "グールを召喚する", tone: TONE.buff }],
    }
  }

  return {
    target: tgt,
    segments: [{ text: "ユニットを召喚する", tone: TONE.buff }],
  }
}

function summonLimitLine(
  e: Extract<SemanticEffect, { kind: "summon_limit" }>
): EffectLine {
  const value = safeNumber((e as any).value ?? (e as any).limit ?? 1)

  return {
    segments: [
      { text: "召喚上限 " },
      { text: `${value}`, tone: TONE.neutral },
    ],
  }
}

function modStatFromCounterLine(
  e: Extract<SemanticEffect, { kind: "mod_stat_from_counter" }>
): EffectLine {
  const tgt = targetShort(e.target)
  const key = counterShort(e.key, (e as any).scope)
  const multi = safeNumber(e.multiplier)
  const statRaw = e.stat

  const stat =
    typeof statRaw === "string" && statRaw.includes("+")
      ? statRaw.split("+").map(statShort).join("・")
      : statShort(statRaw)

  const isNegative = multi < 0
  const abs = Math.abs(multi)

  const cap = stackCapShort(e.maxStack)

  return {
    target: tgt,
    segments: [
      {
        text: isNegative ? `${stat}減少 ` : `${stat}増加 `,
        tone: isNegative ? TONE.debuff : TONE.buff,
      },
      {
        text: `${key}`,
        tone: isNegative ? TONE.debuff : TONE.buff,
      },
      { text: isNegative ? `×${abs}` : `×${abs}` },

      ...(cap ? [{ text: ` ${cap}` }] : []),
    ],
  }
}

function createAncientWeaponLine(
  _e: Extract<SemanticEffect, { kind: "create_ancient_weapon" }>
): EffectLine {
  return {
    segments: [
      { text: "古代兵器を一つ生成する", tone: TONE.buff },
      { text: "（最大3回まで）", tone: TONE.neutral },
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
      target: tgt,
      segments: [
        ...(dur ? [{ text: `${dur}` }] : []),
        { text: "同じ列の味方を庇う", tone: TONE.buff },
      ],
    }
  }

  return {
    segments: [
      ...(dur ? [{ text: `${dur}` }] : []),
      { text: "同じ列の味方を庇う", tone: TONE.buff },
    ],
  }
}

function counterShort(key?: string, scope?: string): string {
  const map: Record<string, string> = {
    dig: "探求",
    teamCurseApplied: "呪印数",
    teamOnDeathTriggerCount: "死亡時効果数",
    swiftVolley: "連射数",
    corpseCount: "死体数",
    equipmentDestroyed: "装備破壊数",
    equipmentForged: "装備数",
    selfDamage: "自傷数",
    selfEquip: "装備数",
    devour: "捕食数"
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
    return `(${d.value}秒間) `
  }
  return ""
}

function capitalize(s: string) {
  return s.charAt(0).toUpperCase() + s.slice(1)
}

function triggerShort(t?: string, ability?: any): string {

  // 吸収系
  if (t?.startsWith("onAbsorb_")) {
    const role = t.replace("onAbsorb_", "")
    return `${role}吸収時`
  }

  // auraTick（周期）
  if (t === "auraTick") {
    const tick = ability?.tick
    if (tick?.type === "everySeconds" && typeof tick.seconds === "number") {
      return `${tick.seconds}秒毎`
    }
    return "一定時間毎"
  }

  const map: Record<string, string> = {
    battleStart: "戦闘開始時",
    onAttack: "攻撃時",
    onKill: "撃破時",
    onDeath: "死亡時",
    onEquip: "装備時",
    onDamageTaken: "被ダメージ時",
    onSelfDamage: "自傷時",
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

  const cond: any = c

  if (typeof c === "string") {
  const map: Record<string, string> = {
    hasFrontAlly: "前列に味方がいる場合",
    hasBackAlly: "後列に味方がいる場合",
    isFront: "前列にいる間",
    isBack: "後列にいる間",
    deadAlly: "味方が死亡した時",
    deadEnemy: "敵が死亡した時",
  }
  return map[c] ?? ""
}

/* =========================
   counter系
========================= */
if (cond.type === "counter") {
  const key = counterShort(cond.key)
  return `${key}+${cond.min ?? 0}`
}

if (cond.type === "counter_at_least") {
  const key = counterShort(cond.key)
  return `${key}+${cond.min}`
}

if (cond.type === "onEquipCount") {
  return `${(cond.value)}個以上装備時`
}

/* =========================
   cost / forge
========================= */
if (cond.type === "unitCost") {
  return `コスト${cond.value}の場合`
}

if (cond.type === "forgeEquipCount") {
  return `${cond.value}個装備時`
}

if (cond.type === "equip_count_at_least") {
  return `装備数が${cond.value}以上の場合`
}

/* =========================
   Curse系
========================= */
if (cond.type === "enemyHasCurse") {
  return `敵に呪印が${cond.value}以上ある場合`
}

if (cond.type === "targetHasCurse") {
  return `対象に呪印が${cond.value}以上ある場合`
}

/* =========================
   HP系
========================= */
if (cond.type === "selfHpBelow") {
  return `自身のHPが${Math.round(cond.percent * 100)}%未満の場合`
}

if (cond.type === "targetHpBelow") {
  return `対象のHPが${Math.round(cond.percent * 100)}%未満の場合`
}

if (cond.type === "allyHpBelow") {
  return `味方のHPが${Math.round(cond.percent * 100)}%未満の場合`
}

if (cond.type === "allyCrossBelow") {
  return `味方のHPが${Math.round(cond.percent * 100)}%未満になった時`
}

if (cond.type === "selfHpBelowPercent") {
  return `自身のHPが${Math.round(cond.value * 100)}%未満の場合`
}

if (typeof c === "string") {
  if (c === "allyCrossBelow50") {
    return "味方のHPが50%未満になった時"
  }
}

/* =========================
   死亡系
========================= */
if (cond.type === "deadAlly") {
  return "味方が死亡した時"
}

if (cond.type === "deadEnemy") {
  return "敵が死亡した時"
}

if (
  (cond as any).type === "deadRoleIs" ||
  (cond as any).kind === "dead_role_is"
) {
  const role = (cond as any).role ?? (cond as any).value
  return `味方${role}が死亡した時`
}

/* =========================
   配置系
========================= */
if (cond.type === "hasFrontAlly") {
  return "前列に味方がいる場合"
}

if (cond.type === "hasBackAlly") {
  return "後列に味方がいる場合"
}

if (cond.type === "isFront") {
  return "前列にいる間"
}

if (cond.type === "isBack") {
  return "後列にいる間"
}

/* =========================
   吸収系
========================= */
if (cond.type === "hasAbsorbedAllRoles") {
  return "全てのロールを吸収した場合"
}

  /* =========================
     fallback（kind対応）
  ========================= */
  switch (cond.kind) {

  case "enemy_has_curse":
    return `敵に呪印が${cond.value}以上ある場合`

  case "target_has_curse":
    return `対象に呪印が${cond.value}以上ある場合`

  case "self_hp_below":
    return `自身のHPが${Math.round(cond.percent * 100)}%未満の場合`

  case "target_hp_below":
    return `対象のHPが${Math.round(cond.percent * 100)}%未満の場合`

  case "ally_hp_below":
    return `味方のHPが${Math.round(cond.percent * 100)}%未満の場合`

  case "counter_at_least": {
    const key = counterShort(cond.key)
    return `${key}+${cond.min}`
  }

  case "has_absorbed_all_roles":
    return "全てのロールを吸収した場合"

  case "equip_count_at_least":
    return `装備数が${cond.value}以上の場合`

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
    return `${roleMap[role] ?? role} ally`
  }

  const map: Record<string, string> = {
    self: "自身",
    target: "対象",
    all_allies: "全ての味方",
    all_enemies: "全ての敵",
    front_allies: "前列の味方",
    back_allies: "後列の味方",
    random_enemy: "ランダムな敵",
    random_ally: "ランダムな味方",
    lowest_hp_ally: "HPが最も低い味方",
    highest_hp_enemy: "HPが最も高い敵",
    highest_atk_ally: "最もATKの高い味方",
    highest_hp_ally: "最もHPの高い味方",
    all_other_allies: "自身以外全ての味方",
    allies_below_hp_percent: "%以下の味方",
    lowest_as_ally: "最もASの低い味方",
    highest_range_ally: "最も射程の長い味方",
    equipped_allies: "装備している味方",
    enemy_column: "同列の敵",
    adjacent_enemies: "隣接する敵",
    equipped_enemy: "装備してる敵",
  }

  return map[t] ?? ""
}

function ordinal(n: number): string {
  if (n === 1) return "1"
  if (n === 2) return "2"
  if (n === 3) return "3"
  return `${n}th`
}

function statShort(stat?: string): string {
  const map: Record<string, string> = {
    atk: "ATK",
    hp: "HP",
    attackSpeed: "AS",
    damageReduce: "DR",
    attackRange: "Range",
  }
  return map[stat ?? ""] ?? (stat ?? "")
}

function stateShort(type?: string): string {
  const map: Record<string, string> = {
    curse_stack: "呪印",
    stun: "スタン",
    damage_amp: "ダメージ上昇",
    damage_reduce: "ダメージ軽減",
    duel: "決闘",
    as_stack: "AS",
    first_attack_boost: "最初の攻撃",
    ignore_dr_next_attack: "次の攻撃は軽減無視",
    lethal_immunity: "致死ダメージ無効",
    atk: "ATK",
    hp: "HP",
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
  return `${v}`
}

function stackCapShort(
  maxStack?: number,
  maxTotalValue?: number,
  maxTrigger?: number
): string {
  const parts: string[] = []

  if (typeof maxStack === "number" && maxStack > 0 && maxStack < 999) {
    parts.push(`上限 ${maxStack}回`)
  }

  if (
    typeof maxTotalValue === "number" &&
    maxTotalValue > 0 &&
    maxTotalValue < 999
  ) {
    parts.push(`上限 ${Math.round(maxTotalValue * 100)}%`)
  }

  if (typeof maxTrigger === "number" && maxTrigger > 0 && maxTrigger < 999) {
    parts.push(`上限 ${maxTrigger}回`)
  }

  if (parts.length === 0) return ""

  return `（${parts.join(" / ")}）`
}

function consumeShort(c?: string): string {
  if (!c) return ""

  const map: Record<string, string> = {
    onAttack: "攻撃で消費",
    onDamageTaken: "ダメージを受けると消費",
    onKill: "キルすると消費",
    onDeath: "死亡時消費",
  }

  return map[c] ?? "[Consumed]"
}

function incrementCounterLine(
  e: Extract<SemanticEffect, { kind: "increment_counter" }>,
  ctx?: {
    battleState?: any
    playerState?: any
    side?: "p1" | "p2"
    ability?: any
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

  const isPerUnit =
    ctx?.ability?.scope === "team" &&
    ctx?.ability?.trigger === "battleStart" &&
    e.kind === "increment_counter" &&
    value === 1

  return {
    segments: [
      ...(isPerUnit ? [{ text: "配置された味方一体につき, " }] : []),
      { text: `${key}` },
      { text: ` +${value}`, tone: TONE.buff },
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

function convertAbility(a: Ability): SemanticAbility {
  return {
    trigger: a.trigger,
    condition: convertCondition(a.condition),
    tick: (a as any).tick,   // ←これ追加
    delay: (a as any).delay, // ついでに
    effects: (a.effects ?? []).map(convertEffect),
  } as any
}
function convertCondition(c: any): SemanticCondition {
  if (!c) return c


  if (c.type === "deadRoleIs") {
    return {
      kind: "dead_role_is",
      role: c.value,
    }
  }

  return c
}