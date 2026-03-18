// components/FusionScreen.tsx

import { PackId } from "@/types"

export function FusionScreen({
  p1Pack,
  p2Pack,
}: {
  p1Pack: PackId | null
  p2Pack: PackId | null
}) {
  if (!p1Pack || !p2Pack) return null

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
      {/* タイトル */}
      <div style={{ fontSize: 28, opacity: 0.8 }}>
        Fusing Packs...
      </div>

      {/* 中央 */}
      <div style={{ display: "flex", alignItems: "center", gap: 32 }}>
        <img
          src={`/packs/${p1Pack}.jpg`}
          style={{ width: 140, height: 180, borderRadius: 10 }}
        />

        <div style={{ fontSize: 36, fontWeight: 800 }}>+</div>

        <img
          src={`/packs/${p2Pack}.jpg`}
          style={{ width: 140, height: 180, borderRadius: 10 }}
        />
      </div>

      {/* 結果 */}
      <div style={{ fontSize: 20, fontWeight: 700 }}>
        {p1Pack} × {p2Pack}
      </div>

      <div style={{ opacity: 0.7 }}>
        Shared Card Pool Created
      </div>
    </div>
  )
}