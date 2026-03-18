import { ANTIQUA_PACK } from "./Antiqua"
import { VARKESH_PACK } from "./Varkesh"
import { PackId, Unit } from "@/types"
import { NIGHTSTEEL_PACK } from "./nightsteel"

export const PACK_UNITS: Record<PackId, Unit[]> = {
  Antiqua: ANTIQUA_PACK,
  Varkesh: VARKESH_PACK,
  Nightsteel: NIGHTSTEEL_PACK,
}

export const PACK_IDS: PackId[] = [
  "Antiqua",
  "Varkesh",
  "Nightsteel",
]