// src/types/drag.ts
export type DragItem =
  | { type: "hand"; handIndex: number }
  | { type: "board"; boardIndex: number }
  | { type: "stock"; stockIndex: number }
  | null
