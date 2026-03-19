"use client"
import { buildDamageStats } from "@/lib/battle/buildDamageStats"
import { useEffect, useRef, useState } from "react"
import { CounterPanel } from "@/components/CounterPanel"
import {
  startTurn,
  placeUnit,
  startBattleVs,
  sellUnitWithEquipments,
  equipFromStock,
  addSynergy,
  equipUnitWithCost,
  createGame,
  rerollHand,
} from "@/lib/game"
import { PlayerState, BattleLog, PackId, Unit, PreBattleState, GameState, BattleUnit} from "@/types"
import { Hand } from "@/components/Hand"
import { Board } from "@/components/Board"
import { DragItem } from "@/types/drag"
import { PACK_IDS } from "@/data/packs"
import { PackSelectScreen } from "@/components/PackSelectScreen"
import { UnitDetailOverlay, DetailTarget, DetailMode } from "@/components/UnitDetailOverlay"
import { PACK_UNITS } from "@/data/packs"
import { cpuTakeSetupTurn } from "@/lib/cpu/cpu"
import { BATTLE_COLS } from "@/lib/battle/boardsize"

export default function GameView() {
  /* =========================
     GameState（唯一の正）
  ========================= */
  const [game, setGame] = useState<GameState | null>(null)
  const [battleCounters, setBattleCounters] = useState<Record<string, number>>({})
  const [battleBoard, setBattleBoard] = useState<BattleUnit[] | null>(null)
  const [damageSide, setDamageSide] = useState<"p1" | "p2">("p1")
  const [detailOverlay, setDetailOverlay] = useState<{
    target: DetailTarget
    mode: DetailMode
    x: number
    y: number
  } | null>(null)

  const [visualEvents, setVisualEvents] = useState<
    {
      id: string
      type: "damage" | "death" | "heal"
      value?: number
    }[]
  >([])

  const [preBattle, setPreBattle] = useState<PreBattleState>({
    p1Pack: null,
    p2Pack: null,
    phase: "packSelect",
  })

  function getAvailablePacks(preBattle: PreBattleState): PackId[] {
    return PACK_IDS.filter((id) => id !== preBattle.p1Pack)
  }

  const [resultSide, setResultSide] = useState<"p1" | "p2">("p1")
  const [dragItem, setDragItem] = useState<DragItem | null>(null)

  function handleReturnToPackSelect() {
    if (battleTimerRef.current !== null) {
      clearInterval(battleTimerRef.current)
      battleTimerRef.current = null
    }

    setGame(null)
    setBattleBoard(null)
    setBattleLogs([])
    setBattleCounters({})
    setVisualEvents([])

    setSelectedBoardIndex(null)
    setSelectedHandIndex(null)
    setDragItem(null)

    setGameOver(null)
    setPhase("setup")
    setShowEnemyBoard(false)

    setPreBattle({
      p1Pack: null,
      p2Pack: null,
      phase: "packSelect",
    })
  }
  /* =========================
     Battle Log 再生用 state
  ========================= */
  const [battleLogs, setBattleLogs] = useState<BattleLog[]>([])
  const battleTimerRef = useRef<number | null>(null)
  const logRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
  if (!logRef.current) return

  logRef.current.scrollTop = logRef.current.scrollHeight
}, [battleLogs])

  
  // コンポーネント破棄時に interval を止める（安全）
  useEffect(() => {
    return () => {
      if (battleTimerRef.current !== null) {
        clearInterval(battleTimerRef.current)
        battleTimerRef.current = null
      }
    }
  }, [])

  const [phase, setPhase] = useState<"setup" | "battle">("setup")
  const [showEnemyBoard, setShowEnemyBoard] = useState(false)
  const [showBattleLog, setShowBattleLog] = useState(false)

  const [selectedBoardIndex, setSelectedBoardIndex] = useState<number | null>(null)
  const [selectedHandIndex, setSelectedHandIndex] = useState<number | null>(null)

  const [gameOver, setGameOver] = useState<null | "win" | "lose">(null)
  const disabled = gameOver !== null

  function selectP2Pack(preBattle: PreBattleState): PackId {
    const available = getAvailablePacks(preBattle)
    return available[Math.floor(Math.random() * available.length)]
  }
  /* =========================
     Pack確定 → GameState生成
  ========================= */
  useEffect(() => {
  if (preBattle.p1Pack && preBattle.p2Pack) {
    setPreBattle(prev => ({
      ...prev,
      phase: "fusion"
    }))
  }
}, [preBattle.p1Pack, preBattle.p2Pack])
useEffect(() => {
  if (preBattle.phase !== "fusion") return

  const timer = setTimeout(() => {

    const g = createGame(preBattle.p1Pack!, preBattle.p2Pack!)

    setPhase("setup")
    setGameOver(null)
    setShowEnemyBoard(false)
    setSelectedBoardIndex(null)
    setSelectedHandIndex(null)
    setBattleBoard(null)
    setBattleLogs([])

    setGame(g)

    setPreBattle(prev => ({
      ...prev,
      phase: "ready"
    }))

  }, 2000) // ←ここが演出時間

  return () => clearTimeout(timer)
}, [preBattle.phase])

  useEffect(() => {
    if (preBattle.phase === "p2Selecting" && preBattle.p1Pack && !preBattle.p2Pack) {
      const aiPack = selectP2Pack(preBattle)
      setPreBattle((prev) => ({
        ...prev,
        p2Pack: aiPack,
      }))
    }
  }, [preBattle.phase, preBattle.p1Pack, preBattle.p2Pack])

  function selectP1Pack(packId: PackId) {
    setPreBattle((prev) => ({
      ...prev,
      p1Pack: packId,
      phase: "p2Selecting",
    }))
  }

  /* =========================
     reroll（GameState版）
  ========================= */
  function handleReroll() {
    if (phase !== "setup") return
    if (disabled) return
    if (!game) return

    const g = structuredClone(game)
    const ok = rerollHand(g, g.p1)
    if (!ok) return

    setGame(g)
  }

  /* =========================
     配置処理
  ========================= */
  function handlePlace(boardIndex: number) {
    if (selectedHandIndex === null) return
    if (disabled) return
    if (!game) return
    if (showEnemyBoard) return

    const g = structuredClone(game)
    const ok = placeUnit(g.p1, selectedHandIndex, boardIndex)
    if (!ok) return

    setGame(g)
    setSelectedHandIndex(null)
  }

  /* =========================
     ユニット移動処理
  ========================= */
  function handleMove(boardIndex: number) {
    if (selectedBoardIndex === null) return
    if (disabled) return
    if (!game) return
    if (showEnemyBoard) return

    if (selectedBoardIndex === boardIndex) {
      setSelectedBoardIndex(null)
      return
    }

    const g = structuredClone(game)
    const a = g.p1.board[selectedBoardIndex]
    const b = g.p1.board[boardIndex]

    g.p1.board[selectedBoardIndex] = b
    g.p1.board[boardIndex] = a

    // ★pos更新
    // ★pos更新
if (a) {
  a.pos = {
    r: Math.floor(boardIndex / BATTLE_COLS),
    c: boardIndex % BATTLE_COLS
  }
}

if (b) {
  b.pos = {
    r: Math.floor(selectedBoardIndex / BATTLE_COLS),
    c: selectedBoardIndex % BATTLE_COLS
  }
}
    setGame(g)
    setSelectedBoardIndex(null)
  }

  function handleDropAt(boardIndex: number) {
    if (!dragItem) return
    if (disabled) return
    if (!game) return
    if (showEnemyBoard) return

    // ===== 手札 → 盤面 =====
    if (dragItem.type === "hand") {
      const handIndex = dragItem.handIndex
      const targetUnit = game.p1.board[boardIndex]

      // ① 空マス → 配置
      if (!targetUnit) {
        const g = structuredClone(game)
        const ok = placeUnit(g.p1, handIndex, boardIndex)
        if (!ok) return

        setGame(g)
        setSelectedHandIndex(null)
        setDragItem(null)
        return
      }

      // ② ユニットあり → 装備
      if (targetUnit) {
        const g = structuredClone(game)
        const ok = equipUnitWithCost(g.p1, handIndex, boardIndex)
        if (!ok) return

        setGame(g)
        setSelectedHandIndex(null)
        setDragItem(null)
        return
      }
    }

    // ===== 盤面 → 盤面 =====
    if (dragItem.type === "board") {
  const from = dragItem.boardIndex
  const to = boardIndex
  if (from === to) return

  const g = structuredClone(game)
  const temp = g.p1.board[from]
  g.p1.board[from] = g.p1.board[to]
  g.p1.board[to] = temp

  if (g.p1.board[to]) {
    g.p1.board[to]!.pos = {
      r: Math.floor(to / BATTLE_COLS),
      c: to % BATTLE_COLS
    }
  }

  if (g.p1.board[from]) {
    g.p1.board[from]!.pos = {
      r: Math.floor(from / BATTLE_COLS),
      c: from % BATTLE_COLS
    }
  }

  setGame(g)
  setSelectedBoardIndex(null)
  setDragItem(null)
  return
}

    // ===== ストック → 装備 =====
    if (dragItem.type === "stock") {
      const g = structuredClone(game)
      const ok = equipFromStock(g.p1, dragItem.stockIndex, boardIndex)
      if (!ok) return

      setGame(g)
      setDragItem(null)
      setSelectedBoardIndex(null)
      return
    }
  }
  

  /* =========================
     戦闘開始
  ========================= */
function handleBattleStart() {
  if (!game) return

  const g = structuredClone(game)

  setBattleCounters({})

    const p1 = g.p1
    const p2 = g.p2

     // 🔥 CPUがこのターンのsetupを実行
  cpuTakeSetupTurn(g, g.p2, g.p1)

// ★ここ追加
for (let i = 0; i < p1.board.length; i++) {
  const u = p1.board[i]
  if (!u) continue

  u.pos = {
  r: Math.floor(i / BATTLE_COLS),
  c: i % BATTLE_COLS
}

u.prevPos = { ...u.pos }
}

for (let i = 0; i < p2.board.length; i++) {
  const u = p2.board[i]
  if (!u) continue

  u.pos = {
  r: Math.floor(i / BATTLE_COLS),
  c: i % BATTLE_COLS
}

u.prevPos = { ...u.pos }
}
  

  // 戦闘前リセット
  p1.battleResult = null
  p2.battleResult = null


  const result = startBattleVs(g, p1, p2)

  setBattleBoard(
  (result.initialBoard ?? []).filter(
    (u): u is BattleUnit => u !== null
  )
)
  // 反映
  setGame(g)




  setPhase("battle")
  setResultSide("p1")

  if (battleTimerRef.current !== null) {
    clearInterval(battleTimerRef.current)
    battleTimerRef.current = null
  }

  setBattleLogs([])

  const sourceLogs = p1.lastBattleLogs ?? []
  let i = 0

  if (sourceLogs.length === 0) return

  function applyBattleDamage() {
    const baseTurn = p1.turn

    const damage =
      result.winner === "p1"
        ? result.p1Survivors + baseTurn
        : result.p2Survivors + baseTurn

    if (result.winner === "p1") {
      p2.hp -= damage
    } else {
      p1.hp -= damage
    }

    if (p1.hp <= 0) setGameOver("lose")
    if (p2.hp <= 0) setGameOver("win")
  }

  function handleNextTurn() {
    const ng = structuredClone(g)

     // 🔥 ここ追加（HPリセット）
  ng.p1.board.forEach(u => {
    if (!u) return
    u.hp = u.maxHp
  })

  ng.p2.board.forEach(u => {
    if (!u) return
    u.hp = u.maxHp
  })

    // 次ターン処理（両者）
    startTurn(ng, ng.p1)
    startTurn(ng, ng.p2)

    cpuTakeSetupTurn(ng, ng.p2, ng.p1)

    setGame(ng)

    setBattleBoard(null)
    setPhase("setup")

    if (battleTimerRef.current !== null) {
      clearInterval(battleTimerRef.current)
      battleTimerRef.current = null
    }

    setBattleLogs([])
  }

  battleTimerRef.current = window.setInterval(() => {
    if (i >= sourceLogs.length) {
      clearInterval(battleTimerRef.current!)

      applyBattleDamage()
      handleNextTurn()
      return
    }
    const currentTime = sourceLogs[i].time
    const batch: BattleLog[] = []

    while (i < sourceLogs.length && sourceLogs[i].time === currentTime) {
      batch.push(sourceLogs[i])
      i++
    }

    setBattleLogs((prev) => [...prev, ...batch])

    batch.forEach((next) => {

  /* =========================
     ダメージ表示（汎用）
  ========================= */
  if ((next as any).action === "counter") {

  // 🔥 これ追加
  if (next.side !== "p1") return

  const key = (next as any).key
  const value = (next as any).value ?? 1

  setBattleCounters(prev => ({
    ...prev,
    [key]: (prev[key] ?? 0) + value
  }))
}

  if (
  typeof next.instanceId === "string" &&
  (
    (next.action === "attack" && typeof next.damage === "number") ||
    (
      next.action === "damage" &&
      (
        typeof (next as any).damage === "number" ||
        typeof (next as any).value === "number"
      )
    )
  )
) {
  const targetId = next.instanceId

  const dmg =
    next.action === "attack"
      ? next.damage
      : (
          typeof (next as any).damage === "number"
            ? (next as any).damage
            : (next as any).value
        )

  setVisualEvents((prev) => [
    ...prev,
    { id: targetId, type: "damage", value: dmg } as any,
  ])

  setTimeout(() => {
    setVisualEvents((prev) =>
      prev.filter((v) => !(v.id === targetId && v.type === "damage"))
    )
  }, 400)
}

/* =========================
   回復表示
========================= */

if (
  (next as any).action === "heal" &&
  typeof next.instanceId === "string"
) {

  const heal = (next as any).value

  if (typeof heal === "number") {

    const targetId = next.instanceId

    setVisualEvents((prev) => [
      ...prev,
      { id: targetId, type: "heal", value: heal } as any,
    ])

    setTimeout(() => {
      setVisualEvents((prev) =>
        prev.filter((v) => !(v.id === targetId && v.type === "heal"))
      )
    }, 400)
  }
}
  /* =========================
     death
  ========================= */

  if (next.action === "death" && typeof next.instanceId === "string") {

    const deadId = next.instanceId

    setVisualEvents((prev) => [
      ...prev,
      { id: deadId, type: "death" },
    ])

    setTimeout(() => {

      setBattleBoard((prev) => {
        if (!prev) return prev
        return prev.filter((u) => u && u.instanceId !== deadId)
      })

      setVisualEvents((prev) =>
        prev.filter((v) => !(v.id === deadId && v.type === "death"))
      )

    }, 400)
  }
      if (
  next.action === "move" &&
  next.instanceId &&
  next.from &&
  next.to
) {

  const from = next.from
  const to = next.to

  setBattleBoard((prev) => {
  if (!prev) return prev

  const b = [...prev]

  const unit = b.find(
    u => u.instanceId === next.instanceId
  )

  if (!unit) return b

  unit.prevPos = next.from
  unit.pos = next.to


  return b
})
}
    })
  }, 300)
}

  /* =========================
     パック選択フェーズ
  ========================= */
  /* =========================
   パック選択フェーズ
========================= */
if (preBattle.phase === "packSelect" || preBattle.phase === "p2Selecting") {
  return (
    <PackSelectScreen
      selectedPack={preBattle.p1Pack}
      enemyPack={preBattle.p2Pack}
      disabledPacks={preBattle.p1Pack ? [preBattle.p1Pack] : []}
      onSelect={selectP1Pack}
    />
  )
}

/* =========================
   フュージョン演出
========================= */
if (preBattle.phase === "fusion") {
  return (
    <div
      style={{
        height: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        background:
          "radial-gradient(circle at center, #1a1a1a, #000)",
        color: "#fff",
        gap: 24,
      }}
    >
      <div style={{ fontSize: 28, opacity: 0.8 }}>
        Fusing Packs...
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: 32 }}>
        <img
          src={`./packs/${preBattle.p1Pack}.jpg`}
          style={{ width: 140, height: 180, borderRadius: 10 }}
        />

        <div style={{ fontSize: 36, fontWeight: 800 }}>+</div>

        <img
          src={`./packs/${preBattle.p2Pack}.jpg`}
          style={{ width: 140, height: 180, borderRadius: 10 }}
        />
      </div>

      <div style={{ fontSize: 20, fontWeight: 700 }}>
        {preBattle.p1Pack} × {preBattle.p2Pack}
      </div>

      <div style={{ opacity: 0.7 }}>
        Shared Card Pool Created
      </div>
    </div>
  )
}

/* =========================
   ready以降
========================= */
if (!game) return null

const player: PlayerState = game.p1
const enemy: PlayerState = game.p2
const sharedPool: Unit[] = game.sharedPool

  // Battle Log 表示用（フェーズで切り替え）
  const logsToShow = phase === "battle" ? battleLogs : player.lastBattleLogs
  const p1DamageStats = buildDamageStats(
  (logsToShow ?? []).filter(l => l.side === "p1")
)

const p2DamageStats = buildDamageStats(
  (logsToShow ?? []).filter(l => l.side === "p2")
)

const damageStats = damageSide === "p1"
  ? p1DamageStats
  : p2DamageStats
  const maxDamage =
  damageStats.length > 0
    ? Math.max(...damageStats.map(s => s.damage))
    : 1
  /* =========================
     画面
  ========================= */
  return (
    <div
      style={{
        width: "100vw",
        height: "100vh",
        display: "flex",
        flexDirection: "column",
        gridTemplateRows: "48px 1fr 128px",
        background: "#111",
        color: "#fff",
        overflow: "hidden",
      }}
    >
      {/* =========================
         上部バー
      ========================= */}
      <div
        style={{
          position: "absolute",
          top: 10,
          left: 20,
          right: 20,

          height: 48,

          display: "flex",
          alignItems: "center",

          padding: "0 16px",

          borderRadius: 12,

          border: "1px solid rgba(255,255,255,0.06)",
          zIndex: 5
        }}
      >
        <span>
          PP {player.pp} / {player.maxPP}
        </span>
        <span style={{ marginLeft: 16 }}>HP {player.hp}</span>
        <span style={{ marginLeft: 16, opacity: 0.7 }}>Enemy HP {enemy.hp}</span>
        <span style={{ marginLeft: 16 }}>Turn {player.turn}</span>
        <span style={{ marginLeft: 16 }}>
        Units {player.board.filter(u => u !== null).length} / {player.maxBoardUnits}
      </span>
        <span style={{ marginLeft: 16 }}>Phase: {phase}</span>

        <div style={{ marginLeft: "auto" }}>
          {phase === "setup" && (
            <button
              style={{
                padding: "6px 12px",
                borderRadius: 8,
                background: "#8b1e1e",
                border: "none",
                color: "#fff",
                cursor: "pointer",
              }}
              onClick={handleBattleStart}
              disabled={disabled}
            >
              BattleStart
            </button>
          )}

          <button style={{ marginLeft: 12 }} onClick={() => setShowEnemyBoard((v) => !v)}>
            {showEnemyBoard ? "My Board" : "Enemy's Board"}
          </button>
        </div>
      </div>

      {/* =========================
         メインエリア（左UI / 盤面 / 右UI）
      ========================= */}
      <div
        style={{
          position: "relative",
          width: "100%",
          height: "100%",
          flex: 1,
          minHeight: 0,
          gap: 0,
          overflow: "hidden",
          alignItems: "stretch",
          backgroundImage: `
            url('./board/arena.png')
            `,
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
                  }}
      >
        {/* =========================
           左パネル：Synergy / Equipment
        ========================= */}
        <div
        style={{
          position: "absolute",
          left: 20,
          top: 80,
          width: 220,
          bottom: 240,

          display: "flex",
          flexDirection: "column",

          color: "#fff",
          textShadow: "0 2px 6px rgba(0,0,0,0.9)"
        }}
        >
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              height: "100%",
              padding: 12,
              boxSizing: "border-box",
              gap: 16,
            }}
          >
            {/* =========================
   Synergy
========================= */}
<div
  style={{
    padding: 8,
  }}
  onDragOver={(e) => e.preventDefault()}
  onDrop={() => {
    if (!dragItem) return
    if (dragItem.type !== "hand") return
    if (disabled) return
    if (!game) return
    const g = structuredClone(game)
    addSynergy(g, g.p1, dragItem.handIndex)
    setGame(g)
    setDragItem(null)
  }}
>
  <div
    style={{
      fontSize: 11,
      letterSpacing: 1,
      opacity: 0.7,
      marginBottom: 10,
      textTransform: "uppercase",
      textShadow: "0 2px 6px rgba(0,0,0,0.9)"
    }}
  >
    SYNERGY
  </div>

  {player.synergies.length === 0 ? (
    <div style={{ opacity: 0.35, fontSize: 12 }}>1 Synergy per turn (Free, Max 2)</div>
  ) : (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(2, 48px)",
        gap: 10,
      }}
    >
      {player.synergies.map((s, i) => {

        const sourceUnit = Object.values(PACK_UNITS)
          .flat()
          .find((u) => u.id === s.id)

        const synergyDetail = sourceUnit?.variants?.synergy

        return (
          <div
            key={i}
            onContextMenu={(e) => {
              e.preventDefault()
              if (!synergyDetail) return

              setDetailOverlay({
                target: { kind: "synergy", synergy: synergyDetail },
                mode: "synergy",
                x: e.clientX,
                y: e.clientY,
              })
            }}
            style={{
              width: 52,
              height: 52,

              clipPath:
                "polygon(25% 6%, 75% 6%, 100% 50%, 75% 94%, 25% 94%, 0% 50%)",

              background:
                "linear-gradient(180deg,#6ea8ff,#2b4b9a)",

              display: "flex",
              alignItems: "center",
              justifyContent: "center",

              color: "#fff",
              fontSize: 14,
              fontWeight: "bold",

              textShadow: "0 2px 6px rgba(0,0,0,0.9)",

              cursor: "pointer",
            }}
          >
            <img
              src={`./units/${s.id}.jpg`}
              draggable={false}
              onError={(ev) => {
                ;(ev.currentTarget as HTMLImageElement).src =
                  "./units/_placeholder.jpg"
              }}
              style={{
                width: "100%",
                height: "100%",
                objectFit: "cover",
                pointerEvents: "none"
              }}
            />
            
          </div>
                  )
                })}
              </div>
            )}
          </div>

            {/* =========================
   Equipment Stock
========================= */}
<div
  style={{
    flex: 1,
    display: "flex",
    flexDirection: "column",
    overflow: "hidden",
  }}
>
  <div
    style={{
      fontSize: 11,
      letterSpacing: 1,
      opacity: 0.7,
      marginBottom: 10,
      textTransform: "uppercase",
      textShadow: "0 2px 6px rgba(0,0,0,0.9)"
    }}
  >
    EQUIPMENT
  </div>

  {player.equipmentStock.length === 0 ? (

  <div
    style={{
      opacity: 0.4,
      fontSize: 11,
      lineHeight: 1.4,
      textAlign: "center",
      marginTop: 8,
    }}
  >
    Drag a unit onto another to turn it into equipment.
Stored here when sold. Reuse for free.
  </div>

) : (

  <div
    style={{
      display: "grid",
      gridTemplateColumns: "repeat(5, 52px)",
      gap: 8,
    }}
  >
    {player.equipmentStock.map((e, i) => {

      const canEquip =
        selectedBoardIndex !== null &&
        !disabled &&
        !showEnemyBoard

      return (
        <div
          key={i}
          draggable={!disabled}
          onDragStart={() =>
            !disabled &&
            setDragItem({ type: "stock", stockIndex: i })
          }
          onClick={() => {
            if (!canEquip) return
            if (!game) return

            const g = structuredClone(game)
            equipFromStock(g.p1, i, selectedBoardIndex!)
            setGame(g)
          }}
          onContextMenu={(ev) => {
            ev.preventDefault()

            setDetailOverlay({
              target: { kind: "equipment", equipment: e as any },
              mode: "equipment",
              x: ev.clientX,
              y: ev.clientY,
            })
          }}
          style={{
            width: 52,
            height: 52,
            clipPath:
              "polygon(25% 6%, 75% 6%, 100% 50%, 75% 94%, 25% 94%, 0% 50%)",
            background:
              "linear-gradient(180deg,#d8b15a,#6a4d18)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 13,
            fontWeight: "bold",
            color: "#fff",
            textShadow: "0 2px 6px rgba(0,0,0,0.9)",
            cursor: canEquip ? "pointer" : "default",
            opacity: canEquip ? 1 : 0.5,
            transition: "transform 0.1s",
          }}
        >
          <img
            src={`./units/${e.id}.jpg`}
            draggable={false}
            onError={(ev) => {
              ;(ev.currentTarget as HTMLImageElement).src =
                "./units/_placeholder.jpg"
            }}
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
              pointerEvents: "none"
            }}
          />
        </div>
      )
    })}
  </div>

)}
</div>
          </div>
        </div>
        {/* =========================
   中央：盤面
========================= */}
        <div
        style={{
          position: "absolute",
          left: "50%",
          top: "40%",
          transform: "translate(-50%, -50%)",

          width: "68vw",
          maxWidth: 1050,

          display: "flex",
          justifyContent: "center",
          alignItems: "center",

          padding: 20,

          borderRadius: 24,
        }}
      >
          {/* Setup */}
          {phase === "setup" && (
            <div style={{ width: "100%", display: "flex", justifyContent: "center" }}>
              <Board
                board={showEnemyBoard ? enemy.board : player.board}
                now={0}
                isBattle={false}
                dragItem={dragItem}
                disabled={showEnemyBoard || disabled}
                onPlace={handlePlace}
                onDropAt={handleDropAt}
                onMove={handleMove}
                visualEvents={visualEvents}
                onSelectUnit={setSelectedBoardIndex}
                selectedBoardIndex={selectedBoardIndex}
                selectedHandIndex={selectedHandIndex}
                onDragStart={(item) => {
                  if (!item) return
                  setDragItem(item)
                  if (item.type === "board") setSelectedBoardIndex(item.boardIndex)
                }}
                onDragEnd={() => {
                  setDragItem(null)
                  setSelectedBoardIndex(null)
                }}
                onRightClickUnit={(unit, x, y) => {
                  setDetailOverlay({
                    target: { kind: "battleUnit", battleUnit: unit },
                    mode: "board",
                    x,
                    y,
                  })
                }}
                canPlace={() => {
                  if (showEnemyBoard) return false
                  if (disabled) return false
                  if (selectedHandIndex === null) return false
                  const unit = player.hand[selectedHandIndex]
                  if (!unit) return false
                  return player.pp >= unit.cost
                }}
              />
            </div>
          )}

          {/* Battle */}
          {phase === "battle" && (
            <div
              style={{
                width: "100%",
                height: "100%",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  width: "100%",
                  maxWidth: 960,
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "center",
                  alignItems: "center",
                  perspective: "1200px",
                  gap: 0,
                }}
              >
                <div style={{ opacity: 0.85, filter: "brightness(0.9)" }}>
                  <Board
                    board={(battleBoard ?? []).filter(
                      (u): u is BattleUnit => u !== null
                    )}
                    isBattle
                    disabled
                    visualEvents={visualEvents}
                    onPlace={() => {}}
                    onDropAt={() => {}}
                    onMove={() => {}}
                    onDragStart={() => {}}
                    onSell={() => {}}
                    onSelectUnit={() => {}}
                    selectedHandIndex={null}
                    selectedBoardIndex={null}
                    canPlace={() => false}
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* =========================
           右：Battle Log
        ========================= */}
        <div
          style={{
            position: "absolute",
            right: 20,
            top: 80,
            width: 260,
            bottom: 240,

            display: "flex",
            flexDirection: "column",

            padding: 16,
            borderRadius: 12,

          
          }}
        >
          <div>
{/* =========================
   Damage Meter
========================= */}
<div
  style={{
    marginBottom: 12,
    background: "#0f0f0f",
    border: "1px solid #333",
    borderRadius: 6,
    padding: 8,
    fontSize: 12
  }}
>
  <div
  style={{
    display: "flex",
    gap: 4,
    marginBottom: 6
  }}
>
  <button
    onClick={() => setDamageSide("p1")}
    style={{
      flex: 1,
      background: damageSide === "p1" ? "#444" : "#222",
      color: "#fff",
      border: "none",
      borderRadius: 4,
      padding: 4,
      cursor: "pointer"
    }}
  >
    P1
  </button>

  <button
    onClick={() => setDamageSide("p2")}
    style={{
      flex: 1,
      background: damageSide === "p2" ? "#444" : "#222",
      color: "#fff",
      border: "none",
      borderRadius: 4,
      padding: 4,
      cursor: "pointer"
    }}
  >
    P2
  </button>
</div>
  <div style={{ opacity: 0.7, marginBottom: 8 }}>
    DAMAGE
  </div>

  {damageStats.length === 0 ? (
    <div style={{ opacity: 0.5 }}>No Result</div>
  ) : (
    damageStats.map((s) => {

      const width = (s.damage / maxDamage) * 100

      return (
        <div
          key={s.id}
          style={{ marginBottom: 6 }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              marginBottom: 2
            }}
          >
            <span>{s.name}</span>
            <span>{s.damage}</span>
          </div>

          <div
            style={{
              height: 6,
              background: "#222",
              borderRadius: 3,
              overflow: "hidden"
            }}
          >
            <div
              style={{
                width: `${width}%`,
                height: "100%",
                background:
                  "linear-gradient(90deg,#ff9f43,#ff4757)"
              }}
            />
          </div>
        </div>
      )
    })
  )}
</div>
            
            
          </div>
        </div>
      </div>

      {/* =========================
         下段：Sell + Hand + Reroll
      ========================= */}
      {phase === "setup" && !showEnemyBoard && (
        <div
          style={{
            position: "absolute",
            left: 0,
            right: 0,
            bottom: 0,

            height: 220,

            background: "transparent",

            display: "flex",
            alignItems: "stretch",
            paddingRight: 24,
            flexShrink: 0,
          }}
        >
          {/* ===== Sell + Reroll ===== */}
          {phase === "setup" && !showEnemyBoard && (
            <div style={{ 
              width: 240, 
              display: "flex", 
              flexDirection: "column", 
              marginRight: 8 }}>
              {/* Sell */}
              <div
                onDragOver={(e) => e.preventDefault()}
                onDrop={() => {
                  if (!dragItem || dragItem.type !== "board") return
                  if (!game) return
                  const g = structuredClone(game)
                  sellUnitWithEquipments(g, g.p1, dragItem.boardIndex)
                  setGame(g)
                  setDragItem(null)
                }}
                style={{
                  flex: 1,
                  background: "rgba(90,0,0,0.85)",
                  borderBottom: "1px solid #400",
                  color: "#ffb3b3",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontWeight: "bold",
                  fontSize: 18,
                  userSelect: "none",
                }}
              >
                Sell
              </div>

              {/* Reroll */}
              <div
                onClick={handleReroll}
                style={{
                  flex: 1,
                  background: "#2a2a2a",
                  borderTop: "1px solid #444",
                  color: "#fff",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 4,
                  fontSize: 18,
                  cursor: player.rerollCharges > 0 || player.pp >= 1 ? "pointer" : "not-allowed",
                  opacity: player.rerollCharges > 0 || player.pp >= 1 ? 1 : 0.4,
                }}
              >
                <div style={{ fontWeight: "bold" }}>Reroll</div>
                <div>
                 {player.rerollCharges} / {player.maxRerollCharges}
                </div>
              </div>
            </div>
          )}

          {/* ===== Hand ===== */}
          <div style={{ 
            flex: 1, 
            display: "flex", 
            alignItems: "flex-end", 
            overflow: "visible",
            paddingTop: 20, 
            marginLeft: 8 }}>
            <Hand
              hand={player.hand}
              selectedIndex={selectedHandIndex}
              onSelect={setSelectedHandIndex}
              selectedBoardIndex={selectedBoardIndex}
              onEquip={(handIndex, boardIndex) => {
                if (boardIndex === null) return
                if (disabled) return
                if (!game) return
                if (showEnemyBoard) return
                const g = structuredClone(game)
                equipUnitWithCost(g.p1, handIndex, boardIndex)
                setGame(g)
              }}
              onRightClickUnit={(unit, x, y) => {
                setDetailOverlay({
                  target: { kind: "unit", unit },
                  mode: "hand",
                  x,
                  y,
                })
              }}
              onDragStart={setDragItem}
              disabled={disabled}
            />
          </div>
        </div>
      )}

      {detailOverlay && (
        <UnitDetailOverlay
          target={detailOverlay.target}
          mode={detailOverlay.mode}
          x={detailOverlay.x}
          y={detailOverlay.y}
          onClose={() => setDetailOverlay(null)}
        />
      )}

      {/* =========================
         Game Over Overlay
      ========================= */}
      {gameOver && (
  <div
    style={{
      position: "absolute",
      inset: 0,
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      fontSize: 48,
      background: "rgba(0,0,0,0.6)",
      zIndex: 999,
      gap: 20,
    }}
  >
    <div>{gameOver === "win" ? "WIN" : "LOSE"}</div>

    <button
      onClick={handleReturnToPackSelect}
      style={{
        fontSize: 18,
        padding: "10px 20px",
        borderRadius: 8,
        background: "#222",
        color: "#fff",
        border: "1px solid #555",
        cursor: "pointer",
      }}
    >
      Rematch
    </button>
  </div>
)}
      <CounterPanel player={player} battleCounters={battleCounters} />
    </div>
  )
}
