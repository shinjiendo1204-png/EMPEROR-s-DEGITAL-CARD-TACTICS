import { useState } from "react"
import { PlayerState } from "@/types"

const LABEL: Record<string, string> = {
  dig: "探求",
  teamCurseApplied: "呪印付与数",
  teamOnDeathTriggerCount: "味方死亡数",
  swiftVolley: "連射カウント",
  corpseCount: "死体数",
  equipmentDestroyed: "装備破壊数",
  equipmentForged: "装備数",
  selfDamage: "自傷回数",
  selfEquip: "装備カウント",
  damageReduce: "ダメージ軽減回数",
  onDeath: "死亡時効果回数",
  as_stack:"AS上昇回数",
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
        padding: "8px 12px",
        borderRadius: 8,
        fontSize: 12,
        color: "white",
        zIndex: 20,
        minWidth: 140
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
        <div style={{ opacity: 0.5 }}>なし</div>
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