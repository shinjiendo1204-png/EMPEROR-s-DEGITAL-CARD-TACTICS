import { Unit } from "@/types"

let autoId = 0

// lib/utils/id.ts などの場所、あるいはそのファイル内

function genId(prefix: string) {
  // 1. タイムスタンプ (Date.now())
  // 2. ランダムな文字列 (Math.random())
  // これらを組み合わせることで、絶対に重複しないIDを作ります
  const randomStr = Math.random().toString(36).substring(2, 8);
  const timestamp = Date.now();
  return `${prefix}_${timestamp}_${randomStr}`;
}

export function ensureAbilityIds(units: Unit[]) {

  for (const unit of units) {

    /* unit abilities */
    for (const ab of unit.abilities ?? []) {
       ab.id = genId(unit.id)
    }

    /* equipment */
    const eq = unit.variants?.equipment
    if (eq?.abilities) {
      for (const ab of eq.abilities) {
       ab.id = genId(unit.id + "_equip")
      }
    }

    /* synergy */
    const syn = unit.variants?.synergy
    if (syn?.abilities) {
      for (const ab of syn.abilities) {
        if (!ab.id) ab.id = genId(unit.id + "_syn")
      }
    }

  }

  return units
}