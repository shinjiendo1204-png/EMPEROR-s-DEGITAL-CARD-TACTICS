"use client"
import BattleCanvas from "@/components/pixi/BattleCanvas"
import { buildDamageStats } from "@/lib/battle/buildDamageStats"
import { useEffect, useRef, useState } from "react"
import { CounterPanel } from "@/components/CounterPanel"
import{ CardListOverlay } from "@/components/CardListOverlay"
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
import { PlayerState, BattleLog, PackId, Unit, PreBattleState, GameState, BattleUnit,} from "@/types"
import { Hand } from "@/components/Hand"
import { Board } from "@/components/Board"
import { DragItem } from "@/types/drag"
import { PACK_IDS } from "@/data/packs"
import { PackSelectScreen } from "@/components/PackSelectScreen"
import { UnitDetailOverlay, DetailTarget, DetailMode } from "@/components/UnitDetailOverlay"
import { PACK_UNITS } from "@/data/packs"
import { cpuTakeSetupTurn } from "@/lib/cpu/cpu"
import { BATTLE_COLS } from "@/lib/battle/boardsize"
import { calculateFinalStats } from "@/lib/battle/statCalculator"
export default function GameView() {
  /* =========================
     GameState
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

  const processedIds = useRef<Set<string>>(new Set())
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
const [viewingPackId, setViewingPackId] = useState<PackId | null>(null);

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

  const [selectedBoardIndex, setSelectedBoardIndex] = useState<number | null>(null)
  const [selectedHandIndex, setSelectedHandIndex] = useState<number | null>(null)
  const [battleNow, setBattleNow] = useState(0)
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

  // 🚩 【最重要】前回の戦闘の重複チェック記録をリセット
  // これにより、2戦目以降で同じバフ（ログ）が来ても無視されずに処理されます
  processedIds.current.clear()

  // 1. ゲーム状態のコピーとリセット
  const g = structuredClone(game)
  setBattleCounters({})
  const p1 = g.p1
  const p2 = g.p2

  // 2. CPUのセットアップ実行
  cpuTakeSetupTurn(g, g.p2, g.p1)

  // 3. ユニット座標の同期
  const updateUnitPos = (player: any) => {
    for (let i = 0; i < player.board.length; i++) {
      const u = player.board[i]
      if (!u) continue
      u.pos = {
        r: Math.floor(i / BATTLE_COLS),
        c: i % BATTLE_COLS
      }
      u.prevPos = { ...u.pos }
    }
  }
  updateUnitPos(p1)
  updateUnitPos(p2)

  // 4. 戦闘前リセット
  p1.battleResult = null
  p2.battleResult = null

  // 5. シミュレーション実行
  const result = startBattleVs(g, p1, p2)

  // 6. Pixi表示用の初期ボード確定
  if (result.initialBoard) {
    const finalizedBoard = structuredClone(result.initialBoard)
    // 初期表示時も計算機を通してバフを反映
    finalizedBoard.forEach(u => {
      if (u) {
        const final = calculateFinalStats(u, 0)
        // ✅ 修正: ?? を使って undefined の場合に base 値を代入するようにする
      u.atk = final.atk ?? u.baseAtk ?? 0
      u.maxHp = final.maxHp ?? u.baseMaxHp ?? 0
      
      // 初期状態なので hp も maxHp に合わせておく
      u.hp = u.maxHp
      }
    })
    setBattleBoard(finalizedBoard.filter((u): u is BattleUnit => u !== null))
  }

  // 7. Reactステート更新
  setGame(g)
  setPhase("battle")
  setResultSide("p1")

  // 8. 既存タイマークリア
  if (battleTimerRef.current !== null) {
    clearInterval(battleTimerRef.current)
    battleTimerRef.current = null
  }

  setBattleLogs([])
  const sourceLogs = p1.lastBattleLogs ?? []
  if (sourceLogs.length === 0) return

  let i = 0
  // 9. ダメージ適用処理
  function applyBattleDamage() {
    const baseTurn = p1.turn
    const damage = result.winner === "p1"
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

  // 10. 次のターン（配置フェーズ）への移行
  function handleNextTurn() {
  const ng = structuredClone(g)
  
  const restoreUnitAfterBattle = (board: (BattleUnit | null)[]) => {
    board.forEach(u => {
      if (!u) return
      
      // 配置フェーズ用の永続ステータスで再計算
      const permanentStats = calculateFinalStats(u, 0)
      
      // ✅ 修正: すべてに対してデフォルト値を設定
      u.maxHp = permanentStats.maxHp ?? u.baseMaxHp ?? 0
      
      // 🚩 エラー箇所: u.hp = u.maxHp (u.maxHp が undefined の可能性を排除済み)
      u.hp = u.maxHp 
      
      u.atk = permanentStats.atk ?? u.baseAtk ?? 0
    })
  }
  
  restoreUnitAfterBattle(ng.p1.board)
  restoreUnitAfterBattle(ng.p2.board)

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

  // 11. ログ再生アニメーション
  battleTimerRef.current = window.setInterval(() => {
    if (i >= sourceLogs.length) {
      clearInterval(battleTimerRef.current!)
      applyBattleDamage()
      handleNextTurn()
      return
    }

    const batch: BattleLog[] = []
    const currentTime = sourceLogs[i].time
    setBattleNow(currentTime)

    while (i < sourceLogs.length && sourceLogs[i].time === currentTime) {
      batch.push(sourceLogs[i])
      i++
    }

    setBattleLogs((prev) => [...prev, ...batch])

    batch.forEach((next) => {
      console.log("Log Action:", next.action);
      const fromStr = (next as any).from ? `${(next as any).from.r}${(next as any).from.c}` : "";
const toStr = (next as any).to ? `${(next as any).to.r}${(next as any).to.c}` : "";
const logId = `${next.time}-${next.instanceId}-${next.action}-${fromStr}-${toStr}-${(next as any).stateType ?? ""}-${(next as any).value ?? ""}`;
      if (processedIds.current.has(logId)) return
      processedIds.current.add(logId)

      // --- GameView.tsx 内の handleBattleStart -> batch.forEach 内 ---

      // --- Summon 処理 (関数型更新に修正) ---
      if ((next as any).action === "summon" || (next as any).action === "SUMMON") {
        console.log("Summon unit data:", (next as any).unit);
        const summonedUnit = (next as any).unit as BattleUnit;
        if (summonedUnit) {
          // ★最重要: prev => [...] の形式にする
          setBattleBoard((prevBoard) => {
            // prevBoard は常に「最新の」盤面データになる
            const currentBoard = prevBoard || [];
            
          if (currentBoard.some(u => u.instanceId === summonedUnit.instanceId)) return currentBoard;
            
            console.log("Adding Ghoul to Board:", summonedUnit.instanceId);
            
        
            return [...currentBoard, summonedUnit];
          });
        }
      }

      if (typeof next.instanceId === "string") {
        const targetId = next.instanceId

        setBattleBoard((prev) => {
          if (!prev) return prev
          
          const unitIndex = prev.findIndex(u => u.instanceId === targetId)
          if (unitIndex === -1) return prev

          // 🚩 ユニットを新しく作り直し、オブジェクトの参照を更新する（再描画・バフ更新を強制）
          const unit = { ...prev[unitIndex] }
          const b = [...prev]

          // 526行目付近：移動ログの処理
          if (next.action === "move" && (next as any).from && (next as any).to) {
            const from = (next as any).from;
            const to = (next as any).to;

            // unit.pos が undefined の場合に備えてデフォルト値を設定
            const currentPos = unit.pos ?? { r: 0, c: 0 };

            // 🚩 前回の座標を「現在の座標」から安全にコピー
            unit.prevPos = { 
              r: from.r ?? currentPos.r, 
              c: from.c ?? currentPos.c 
            };

            // 🚩 新しい座標をセット
            unit.pos = { 
              r: to.r ?? 0, 
              c: to.c ?? 0 
            };

            (unit as any).lastMoveTime = next.time;
          }
          // 2. 【バフ・ステータス更新】
          // 🚩 【バフ・ステータス更新】累積（加算）に対応させる
          if ((next as any).action === "mod_stat" || (next as any).action === "add_state") {
            const stat = (next as any).stat;
            const value = (next as any).value;
            const map: Record<string, string> = {
              atk: "atk", 
              hp: "hp", 
              maxHp: "hp",
              attackSpeed: "as_stack", 
              damageReduce: "damage_reduce"
            };
            const stateType = map[stat] || (next as any).stateType;
            
            if (stateType && typeof value === "number") {
              unit.states = unit.states ? [...unit.states] : [];

              // --- ここが修正ポイント！ ---
              // 同じ種別のバフを探す
              const existingIndex = unit.states.findIndex(s => s.type === stateType);

              if (existingIndex !== -1) {
                // ❌ 上書きではなく ✅ 加算する
                // 元の value に今回の value を足す（累積）
                unit.states[existingIndex] = { 
                  ...unit.states[existingIndex], 
                  value: (unit.states[existingIndex].value ?? 0) + value 
                };
              } else {
                // 新規バフとして追加
                unit.states.push({ 
                  id: crypto.randomUUID(), 
                  type: stateType, 
                  value: value, 
                  stacks: 1 
                });
              }
            }
            
            // --- 修正後のステータス更新処理 ---
            const final = calculateFinalStats(unit, next.time);

            // 🚩 型安全に値を取得 (undefined の場合は base 値や 0 に逃がす)
            const prevMax = unit.maxHp ?? unit.baseMaxHp ?? 0;
            const nextMax = final.maxHp ?? unit.baseMaxHp ?? 0;

            // ① 最大HPが増えたなら、現在HPもその分だけ「底上げ」する
            if (nextMax > prevMax) {
              const diff = nextMax - prevMax;
              unit.hp = (unit.hp ?? 0) + diff; 
              console.log(`[VIEW_HP_SYNC] ${unit.unitName}: HP Increased +${diff}`);
            }

            // ② ステータスを最新状態に上書き
            unit.atk = final.atk ?? unit.baseAtk ?? 0;
            unit.maxHp = nextMax;
            unit.attackSpeed = final.attackSpeed ?? unit.baseAttackSpeed ?? 1;

            // ③ 安全装置（最大HPが減った時に現在HPがハミ出さないようにする）
            if (unit.hp > unit.maxHp) {
              unit.hp = unit.maxHp;
            }
// ----------------
            
            // HPそのものの直接変更（回復など）の場合のみ、現在のHPを更新
            if (stat === "hp" && value > 0) unit.hp = value; 
          }
          // 3. 【ダメージ反映】
          if (next.action === "attack" || next.action === "damage") {
            const dmg = (next as any).damage ?? (next as any).value
            if (typeof dmg === "number") {
              unit.hp = Math.max(0, unit.hp - dmg)
            }
          }

          // 4. 【回復】
          if ((next as any).action === "heal") {
            const heal = (next as any).value
            if (typeof heal === "number") unit.hp += heal
          }

          // 5. 【最終死亡判定】
          // HPが0以下で、かつ「回復ログ」や「バフログ」ではないことを確認
          if (unit.hp <= 0 && next.action !== "heal" && (next as any).action !== "mod_stat") {
            return b.filter(u => u.instanceId !== targetId)
          }

          b[unitIndex] = unit
          return b
        })

        // 視覚演出
        if (next.action === "attack" || next.action === "damage") {
          const dmg = next.action === "attack" ? next.damage : ((next as any).damage ?? (next as any).value)
          if (typeof dmg === "number") {
            setVisualEvents(prev => [...prev, { id: targetId, type: "damage", value: dmg } as any])
            setTimeout(() => setVisualEvents(prev => prev.filter(v => !(v.id === targetId && v.type === "damage"))), 400)
          }
        }

        // GameView.tsx の handleBattleStart -> batch.forEach 内

if (next.action === "death") {
  const targetId = next.instanceId;
  setVisualEvents(prev => [...prev, { id: targetId, type: "death" } as any]);

  // ★重要：death ログが来たら、確実にそのユニットを盤面から消す
  setBattleBoard(prev => {
    if (!prev) return prev;
    const filtered = prev.filter(u => u.instanceId !== targetId);
    console.log(`Removing dead unit: ${targetId}. Remaining:`, filtered.length);
    return filtered;
  });

  setTimeout(() => {
    setVisualEvents(prev => prev.filter(v => !(v.id === targetId && v.type === "death")));
  }, 400);
}

// SUMMON 側も「既にあるなら追加しない」を徹底
if (next.action === "summon") {
  const summonedUnit = (next as any).unit;
  if (summonedUnit) {
    setBattleBoard(prev => {
      const current = prev || [];
      if (current.some(u => u.instanceId === summonedUnit.instanceId)) return current;
      return [...current, summonedUnit];
    });
  }
}
      if ((next as any).action === "counter" && next.side === "p1") {
        const key = (next as any).key
        const val = (next as any).value ?? 1
        setBattleCounters(prev => ({ ...prev, [key]: (prev[key] ?? 0) + val }))
      }
    }})
  }, 300)
}
/* =========================
   パック選択フェーズ
========================= */

if (preBattle.phase === "packSelect" || preBattle.phase === "p2Selecting") {
  return (
    <>
      <PackSelectScreen
        selectedPack={preBattle.p1Pack}
        enemyPack={preBattle.p2Pack}
        disabledPacks={preBattle.p1Pack ? [preBattle.p1Pack] : []}
        onSelect={selectP1Pack}
        onViewCardList={(id) => setViewingPackId(id)}
      />

      {viewingPackId && (
        <CardListOverlay
          packId={viewingPackId}
          onClose={() => setViewingPackId(null)}
          onRightClickUnit={(unit, x, y) => {
            setDetailOverlay({
              target: { kind: "unit", unit },
              mode: "album" as any, 
              x,
              y
            });
          }}
        />
      )}

      {/* ★ ここを追加：詳細画面コンポーネントをここに置く */}
      {detailOverlay && (
        <UnitDetailOverlay
          {...detailOverlay}
          onClose={() => setDetailOverlay(null)}
        />
      )}
    </>
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
        カードプール生成中...
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
              戦闘開始
            </button>
          )}

          <button style={{ marginLeft: 12 }} onClick={() => setShowEnemyBoard((v) => !v)}>
            {showEnemyBoard ? "自分の盤面" : "相手の盤面"}
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
          width: 320,
          bottom: 240,
          zIndex: 10,

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
    シナジー
  </div>

  {player.synergies.length === 0 ? (
    <div style={{ opacity: 0.35, fontSize: 12 }}>ユニットは、ここにドラッグするとシナジーになります。(1ターンに1枚。無料。 最高２枚。上限を超えると古いものから上書き。)</div>
  ) : (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(2, 48px)",
        gap: 12,
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
              width: 60,
              height: 58,

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
    装備ストック
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
   全てのユニットは、盤面に配置された別のユニットに重ねると、コストを消費して装備品になります。
   そのユニットを売却した場合、装備はストックに保管され、以降は無料で使えます。
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
    onDragStart={(ev) => {
      if (disabled) return

      // 元の処理
      setDragItem({ type: "stock", stockIndex: i })

      // ===== カスタムドラッグ画像 =====
      const img = new Image()
      img.src = `./units/${e.id}.jpg`

      img.onload = () => {
        const size = 52

        const canvas = document.createElement("canvas")
        canvas.width = size
        canvas.height = size

        const ctx = canvas.getContext("2d")
        if (!ctx) return

        // 🔥 影（任意）
        ctx.shadowColor = "rgba(0,0,0,0.5)"
        ctx.shadowBlur = 8

        // 🔷 六角形クリップ
        ctx.beginPath()
        ctx.moveTo(size * 0.25, size * 0.06)
        ctx.lineTo(size * 0.75, size * 0.06)
        ctx.lineTo(size, size * 0.5)
        ctx.lineTo(size * 0.75, size * 0.94)
        ctx.lineTo(size * 0.25, size * 0.94)
        ctx.lineTo(0, size * 0.5)
        ctx.closePath()
        ctx.clip()

        ctx.drawImage(img, 0, 0, size, size)

        ev.dataTransfer.setDragImage(canvas, size / 2, size / 2)
      }
    }}
    onClick={() => {
      if (!canEquip) return
      if (!game) return

      const g = structuredClone(game)
      equipFromStock(g.p1, i, selectedBoardIndex!)
      setGame(g)

      // （任意）選択維持したいならこれ
      setSelectedBoardIndex(selectedBoardIndex)
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
      background: "linear-gradient(180deg,#d8b15a,#6a4d18)",
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
        pointerEvents: "none",
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
            position: "relative",

            width: "68vw",
            maxWidth: 1050,
            height: "70vh",   

            margin: "0 auto",

            display: "flex",
            justifyContent: "center",
            alignItems: "center",

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
                <BattleCanvas
                  board={battleBoard ?? []}
                  logs={battleLogs}
                />
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
                売却
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
                <div style={{ fontWeight: "bold" }}>リロール</div>
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
      もう一度対戦する
    </button>
  </div>
)}
      <CounterPanel player={player} battleCounters={battleCounters} />
    </div>
  )
}
