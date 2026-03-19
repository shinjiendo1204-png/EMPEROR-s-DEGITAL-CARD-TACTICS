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

export function renderAbilityEN(
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

              {first.condition && (
                <span className="tag condition">
                  {conditionShort(first.condition)}
                </span>
              )}
            </div>

            {/* 🔻 Effects（targetごとにまとめる） */}
            {Array.from(groupedByTarget.entries()).map(([targetKey, effects], i) => {

  // ★ 追加：stat統合
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
              {j > 0 && ", "}
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
export function renderAbilitiesENFromRaw(
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
                          {j > 0 && ", "}
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
  const trig = triggerShort(s.trigger)
  const cond = conditionShort(s.condition)
  const delay = delayShort((s as any).delay)
  const tick = tickShort((s as any).tick)

  const once = (s as any).once ? " (once per battle)" : ""

  if (cond.includes("after forging")) {
  return `On equip ${cond}`
}

  if (s.trigger === "onDeath") {
  if (cond.startsWith("when an allied")) {
    return capitalize(cond) + once
  }
  if (cond === "When an ally dies") return `When an ally dies${once}`
  if (cond === "When an enemy dies") return `When an enemy dies${once}`
  return `On death${once}`
}

  const parts: string[] = []

  if (delay) {
    parts.push(delay)
  } else if (tick) {
    parts.push(tick)
  }

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
    return `After ${d.value}s`
  }
  return ""
}

function tickShort(tick?: any): string {
  if (!tick) return ""
  if (tick.type === "everySeconds" && typeof tick.seconds === "number") {
    return `Every ${tick.seconds}s`
  }
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
          { text: "Take " },
          { text: `${safeNumber(e.value)}`, tone: TONE.debuff },
          { text: " self-damage" },
        ],
      }
      break

    case "set_attack_range":
      base = setRangeLine(e)
      break

    case "remove_state":
      base = {
        target: targetShort(e.target),
        segments: [
          { text: "Remove " },
          { text: `${stateShort(e.stateType)}`, tone: stateTone(e.stateType) },
        ],
      }
      break

    case "increment_counter":
      base = incrementCounterLine(e, ctx)
      break

    case "dig_relic":
      base = digRelicLine(e)
      break

    case "guard_adjacent":
      base = guardAdjacentLine(e)
      break

    case "destroy_equipment":
      base = destroyEquipmentLine(e)
      break

    default:
      base = {
        segments: [{ text: "Special effect" }],
      }
  }

  /* 🔥 ここを追加 */
  return {
    ...base,
    trigger: triggerShort(ctx?.ability?.trigger),
    condition: conditionShort(ctx?.ability?.condition),
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
      segments: [{ text: "Destroy equipped item", tone: TONE.debuff }],
    }
  }

  if (tgt) {
    return {
      target: tgt,
      segments: [{ text: "Destroy equipment", tone: TONE.debuff }],
    }
  }

  return {
    segments: [{ text: "Destroy equipment", tone: TONE.debuff }],
  }
}

function damageLine(
  e: Extract<SemanticEffect, { kind: "damage" }>
): EffectLine {
  const dur = durationPrefix(e.duration)
  const tgt = targetShort(e.target)
  const value = safeNumber(e.value)
  const ignore = e.ignoreDR ? " (ignores damage reduction)" : ""

  return {
    target: tgt,
    segments: [
      ...(dur ? [{ text: `${dur}` }] : []),
      { text: "Deal " },
      { text: `${value}`, tone: TONE.debuff },
      { text: ` damage${ignore}` },
    ],
  }
}

function damageFromCounterLine(
  e: Extract<SemanticEffect, { kind: "damage_from_counter" }>
): EffectLine {
  const dur = durationPrefix(e.duration)
  const tgt = targetShort(e.target) || "All enemy units"
  const key = counterShort((e as any).key, e.scope)
  const multi = safeNumber((e as any).multiplier)

  return {
    target: tgt,
    segments: [
      ...(dur ? [{ text: `${dur}` }] : []),
      { text: "Deal damage equal to " },
      { text: `${key}`, tone: TONE.debuff },
      { text: ` ×${multi}` },
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
      ...(dur ? [{ text: `${dur}` }] : []),
      { text: "Deal " },
      { text: `${value}`, tone: TONE.debuff },
      { text: " damage over " },
      { text: `${hits}`, tone: TONE.debuff },
      { text: " hits" },
    ],
  }
}

function tauntAllLine(
  _e: Extract<SemanticEffect, { kind: "taunt_all" }>
): EffectLine {
  return {
    target: "Self",
    segments: [
      { text: "Guard all allies", tone: TONE.buff },
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
      { text: "Deal " },
      { text: `${percent}%`, tone: TONE.debuff },
      { text: " damage" },
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
      { text: `Set attack range to ${rangeValueShort(e.value)}` },
    ],
  }
}

/* =========================================================
   add_state
========================================================= */

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
      ? ` for ${e.duration.value}s`
      : ""

  const cap = stackCapShort(
    e.maxStack,
    e.maxTotalValue,
    (e as any).maxTriggers
  )

  return {
  target: tgt,
  segments: [
    ...(valueText
      ? [{ text: `${state}${valueText}`, tone }] // ← ここ変更
      : [{ text: `${state}`, tone }]),

    ...(duration ? [{ text: duration }] : []),
    ...(cap ? [{ text: ` ${cap}` }] : []),
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
        ...(dur ? [{ text: `${dur}` }] : []),
        { text: "Reduce the next damage taken by " },
        { text: `${value}`, tone: TONE.buff },
        { text: " once this battle" },
      ],
    }
  }

  if (stateType === "lethal_immunity" && consumeOn === "onDamageTaken") {
    return {
      target: tgt,
      segments: [
        ...(dur ? [{ text: `${dur}` }] : []),
        { text: "Negate lethal damage once this battle", tone: TONE.buff },
      ],
    }
  }

  if (stateType === "ignore_dr_next_attack" && consumeOn === "onAttack") {
    return {
      target: tgt,
      segments: [
        ...(dur ? [{ text: `${dur}` }] : []),
        { text: "Next attack ignores damage reduction", tone: TONE.buff },
      ],
    }
  }

  if (stateType === "first_attack_boost" && consumeOn === "onAttack") {
    return {
      target: tgt,
      segments: [
        ...(dur ? [{ text: `${dur}` }] : []),
        { text: "Increase next attack damage by " },
        { text: `${value}`, tone: TONE.buff },
      ],
    }
  }

  if (stateType === "duel" && consumeOn === "onAttack") {
    return {
      target: tgt,
      segments: [
        ...(dur ? [{ text: `${dur}` }] : []),
        { text: "Next attack deals " },
        { text: `${value}`, tone: TONE.buff },
        { text: " bonus damage" },
      ],
    }
  }

  if (consumeOn === "onKill") {
    return {
      target: tgt,
      segments: [
        ...(dur ? [{ text: `${dur}` }] : []),
        { text: "Expires after getting a kill" },
      ],
    }
  }

  if (consumeOn === "onDeath") {
    return {
      target: tgt,
      segments: [
        ...(dur ? [{ text: `${dur}` }] : []),
        { text: "Expires on death" },
      ],
    }
  }

  if (consumeOn === "onDamageTaken") {
    return {
      target: tgt,
      segments: [
        ...(dur ? [{ text: `${dur}` }] : []),
        { text: "Expires when taking damage" },
      ],
    }
  }

  if (consumeOn === "onAttack") {
    return {
      target: tgt,
      segments: [
        ...(dur ? [{ text: `${dur}` }] : []),
        { text: "Expires after attacking" },
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
  const tgt = targetShort((e as any).target)

  if ((e as any).unitId === "varkesh_ghoul_token") {
    return {
      target: tgt,
      segments: [{ text: "Summon a Ghoul", tone: TONE.buff }],
    }
  }

  return {
    target: tgt,
    segments: [{ text: "Summon a unit", tone: TONE.buff }],
  }
}

function summonLimitLine(
  e: Extract<SemanticEffect, { kind: "summon_limit" }>
): EffectLine {
  const value = safeNumber((e as any).value ?? (e as any).limit ?? 1)

  return {
    segments: [
      { text: "Summon limit " },
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
    ? statRaw.split("+").map(statShort).join(" & ")
    : statShort(statRaw)

  const isNegative = multi < 0
  const abs = Math.abs(multi)

  // ★ 追加
  const cap = stackCapShort(e.maxStack)

  return {
    target: tgt,
    segments: [
      { text: isNegative ? "Reduce " : "Gain " },
      {
        text: `${stat}`,
        tone: isNegative ? TONE.debuff : TONE.buff,
      },
      { text: isNegative ? " by " : " equal to " },
      {
        text: `${key}`,
        tone: isNegative ? TONE.debuff : TONE.buff,
      },
      ...(abs !== 1 ? [{ text: ` ×${abs}` }] : []),

      // ★ ここで表示
      ...(cap ? [{ text: ` ${cap}` }] : []),
    ],
  }
}

function createAncientWeaponLine(
  _e: Extract<SemanticEffect, { kind: "create_ancient_weapon" }>
): EffectLine {
  return {
    segments: [{ text: "Forge an Ancient Weapon", tone: TONE.buff }],
  }
}

function chainAttackLine(
  e: Extract<SemanticEffect, { kind: "chain_attack" }>
): EffectLine {
  const count = safeNumber((e as any).count ?? (e as any).value ?? 1)
  const tgt = targetShort((e as any).target)

  return {
    target: tgt,
    segments: [
      { text: "Attack " },
      { text: `${count}`, tone: TONE.buff },
      { text: " times in a row" },
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
        { text: "Guard allies in the same column", tone: TONE.buff },
      ],
    }
  }

  return {
    segments: [
      ...(dur ? [{ text: `${dur}` }] : []),
      { text: "Guard allies in the same column", tone: TONE.buff },
    ],
  }
}

function counterShort(key?: string, scope?: string): string {
  const map: Record<string, string> = {
    dig: "Dig",
    teamCurseApplied: "Curse",
    teamOnDeathTriggerCount: "OnDeath",
    swiftVolley: "Volley",
    corpseCount: "Corpses",
    equipmentDestroyed: "Destroyed",
    equipmentForged: "Forged",
    selfDamage: "Self-damage",
    selfEquip: "Equip",
    devour: "Devour"
  }

  const base = map[key ?? ""] ?? key ?? "?"

  if (scope === "battle") return `${base} (battle)`
  if (scope === "match") return `${base} (match)`
  if (scope === "turn") return `${base} (turn)`

  return base
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
    return `For ${d.value}s `
  }
  return ""
}

function capitalize(s: string) {
  return s.charAt(0).toUpperCase() + s.slice(1)
}

function triggerShort(t?: string, ability?: any): string {

  if (t?.startsWith("onAbsorb_")) {
  const role = t.replace("onAbsorb_", "")
  return `When absorbing ${capitalize(role)}`
}

  if (t === "auraTick") {
    const tick = ability?.tick
    if (tick?.type === "everySeconds" && typeof tick.seconds === "number") {
      return `Every ${tick.seconds}s`
    }
    return "Periodically"
  }

  const map: Record<string, string> = {
    battleStart: "At battle start",
    onAttack: "On attack",
    onKill: "On kill",
    onDeath: "On death",
    onEquip: "On equip",
    onDamageTaken: "When damaged",
    onSelfDamage: "On self-damage",
    firstDeath: "On the first death",
  }

  return map[t ?? ""] ?? t ?? "" // ← fallbackも修正
}
/* =========================================================
   Condition
========================================================= */

function conditionShort(
  c?: SemanticCondition | string
): string {
  if (!c) return ""

  const cond: any = c

  /* =========================
     string型（旧）
  ========================= */
  if (typeof c === "string") {
    const map: Record<string, string> = {
      hasFrontAlly: "if there is an ally in the front row",
      hasBackAlly: "if there is an ally in the back row",
      isFront: "while in the front row",
      isBack: "while in the back row",
      deadAlly: "When an ally dies",
      deadEnemy: "When an enemy dies",
    }
    return map[c] ?? ""
  }

  /* =========================
     counter系
  ========================= */
  if (cond.type === "counter") {
    const key = counterShort(cond.key)
    return `if ${key} is ${cond.min ?? 0} or higher`
  }

  if (cond.type === "counter_at_least") {
    const key = counterShort(cond.key)
    return `if ${key} is at least ${cond.min}`
  }

  if (cond.type === "onEquipCount") {
  return `on the ${ordinal(cond.value)} equip`
}

  /* =========================
     cost / forge
  ========================= */
  if (cond.type === "unitCost") {
    return `if cost is ${cond.value}`
  }

  if (cond.type === "forgeEquipCount") {
  return `after forging ${cond.value} equipment`
}

  if (cond.type === "equip_count_at_least") {
    return `if equipment count is at least ${cond.value}`
  }

  /* =========================
     🔥 Curse系（今回の核心）
  ========================= */
  if (cond.type === "enemyHasCurse") {
    return `if enemy has ${cond.value}+ Curse`
  }

  if (cond.type === "targetHasCurse") {
    return `if target has ${cond.value}+ Curse`
  }

  /* =========================
     HP系
  ========================= */
  if (cond.type === "selfHpBelow") {
    return `if HP is below ${Math.round(cond.percent * 100)}%`
  }

  if (cond.type === "targetHpBelow") {
    return `if target HP is below ${Math.round(cond.percent * 100)}%`
  }

  if (cond.type === "allyHpBelow") {
    return `if an ally's HP is below ${Math.round(cond.percent * 100)}%`
  }
  

  if (cond.type === "allyCrossBelow") {
    return `when an ally drops below ${Math.round(cond.percent * 100)}% HP`
  }

  if (cond.type === "selfHpBelowPercent") {
  return `if HP is below ${Math.round(cond.value * 100)}%`
}

  if (typeof c === "string") {
  if (c === "allyCrossBelow50") {
    return "when an ally drops below 50% HP"
  }
}

  /* =========================
     死亡系
  ========================= */
  if (cond.type === "deadAlly") {
    return "When an ally dies"
  }

  if (cond.type === "deadEnemy") {
    return "When an enemy dies"
  }

  if ((cond as any).type === "deadRoleIs" || (cond as any).kind === "dead_role_is") {
  const role = (cond as any).role ?? (cond as any).value
  return `when an allied ${capitalize(role)} dies`
}
  /* =========================
     配置系
  ========================= */
  if (cond.type === "hasFrontAlly") {
    return "if there is an ally in the front row"
  }

  if (cond.type === "hasBackAlly") {
    return "if there is an ally in the back row"
  }

  if (cond.type === "isFront") {
    return "while in the front row"
  }

  if (cond.type === "isBack") {
    return "while in the back row"
  }

  /* =========================
     吸収系
  ========================= */
  if (cond.type === "hasAbsorbedAllRoles") {
    return "after absorbing all roles"
  }

  /* =========================
     fallback（kind対応）
  ========================= */
  switch (cond.kind) {
    case "enemy_has_curse":
      return `if enemy has ${cond.value}+ Curse`

    case "target_has_curse":
      return `if target has ${cond.value}+ Curse`

    case "self_hp_below":
      return `if HP is below ${Math.round(cond.percent * 100)}%`

    case "target_hp_below":
      return `if target HP is below ${Math.round(cond.percent * 100)}%`

    case "ally_hp_below":
      return `if an ally's HP is below ${Math.round(cond.percent * 100)}%`

    case "counter_at_least": {
      const key = counterShort(cond.key)
      return `if ${key} is at least ${cond.min}`
    }

    case "has_absorbed_all_roles":
      return "after absorbing all roles"

    case "equip_count_at_least":
      return `if equipment count is at least ${cond.value}`

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
      tank: "Tank",
      bruiser: "Bruiser",
      skirmisher: "Skirmisher",
      ranged: "Ranged",
      support: "Support",
    }
    return `${roleMap[role] ?? role} ally`
  }

  const map: Record<string, string> = {
    self: "Self",
    target: "Target",
    all_allies: "All allies",
    all_enemies: "All enemies",
    front_allies: "Front-row allies",
    back_allies: "Back-row allies",
    random_enemy: "Random enemy",
    random_ally: "Random ally",
    lowest_hp_ally: "Lowest-HP ally",
    highest_hp_enemy: "Highest-HP enemy",
    highest_atk_ally: "Highest-ATK ally",
    highest_hp_ally: "Highest-HP ally",
    all_other_allies: "All other allies",
    allies_below_hp_percent: "Low-HP allies",
    lowest_as_ally: "Lowest-AS ally",
    highest_range_ally: "Longest-range ally",
    equipped_allies: "Equipped allies",
    enemy_column: "Enemies in target's column",
    adjacent_enemies: "Adjacent enemies",
    equipped_enemy: "Equipped enemy",
  }

  return map[t] ?? ""
}

function ordinal(n: number): string {
  if (n === 1) return "first"
  if (n === 2) return "second"
  if (n === 3) return "third"
  return `${n}th`
}

function statShort(stat?: string): string {
  const map: Record<string, string> = {
    atk: "ATK",
    hp: "HP",
    attackSpeed: "AS",
    damageReduce: "Damage Reduction",
    attackRange: "Range",
  }
  return map[stat ?? ""] ?? (stat ?? "")
}

function stateShort(type?: string): string {
  const map: Record<string, string> = {
    curse_stack: "Curse",
    stun: "Stun",
    damage_amp: "Damage Taken",
    damage_reduce: "Damage Reduction",
    duel: "Duel",
    as_stack: "AS",
    first_attack_boost: "First Strike",
    ignore_dr_next_attack: "Ignore DR on Next Attack",
    lethal_immunity: "Lethal Immunity",
    atk: "Attack",
    hp: "Health",
    absorbed_tank: "Tank Absorbed",
    absorbed_bruiser: "Bruiser Absorbed",
    absorbed_skirmisher: "Skirmisher Absorbed",
    absorbed_ranged: "Ranged Absorbed",
    absorbed_support: "Support Absorbed",
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

  if (typeof maxStack === "number") {
    parts.push(`max ${maxStack} stacks`)
  }

  if (typeof maxTotalValue === "number" && !maxStack) {
    parts.push(`max ${Math.round(maxTotalValue * 100)}%`)
  }

  if (typeof maxTrigger === "number") {
    parts.push(`up to ${maxTrigger} times`)
  }

  if (parts.length === 0) return ""

  return `(${parts.join(" / ")})`
}

function consumeShort(c?: string): string {
  if (!c) return ""

  const map: Record<string, string> = {
    onAttack: "[Consumed on attack]",
    onDamageTaken: "[Consumed when damaged]",
    onKill: "[Consumed on kill]",
    onDeath: "[Consumed on death]",
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
      ...(isPerUnit ? [{ text: "Per allied unit, " }] : []),
      { text: `${key}` },
      { text: ` +${value}`, tone: TONE.buff },
    ],
  }
}

function digRelicLine(
  _e: Extract<SemanticEffect, { kind: "dig_relic" }>
): EffectLine {
  return {
    segments: [{ text: "Excavate a relic", tone: TONE.buff }],
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

  // deadRoleIs 正規化
  if (c.type === "deadRoleIs") {
    return {
      kind: "dead_role_is",
      role: c.value,
    }
  }

  return c
}