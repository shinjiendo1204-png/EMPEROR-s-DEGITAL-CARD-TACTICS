// src/lib/battle/battleStart.ts

import { BattleState } from "./state"
import { BattleLog, BattleUnit } from "@/types"
import { runAbilities } from "./abilityRunner"


/* =========================
   Utility
========================= */
function getAlive(units: (BattleUnit | null)[]) {
  return units.filter(
    (u): u is BattleUnit => u !== null && u.hp > 0
  )
}

/* =========================
   battleStart
========================= */
export function runBattleStart(
  state: BattleState,
  battleLogs: BattleLog[]
) {

  const p1Alive = getAlive(state.p1Units)
  const p2Alive = getAlive(state.p2Units)

  /* =========================================
   🔥 ability priority sort（1回だけ）
========================================= */
for (const unit of [...p1Alive, ...p2Alive]) {
  unit.abilities?.sort(
    (a, b) => (b.priority ?? 0) - (a.priority ?? 0)
  )
}

  /* =========================================
     ① ユニット個別 battleStart
  ========================================= */
  for (const unit of [...p1Alive, ...p2Alive]) {

    // duration 初期化
    unit.abilities?.forEach(ability => {
      if (!ability.duration) return

      if (ability.duration.type === "time") {
        ability.__expiresAt = state.now + ability.duration.value
      }

      if (ability.duration.type === "turn") {
        ability.__remainingTurns = ability.duration.value
      }
    })

    runAbilities("battleStart", unit, {
      allies: unit.side === "p1" ? p1Alive : p2Alive,
      enemies: unit.side === "p1" ? p2Alive : p1Alive,
      now: state.now ?? 0,
      battleState: state,
      leader:
        unit.side === "p1"
          ? p1Alive[0]
          : p2Alive[0],
      playerState:
        unit.side === "p1"
          ? state.p1Player
          : state.p2Player,
          battleLogs,
    })
  }

  // 🔥 これを追加
for (const side of ["p1", "p2"] as const) {

  const abilities = state.teamAbilities[side]
  if (!abilities?.length) continue

  const allies = side === "p1" ? p1Alive : p2Alive
  const enemies = side === "p1" ? p2Alive : p1Alive
  const playerState = side === "p1" ? state.p1Player : state.p2Player

  const leader = allies[0]
  if (!leader) continue

  // ダミーunitとしてleaderを使う
  const fakeUnit = {
    ...leader,
    abilities
  }

  runAbilities("battleStart", fakeUnit, {
    allies,
    enemies,
    now: state.now ?? 0,
    battleState: state,
    playerState,
    battleLogs,

    isTeam: true,
    leader
  })
}



  battleLogs.push({
    text: "✨ battleStart"
  } as BattleLog)
}


