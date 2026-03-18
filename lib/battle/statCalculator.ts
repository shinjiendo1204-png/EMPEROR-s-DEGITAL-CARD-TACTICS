// src/lib/battle/statCalculator.ts
import { BattleUnit, BattleStateEffect } from "@/types"

const MIN_AS = 0.05
const MAX_AS = 5

/* =========================
   ヘルパー
========================= */

function sumStates(unit: BattleUnit, type: BattleStateEffect["type"], now: number): number {
  return (unit.states ?? [])
    .filter(s =>
      s.type === type &&
      (s.expiresAt === undefined || s.expiresAt > now) &&
      (s.consumeOn == null) // ✅ これ追加：一回消費系は常時計上しない
    )
    .reduce((sum, s) => sum + (s.value ?? 0), 0)
}

/* =========================
   最終ステータス計算
========================= */
export function calculateFinalStats(
  unit: BattleUnit,
  now: number
) {
  let atk = unit.baseAtk
  let attackSpeed = unit.baseAttackSpeed
  let damageReduce = unit.baseDamageReduce ?? 0
  let maxHp = unit.baseMaxHp

  // ★ stun判定（最優先）
  const stunned = (unit.states ?? []).some(
    s =>
      s.type === "stun" &&
      (s.expiresAt === undefined || s.expiresAt > now)
  )

  if (stunned) {
    return {
      atk: unit.baseAtk,
      attackSpeed: 0, // 行動停止（step側でstun処理してるので実害は小さいが一応）
      damageReduce: unit.baseDamageReduce ?? 0,
      maxHp: unit.baseMaxHp,
    }
  }

  /* =========================
     state加算
  ========================= */

  // atk
  atk += sumStates(unit, "atk", now)

  // hp
  maxHp += sumStates(unit, "hp", now)

  // attackSpeed
  const asBonus = sumStates(unit, "as_stack", now)
  attackSpeed *= (1 + asBonus)
  // damageReduce
  damageReduce += sumStates(unit, "damage_reduce", now)

  /* =========================
     suddenDeath（秒スケール版）
     - now は 0.2, 1.0, 2.3 ... のような秒で進んでいる前提
     - 30秒以降、徐々に火力/速度を上げて必ず決着させる
  ========================= */
  const SUDDEN_DEATH_START = 30000 // ✅ ここが超重要（30000は8時間なのでほぼ発動しない）
  if (now >= SUDDEN_DEATH_START) {
    const t = now - SUDDEN_DEATH_START

    // 1秒あたり +3% にしたいなら ms を秒換算
    const seconds = t / 1000
    const scale = 1 + seconds * 0.03


    atk *= scale
    attackSpeed *= (1 + t * 0.015) // ASはatkより控えめに
  }

  /* =========================
     clamp
  ========================= */
  if (attackSpeed < MIN_AS) attackSpeed = MIN_AS
  if (attackSpeed > MAX_AS) attackSpeed = MAX_AS

  if (maxHp < 1) maxHp = 1

  return {
    atk,
    attackSpeed,
    damageReduce,
    maxHp,
  }
}

/* =========================
   ダメージ倍率（攻撃側）
========================= */
export function getDamageMultiplier(
  unit: BattleUnit,
  now: number
): number {
  let mult = 1

  mult += sumStates(unit, "damage_amp", now)
  mult += sumStates(unit, "first_attack_boost", now)

  return mult
}

/* =========================
   被ダメ倍率（防御側）
========================= */
export function getDamageTakenMultiplier(
  unit: BattleUnit,
  now: number
): number {
  let mult = 1
  mult += sumStates(unit, "damage_taken_amp", now)
  return mult
}

/* =========================
   lethal immunity
========================= */
export function hasLethalImmunity(
  unit: BattleUnit,
  now: number
): boolean {
  return (unit.states ?? []).some(
    s =>
      s.type === "lethal_immunity" &&
      (s.expiresAt === undefined || s.expiresAt > now)
  )
}