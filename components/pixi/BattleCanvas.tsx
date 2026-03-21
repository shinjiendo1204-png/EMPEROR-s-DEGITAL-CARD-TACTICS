"use client"

import { useEffect, useRef } from "react"
import * as PIXI from "pixi.js"
import { BattleUnit, BattleLog } from "@/types"
import { BATTLE_COLS } from "@/lib/battle/boardsize"

type Props = {
  board: BattleUnit[]
  logs: BattleLog[]
}

type StatsTexts = {
  atkText: PIXI.Text;
  slashText: PIXI.Text;
  hpText: PIXI.Text;
}

export default function BattleCanvas({ board, logs }: Props) {
  const containerRef = useRef<HTMLDivElement | null>(null)
  const appRef = useRef<PIXI.Application | null>(null)
  const unitLayerRef = useRef<PIXI.Container>(new PIXI.Container())
  
  const spriteMapRef = useRef<Record<string, PIXI.Container>>({})
  const statsTextMapRef = useRef<Record<string, StatsTexts>>({})
  const targetPositionsRef = useRef<Record<string, { x: number; y: number }>>({})
  const textureCacheRef = useRef<Record<string, PIXI.Texture>>({})

  const CELL_W = 70
  const CELL_H = 64
  const GAP_X = 6
  const GAP_Y = 16 
  const OFFSET_X = 28

  useEffect(() => {
    let active = true
    const init = async () => {
      if (!containerRef.current || appRef.current) return
      const app = new PIXI.Application()
      await app.init({
        width: containerRef.current.clientWidth,
        height: containerRef.current.clientHeight,
        backgroundAlpha: 0,
        antialias: true,
        resolution: window.devicePixelRatio || 1,
        autoDensity: true, 
      })
      if (!active) return
      appRef.current = app
      containerRef.current.innerHTML = ""
      containerRef.current.appendChild(app.canvas)
      app.stage.addChild(unitLayerRef.current)

      app.ticker.add(() => {
        unitLayerRef.current.children.forEach((container: any) => {
          const id = container.instanceId;
          const target = targetPositionsRef.current[id];
          if (!target) return;

          if (container.logicX === undefined) container.logicX = container.x;
          if (container.logicY === undefined) container.logicY = container.y;

          container.logicX += (target.x - container.logicX) * 0.15;
          container.logicY += (target.y - container.logicY) * 0.15;

          const dist = Math.sqrt(
            Math.pow(target.x - container.logicX, 2) + 
            Math.pow(target.y - container.logicY, 2)
          );
          const jumpHeight = Math.min(dist * 0.4, 18);

          container.x = container.logicX;
          container.y = container.logicY - jumpHeight;
        });
      });
    }
    init()
    return () => { 
      active = false
      if (appRef.current) {
        appRef.current.destroy(true, { children: true, texture: true })
        appRef.current = null
      }
    }
  }, [])

  useEffect(() => {
    const app = appRef.current
    if (!app) return

    const originX = (app.screen.width - ((BATTLE_COLS * CELL_W) + OFFSET_X)) / 2
    const originY = 2; 
    const CURRENT_GAP_Y = 6;

    const currentIds = new Set(board.map(u => u.instanceId));

    Object.keys(spriteMapRef.current).forEach(id => {
      if (!currentIds.has(id)) {
        const container = spriteMapRef.current[id];
        if (container) {
          unitLayerRef.current.removeChild(container);
          container.destroy({ children: true });
        }
        delete spriteMapRef.current[id];
        delete statsTextMapRef.current[id];
        delete targetPositionsRef.current[id];
      }
    });

    board.forEach(async (u) => {
      // ✅ エンジン側ですでに計算済みの値（u.atk, u.hp）をそのまま使う
      const displayAtk = Math.round(u.atk);
      const displayHp = Math.round(u.hp);
      
      const pos = u.pos ?? { r: 0, c: 0 }
      const tPos = {
        x: originX + (pos.c * (CELL_W + GAP_X)) + (pos.r % 2 === 1 ? OFFSET_X : 0),
        y: originY + (pos.r * (CELL_H + CURRENT_GAP_Y)) 
      }

      if (spriteMapRef.current[u.instanceId]) {
        const container = spriteMapRef.current[u.instanceId] as any;
        const texts = statsTextMapRef.current[u.instanceId];
        targetPositionsRef.current[u.instanceId] = tPos;

        // BattleCanvas.tsx の statsTextMapRef 更新部分
if (texts) {
  const displayAtk = Math.round(u.atk);
  const displayHp = Math.round(u.hp);
  const displayMaxHp = Math.round(u.maxHp || u.baseMaxHp);

 texts.hpText.text = `${displayHp}`;

  // 色判定：最大HPがベースより高ければ緑にする
  const isBuffed = displayMaxHp > (u.baseMaxHp ?? 100);
  texts.hpText.style.fill = isBuffed ? "#6bff8a" : "#ffffff";
}
        return; 
      }

      // --- 新規作成時 ---
      const container = new PIXI.Container() as any;
      container.instanceId = u.instanceId;
      container.logicX = tPos.x;
      container.logicY = tPos.y;
      container.x = tPos.x;
      container.y = tPos.y;
      targetPositionsRef.current[u.instanceId] = tPos;

      const unitVisual = new PIXI.Container()
      let texture = textureCacheRef.current[u.unitId]
      if (!texture) {
        try {
          texture = await PIXI.Assets.load(`/units/${u.unitId}.jpg`)
          textureCacheRef.current[u.unitId] = texture
        } catch (e) { texture = PIXI.Texture.WHITE; }
      }
      
      const sprite = new PIXI.Sprite(texture)
      sprite.anchor.set(0.5); sprite.x = CELL_W / 2; sprite.y = CELL_H / 2
      if (texture !== PIXI.Texture.WHITE) {
        sprite.scale.set(Math.max(CELL_W / texture.width, CELL_H / texture.height))
      } else {
        sprite.width = CELL_W; sprite.height = CELL_H; sprite.tint = 0xff0000;
      }

      const mask = new PIXI.Graphics().beginFill(0xffffff)
        .moveTo(CELL_W * 0.25, 0).lineTo(CELL_W * 0.75, 0).lineTo(CELL_W, CELL_H * 0.5)
        .lineTo(CELL_W * 0.75, CELL_H).lineTo(CELL_W * 0.25, CELL_H).lineTo(0, CELL_H * 0.5)
        .closePath().endFill()
      unitVisual.addChild(sprite, mask); unitVisual.mask = mask
      container.addChild(unitVisual)

      const border = new PIXI.Graphics().lineStyle(2, 0xffffff, 0.2)
        .moveTo(CELL_W * 0.25, 0).lineTo(CELL_W * 0.75, 0).lineTo(CELL_W, CELL_H * 0.5)
        .lineTo(CELL_W * 0.75, CELL_H).lineTo(CELL_W * 0.25, CELL_H).lineTo(0, CELL_H * 0.5)
        .closePath(); container.addChild(border)

      const statsContainer = new PIXI.Container()
      const STATS_BG_W = 52
      const statsBg = new PIXI.Graphics().beginFill(0x2d2620, 0.85).drawRoundedRect(0, 0, STATS_BG_W, 16, 8).endFill()
      const style = { fontSize: 11, fontWeight: '900' as any, fill: '#ffffff' }
      
      const atkText = new PIXI.Text(`${displayAtk}`, style)
      const slashText = new PIXI.Text("/", { ...style, fill: '#aaa', fontSize: 9 })
      const hpText = new PIXI.Text(`${displayHp}`, style)
      
      if (displayAtk > (u.baseAtk ?? 0)) atkText.style.fill = "#6bff8a";
      
      atkText.anchor.set(1, 0.5);   atkText.position.set(22, 8)
      slashText.anchor.set(0.5, 0.5); slashText.position.set(26, 8)
      hpText.anchor.set(0, 0.5);    hpText.position.set(30, 8)

      statsContainer.addChild(statsBg, atkText, slashText, hpText)
      statsContainer.position.set((CELL_W - STATS_BG_W) / 2, CELL_H - 8)
      container.addChild(statsContainer)

      unitLayerRef.current.addChild(container)
      spriteMapRef.current[u.instanceId] = container
      statsTextMapRef.current[u.instanceId] = { atkText, slashText, hpText }
      
      container.scale.set(0);
      let age = 0;
      const summonTicker = (delta: PIXI.Ticker) => {
        age += delta.deltaTime;
        const p = Math.min(1, age / 15);
        container.scale.set(p);
        if (p >= 1) app.ticker.remove(summonTicker);
      };
      app.ticker.add(summonTicker);
    })
  }, [board])

  const processedLogsRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    const app = appRef.current;
    if (!app) return;

    logs.forEach((log) => {
      if (!log.instanceId) return;
      const logKey = `${log.time}-${log.instanceId}-${log.action}-${(log as any).value}`;
      if (processedLogsRef.current.has(logKey)) return;
      processedLogsRef.current.add(logKey);

      const unit = spriteMapRef.current[log.instanceId];
      if (!unit) return;

      if (log.action === "attack") {
        const isPlayerSide = (log as any).isPlayer ?? true;
        const dir = isPlayerSide ? 1 : -1; 
        const pushAmount = 24 * dir; 
        let age = 0;
        const attackTicker = (delta: PIXI.Ticker) => {
          age += delta.deltaTime;
          if (age < 5) {
            unit.x += (pushAmount / 5) * delta.deltaTime;
          } else if (age < 15) {
            unit.x -= (pushAmount / 10) * delta.deltaTime;
          } else {
            app.ticker.remove(attackTicker);
          }
        };
        app.ticker.add(attackTicker);
      }

      if (log.action === "damage" || log.action === "self_damage") {
        const value = (log as any).value || 0;
        if (value <= 0) return;
        const isSelf = log.action === "self_damage";
        const dmgText = new PIXI.Text(`${Math.round(value)}`, {
          fontSize: isSelf ? 18 : 26, 
          fontWeight: '900' as any, 
          fill: isSelf ? '#ffaa00' : '#ff4444',
          stroke: { color: '#000000', width: 4 }
        });
        dmgText.anchor.set(0.5);
        dmgText.x = unit.x + CELL_W / 2;
        dmgText.y = unit.y + CELL_H / 2;
        app.stage.addChild(dmgText);

        const originalX = unit.x;
        let age = 0;
        const dmgTicker = (delta: PIXI.Ticker) => {
          age += delta.deltaTime;
          dmgText.y -= 1.2 * delta.deltaTime;
          dmgText.alpha = 1 - (age / 35);
          if (age < 12) {
            unit.x = originalX + (Math.random() - 0.5) * 8;
          } else if (age >= 12 && age < 14) {
            unit.x = originalX;
          }
          if (age > 35) {
            app.stage.removeChild(dmgText);
            dmgText.destroy();
            app.ticker.remove(dmgTicker);
          }
        };
        app.ticker.add(dmgTicker);
      }

      if (log.action === "heal") {
        const value = (log as any).value || 0;
        const text = new PIXI.Text(`+${Math.round(value)}`, {
          fontSize: 22, fontWeight: '900' as any, fill: '#6bff8a', stroke: { color: '#004400', width: 4 }
        });
        text.anchor.set(0.5);
        text.x = unit.x + CELL_W / 2;
        text.y = unit.y - 12;
        app.stage.addChild(text);
        let age = 0;
        const healTicker = (delta: PIXI.Ticker) => {
          age += delta.deltaTime;
          text.y -= 1.5;
          text.alpha = 1 - (age / 45);
          if (age > 45) {
            app.stage.removeChild(text);
            text.destroy();
            app.ticker.remove(healTicker);
          }
        };
        app.ticker.add(healTicker);
      }
    });
  }, [logs]);

  return <div ref={containerRef} style={{ position: "absolute", inset: 0, pointerEvents: "none" }} />
}