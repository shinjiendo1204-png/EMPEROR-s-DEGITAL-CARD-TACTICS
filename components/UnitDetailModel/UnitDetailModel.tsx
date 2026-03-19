import { Unit, BattleUnit } from "@/types"
import { abilityToLine } from "@/lib/ui/abilityText"
import { calculateFinalStats } from "@/lib/battle/statCalculator"
import { useState } from "react"

/* =========================
   表示用マップ
========================= */

const RANGE_LABEL: Record<string, string> = {
  melee: "射程1",
  ranged: "射程2",
  any: "射程3",
}

const ATTACK_SPEED_BY_ROLE: Record<string, number> = {
  tank: 0.55,
  bruiser: 0.65,
  skirmisher: 0.8,
  ranged: 0.85,
  support: 0.75,
}

/* =========================
   色判定
========================= */

function getStatColor(diff: number) {
  if (diff > 0) return "#6bff8a"
  if (diff < 0) return "#ff6b6b"
  return "#ffffff"
}

/* =========================
   ステータス行UI
========================= */

function StatRow({
  label,
  value,
  color,
}: {
  label: string
  value: string | number
  color?: string
}) {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        width: "100%",
        maxWidth: 140,
        fontSize: 13,
        fontWeight: 700,
      }}
    >
      <span style={{ opacity: 0.7 }}>{label}</span>
      <span style={{ color: color ?? "#fff" }}>{value}</span>
    </div>
  )
}

/* =========================
   タブボタン
========================= */

function TabButton({
  label,
  active,
  onClick
}: {
  label: string
  active: boolean
  onClick: () => void
}) {

  return (
    <button
      onClick={onClick}
      style={{
        padding: "4px 8px",
        fontSize: 12,
        fontWeight: 700,
        borderRadius: 6,
        border: "none",
        cursor: "pointer",
        background: active ? "#444" : "#222",
        color: active ? "#fff" : "#aaa"
      }}
    >
      {label}
    </button>
  )
}

/* =========================
   メイン
========================= */

export function UnitDetailModel({
  unit,
  battleUnit,
  mode,
  battleNow
}: {
  unit: Unit
  battleUnit?: BattleUnit
  mode: "hand" | "board"
  battleNow?: number
}) {

  const [tab, setTab] =
    useState<"unit" | "equipment" | "synergy">("unit")

  const rangeLabel =
    RANGE_LABEL[(unit as any).attackRange] ?? "射程?"

  const roleAS =
    ATTACK_SPEED_BY_ROLE[(unit as any).role] ?? null

  const stats = battleUnit
    ? calculateFinalStats(battleUnit, battleNow ?? 0)
    : null

  const baseAtk = battleUnit?.baseAtk ?? unit.atk
  const baseHp = battleUnit?.baseMaxHp ?? unit.hp
  const baseAS = battleUnit?.baseAttackSpeed ?? roleAS
  const baseDR = battleUnit?.baseDamageReduce ?? 0

  const atkDiff = stats ? stats.atk - baseAtk : 0
  const hpDiff = stats ? stats.maxHp - baseHp : 0
  const asDiff = stats ? stats.attackSpeed - baseAS : 0
  const drDiff = stats ? stats.damageReduce - baseDR : 0

  const dps = stats
    ? stats.atk / stats.attackSpeed
    : baseAtk / (baseAS ?? 1)

  const baseDps = baseAtk / (baseAS ?? 1)

  const dpsDiff = dps - baseDps

  const equipmentStats =
    unit.variants?.equipment?.baseStats ?? null

  return (
    <>
      {/* ヘッダー */}

      <h2 style={{ fontSize: 18, fontWeight: 800 }}>
        {unit.name}
      </h2>

      {/* 基本情報 */}

      <div
        style={{
          fontSize: 13,
          opacity: 0.85,
          display: "flex",
          gap: 12,
          marginBottom: 10,
        }}
      >
        <div>{unit.cost}Cost</div>
        <div>{unit.role}</div>
        <div>{rangeLabel}</div>
      </div>

      {/* タブ（handのみ） */}

      {mode === "hand" && (
        <div
          style={{
            display: "flex",
            gap: 6,
            marginBottom: 10
          }}
        >
          <TabButton
            label="Unit"
            active={tab === "unit"}
            onClick={() => setTab("unit")}
          />

          {unit.variants?.equipment && (
            <TabButton
              label="Equipment"
              active={tab === "equipment"}
              onClick={() => setTab("equipment")}
            />
          )}

          {unit.variants?.synergy && (
            <TabButton
              label="Synergy"
              active={tab === "synergy"}
              onClick={() => setTab("synergy")}
            />
          )}
        </div>
      )}

      {/* =========================
          UNIT
      ========================= */}

      {(mode === "board" || tab === "unit") && (
        <>
          <div style={{ marginBottom: 10 }}>

            <StatRow
              label="ATK"
              value={stats ? stats.atk : baseAtk}
              color={getStatColor(atkDiff)}
            />

            <StatRow
              label="HP"
              value={stats ? stats.maxHp : baseHp}
              color={getStatColor(hpDiff)}
            />

            <StatRow
              label="AS"
              value={
                stats
                  ? stats.attackSpeed.toFixed(2)
                  : baseAS?.toFixed(2)
              }
              color={getStatColor(asDiff)}
            />

            <StatRow
              label="DPS"
              value={dps.toFixed(2)}
              color={getStatColor(dpsDiff)}
            />

            <StatRow
              label="DR"
              value={stats ? stats.damageReduce : baseDR}
              color={getStatColor(drDiff)}
            />

          </div>

          <h3>能力</h3>

          {(unit.abilities ?? []).map((a, i) => (
            <div key={i}>{abilityToLine(a)}</div>
          ))}
        </>
      )}

      {/* =========================
          EQUIPMENT
      ========================= */}

      {mode === "hand" &&
        tab === "equipment" &&
        unit.variants?.equipment && (
          <>
            <h3>{unit.variants.equipment.name}</h3>

            {equipmentStats && (
              <div style={{ marginBottom: 10 }}>
                {Object.entries(equipmentStats).map(([k, v]) => (
                  <StatRow
                    key={k}
                    label={k.toUpperCase()}
                    value={`+${v}`}
                  />
                ))}
              </div>
            )}

            {(unit.variants.equipment.abilities ?? []).map((a, i) => (
              <div key={i}>{abilityToLine(a)}</div>
            ))}
          </>
        )}

      {/* =========================
          SYNERGY
      ========================= */}

      {mode === "hand" &&
        tab === "synergy" &&
        unit.variants?.synergy && (
          <>
            <h3>{unit.variants.synergy.name}</h3>

            {(unit.variants.synergy.abilities ?? []).map((a, i) => (
              <div key={i}>{abilityToLine(a)}</div>
            ))}
          </>
        )}
    </>
  )
}