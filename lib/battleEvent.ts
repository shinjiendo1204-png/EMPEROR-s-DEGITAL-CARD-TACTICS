// src/lib/battleEvent.ts
import { BattleEvent, BattleLog } from "@/types"

export function eventToLog(e: BattleEvent, time: number): BattleLog {
  switch (e.type) {
    case "battleStart":
      return {
        unitId: "system",
        unitName: "戦闘",
        action: "skill",
        trigger: "battleStart",
        text: "⚔️ 戦闘開始",
        time,
      }

    case "battleEnd":
      return {
        unitId: "system",
        unitName: "戦闘",
        action: "skill",
        trigger: "battleEnd",
        text: "🏁 戦闘終了",
        time,
      }

    case "attack":
      return {
        unitId: e.from,
        unitName: "",
        action: "attack",
        text: `🗡 ${e.from} が ${e.to} を攻撃（${e.damage}ダメージ）`,
        time
      }

    case "death":
      return {
        unitId: e.instanceId,
        unitName: e.unitName,
        action: "death",
        text: `💀 ${e.unitName} は倒れた`,
        time
      }

    case "kill":
      return {
        unitId: e.instanceId,
        unitName: e.unitName,
        action: "kill",
        text: `🔥 ${e.unitName} は敵を討ち取った`,
        time
      }

    case "skill":
      return {
        unitId: e.instanceId,
        unitName: e.unitName,
        action: "skill",
        trigger: e.trigger,
        text: `✨ ${e.unitName} が能力を発動`,
        time
      }

    default: {
      // 到達不能だが、型安全のため
      const _exhaustive: never = e
      return {
        unitId: "system",
        unitName: "戦闘",
        action: "skill",
        text: "（不明なイベント）",
        time
      }
    }
  }
}
