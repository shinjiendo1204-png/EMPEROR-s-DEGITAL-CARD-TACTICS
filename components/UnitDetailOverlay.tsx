"use client"

import { useEffect, useRef, useState, useLayoutEffect } from "react" // ★ useLayoutEffect を追加
import { Unit, Ability, BattleUnit, PlayerState } from "@/types"
import { ROLE_AS } from "@/lib/battle/constants"
import { calculateFinalStats } from "@/lib/battle/statCalculator"
import { BattleState } from "@/lib/battle/state"
import { abilityToLine } from "@/lib/ui/abilityText"

// DetailMode に album を追加
export type DetailMode = "hand" | "board" | "equipment" | "synergy" | "album"

type EquipmentLike = {
  name: string
  description?: string
  abilities?: Ability[]
  baseStats?: Partial<Record<string, number>>
}

type SynergyLike = {
  name: string
  description?: string
  abilities?: Ability[]
}

export type DetailTarget =
  | { kind: "unit"; unit: Unit }
  | { kind: "battleUnit"; battleUnit: BattleUnit }
  | { kind: "equipment"; equipment: EquipmentLike }
  | { kind: "synergy"; synergy: SynergyLike }

type Props = {
  target: DetailTarget
  mode: DetailMode
  x: number
  y: number
  onClose: () => void
  battleState?: BattleState 
  playerState?: PlayerState
}

function roleToText(role?: string) {
  if (!role) return ""
  const map: Record<string, string> = {
    tank: "タンク",
    bruiser: "ブルーザー",
    skirmisher: "スカーミッシャー",
    support: "サポート",
    ranged: "レンジ",
  }
  return map[role] ?? role
}

function attackRangeToText(range?: number) {
  if (range === undefined) return "?"
  return `${range}`
}

export function UnitDetailOverlay({ target, mode, x, y, onClose, battleState, playerState}: Props) {
  const panelRef = useRef<HTMLDivElement>(null)

  /* =========================
     ESC / クリック外で閉じる
  ========================= */
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose()
    }
    window.addEventListener("keydown", onKeyDown)
    return () => window.removeEventListener("keydown", onKeyDown)
  }, [onClose])

  useEffect(() => {
    const onMouseDown = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        onClose()
      }
    }
    document.addEventListener("mousedown", onMouseDown)
    return () => document.removeEventListener("mousedown", onMouseDown)
  }, [onClose])

  /* =========================
     動的な位置補正 (ここを修正)
  ========================= */
  const PANEL_WIDTH = 360
  // const PANEL_HEIGHT = 260 // ★固定値の高さ宣言を削除
  const [pos, setPos] = useState<{ left: number; top: number } | null>(null)

  // 描画後に実際の高さを計測して位置を決める
  useLayoutEffect(() => {
    if (!panelRef.current) return;

    // Reactが描画した実際の高さを取得 (例: 450px など)
    const actualHeight = panelRef.current.offsetHeight;

    // 横位置の計算 (右側にはみ出すなら左に出す)
    let left = x + PANEL_WIDTH > window.innerWidth ? x - PANEL_WIDTH - 15 : x + 15;
    
    // 縦位置の計算 (★ここが重要)
    // クリック位置(y) + 実際の高さ が画面下部を超える場合、上にずらす
    let top = y + actualHeight > window.innerHeight ? window.innerHeight - actualHeight - 15 : y + 15;

    // 画面上部からはみ出さないように補正
    if (top < 15) top = 15;
    // 画面左側からはみ出さないように補正
    if (left < 15) left = 15;

    setPos({ left, top });
  }, [x, y, target]); // targetが変わった時(能力が変わった時)も再計算

  /* =========================
     共通UI
  ========================= */
  const SectionTitle = ({ children, color }: { children: string, color?: string }) => (
    <div
      style={{
        fontSize: 13,
        fontWeight: 700,
        margin: "12px 0 6px", // ★マージンを少し調整
        opacity: 0.9,
        color: color || "#fff",
        borderLeft: color ? `3px solid ${color}` : "none", // ★ラベル風に
        paddingLeft: color ? 8 : 0,
      }}
    >
      {children}
    </div>
  )

  const AbilityList = ({
  abilities,
}: {
  abilities?: Ability[]
}) => {
  if (!abilities || abilities.length === 0) {
    return <div style={{ fontSize: 12, opacity: 0.55 }}>なし</div>
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
      <div
        style={{
          padding: "6px 8px",
          borderRadius: 8,
          background: "rgba(255,255,255,0.06)",
          fontSize: 12,
          lineHeight: 1.4,
        }}
      >
        {/* map で一つずつアビリティを取り出して renderAbilityJP に渡す */}
        {abilities.map((abil, idx) => (
          <div key={idx} style={{ marginBottom: idx === abilities.length - 1 ? 0 : 8 }}>
            {abilityToLine(abil, { 
              battleState, // Propsから渡ってきているもの
              playerState  // Propsから渡ってきているもの
            })}
          </div>
        ))}
      </div>
    </div>
  )
}

  /* =========================
     Unit 表示
  ========================= */
  /* =========================
     Unit 表示 (ハンド・アルバム・図鑑用)
  ========================= */
  const renderUnit = (unit: Unit) => {
    // 1. 各種変数の準備
    const isHero = unit.mode === "hero" // ★ヒーロー判定
    const role = (unit as any).role
    const attackRange = unit.attackRange
    const baseATK = (unit as any).atk ?? 0
    const baseHP = (unit as any).hp ?? 0
    const variants: any = (unit as any).variants

    // 攻撃速度 (AS) の取得
    const baseAS =
      role && ROLE_AS[role as keyof typeof ROLE_AS] !== undefined
        ? ROLE_AS[role as keyof typeof ROLE_AS]
        : null

    return (
      <>
        {/* --- ヘッダー：名前とコストバッジ --- */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ 
            fontSize: 19, 
            fontWeight: 900,
            color: isHero ? "#e8edf5" : "#fff", // ヒーローはプラチナ色
            textShadow: isHero ? "0 0 10px rgba(232,237,245,0.3)" : "none"
          }}>
            {unit.name}
          </div>

          {/* 盤面(renderBattleUnit)と共通のデザイン */}
          <div style={{ 
            fontSize: 12, 
            fontWeight: 800,
            opacity: 1, 
            background: isHero 
              ? "linear-gradient(45deg, #2c3e50, #000)" 
              : "rgba(255, 255, 255, 0.15)", 
            color: isHero ? "#e8edf5" : "#fff",
            padding: "2px 8px", 
            borderRadius: 4,
            border: isHero ? "1px solid rgba(232, 237, 245, 0.5)" : "1px solid rgba(255, 255, 255, 0.1)"
          }}>
            {isHero ? "✦ HERO" : `Cost ${unit.cost}`}
          </div>
        </div>

        {/* --- ステータス行 --- */}
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: "6px 12px",
            fontSize: 12,
            opacity: 0.9,
            marginTop: 8,
            paddingBottom: 8,
            borderBottom: isHero ? "1px solid rgba(232,237,245,0.3)" : "1px solid rgba(255,255,255,0.08)"
          }}
        >
          {role && <div>{roleToText(role)}</div>}
          <div>HP {baseHP}</div>
          <div>ATK {baseATK}</div>
          {baseAS !== null && <div>AS {baseAS}</div>}
          {attackRange && <div>Range {attackRangeToText(attackRange)}</div>}
        </div>

        {/* --- ユニットアビリティ --- */}
        <SectionTitle>アビリティ</SectionTitle>
        <AbilityList abilities={(unit as any).abilities} />

        {/* --- フォームチェンジ情報 (ハンドまたはアルバム時のみ) --- */}
        {(mode === "hand" || mode === "album") && (
          <>
            {/* 装備形態 */}
            <SectionTitle color="#4fd1ff">装備モード</SectionTitle> 
            {variants?.equipment ? (
              <>
                <div style={{ fontSize: 12, opacity: 0.8, fontWeight: "bold", marginBottom: 4 }}>
                  {variants.equipment.name}
                </div>

                {/* 装備時の追加ステータス */}
                {variants.equipment.baseStats && (
                  <div style={{ display: "flex", gap: 12, fontSize: 12, fontWeight: 700, marginTop: 4, marginBottom: 6 }}>
                    {variants.equipment.baseStats.atk && (
                      <div>ATK <span style={{ color: "#4ade80" }}>+{variants.equipment.baseStats.atk}</span></div>
                    )}
                    {variants.equipment.baseStats.hp && (
                      <div>HP <span style={{ color: "#4ade80" }}>+{variants.equipment.baseStats.hp}</span></div>
                    )}
                  </div>
                )}

                {/* 装備アビリティ */}
                {(variants.equipment.abilities && variants.equipment.abilities.length > 0) ? (
                  <AbilityList abilities={variants.equipment.abilities}/>
                ) : (
                  !variants.equipment.baseStats && <div style={{ fontSize: 12, opacity: 0.55 }}>なし</div>
                )}
              </>
            ) : (
              <div style={{ fontSize: 12, opacity: 0.55 }}>なし</div>
            )}

            {/* シナジー形態 */}
            <SectionTitle color="#4ade80">シナジーモード</SectionTitle>
            {variants?.synergy ? (
              <>
                <div style={{ fontSize: 12, opacity: 0.8, fontWeight: "bold", marginBottom: 4 }}>
                  {variants.synergy.name}
                </div>
                <AbilityList abilities={variants.synergy.abilities} />
              </>
            ) : (
              <div style={{ fontSize: 12, opacity: 0.55 }}>なし</div>
            )}
          </>
        )}
      </>
    )
  }

  /* =========================
   BattleUnit 表示 (盤面に出た時の表示)
========================= */
const renderBattleUnit = (unit: BattleUnit) => {
  const finalStats = calculateFinalStats(unit, 0)
  const isHero = (unit as any).mode === "hero";
  const baseAtk = unit.baseAtk
  const atkColor = finalStats.atk > baseAtk ? "#4ade80" : finalStats.atk < baseAtk ? "#f87171" : "#fff"

  return (
    <>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div style={{ 
          fontSize: 18, 
          fontWeight: 800,
          color: isHero ? "#e8edf5" : "#fff",
          textShadow: isHero ? "0 0 10px rgba(232,237,245,0.3)" : "none"
        }}>
          {unit.unitName}
        </div>
        
        {/* ★ renderUnit と完全に同期 */}
        <div style={{ 
          fontSize: 12, 
          fontWeight: 800,
          opacity: 1, 
          background: isHero 
            ? "linear-gradient(45deg, #2c3e50, #000)" 
            : "rgba(255, 255, 255, 0.15)", 
          color: isHero ? "#e8edf5" : "#fff",
          padding: "2px 8px", 
          borderRadius: 4,
          border: isHero ? "1px solid rgba(232, 237, 245, 0.5)" : "1px solid rgba(255, 255, 255, 0.1)"
        }}>
          {isHero ? "✦ HERO" : `Cost ${unit.cost ?? 0}`}
        </div>
      </div>

      <div style={{ 
        display: "flex", 
        flexWrap: "wrap", 
        gap: "6px 12px", 
        fontSize: 12, 
        opacity: 0.9, 
        marginTop: 8,
        paddingBottom: 8,
        borderBottom: "1px solid rgba(255,255,255,0.08)"
      }}>
        <div>{roleToText(unit.role)}</div>
        <div>HP {unit.hp} / {unit.maxHp}</div>
        <div>ATK <span style={{ color: atkColor }}>{finalStats.atk}</span></div>
        
        {/* ★ 消えていた AS (Attack Speed) を追加 */}
        <div>AS <span style={{ color: "#fff" }}>{finalStats.attackSpeed.toFixed(2)}</span></div>
        
        <div>Range {attackRangeToText(unit.attackRange)}</div>
      </div>

      <SectionTitle>Ability</SectionTitle>
      <AbilityList abilities={unit.abilities}/>
    </>
  )
}

  const renderSynergy = (s: SynergyLike) => (
    <>
      <div style={{ fontSize: 18, fontWeight: 800 }}>{s.name}</div>
      <div style={{ fontSize: 12, opacity: 0.75 }}>Synergy</div>
      <SectionTitle>Ability</SectionTitle>
      <AbilityList abilities={s.abilities}/>
    </>
  )

  const renderEquipment = (e: EquipmentLike & { baseStats?: Partial<Record<string, number>> }) => {
    const baseStats = e.baseStats ?? (e as any).variants?.equipment?.baseStats
    return (
      <>
        <div style={{ fontSize: 18, fontWeight: 800 }}>{e.name}</div>
        <div style={{ fontSize: 12, opacity: 0.75 }}>Equipment</div>
        {baseStats && (
          <div style={{ display: "flex", gap: 12, marginTop: 6, fontSize: 14, fontWeight: 700 }}>
            {Object.entries(baseStats as Record<string, number>).map(([stat, value]) => (
              <div key={stat}>{statToShortText(stat)}<span style={{ color: (value as number) > 0 ? "#4ade80" : "#f87171", marginLeft: 2 }}>{(value as number) > 0 ? "+" : ""}{value}</span></div>
            ))}
          </div>
        )}
        <SectionTitle>Ability</SectionTitle>
        <AbilityList abilities={e.abilities} />
      </>
    )
  }

  function statToShortText(stat: string) {
    const map: Record<string, string> = { atk: "ATK", hp: "HP", attackSpeed: "AS", damageReduce: "DR", attackRange: "Range" }
    return map[stat] ?? stat
  }

  /* =========================
     メインレンダリング
  ========================= */
  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 9999, pointerEvents: "none" }}>
      <div
        ref={panelRef}
        style={{
          position: "fixed",
          // 計算された位置を適用 (まだ計算できていない時は隠しておく)
          left: pos?.left ?? -1000, 
          top: pos?.top ?? -1000,
          width: PANEL_WIDTH,
          // スクロールが出なくても、画面内に収まるように最大高さを制限
          maxHeight: "calc(100vh - 40px)", 
          overflowY: "auto",
          padding: 16,
          borderRadius: 14, // ★少し角を丸く
          background: "rgba(12,12,12,0.95)", // ★背景を少し濃く
          border: "1px solid rgba(255,255,255,0.18)",
          boxShadow: "0 20px 60px rgba(0,0,0,0.7)", // ★影を強く
          color: "#fff",
          pointerEvents: "auto",
          // 位置計算が完了するまで透明にしておく (パタパタ防止)
          visibility: pos ? "visible" : "hidden", 
          transition: "visibility 0.1s, opacity 0.1s",
          opacity: pos ? 1 : 0,
        }}
      >
        {target.kind === "unit" && renderUnit(target.unit)}
        {target.kind === "battleUnit" && renderBattleUnit(target.battleUnit)}
        {target.kind === "equipment" && renderEquipment(target.equipment)}
        {target.kind === "synergy" && renderSynergy(target.synergy)}
      </div>
    </div>
  )
}