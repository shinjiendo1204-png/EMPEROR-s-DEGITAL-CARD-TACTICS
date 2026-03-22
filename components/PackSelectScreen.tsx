"use client"

import { PackId } from "@/types"
import { PACK_IDS } from "@/data/packs"
import { useState } from "react"

type Props = {
  selectedPack: PackId | null
  enemyPack?: PackId | null
  disabledPacks?: PackId[]
  onSelect: (packId: PackId) => void
  onViewCardList: (packId: PackId) => void // 親コンポーネントで受け取る用
}

const PACK_INFO: Record<string, { desc: string }> = {
  Antiqua: {
    desc: "探求と装備でスケールする冒険者パック"
  },
  Varkesh: {
    desc: "自傷、呪印、死亡で強化される邪悪パック"
  },
  Knightsteel: {
    desc: "軽減、AS増加、ヒールが得意な騎士パック"
  }
}

export function PackSelectScreen({
  selectedPack,
  enemyPack,
  disabledPacks,
  onSelect,
  onViewCardList,
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
        background: "radial-gradient(circle at center, #1a1a1a, #000)",
        color: "#fff",
        overflow: "hidden",
      }}
    >
      {/* =========================
          TITLE
      ========================= */}
      <h2 style={{ fontSize: 32, letterSpacing: 1.2, marginBottom: 40 }}>
        パックを選択する
      </h2>

      {/* =========================
          PACK CARDS AREA
      ========================= */}
      <div style={{ display: "flex", gap: 32 }}>
        {PACK_IDS.map(packId => {
          const disabled = disabledPacks?.includes(packId)
          const isHovered = hovered === packId
          const isSelected = selectedPack === packId

          return (
            <div
              key={packId}
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 20, // カードとボタンの隙間
              }}
            >
              {/* --- カード本体 --- */}
              <div
                onClick={() => !disabled && onSelect(packId)}
                onMouseEnter={() => !disabled && setHovered(packId)}
                onMouseLeave={() => setHovered(null)}
                style={{
                  width: 240,
                  height: 340,
                  position: "relative",
                  cursor: disabled ? "not-allowed" : "pointer",
                  opacity: disabled ? 0.3 : 1,
                  borderRadius: 16,
                  overflow: "hidden",
                  border: isSelected ? "3px solid #4fd1ff" : "1px solid #333",
                  transform: isHovered ? "scale(1.05)" : "scale(1)",
                  transition: "0.2s ease",
                  boxShadow: isSelected
                    ? "0 0 25px rgba(79,209,255,0.6)"
                    : isHovered
                    ? "0 12px 30px rgba(0,0,0,0.7)"
                    : "0 6px 16px rgba(0,0,0,0.4)",
                }}
              >
                <img
                  src={`./packs/${packId}.jpg`}
                  onError={(e) => {
                    (e.currentTarget as HTMLImageElement).src = "./units/_placeholder.jpg"
                  }}
                  style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                  }}
                />
                <div
                  style={{
                    position: "absolute",
                    bottom: 0,
                    width: "100%",
                    padding: 14,
                    background: "linear-gradient(transparent, rgba(0,0,0,0.95))",
                  }}
                >
                  <div style={{ fontSize: 20, fontWeight: "bold" }}>{packId}</div>
                  <div style={{ fontSize: 13, opacity: 0.75, marginTop: 6 }}>
                    {PACK_INFO[packId]?.desc}
                  </div>
                </div>
              </div>

              {/* --- VIEW LIST ボタン --- */}
              <button
                onClick={(e) => {
                  e.stopPropagation(); // 親の onClick (onSelect) を防ぐ
                  onViewCardList(packId);
                }}
                style={{
                  width: "100%",
                  padding: "10px 0",
                  borderRadius: 12,
                  background: "rgba(255, 255, 255, 0.05)",
                  border: "1px solid rgba(255, 255, 255, 0.2)",
                  color: "#fff",
                  fontSize: 11,
                  fontWeight: "bold",
                  letterSpacing: "1px",
                  cursor: "pointer",
                  transition: "0.2s",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = "rgba(255, 255, 255, 0.15)";
                  e.currentTarget.style.borderColor = "#d8b15a";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = "rgba(255, 255, 255, 0.05)";
                  e.currentTarget.style.borderColor = "rgba(255, 255, 255, 0.2)";
                }}
              >
                カードリスト
              </button>
            </div>
          )
        })}
      </div>

      {/* =========================
          FOOTER INFO
      ========================= */}
      {selectedPack && !enemyPack && (
        <div style={{ marginTop: 36, opacity: 0.7 }}>
          カードプール作成中...
        </div>
      )}

      {selectedPack && enemyPack && (
        <div style={{ marginTop: 40, display: "flex", flexDirection: "column", alignItems: "center", gap: 18 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 28 }}>
            <img src={`./packs/${selectedPack}.jpg`} style={{ width: 100, height: 140, borderRadius: 8, border: "1px solid rgba(255,255,255,0.2)" }} />
            <div style={{ fontSize: 34, fontWeight: 800, opacity: 0.8 }}>+</div>
            <img src={`./packs/${enemyPack}.jpg`} style={{ width: 100, height: 140, borderRadius: 8, border: "1px solid rgba(255,255,255,0.2)" }} />
          </div>
          <div style={{ fontSize: 18, fontWeight: 700 }}>{selectedPack} × {enemyPack}</div>
        </div>
      )}
    </div>
  )
}