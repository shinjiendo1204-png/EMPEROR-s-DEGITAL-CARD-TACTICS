import { BattleUnit } from "@/types"
import { DragItem } from "@/types/drag"
import { PLAYER_ROWS, BATTLE_COLS } from "@/lib/battle/boardsize"
import { calculateFinalStats } from "@/lib/battle/statCalculator"

const CELL_WIDTH = 64
const CELL_HEIGHT = 62

type VisualEvent = {
  id: string
  type: "damage" | "death" | "heal"
  value?: number
}

type Props = {
  board: (BattleUnit | null)[]
  onPlace: (index: number) => void
  canPlace?: (index: number) => boolean
  isBattle?: boolean
  onSell?: (index: number) => void
  canSell?: boolean
  now?: number

  onSelectUnit?: (index: number) => void
  selectedBoardIndex?: number | null
  onMove?: (index: number) => void
  selectedHandIndex?: number | null

  onDragStart?: (item: DragItem, unit: BattleUnit) => void
  onDragEnd?: () => void

  onRightClickUnit?: (unit: BattleUnit, x: number, y: number) => void

  dragItem?: DragItem | null
  disabled?: boolean
  flipVertical?: boolean
  onDropAt?: (index: number) => void

  visualEvents?: VisualEvent[]
}

export function Board({
  board,
  onPlace,
  canPlace,
  onSelectUnit,
  selectedBoardIndex,
  onMove,
  selectedHandIndex,
  onDropAt,
  onDragStart,
  onDragEnd,
  dragItem,
  isBattle = false,
  disabled = false,
  flipVertical = false,
  onRightClickUnit,
  visualEvents,
  now,
}: Props) {

  const rows = Array.from(
    { length: isBattle ? PLAYER_ROWS * 2 : PLAYER_ROWS },
    (_, r) =>
      Array.from({ length: BATTLE_COLS }, (_, c) =>
        r * BATTLE_COLS + c
      )
  )

  const displayRows = flipVertical ? [...rows].reverse() : rows

  function renderCell(i: number) {

    const col = i % BATTLE_COLS
    const row = Math.floor(i / BATTLE_COLS)

    let unit: BattleUnit | null = null

    if (isBattle) {

      unit =
        board.find(
          (u): u is BattleUnit =>
            !!u &&
            u.pos?.r === row &&
            u.pos?.c === col
        ) ?? null

    } else {

      unit = board[i] ?? null
    }

    const placeable = canPlace ? canPlace(i) : true

    const fromC = unit?.prevPos?.c ?? unit?.pos?.c ?? col
    const fromR = unit?.prevPos?.r ?? unit?.pos?.r ?? row

    const toC = unit?.pos?.c ?? col
    const toR = unit?.pos?.r ?? row

    const dx = (fromC - toC) * CELL_WIDTH
    const dy = (fromR - toR) * CELL_HEIGHT

    const damageEvent = visualEvents?.find(
      (v) => unit && v.id === unit.instanceId && v.type === "damage"
    )

    const deathEvent = visualEvents?.find(
      (v) => unit && v.id === unit.instanceId && v.type === "death"
    )
      const healEvent = visualEvents?.find(
  (v) => unit && v.id === unit.instanceId && v.type === "heal"
)
    const isSelected = selectedBoardIndex === i

    const isDraggingThis =
      dragItem?.type === "board" && dragItem.boardIndex === i

    const isHandPlacing =
      selectedHandIndex !== null || dragItem?.type === "hand"

    const isBoardMoving =
      dragItem?.type === "board" && dragItem.boardIndex !== i

    const highlight = !unit && (isHandPlacing || isBoardMoving)

    const hpRatio = unit
      ? Math.max(0, Math.min(1, unit.hp / unit.maxHp))
      : 0

    return (
      <div
        key={i}
        onContextMenu={(e) => {
          if (!unit) return
          e.preventDefault()
          onRightClickUnit?.(unit, e.clientX, e.clientY)
        }}
        onClick={() => {

          if (disabled) return

          if (!unit && selectedHandIndex !== null && placeable) {
            onPlace(i)
            return
          }

          if (selectedBoardIndex !== null && selectedBoardIndex !== i) {
            onMove?.(i)
            return
          }

          if (unit) {
            onSelectUnit?.(i)
          }
        }}
        onDragOver={(e) => {
          if (disabled) return
          e.preventDefault()
        }}
        onDrop={() => {
          if (disabled) return
          onDropAt?.(i)
        }}
        draggable={!disabled && !!unit}
        onDragStart={(e) => {

          if (disabled || !unit) return

          onSelectUnit?.(i)

          onDragStart?.(
            { type: "board", boardIndex: i },
            unit
          )

          const ghost = document.createElement("div")

          ghost.style.position = "absolute"
          ghost.style.top = "-1000px"
          ghost.style.left = "-1000px"

          ghost.innerHTML = `
          <svg width="${CELL_WIDTH}" height="${CELL_HEIGHT}" viewBox="0 0 100 100">
            <defs>
              <clipPath id="hexClip">
                <polygon points="25,0 75,0 100,50 75,100 25,100 0,50"/>
              </clipPath>
            </defs>

            <image
              href="./units/${unit.unitId}.jpg"
              width="100"
              height="100"
              preserveAspectRatio="xMidYMid slice"
              clip-path="url(#hexClip)"
            />

            <polygon
              points="25,0 75,0 100,50 75,100 25,100 0,50"
              fill="none"
              stroke="#ffd700"
              stroke-width="2"
            />
          </svg>
          `

          document.body.appendChild(ghost)

          e.dataTransfer.setDragImage(
            ghost,
            CELL_WIDTH / 2,
            CELL_HEIGHT / 2
          )

          setTimeout(() => {
            document.body.removeChild(ghost)
          }, 0)
        }}
        onDragEnd={() => {
          onDragEnd?.()
        }}
        style={{
          width: CELL_WIDTH,
          height: CELL_HEIGHT,
          position: "relative",
          overflow: "visible",

          animation: damageEvent
            ? "hitShake 0.25s ease"
            : undefined,

          transition: "filter 0.15s",

          filter: damageEvent
            ? "brightness(1.6)"
            : "none",

          opacity: deathEvent ? 0 : 1,

          cursor: disabled ? "default" : "pointer",

          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >

        <div
          style={{
            position: "absolute",
            inset: 0,

            clipPath:
              "polygon(25% 0%,75% 0%,100% 50%,75% 100%,25% 100%,0% 50%)",

            overflow: "hidden",
          }}
        >

          <div
            style={{
              position: "absolute",
              inset: 0,

              transform: `translate(${dx}px, ${dy}px)`,

              transition: "transform 0.25s linear",

              background: unit
                ? "#2a2a2a"
                : highlight
                ? "rgba(255,215,0,0.15)"
                : "rgba(255,255,255,0.02)",

              border: isDraggingThis
                ? "2px solid #ffd700"
                : highlight
                ? "2px solid rgba(255,215,0,0.6)"
                : unit
                ? "1px solid rgba(255,255,255,0.12)"
                : "1px solid rgba(255,255,255,0.18)",
            }}
          />

          <div
            style={{
              position: "absolute",
              inset: 0,
              background: unit
                ? "#2a2a2a"
                : "rgba(255,255,255,0.02)",
              border: "1px solid rgba(255,255,255,0.12)"
            }}
          />

          {unit && (
            <div
              style={{
                position: "absolute",
                inset: 0,
                pointerEvents: "none",
              }}
            >
              <img
                src={`./units/${unit.unitId}.jpg`}
                alt={unit.unitName}
                draggable={false}
                onError={(ev) => {
                  ;(ev.currentTarget as HTMLImageElement).src =
                    "./units/_placeholder.jpg"
                }}
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",

                  clipPath:
                    "polygon(25% 0%,75% 0%,100% 50%,75% 100%,25% 100%,0% 50%)",
                }}
              />
            </div>
          )}

        </div>

        {unit && (
          <>
            {unit.equipments && unit.equipments.length > 0 && (
              <div
                style={{
                  position: "absolute",
                  top: -14,
                  left: "50%",
                  transform: "translateX(-50%)",
                  display: "flex",
                  gap: 3,
                  zIndex: 6
                }}
              >
                {unit.equipments.map((eq: any, index: number) => (
                  <img
                    key={index}
                    src={`./units/${eq.id}.jpg`}
                    onError={(ev) => {
                      ;(ev.currentTarget as HTMLImageElement).src =
                        "./units/_placeholder.jpg"
                    }}
                    style={{
                      width: 14,
                      height: 14,
                      borderRadius: 3,
                      border: "1px solid rgba(255,255,255,0.6)",
                      background: "#000"
                    }}
                  />
                ))}
              </div>
            )}

            {(() => {

              const stats = calculateFinalStats(unit, 0)
              
              const atkColor =
                stats.atk > unit.baseAtk ? "#6bff8a" :
                stats.atk < unit.baseAtk ? "#ff6b6b" :
                "#ffffff"

              const hpColor =
                stats.maxHp > unit.baseMaxHp ? "#6bff8a" :
                stats.maxHp < unit.baseMaxHp ? "#ff6b6b" :
                "#ffffff"

              return (
                <div
                  style={{
                    position: "absolute",
                    bottom: -14,
                    left: "50%",
                    transform: "translateX(-50%)",
                    fontSize: 8,
                    fontWeight: 700,
                    background: "rgba(0,0,0,0.6)",
                    padding: "1px 6px",
                    borderRadius: 6,
                    zIndex: 10
                  }}
                >
                  <span style={{ color: atkColor }}>
                    {Math.round(stats.atk)}
                  </span>

                  <span style={{ color: "#aaa" }}>/</span>

                  <span style={{ color: hpColor }}>
                    {Math.round(unit.hp)}
                  </span>
                </div>
              )
            })()}

            {damageEvent && (
              <div
                style={{
                  position: "absolute",
                  top: -8,
                  fontSize: 14,
                  fontWeight: 800,
                  color: "#ff4d4d",
                  animation: "floatUp 0.6s ease-out forwards",
                  pointerEvents: "none",
                  zIndex: 5,
                }}
              >
                -{damageEvent.value}
              </div>
            )}

            {healEvent && (
              <div
                style={{
                  position: "absolute",
                  top: -8,
                  fontSize: 14,
                  fontWeight: 800,
                  color: "#6bff8a",
                  animation: "floatUp 0.6s ease-out forwards",
                  pointerEvents: "none",
                  zIndex: 5,
                }}
              >
                +{healEvent.value}
              </div>
            )}

          </>
        )}
      </div>
    )
  }

  return (
    <>
      <style>
        {`
        @keyframes floatUp {
          0% { transform: translateY(0); opacity: 1; }
          100% { transform: translateY(-20px); opacity: 0; }
        }

        @keyframes hitShake {
          0% { transform: translateX(0); }
          25% { transform: translateX(-3px); }
          50% { transform: translateX(3px); }
          75% { transform: translateX(-2px); }
          100% { transform: translateX(0); }
        }
        `}
      </style>

      <div
        style={{
          display: "flex",
          flexDirection: "column",
          columnGap: 18,
          rowGap: 22,
          alignItems: "center",
          transform: `
            perspective(1200px)
            ${flipVertical ? "scale(0.9)" : "scale(1)"}
          `,
          transformStyle: "preserve-3d",
          opacity: flipVertical ? 0.6 : 1,
        }}
      >
        {displayRows.map((row, rowIndex) => (
          <div
            key={rowIndex}
            style={{
              display: "flex",
              gap: 6,
              transform: rowIndex % 2 === 1
                ? "translateX(32px)"
                : "translateX(0)"
            }}
          >
            {row.map(renderCell)}
          </div>
        ))}
      </div>
    </>
  )
}