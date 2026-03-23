// lib/battle/condition.ts
import { BattleUnit, AbilityCondition,BattleStateEffect } from "@/types"
import { getCounter } from "./counterManager"
import type { AbilityContext } from "./abilityRunner"

export function checkCondition(
  unit: BattleUnit,
  condition?: AbilityCondition,
  context?: AbilityContext
): boolean {
  if (!condition) return true

   /* =========================
     🔥 オブジェクト型条件
  ========================= */
  if (typeof condition === "object") {

    if (condition.type === "enemyHasCurse") {
      return (
        context?.enemies.some(enemy => {
          const total = (enemy.states ?? [])
            .filter(s => s.type === "curse_stack")
            .reduce((sum, s) => sum + (s.value ?? 0), 0)

          return total >= condition.value
        }) ?? false
      )
    }

    if (condition.type === "allyCrossBelow") {
  const t = context?.target
  if (!t) return false

  const percent = condition.percent ?? 0.5
  const prev = (t as any).prevHp ?? t.hp

  return prev > t.maxHp * percent && t.hp <= t.maxHp * percent
}

    if (condition.type === "onEquipCount") {

      if (context?.isTeam) {
       return context?.allies?.some(
  u => (u.equipments?.length ?? 0) >= condition.value
) ?? false
      }

      return (unit.equipments?.length ?? 0) >= condition.value
    }

    if (condition.type === "forgeEquipCount") {

  // 完成済みなら発動しない
  if (unit.ancientForgeComplete) return false

  const count = unit.equipments?.length ?? 0

  return count >= condition.value
}

  

    if (condition.type === "targetHasCurse") {
      const t = context?.target
      if (!t) return false

      const total = (t.states ?? [])
        .filter(s => s.type === "curse_stack")
        .reduce((sum, s) => sum + (s.value ?? 0), 0)

      return total >= condition.value
    }

    if (condition.type === "deadRoleIs") {
      const t = context?.deadUnit
      if (!t) return false

      // 1. 自分自身の死は無視
      if (t.instanceId === unit.instanceId) return false

      // 2. サイド判定を「自分のサイド」と「死んだ奴のサイド」の比較に固定
      const isAlly = t.side === unit.side
      if (!isAlly) return false

      // 3. ロールの一致（念のためトリムと小文字化）
      const targetRole = String(t.role).toLowerCase().trim()
      const conditionRole = String(condition.value).toLowerCase().trim()
      
      const match = targetRole === conditionRole
      
      if (match) {
      }
      return match
    }

    if (condition?.type === "counter") {
      const count = getCounter(
        context!,
        unit.side,
        condition.key,
        condition.scope
      )
      return count >= condition.min
    }

    if (condition.type === "hasAbsorbedAllRoles") {
      const required: BattleStateEffect["type"][]= [
        "absorbed_tank",
        "absorbed_bruiser",
        "absorbed_skirmisher",
        "absorbed_ranged",
        "absorbed_support"
      ]

      const owned = new Set((unit.states ?? []).map(s => s.type))

      return required.every(r => owned.has(r))
    }

    if (condition.type === "boardCount") {

  const allies = context?.allies ?? []

  const filtered = allies.filter(u => {

    if (u.hp <= 0) return false

    if (condition.pack && u.pack !== condition.pack) return false

    if (condition.role && u.role !== condition.role) return false

    return true
  })

  return filtered.length >= condition.min
}

if (condition.type === "boardCost") {

  const allies = context?.allies ?? []

  const totalCost = allies
    .filter(u => {
      if (condition.pack && u.pack !== condition.pack) return false
      return true
    })
    .reduce((sum, u) => sum + u.cost, 0)

  return totalCost >= condition.min
}

if (condition.type === "unitCost") {

  if (context?.isTeam) {
    return context?.allies?.some(u => u.cost === condition.value) ?? false
  }

  return unit.cost === condition.value
}

if (condition.type === "ancientWeaponCountBelow") {

  const equipCount = unit.equipments?.length ?? 0
  if (equipCount < 3) return false

  const forged =
    context?.playerState?.ancientWeapons?.length ?? 0

  return forged < condition.value
}

if (condition.type === "unitFullEquipCount") {

  const allies = context?.allies ?? []

  const fullEquipUnits = allies.filter(u => {
    if (u.hp <= 0) return false
    return (u.equipments?.length ?? 0) >= 3
  })

  return fullEquipUnits.length >= condition.min
}

if (condition.type === "customBoardCount") {

  const allies = context?.allies ?? []

  const alive = allies.filter(u => u.hp > 0)

  const requiredCount = alive.filter(
    u => u.pack === condition.requiredPack
  ).length

  if (requiredCount < condition.requiredCount) {
    return false
  }

  const additionalCount = alive.filter(
    u => condition.additionalPacks.includes(u.pack)
  ).length

  const total = requiredCount + additionalCount

  return (
    additionalCount >= condition.additionalMin &&
    total >= condition.totalMin
  )
}

    /* =========================
      HP条件拡張
    ========================= */

      if (condition.type === "allyHpBelowPercent") {
      const p = condition.value
      return (
        context?.allies.some(a => a.hp > 0 && a.hp <= a.maxHp * p) ?? false
      )
    }

    if (condition.type === "targetHpBelowPercent") {
      const t = context?.target
      if (!t) return false
      return t.hp / t.maxHp <= condition.value
    }

    if (condition.type === "selfHpBelowPercent") {
  if (context?.isTeam) {
    // 🔥 チーム判定に変更
    return context?.allies?.some(
      a => a.hp / a.maxHp <= condition.value
    ) ?? false
  }

  return unit.hp / unit.maxHp <= condition.value
}
  }

  switch (condition) {
    case "hasFrontAlly":
      return (
        context?.allies.some(u => u.row === "front" && u.hp > 0) ?? false
      )

    case "hasBackAlly":
      return (
        context?.allies.some(u => u.row === "back" && u.hp > 0) ?? false
      )

    case "deadAlly":
  if (!context?.deadUnit) return false

  return (
    context.deadUnit.side === unit.side &&
    context.deadUnit.instanceId !== unit.instanceId
  )
case "deadEnemy":
  if (!context?.deadUnit) return false
  return context.deadUnit.side !== unit.side

    case "isFront":
      return unit.row === "front"

    case "isBack":
      return unit.row === "back"

    default:
      return true
  }
}
