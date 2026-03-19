import { BattleLog } from "@/types"

export type DamageStat = {
  id: string
  name: string
  damage: number
}

export function buildDamageStats(logs: BattleLog[]): DamageStat[] {

  const map: Record<string, DamageStat> = {}

  for (const log of logs) {

    if (
      log.action !== "attack" &&
      log.action !== "damage"
    ) continue

    const dmg =
      (log as any).damage ??
      (log as any).value ??
      0

    if (dmg <= 0) continue

    let id = ""
    let name = ""

    // =========================
    // ★ チームダメージ
    // =========================
    if ((log as any).unitId === "team_curse") {
      id = "team_curse"
      name = "Team Damage"
    }
    else if ((log as any).unitId === "team_self_damage") {
      id = "team_self_damage"
      name = "Team Damage"
    }

    // =========================
    // ★ 通常ユニット
    // =========================
    else {
      id =
        (log as any).unitId ??
        log.instanceId ??
        log.unitName ??
        "unknown"

      name =
        log.unitName ??
        "unknown"
    }

    if (!map[id]) {
      map[id] = {
        id,
        name,
        damage: 0
      }
    }

    map[id].damage += dmg
  }

  return Object.values(map)
    .sort((a, b) => b.damage - a.damage)
}