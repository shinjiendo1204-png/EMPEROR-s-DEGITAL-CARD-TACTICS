import styles from "./Card.module.css"
import { Unit } from "@/types"

type Props = {
  unit: Unit
  selected?: boolean
  onClick?: () => void
  onDragStart?: () => void
  onContextMenu?: (e: React.MouseEvent) => void 
  hero?: boolean
}

export function Card({
  unit,
  selected,
  onClick,
  onDragStart,
  onContextMenu,
  hero,
}: Props) {

  const isHero = hero

  return (
    <div
      className={`
        ${styles.card}
        ${styles[`pack${unit.pack}`]}
        ${styles[`cost${unit.cost}`]}
        ${selected ? styles.selected : ""}
      `}
      onClick={onClick}
      draggable
      onDragStart={onDragStart}
      onContextMenu={onContextMenu}
    >

      {/* コスト or ヒーロー */}
      {!isHero ? (
        <div className={styles.costMedal}>
          {unit.cost}
        </div>
      ) : (
        <div className={styles.heroBadge}>✦</div>
      )}

      {/* ART */}
     <div className={styles.artWrapper}>
  <img src={`./units/${unit.id}.jpg`} draggable={false} />
</div>

      {/* NAME */}
      <div className={styles.name}>{unit.name}</div>

      {/* STATS */}
      <div className={styles.stats}>
        <div className={styles.atkBox}>{unit.atk}</div>
        <div className={styles.hpBox}>{unit.hp}</div>
      </div>

    </div>
  )
}