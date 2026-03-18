import type { GameState, PlayerState, BattleUnit, Unit, Ability } from "@/types"
import {
  placeUnit,
  equipUnitWithCost,
  addSynergy,
  sellUnitWithEquipments,
  rerollHand,
} from "@/lib/game"
import { getRowByIndex } from "@/lib/board"

type CpuAction =
  | { kind: "place"; handIndex: number; boardIndex: number }
  | { kind: "equip"; handIndex: number; boardIndex: number }
  | { kind: "synergy"; handIndex: number }
  | { kind: "sell"; boardIndex: number }
  | { kind: "reroll" }
  | { kind: "pass" }

type CpuOptions = {
  maxSteps?: number
  allowSell?: boolean
  allowReroll?: boolean
  minImprove?: number
  searchDepth?: number
  beamWidth?: number
}

/* =========================
   Public API
========================= */

export function cpuTakeSetupTurn(
  g: GameState,
  cpu: PlayerState,
  enemy: PlayerState,
  opt: CpuOptions = {}
) {
  const maxSteps = opt.maxSteps ?? 24
  const allowSell = opt.allowSell ?? true
  const allowReroll = opt.allowReroll ?? true
  const minImprove = opt.minImprove ?? 0.2
  const searchDepth = opt.searchDepth ?? 2
  const beamWidth = opt.beamWidth ?? 4

  if (!cpu.hand) cpu.hand = []
  if (!cpu.board) return

  for (let step = 0; step < maxSteps; step++) {
    const currentScore = evaluatePosition(g, cpu, enemy)

    const plan = findBestPlan(g, cpu, enemy, {
      allowSell,
      allowReroll,
      depth: searchDepth,
      beamWidth,
    })

    if (!plan.actions.length) break
    if (plan.score - currentScore < minImprove) break

    const ok = applyAction(g, cpu, plan.actions[0])
    if (!ok) break
  }
}

/* =========================
   Search
========================= */

function findBestPlan(
  g: GameState,
  cpu: PlayerState,
  enemy: PlayerState,
  opt: {
    allowSell: boolean
    allowReroll: boolean
    depth: number
    beamWidth: number
  }
): { score: number; actions: CpuAction[] } {
  type Node = {
    game: GameState
    cpu: PlayerState
    enemy: PlayerState
    score: number
    actions: CpuAction[]
  }

  let beam: Node[] = [
    {
      game: structuredClone(g),
      cpu: structuredClone(cpu),
      enemy: structuredClone(enemy),
      score: evaluatePosition(g, cpu, enemy),
      actions: [],
    },
  ]

  let best = beam[0]

  for (let depth = 0; depth < opt.depth; depth++) {
    const nextBeam: Node[] = []

    for (const node of beam) {
      const actions = enumerateActions(
        node.game,
        node.cpu,
        opt.allowSell,
        opt.allowReroll
      )

      actions.push({ kind: "pass" })

      for (const action of actions) {
        const sim = structuredClone(node.game)
        const simCpu = sim.p2
        const simEnemy = sim.p1

        const ok = applyAction(sim, simCpu, action)
        if (!ok) continue

        const score = evaluatePosition(sim, simCpu, simEnemy)

        const candidate: Node = {
          game: sim,
          cpu: simCpu,
          enemy: simEnemy,
          score,
          actions: [...node.actions, action],
        }

        nextBeam.push(candidate)

        if (candidate.score > best.score) {
          best = candidate
        }
      }
    }

    nextBeam.sort((a, b) => b.score - a.score)
    beam = nextBeam.slice(0, opt.beamWidth)

    if (beam.length === 0) break
  }

  return {
    score: best.score,
    actions: best.actions,
  }
}

/* =========================
   Action enumeration
========================= */

function enumerateActions(
  g: GameState,
  cpu: PlayerState,
  allowSell: boolean,
  allowReroll: boolean
): CpuAction[] {
  const out: CpuAction[] = []

  for (let hi = 0; hi < cpu.hand.length; hi++) {
    const card = cpu.hand[hi]
    if (!card) continue

    if (!cpu.synergyUsedThisTurn) {
      out.push({ kind: "synergy", handIndex: hi })
    }

    for (let bi = 0; bi < cpu.board.length; bi++) {
      if (cpu.board[bi]) continue
      if (cpu.pp < card.cost) continue

      const row = getRowByIndex(bi)
      if (card.placement === "front_only" && row !== "front") continue

      out.push({ kind: "place", handIndex: hi, boardIndex: bi })
    }

    for (let bi = 0; bi < cpu.board.length; bi++) {
      const target = cpu.board[bi]
      if (!target) continue
      if (cpu.pp < card.cost) continue
      if ((target.equipments?.length ?? 0) >= 3) continue

      out.push({ kind: "equip", handIndex: hi, boardIndex: bi })
    }
  }

  if (allowSell) {
    for (let bi = 0; bi < cpu.board.length; bi++) {
      if (!cpu.board[bi]) continue
      out.push({ kind: "sell", boardIndex: bi })
    }
  }

  if (allowReroll) {
    const canReroll = (cpu.rerollCharges ?? 0) > 0 || cpu.pp >= 1
    if (canReroll) out.push({ kind: "reroll" })
  }

  return dedupeActions(out)
}

function dedupeActions(actions: CpuAction[]): CpuAction[] {
  const seen = new Set<string>()
  const out: CpuAction[] = []

  for (const a of actions) {
    const key = JSON.stringify(a)
    if (seen.has(key)) continue
    seen.add(key)
    out.push(a)
  }

  return out
}

function applyAction(g: GameState, cpu: PlayerState, a: CpuAction): boolean {
  switch (a.kind) {
    case "place":
      return placeUnit(cpu, a.handIndex, a.boardIndex)

    case "equip":
      return equipUnitWithCost(cpu, a.handIndex, a.boardIndex)

    case "synergy":
      return addSynergy(g, cpu, a.handIndex)

    case "sell":
      return sellUnitWithEquipments(g, cpu, a.boardIndex)

    case "reroll":
      return rerollHand(g, cpu)

    case "pass":
      return true

    default:
      return false
  }
}

/* =========================
   Evaluation
========================= */

function evaluatePosition(g: GameState, cpu: PlayerState, enemy: PlayerState): number {
  const myBoard = evaluateBoard(cpu, enemy)
  const oppBoard = evaluateBoard(enemy, cpu)
  const myHand = evaluateHand(cpu)
  const economy = evaluateEconomy(cpu)
  const hero = evaluateHeroProgress(cpu)
  const curve = evaluateCurve(cpu)

  return (
    myBoard * 1.2
    - oppBoard * 0.95
    + myHand * 0.35
    + economy
    + hero
    + curve
  )
}

function evaluateEconomy(p: PlayerState): number {
  let score = 0

  score += Math.min(p.pp, 3) * 0.22
  score += Math.min(p.rerollCharges ?? 0, 2) * 0.2

  return score
}

function evaluateCurve(p: PlayerState): number {
  let score = 0
  const unitCount = p.board.filter(Boolean).length

  if (unitCount < p.maxBoardUnits) {
    score -= (p.maxBoardUnits - unitCount) * 1.8
  }

  if (p.pp === 0 && unitCount > 0) {
    score += 0.6
  }

  return score
}

function evaluateHeroProgress(p: PlayerState): number {
  let score = 0
  if (p.pendingHero) score += 4
  if (p.activeHeroThisTurn) score += 5
  return score
}

function evaluateHand(p: PlayerState): number {
  let score = 0

  for (const c of p.hand) {
    if (!c) continue

    score += estimateCardValue(c) * 0.35

    if (c.mode === "hero") score += 8
    if (c.cost <= p.pp) score += 0.8
  }

  return score
}

function evaluateBoard(self: PlayerState, enemy: PlayerState): number {
  let score = 0
  const units = self.board.filter((u): u is BattleUnit => u !== null)

  for (let i = 0; i < units.length; i++) {
    const u = units[i]

    const atk = u.baseAtk ?? u.atk ?? 0
    const hp = u.baseMaxHp ?? u.maxHp ?? u.hp ?? 0
    const as = u.baseAttackSpeed ?? u.attackSpeed ?? 0
    const dr = sumState(u, "damage_reduce")
    const rangeScore = rangeValue(u.attackRange)

    score += atk * 1.55
    score += hp * 1.25
    score += as * 1.1
    score += dr * 1.6
    score += rangeScore * 0.7

    score += rolePlacementScore(u)
    score += formationScore(self, u, i)
    score += equipmentScore(u)
    score += abilityScore(u)
  }

  score += units.length * 2.2
  score += (self.synergies?.length ?? 0) * 2.4

  score += frontlineScore(self)
  score += backlineProtectionScore(self)
  score += matchupScore(self, enemy)

  return score
}

/* =========================
   Fine-grained scoring
========================= */

function estimateCardValue(card: Unit): number {
  let score = 0

  score += (card.atk ?? 0) * 1.4
  score += (card.hp ?? 0) * 1.2
  score += rangeValue(card.attackRange) * 0.7
  score += abilityListScore(card.abilities ?? []) * 0.8

  if (card.mode === "hero") score += 10
  if (card.mode === "equipment") score += 3.5
  if (card.mode === "synergy") score += 4.0

  const efficiency = card.cost > 0 ? score / card.cost : score
  return score + efficiency * 0.6
}

function rolePlacementScore(u: BattleUnit): number {
  let score = 0

  if (u.role === "tank" && u.row === "front") score += 2.8
  if (u.role === "bruiser" && u.row === "front") score += 1.6
  if (u.role === "skirmisher" && u.row === "front") score += 0.9
  if ((u.role === "ranged" || u.role === "support") && u.row === "back") score += 2.1

  if ((u.role === "ranged" || u.role === "support") && u.row === "front") score -= 2.6
  if (u.role === "tank" && u.row === "back") score -= 1.8

  return score
}

function formationScore(self: PlayerState, u: BattleUnit, index: number): number {
  let score = 0

  const col = index % 4
  const sameColFront = index - 4 >= 0 ? self.board[index - 4] : null
  const sameColBack = index + 4 < self.board.length ? self.board[index + 4] : null

  if ((u.role === "ranged" || u.role === "support") && sameColFront) {
    score += 1.4
  }

  if (u.role === "tank" && sameColBack) {
    score += 0.8
  }

  if (u.role === "tank" && (col === 1 || col === 2)) {
    score += 0.5
  }

  return score
}

function equipmentScore(u: BattleUnit): number {
  const eqCount = u.equipments?.length ?? 0
  let score = eqCount * 1.1

  if (u.role === "ranged" && eqCount > 0) score += 0.5

  return score
}

function abilityScore(u: BattleUnit): number {
  return abilityListScore(u.abilities ?? [])
}

function abilityListScore(abilities: Ability[]): number {
  let score = 0

  for (const a of abilities) {
    const trigger = a.trigger ?? ""

    if (trigger === "battleStart") score += 1.0
    if (trigger === "onAttack") score += 1.5
    if (trigger === "onKill") score += 1.2
    if (trigger === "onDeath") score += 1.0
    if (trigger === "auraTick") score += 1.4

    const effects = (a.effects ?? []) as any[]

    for (const e of effects) {
      const type = e.type ?? e.kind

      if (type === "DAMAGE" || type === "damage") score += 2.0
      if (type === "HEAL" || type === "heal") score += 1.2
      if (type === "ADD_STATE" || type === "add_state") score += 1.2
      if (type === "SUMMON" || type === "summon") score += 2.0
      if (type === "MOD_STAT" || type === "stat_mod") score += 1.3
      if (type === "SET_ATTACK_RANGE" || type === "set_attack_range") score += 0.8
      if (type === "SELF_DAMAGE" || type === "self_damage") score -= 0.5

      if (e.target === "all_enemies") score += 1.6
      if (e.target === "all_allies") score += 1.0
      if (e.target === "random_enemy") score += 0.5

      if (typeof e.value === "number") {
        score += Math.min(e.value, 6) * 0.25
      }
    }

    if ((a as any).once) score -= 0.15
  }

  return score
}

function frontlineScore(p: PlayerState): number {
  let front = 0
  let back = 0

  for (let i = 0; i < p.board.length; i++) {
    const u = p.board[i]
    if (!u) continue
    if (u.row === "front") front++
    else back++
  }

  if (front === 0 && back > 0) return -4
  if (front >= 2) return 1.4
  return 0
}

function backlineProtectionScore(p: PlayerState): number {
  let score = 0

  for (let i = 0; i < p.board.length; i++) {
    const u = p.board[i]
    if (!u) continue

    if (u.role === "ranged" || u.role === "support") {
      const protectorIndex = i - 4
      if (protectorIndex >= 0 && p.board[protectorIndex]) {
        score += 1.2
      } else {
        score -= 1.0
      }
    }
  }

  return score
}

function matchupScore(self: PlayerState, enemy: PlayerState): number {
  const myUnits = self.board.filter((u): u is BattleUnit => u !== null)
  const oppUnits = enemy.board.filter((u): u is BattleUnit => u !== null)

  let score = 0

  const myFront = myUnits.filter(u => u.row === "front").length
  const oppFront = oppUnits.filter(u => u.row === "front").length

  if (oppFront === 0 && myFront > 0) score += 1.2
  if (myFront === 0 && oppFront > 0) score -= 1.8

  const myRange = myUnits.reduce((s, u) => s + rangeValue(u.attackRange), 0)
  const oppRange = oppUnits.reduce((s, u) => s + rangeValue(u.attackRange), 0)

  score += (myRange - oppRange) * 0.18

  return score
}

function rangeValue(v: number): number {
  if (v === 1) return 1
  if (v === 2) return 2
  if (v >= 3) return 3
  return 1
}
function sumState(u: BattleUnit, type: string): number {
  if (!u.states?.length) return 0

  let s = 0
  for (const st of u.states) {
    if (st.type === type && typeof st.value === "number") {
      s += st.value
    }
  }
  return s
}