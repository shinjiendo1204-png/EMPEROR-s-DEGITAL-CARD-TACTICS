// core.ts（修正版）

import { BattleUnit, BattleEvent } from "@/types"
import {
  calculateFinalStats,
  getDamageMultiplier,
  getDamageTakenMultiplier,
  hasLethalImmunity,
} from "./statCalculator"
import {
  removeState,
  consumeStates,
} from "./stateEffects"
import { runAbilities } from "./abilityRunner"

/* =========================
   attackOnce
========================= */

export function attackOnce(
  attacker: BattleUnit,
  target: BattleUnit
): BattleEvent[] {

  const events: BattleEvent[] = []
  const now = attacker.nextActionTime

  /* =========================
     ① 攻撃側ステータス
  ========================= */

  const attackerStats = calculateFinalStats(attacker, now)
  let damage = attackerStats.atk

  damage *= getDamageMultiplier(attacker, now)

  /* =========================
     ② 防御側ステータス
  ========================= */

  const targetStats = calculateFinalStats(target, now)

  const ignoreDR = attacker.states?.some(
    s => s.type === "ignore_dr_next_attack"
  )

  if (!ignoreDR) {
    damage *= getDamageTakenMultiplier(target, now)
    damage -= targetStats.damageReduce
  }

  /* =========================
     ③ 一回軽減（ここで消費）
  ========================= */

  const onceReduce = consumeStates(target, "onDamageTaken", now)
  damage -= onceReduce

  damage = Math.max(0, Math.floor(damage))

  /* =========================
     ④ 攻撃ログ
  ========================= */

  events.push({
    type: "attack",
    from: attacker.instanceId,
    to: target.instanceId,
    damage,
  })

  /* =========================
     ⑤ HP減算
  ========================= */

  target.prevHp = target.hp
  target.hp -= damage

  /* =========================
     ⑥ 死亡判定
  ========================= */

  if (target.hp <= 0) {

    if (hasLethalImmunity(target, now)) {
      target.hp = 1
      removeState(target, "lethal_immunity")
      return events
    }

    target.hp = 0

    events.push({
      type: "death",
      instanceId: target.instanceId,
      unitName: target.unitName,
    } as any)
  }

  /* =========================
     ⑦ ignoreDR消費
  ========================= */

  if (ignoreDR) {
    attacker.states = (attacker.states ?? []).filter(
      s => s.type !== "ignore_dr_next_attack"
    )
  }

  return events
}