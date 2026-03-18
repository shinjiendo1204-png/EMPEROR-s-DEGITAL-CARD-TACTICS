import { Unit } from "@/types"
import { DragItem } from "@/types/drag"
import { Card } from "@/components/Card"

type Props = {
  hand: Unit[]
  selectedIndex: number | null
  onSelect: (index: number) => void
  onEquip: (handIndex: number, boardIndex: number | null) => void
  selectedBoardIndex: number | null
  onDragStart?: (item: DragItem) => void
  disabled?: boolean

  /** ★追加：右クリックで詳細（hand） */
  onRightClickUnit?: (unit: Unit, x: number, y: number) => void
}

export function Hand({
  hand,
  selectedIndex,
  onSelect,
  onEquip,
  selectedBoardIndex,
  onDragStart,
  disabled,
  onRightClickUnit,
}: Props) {
  return (
    <div style={{ display: "flex", gap: 16 }}>
      {hand.map((u, i) => {
        const canEquip = selectedBoardIndex !== null

        return (
          <Card
            key={i}
            unit={u}
            selected={i === selectedIndex}
            onClick={() => {
              if (disabled) return
              onSelect(i)
            }}
            onDragStart={() => {
              if (disabled) return
              onSelect(i)
              onDragStart?.({ type: "hand", handIndex: i })
            }}
            onContextMenu={(e) => {   // ←ここ追加
            if (disabled) return
            e.preventDefault()
            onRightClickUnit?.(u, e.clientX, e.clientY)
          }}
            hero={u.mode === "hero"} 
          />
        )
      })}
    </div>
  )
}