export type PackID = "Antiqua" | "Varkesh" | "Knightsteel"

export type PackMeta = {
  id: PackID
  name: string
  description: string
}

export const PACKS: PackMeta[] = [
  {
    id: "Antiqua",
    name: "遺物パック",
    description: "発掘したレリックで強化"
  },
  {
    id: "Varkesh",
    name: "狂気パック",
    description: "高火力・自己犠牲"
  },
  {
    id: "Knightsteel",
    name: "王国パック",
    description: "高耐久・回復"
  },
]
