// src/lib/battle/boardsize.ts

export const PLAYER_ROWS = 4
export const BATTLE_COLS = 6
export const BATTLE_SIZE = PLAYER_ROWS * BATTLE_COLS

// 戦闘時は上下2面をつなげる
export const COMBAT_ROWS = PLAYER_ROWS * 2