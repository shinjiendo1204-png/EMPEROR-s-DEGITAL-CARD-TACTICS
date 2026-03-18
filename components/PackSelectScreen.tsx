import { PackId } from "@/types"
import { PACK_IDS } from "@/data/packs"

type Props = {
  selectedPack: PackId | null
  disabledPacks?: PackId[]
  onSelect: (packId: PackId) => void
}

export function PackSelectScreen({
  selectedPack,
  disabledPacks,
  onSelect,
}: Props) {
  return (
    <div
      style={{
        height: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        background: "#111",
        color: "#fff",
      }}
    >
      <h2>パックを選択</h2>

      <div style={{ display: "flex", gap: 16, marginTop: 24 }}>
        {PACK_IDS.map(packId => {
  const disabled = disabledPacks?.includes(packId)

  return (
    <button
      key={packId}
      disabled={disabled}
      onClick={() => onSelect(packId)}
      style={{
        opacity: disabled ? 0.3 : 1,
        cursor: disabled ? "not-allowed" : "pointer",
        padding: "8px 12px",
        background: selectedPack === packId ? "#0af" : "#222",
        border: "1px solid #333",
        borderRadius: 6,
        color: "#fff",
        minWidth: 80,
      }}
    >
      {packId}
    </button>
  )
})}

      </div>

      {selectedPack && (
        <div style={{ marginTop: 24, opacity: 0.7 }}>
          選択中：{selectedPack}
        </div>
      )}
    </div>
  )
}
