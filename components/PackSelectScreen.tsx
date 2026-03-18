import { PackId } from "@/types"
import { PACK_IDS } from "@/data/packs"
import { useState } from "react"

type Props = {
  selectedPack: PackId | null
  enemyPack?: PackId | null
  disabledPacks?: PackId[]
  onSelect: (packId: PackId) => void
}

const PACK_INFO: Record<string, { desc: string }> = {
  Antiqua: {
    desc: "Scale with relic power"
  },
  Varkesh: {
    desc: "Sacrifice & curse enemies"
  },
  Knightsteel: {
    desc: "Speed & combat buffs"
  }
}

export function PackSelectScreen({
  selectedPack,
  enemyPack,
  disabledPacks,
  onSelect,
}: Props) {

  const [hovered, setHovered] = useState<PackId | null>(null)

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
      }}
    >
      {/* =========================
          TITLE
      ========================= */}
      <h2 style={{ fontSize: 32, letterSpacing: 1.2 }}>
        Choose Your Pack
      </h2>

      {/* =========================
          PACK CARDS
      ========================= */}
      <div style={{ display: "flex", gap: 32, marginTop: 48 }}>
        {PACK_IDS.map(packId => {
          const disabled = disabledPacks?.includes(packId)
          const isHovered = hovered === packId
          const isSelected = selectedPack === packId

          return (
            <div
              key={packId}
              onClick={() => !disabled && onSelect(packId)}
              onMouseEnter={() => setHovered(packId)}
              onMouseLeave={() => setHovered(null)}
              style={{
                width: 240,
                height: 340,
                position: "relative",
                cursor: disabled ? "not-allowed" : "pointer",
                opacity: disabled ? 0.3 : 1,

                borderRadius: 16,
                overflow: "hidden",

                border: isSelected
                  ? "3px solid #4fd1ff"
                  : "1px solid #333",

                transform: isHovered ? "scale(1.07)" : "scale(1)",
                transition: "0.2s ease",

                boxShadow: isSelected
                  ? "0 0 25px rgba(79,209,255,0.6)"
                  : isHovered
                  ? "0 12px 30px rgba(0,0,0,0.7)"
                  : "0 6px 16px rgba(0,0,0,0.4)",
              }}
            >
              {/* IMAGE */}
              <img
                src={`/packs/${packId}.jpg`}
                onError={(e) => {
                  (e.currentTarget as HTMLImageElement).src =
                    "/units/_placeholder.jpg"
                }}
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                }}
              />

              {/* BOTTOM */}
              <div
                style={{
                  position: "absolute",
                  bottom: 0,
                  width: "100%",
                  padding: 14,
                  background:
                    "linear-gradient(transparent, rgba(0,0,0,0.95))",
                }}
              >
                <div style={{ fontSize: 20, fontWeight: "bold" }}>
                  {packId}
                </div>

                <div
                  style={{
                    fontSize: 13,
                    opacity: 0.75,
                    marginTop: 6,
                  }}
                >
                  {PACK_INFO[packId]?.desc}
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* =========================
          GENERATING
      ========================= */}
      {selectedPack && !enemyPack && (
        <div style={{ marginTop: 36, opacity: 0.7 }}>
          Creating shared card pool...
        </div>
      )}

      {/* =========================
          FUSION RESULT
      ========================= */}
      {selectedPack && enemyPack && (
        <div
          style={{
            marginTop: 40,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 18,
          }}
        >
          {/* PACK + PACK */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 28,
            }}
          >
            <img
              src={`/packs/${selectedPack}.jpg`}
              style={{
                width: 120,
                height: 160,
                objectFit: "cover",
                borderRadius: 10,
                border: "1px solid rgba(255,255,255,0.2)",
              }}
            />

            {/* PLUS */}
            <div
              style={{
                fontSize: 34,
                fontWeight: 800,
                opacity: 0.8,
              }}
            >
              +
            </div>

            <img
              src={`/packs/${enemyPack}.jpg`}
              style={{
                width: 120,
                height: 160,
                objectFit: "cover",
                borderRadius: 10,
                border: "1px solid rgba(255,255,255,0.2)",
              }}
            />
          </div>

          {/* RESULT TITLE */}
          <div
            style={{
              fontSize: 18,
              fontWeight: 700,
              letterSpacing: 1,
            }}
          >
            {selectedPack} × {enemyPack}
          </div>

          {/* POOL */}
          <div
            style={{
              fontSize: 15,
              opacity: 0.85,
            }}
          >
            Shared Card Pool Created
          </div>

          {/* COMBO */}
          <div
            style={{
              fontSize: 13,
              opacity: 0.6,
            }}
          >
            {PACK_INFO[selectedPack]?.desc} × {PACK_INFO[enemyPack]?.desc}
          </div>
        </div>
      )}

      {/* SELECTED */}
      {selectedPack && (
        <div style={{ marginTop: 20, opacity: 0.5, fontSize: 13 }}>
          Selected: {selectedPack}
        </div>
      )}
    </div>
  )
}