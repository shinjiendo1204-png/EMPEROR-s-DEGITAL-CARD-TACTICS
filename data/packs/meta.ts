export type PackID = "Antiqua" | "Varkesh" | "Nightsteel"

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
    name: "パック",
    description: "高火力・自己犠牲"
  },
  {
    id: "Nightsteel",
    name: "忍者と侍の国",
    description: "高耐久・回復"
  },
]
