import React from "react";
import { PackId, Unit } from "@/types";
import { PACK_UNITS } from "@/data/packs";
import { HERO_UNITS } from "@/data/heroes"; 
import { Card } from "./Card";
import styles from "./CardListOverlay.module.css";

type Props = {
  packId: PackId;
  onClose: () => void;
  onRightClickUnit: (unit: Unit, x: number, y: number) => void;
};

export function CardListOverlay({ packId, onClose, onRightClickUnit }: Props) {
  // 1. 通常のユニットを取得
  const normalUnits = PACK_UNITS[packId] || [];

  // 2. ヒーローユニットの中から、このパックに属するものだけを抽出
  // packId が "Knightsteel" の場合、unit.pack === "Knightsteel" のものを探します
  const packHeroes = HERO_UNITS.filter(u => u.pack === packId);

  // 3. ヒーローを先頭にして合体させる
  const allUnits = [...packHeroes, ...normalUnits];

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.container} onClick={(e) => e.stopPropagation()}>
        
        <div className={styles.header}>
          <div>
            <div className={styles.label}>PACK COLLECTION</div>
            <h2 className={styles.packName}>{packId}</h2>
          </div>
          <button className={styles.closeBtn} onClick={onClose}>×</button>
        </div>

        <div className={styles.grid}>
          {allUnits.map((unit) => (
            <div key={unit.id} style={{ position: "relative" }}>
              <Card
                unit={unit}
                hero={unit.mode === "hero"}
                onClick={() => {
                  onRightClickUnit(unit, window.innerWidth / 2, window.innerHeight / 2);
                }}
                onContextMenu={(e: React.MouseEvent) => {
                  e.preventDefault();
                  onRightClickUnit(unit, e.clientX, e.clientY);
                }}
              />
              
              {/* ★ ヒーローカードに特別なバッジを表示 */}
              {unit.mode === "hero" && (
                <div style={{
                  position: "absolute",
                  top: -8,
                  left: -8,
                  background: "linear-gradient(45deg, #d8b15a, #f9e4a8)",
                  color: "#000",
                  fontSize: "10px",
                  fontWeight: "900",
                  padding: "2px 8px",
                  borderRadius: "4px",
                  boxShadow: "0 2px 4px rgba(0,0,0,0.5)",
                  zIndex: 10,
                  letterSpacing: "1px"
                }}>
                  HERO
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}