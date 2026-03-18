import React from "react"
import type {
  SemanticAbility,
  SemanticEffect,
  SemanticCondition,
} from "./types"
import {
  TRIGGER_EN,
  TARGET_EN,
  STAT_EN,
  STATE_EN,
} from "./dictionaries"

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
  text: string
  tone: Tone
}

/* =========================================================
   Main
========================================================= */

export function renderAbilityEN(
  s: SemanticAbility
): React.ReactNode {

  const header = buildHeader(s)

  return (
    <>
      {s.effects.map((e, i) => {
        const line = effectLine(e)
        return (
          <div key={i}>
            {header && <strong>{header}: </strong>}
            <span>{line.text}</span>
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

  const parts: string[] = []

  const trig = triggerToEN(s.trigger)
  if (trig) parts.push(trig)

  const tick = tickToEN(s.tick)
  if (tick) parts.push(tick)

  const delay = delayToEN(s.delay)
  if (delay) parts.push(delay)

  if (s.aura) parts.push("While active")

  const scope = scopeToEN(s.scope)
  if (scope) parts.push(scope)

  const cond = conditionToEN(s.condition)
  if (cond) parts.push(cond)

  if (s.once) parts.push("once")

  return parts.join(" ")
}

/* =========================================================
   Effect Dispatcher
========================================================= */

function effectLine(e: SemanticEffect): EffectLine {
  switch (e.kind) {

    case "stat_mod":
      return statModLine(e)

    case "add_state":
      return addStateLine(e)

    case "damage":
      return damageLine(e)

    case "damage_from_counter":
      return counterLine(e)

    case "heal":
      return healLine(e)

    case "self_damage":
      return { text: `self takes ${e.value} damage`, tone: TONE.debuff }

    case "set_attack_range":
      return rangeLine(e)

    default:
      return { text: "special effect", tone: TONE.neutral }
  }
}

/* =========================================================
   Effect Handlers
========================================================= */

function statModLine(
  e: Extract<SemanticEffect, { kind: "stat_mod" }>
): EffectLine {

  const target = targetToEN(e.target)
  const stat = STAT_EN[e.stat] ?? e.stat

  const sign = e.value >= 0 ? "increases" : "decreases"
  const abs = Math.abs(e.value)

  const tone: Tone =
    e.value >= 0 ? TONE.buff : TONE.debuff

  if (e.stat === "attackSpeed") {
    return {
      text: `${target}'s ${stat} ${sign} by ${Math.round(abs * 100)}%`,
      tone,
    }
  }

  return {
    text: `${target}'s ${stat} ${sign} by ${abs}`,
    tone,
  }
}

function addStateLine(
  e: Extract<SemanticEffect, { kind: "add_state" }>
): EffectLine {

  const state = STATE_EN[e.stateType] ?? e.stateType
  const target = targetToEN(e.target)
  const stack = e.value !== undefined ? ` ${e.value}` : ""

  return {
    text: `apply ${state}${stack} to ${target}`,
    tone: TONE.neutral,
  }
}

function damageLine(
  e: Extract<SemanticEffect, { kind: "damage" }>
): EffectLine {

  const target = targetToEN(e.target)
  const ignore = e.ignoreDR ? " (ignores damage reduction)" : ""

  return {
    text: `deal ${e.value} damage to ${target}${ignore}`,
    tone: TONE.debuff,
  }
}

function counterLine(
  e: Extract<SemanticEffect, { kind: "damage_from_counter" }>
): EffectLine {

  return {
    text: `deal ${e.key} × ${e.multiplier} damage`,
    tone: TONE.debuff,
  }
}

function healLine(
  e: Extract<SemanticEffect, { kind: "heal" }>
): EffectLine {

  const target = targetToEN(e.target)

  if (e.percent) {
    return {
      text: `restore ${Math.round(e.value * 100)}% HP to ${target}`,
      tone: TONE.buff,
    }
  }

  return {
    text: `restore ${e.value} HP to ${target}`,
    tone: TONE.buff,
  }
}

function rangeLine(
  e: Extract<SemanticEffect, { kind: "set_attack_range" }>
): EffectLine {

  return {
    text: `set attack range to ${e.value}`,
    tone: TONE.neutral,
  }
}

/* =========================================================
   Condition
========================================================= */

function conditionToEN(c?: SemanticCondition): string {
  if (!c) return ""

  switch (c.kind) {
    case "dead_ally":
      return "when an ally dies"
    case "dead_enemy":
      return "when an enemy dies"
    case "self_hp_below":
      return `when HP is below ${Math.round(c.percent * 100)}%`
    case "target_hp_below":
      return `when target HP is below ${Math.round(c.percent * 100)}%`
    case "ally_hp_below":
      return `when an ally is below ${Math.round(c.percent * 100)}% HP`
    case "enemy_has_curse":
      return `when an enemy has ${c.value}+ Curse`
    case "target_has_curse":
      return `when target has ${c.value}+ Curse`
    default:
      return ""
  }
}

/* =========================================================
   Helpers
========================================================= */

function triggerToEN(t?: string) {
  return TRIGGER_EN[t ?? ""] ?? ""
}

function targetToEN(t?: string) {
  return TARGET_EN[t ?? "self"] ?? "self"
}

function scopeToEN(scope?: string) {
  if (!scope) return ""
  if (scope === "team") return "for allies"
  if (scope === "global") return "globally"
  return ""
}

function tickToEN(tick?: any) {
  if (!tick) return ""
  if (tick.type === "everySeconds")
    return `every ${tick.seconds}s`
  return ""
}

function delayToEN(d?: any) {
  if (!d) return ""
  if (d.type === "time")
    return `after ${d.value}s`
  return ""
}