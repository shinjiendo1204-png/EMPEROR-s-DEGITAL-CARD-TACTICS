"use client"

import { useEffect, useRef, useState } from "react"
import { Unit, Ability, BattleUnit, PlayerState } from "@/types"
import { resolveFinalStats } from "@/lib/ui/resolveFinalStats"
import { ROLE_AS } from "@/lib/battle/constants"
import { calculateFinalStats } from "@/lib/battle/statCalculator"
import { BattleState } from "@/lib/battle/state"
import { renderAbilitiesENFromRaw } from "@/lib/ui/abilityformatter/renderEN"

export type DetailMode = "hand" | "board" | "equipment" | "synergy"

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
    tank: "tank",
    bruiser: "bruiser",
    skirmisher: "skirmisher",
    support: "support",
    ranged: "ranged",
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
     位置補正
  ========================= */
  const PANEL_WIDTH = 360
  const PANEL_HEIGHT = 260
  const [pos, setPos] = useState<{ left: number; top: number } | null>(null)

  useEffect(() => {
    const left =
      x + PANEL_WIDTH > window.innerWidth ? x - PANEL_WIDTH - 12 : x + 12
    const top =
      y + PANEL_HEIGHT > window.innerHeight ? y - PANEL_HEIGHT - 12 : y + 12
    setPos({ left, top })
  }, [x, y])

  if (!pos) return null

  /* =========================
     共通UI
  ========================= */
  const SectionTitle = ({ children }: { children: string }) => (
    <div
      style={{
        fontSize: 13,
        fontWeight: 700,
        margin: "10px 0 6px",
        opacity: 0.9,
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
        {renderAbilitiesENFromRaw(abilities)}
      </div>
    </div>
  )
}

  /* =========================
     Unit 表示（変更なし）
  ========================= */
  const renderUnit = (unit: Unit) => {
    const role = (unit as any).role
    const attackRange = unit.attackRange
    const baseATK = (unit as any).atk ?? 0
    const baseHP = (unit as any).hp ?? 0
    const variants: any = (unit as any).variants


    const baseAS =
      role && ROLE_AS[role as keyof typeof ROLE_AS] !== undefined
        ? ROLE_AS[role as keyof typeof ROLE_AS]
        : null

    const dps =
      baseAS && baseAS > 0
        ? baseATK / baseAS
        : baseATK

    const _finalStats =
      mode === "hand"
        ? resolveFinalStats(unit, { includeEquipment: true, includeSynergy: true })
        : resolveFinalStats(unit)

    return (
      <>
        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <div style={{ fontSize: 18, fontWeight: 800 }}>{unit.name}</div>
          <div style={{ fontSize: 12, opacity: 0.75 }}>Cost {unit.cost}</div>
        </div>

        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: "6px 12px",
            fontSize: 12,
            opacity: 0.9,
            marginTop: 8,
          }}
        >
          {role && <div>{roleToText(role)}</div>}
          <div>HP {baseHP}</div>
          <div>ATK {baseATK}</div>
          {baseAS !== null && <div>AS {baseAS}</div>}
          {baseAS !== null && (<div>DPS {dps.toFixed(2)}</div>)}
          {attackRange && <div>Range {attackRangeToText(attackRange)}</div>}
          
          
        </div>

        <SectionTitle>Ability</SectionTitle>
        <AbilityList abilities={(unit as any).abilities} />

        {mode === "hand" && (
          <>
            <SectionTitle>Equip</SectionTitle>
            {variants?.equipment ? (
  <>
    <div style={{ fontSize: 12, opacity: 0.8 }}>
      {variants.equipment.name}
    </div>

    {/* ===== baseStats表示 ===== */}
        {variants.equipment.baseStats && (
          <div
            style={{
              display: "flex",
              gap: 12,
              fontSize: 12,
              fontWeight: 700,
              marginTop: 4,
            }}
          >
            {variants.equipment.baseStats.atk && (
              <div>
                ATK{" "}
                <span style={{ color: "#4ade80" }}>
                  +{variants.equipment.baseStats.atk}
                </span>
              </div>
            )}

            {variants.equipment.baseStats.hp && (
              <div>
                HP{" "}
                <span style={{ color: "#4ade80" }}>
                  +{variants.equipment.baseStats.hp}
                </span>
              </div>
            )}
          </div>
        )}

        {/* ===== abilities ===== */}
        {(variants.equipment.abilities &&
          variants.equipment.abilities.length > 0) ? (
          <AbilityList abilities={variants.equipment.abilities}/>
        ) : (
          !variants.equipment.baseStats && (
            <div style={{ fontSize: 12, opacity: 0.55 }}>なし</div>
          )
        )}
      </>
    ) : (
      <div style={{ fontSize: 12, opacity: 0.55 }}>なし</div>
    )}

            <SectionTitle>Synergy</SectionTitle>
            {variants?.synergy ? (
              <>
                <div style={{ fontSize: 12, opacity: 0.8 }}>
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
     BattleUnit 表示（エラー修正版）
  ========================= */
  const renderBattleUnit = (unit: BattleUnit) => {
    const finalStats = calculateFinalStats(unit, 0)
      const dps =
  finalStats.attackSpeed > 0
    ? finalStats.atk / finalStats.attackSpeed
    : finalStats.atk
    const baseAtk = unit.baseAtk
    const baseMaxHp = unit.baseMaxHp
    const baseAttackSpeed = unit.baseAttackSpeed
    const baseDamageReduce = unit.baseDamageReduce
    const side = unit.side
    const baseDps =
  baseAttackSpeed > 0 ? baseAtk / baseAttackSpeed : baseAtk
    const selfDamageCount =
      battleState?.counters[side]?.["teamSelfDamage"] ?? 0

    const atkColor =
      finalStats.atk > baseAtk
        ? "#4ade80"
        : finalStats.atk < baseAtk
        ? "#f87171"
        : "#fff"

    const asColor =
      finalStats.attackSpeed > baseAttackSpeed
        ? "#4ade80"
        : finalStats.attackSpeed < baseAttackSpeed
        ? "#f87171"
        : "#fff"

    const drColor =
      finalStats.damageReduce > baseDamageReduce
        ? "#4ade80"
        : finalStats.damageReduce < baseDamageReduce
        ? "#f87171"
        : "#fff"

    const dpsColor =
  dps > baseDps
    ? "#4ade80"
    : dps < baseDps
    ? "#f87171"
    : "#fff"

    return (
      <>
        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <div style={{ fontSize: 18, fontWeight: 800 }}>{unit.unitName}</div>
        </div>

        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: "6px 12px",
            fontSize: 12,
            opacity: 0.9,
            marginTop: 8,
          }}
        >
          <div>{roleToText(unit.role)}</div>
          <div>
            ATK{" "}
            <span style={{ color: atkColor }}>
              {finalStats.atk}
            </span>
          </div>

          <div>
            HP {unit.maxHp}
          </div>

          <div>
            AS{" "}
            <span style={{ color: asColor }}>
              {finalStats.attackSpeed.toFixed(2)}
            </span>
          </div>
          <div>
          DPS{" "}
          <span style={{ color: dpsColor }}>
            {dps.toFixed(2)}
          </span>
        </div>

          <div>
            DR{" "}
            <span style={{ color: drColor }}>
              {finalStats.damageReduce}
            </span>
          </div>
          <div>AttackRange {attackRangeToText(unit.attackRange)}</div>
        </div>

        <SectionTitle>Ability</SectionTitle>
        <AbilityList abilities={unit.abilities}/>

        {unit.states && unit.states.length > 0 && (
          <>
            <SectionTitle>States</SectionTitle>
            {unit.states.map((s, i) => (
              <div key={i} style={{ fontSize: 12 }}>
                {s.type} {s.value ? `+${s.value}` : ""}
              </div>
            ))}
          </>
        )}
      </>
    )
  }

  const renderSynergy = (s: SynergyLike) => {

  return (
    <>
      <div style={{ fontSize: 18, fontWeight: 800 }}>{s.name}</div>
      <div style={{ fontSize: 12, opacity: 0.75 }}>Synergy</div>
      <SectionTitle>Ability</SectionTitle>
      <AbilityList abilities={s.abilities}/>
    </>
  )
}


const renderEquipment = (e: EquipmentLike & {
  baseStats?: Partial<Record<string, number>>
}) => {

  const baseStats = e.baseStats ?? (e as any).variants?.equipment?.baseStats

  return (
    <>
      <div style={{ fontSize: 18, fontWeight: 800 }}>{e.name}</div>
      <div style={{ fontSize: 12, opacity: 0.75 }}>Equipment</div>

      {baseStats && (
        <div
          style={{
            display: "flex",
            gap: 12,
            marginTop: 6,
            fontSize: 14,
            fontWeight: 700,
          }}
        >
         {Object.entries(baseStats as Record<string, number>).map(([stat, value]) => {

        const v = value as number

        return (
          <div key={stat}>
            {statToShortText(stat)}
            <span
              style={{
                color: v > 0 ? "#4ade80" : "#f87171",
                marginLeft: 2,
              }}
            >
              {v > 0 ? "+" : ""}
              {v}
            </span>
          </div>
        )
      })}
        </div>
      )}

      <SectionTitle>Ability</SectionTitle>
      <AbilityList abilities={e.abilities} />
    </>
  )
}

  
function statToShortText(stat: string) {
  const map: Record<string, string> = {
    atk: "ATK",
    hp: "HP",
    attackSpeed: "AS",
    damageReduce: "DR",
    attackRange: "Range",
  }
  return map[stat] ?? stat
}



  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 9999, pointerEvents: "none" }}>
      <div
        ref={panelRef}
        style={{
          position: "fixed",
          left: pos.left,
          top: pos.top,
          width: PANEL_WIDTH,
          maxHeight: "70vh",
          overflowY: "auto",
          padding: 14,
          borderRadius: 12,
          background: "rgba(20,20,20,0.92)",
          border: "1px solid rgba(255,255,255,0.18)",
          boxShadow: "0 20px 40px rgba(0,0,0,0.65)",
          color: "#fff",
          pointerEvents: "auto",
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
