import { useState } from "react"
import { PlayerState } from "@/types"

export const LABEL: Record<string, string> = {
  dig: "dig",
  devour: "devour",
  teamCurseApplied: "Curse Applied",
  teamOnDeathTriggerCount: "Ally Deaths",
  swiftVolley: "Volley Count",
  corpseCount: "Corpses",
  equipmentDestroyed: "Equipment Destroyed",
  equipmentForged: "Equipment Crafted",
  selfDamage: "Self Damage",
  selfEquip: "Equip Count",
  damageReduce: "Damage Reduced",
  onDeath: "On-Death Triggers",
  as_stack: "AS Stacks",
}

export function CounterPanel({
  player,
  battleCounters
}: {
  player: PlayerState
  battleCounters: Record<string, number>
}) {
  const [scope, setScope] = useState<"match" | "battle">("match")
  
  const counters =
    scope === "match"
      ? player.counters?.match ?? {}
      : battleCounters

const HIDDEN_KEYS = ["digProgress", "digTotal"]

const entries = Object.entries(counters)
  .filter(([key, val]) => Number(val) > 0)
  .filter(([key]) => !HIDDEN_KEYS.includes(key))
  return (
    <div
      style={{
  position: "absolute",
  right: 12,
  bottom: 12,

  background: "rgba(0,0,0,0.6)",

  padding: "10px 14px",   // ← 少し広げる
  borderRadius: 8,       // ← 少し丸く

  fontSize: 11,           // ← メイン

  color: "white",
  zIndex: 20,
  minWidth: 120           // ← 横も少し広げる
}}
    >
      {/* 切り替え */}
      <div style={{ display: "flex", gap: 4, marginBottom: 6 }}>
        <button
          onClick={() => setScope("match")}
          style={{
            flex: 1,
            background: scope === "match" ? "#444" : "#222",
            color: "#fff",
            border: "none",
            borderRadius: 4,
            padding: "4px 6px",
            cursor: "pointer"
          }}
        >
          Match
        </button>

        <button
          onClick={() => setScope("battle")}
          style={{
            flex: 1,
            background: scope === "battle" ? "#444" : "#222",
            color: "#fff",
            border: "none",
            borderRadius: 4,
            padding: "4px 6px",
            cursor: "pointer"
          }}
        >
          Battle
        </button>
      </div>

      {/* 中身 */}
      {entries.length === 0 ? (
        <div style={{ opacity: 0.5 }}>No Stacks</div>
      ) : (
        entries.map(([key, val]) => (
          <div key={key}>
            {LABEL[key] ?? key}: {Number(val)}
          </div>
        ))
      )}
    </div>
  )
}