import { Unit, PackId } from "@/types"
import { PACK_UNITS } from "@/data/packs"

export function createSharedCardPool(
  p1Pack: PackId,
  p2Pack: PackId
): Unit[] {

  const combined = [
    ...PACK_UNITS[p1Pack],
    ...PACK_UNITS[p2Pack],
  ]

  // idで重複除去
  const uniqueMap = new Map<string, Unit>()

  for (const u of combined) {
    if (!uniqueMap.has(u.id)) {
      uniqueMap.set(u.id, structuredClone(u))
    }
  }

  return Array.from(uniqueMap.values())
}
