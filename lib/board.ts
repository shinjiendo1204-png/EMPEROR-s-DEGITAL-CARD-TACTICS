// src/lib/board.ts
import { Row } from "@/types"
import { BattleUnit } from "@/types"
import { BATTLE_COLS } from "@/lib/battle/boardsize"

export function getRowByIndex(index: number): Row {
  const rowIndex = Math.floor(index / BATTLE_COLS)
  return rowIndex === 0 ? "front" : "back"
}

export function canPlaceAt(
  board: (BattleUnit | null)[],
  index: number
): boolean {
  return board[index] === null
}