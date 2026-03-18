import { BattleUnit } from "@/types"
import { COMBAT_ROWS, BATTLE_COLS } from "./boardsize"

function createEmptyBoard() {
  return Array.from({ length: COMBAT_ROWS }, () =>
    Array.from({ length: BATTLE_COLS }, () => " . ")
  )
}

function placeUnits(
  board: string[][],
  units: BattleUnit[],
  side: "p1" | "p2"
) {
  for (const unit of units) {
    if (!unit.pos || unit.hp <= 0) continue

    const symbol = unit.unitName.charAt(0).toUpperCase()

    board[unit.pos.r][unit.pos.c] =
      side === "p1"
        ? ` ${symbol} `
        : ` ${symbol.toLowerCase()} `
  }
}

export function printBoardState(
  p1Units: BattleUnit[],
  p2Units: BattleUnit[],
  time: number
) {
  const board = createEmptyBoard()

  placeUnits(board, p1Units, "p1")
  placeUnits(board, p2Units, "p2")

  console.log("\n============================")
  console.log(`Time: ${time.toFixed(2)}`)
  console.log("============================")

  for (let r = 0; r < COMBAT_ROWS; r++) {
    console.log(
      board[r]
        .map(cell => `[${cell}]`)
        .join("")
    )
  }

  console.log("============================\n")
}
