import { BattleUnit } from "@/types"
import { BattleLog } from "@/types"

/* =========================
   文字ログ
========================= */
export function logAttackText(
  logs: string[],
  msg: string
) {
  logs.push(msg)
}

export function logDeathText(
  logs: string[],
  msg: string
) {
  logs.push(msg)
}

/* =========================
   攻撃イベント
========================= */
export function logAttackEvent(
  battleLogs: BattleLog[],
  attacker: BattleUnit,
  target: BattleUnit,
  damage: number,
  msg: string,
  time: number
) {
  battleLogs.push({
    action: "attack",
    text: msg,

    unitId: attacker.unitId,
    unitName: attacker.unitName,

    instanceId: target.instanceId,
    damage,
    time,

    side: attacker.side
  })
}

/* =========================
   死亡
========================= */
export function logDeathEvent(
  battleLogs: BattleLog[],
  unit: BattleUnit,
  msg: string,
  time: number
) {
  battleLogs.push({
    action: "death",
    text: msg,

    unitId: unit.unitId,
    unitName: unit.unitName,

    instanceId: unit.instanceId,
    side: unit.side,
    time
  })
}

/* =========================
   kill
========================= */
export function logKillEvent(
  battleLogs: BattleLog[],
  attacker: BattleUnit,
  target: BattleUnit,
  time: number
) {
  battleLogs.push({
    action: "kill",
    text: `✅ ${attacker.unitName} が ${target.unitName} を倒した`,

    unitId: attacker.unitId,
    unitName: attacker.unitName,

    instanceId: attacker.instanceId,

    side: attacker.side,

    to: target.pos,

    time
  })
}
/* =========================
   呪印
========================= */
export function logCurseEvent(
  logs: BattleLog[],
  unit: BattleUnit,
  damage: number,
  now: number
) {
  logs.push({
    unitId: unit.unitId,
    unitName: unit.unitName,

    action: "curse",
    text: `☠ ${unit.unitName} に ${damage} 呪印ダメージ`,

    side: unit.side,

    damage,
    time: now
  })
}