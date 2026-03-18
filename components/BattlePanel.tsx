"use client"

import { useState } from "react"
import { BattleLog } from "@/types"

type Props = {
  phase: "setup" | "battle" | "result"
  logs: BattleLog[]
  battleResult?: {
    winner: "player" | "enemy" | "draw"
    damage?: number
  } | null
}

export function BattlePanel({
  phase,
  logs,
  battleResult,
}: Props) {
  const [tab, setTab] = useState<"log" | "result">("log")

  return (
    <div
      style={{
        width: 360,
        height: "100%",
        display: "flex",
        flexDirection: "column",
        background: "rgba(18,18,18,0.92)",
        borderLeft: "1px solid rgba(255,255,255,0.12)",
      }}
    >
      {/* ===== Tabs ===== */}
      <div
        style={{
          display: "flex",
          borderBottom: "1px solid rgba(255,255,255,0.12)",
        }}
      >
        {(["log", "result"] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            style={{
              flex: 1,
              padding: "10px 0",
              background:
                tab === t
                  ? "rgba(255,255,255,0.08)"
                  : "transparent",
              color: "#fff",
              border: "none",
              cursor: "pointer",
              fontWeight: tab === t ? 700 : 400,
            }}
          >
            {t === "log" ? "Battle Log" : "Result"}
          </button>
        ))}
      </div>

      {/* ===== Content ===== */}
      <div
        style={{
          flex: 1,
          overflowY: "auto",
          padding: 12,
          fontSize: 12,
          color: "#eee",
        }}
      >
        {tab === "log" && (
          <>
            {logs.length === 0 && (
              <div style={{ opacity: 0.5 }}>
                No battle logs
              </div>
            )}
            {logs.map((log, i) => (
              <div
                key={i}
                style={{
                  marginBottom: 6,
                  lineHeight: 1.4,
                }}
              >
                {log.text}
              </div>
            ))}
          </>
        )}

        {tab === "result" && (
          <>
            {battleResult ? (
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: 12,
                }}
              >
                <div
                  style={{
                    fontSize: 18,
                    fontWeight: 700,
                  }}
                >
                  {battleResult.winner === "player" &&
                    "Victory"}
                  {battleResult.winner === "enemy" &&
                    "Defeat"}
                  {battleResult.winner === "draw" &&
                    "Draw"}
                </div>

                {battleResult.damage !== undefined && (
                  <div>
                    Damage: {battleResult.damage}
                  </div>
                )}
              </div>
            ) : (
              <div style={{ opacity: 0.5 }}>
                No result yet
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
