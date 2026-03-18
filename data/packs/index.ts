import { ANTIQUA_PACK } from "./Antiqua"
import { VARKESH_PACK } from "./Varkesh"
import { PackId, Unit } from "@/types"
import { KNIGHTSTEEL_PACK } from "./Knightsteel"

export const PACK_UNITS: Record<PackId, Unit[]> = {
  Antiqua: ANTIQUA_PACK,
  Varkesh: VARKESH_PACK,
  Knightsteel: KNIGHTSTEEL_PACK,
}

export const PACK_IDS: PackId[] = [
  "Antiqua",
  "Varkesh",
  "Knightsteel",
]