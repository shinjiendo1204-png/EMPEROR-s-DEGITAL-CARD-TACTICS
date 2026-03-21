"use client"

import { useEffect, useRef } from "react"
import * as PIXI from "pixi.js"
import { BattleUnit, BattleLog } from "@/types"
import { BATTLE_COLS } from "@/lib/battle/boardsize"
import { calculateFinalStats } from "@/lib/battle/statCalculator"

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
  
  // ★重要: removeChildren() をやめるため、ステージ用のコンテナを持つ
  const unitLayerRef = useRef<PIXI.Container>(new PIXI.Container())
  
  const spriteMapRef = useRef<Record<string, PIXI.Container>>({})
  const statsTextMapRef = useRef<Record<string, StatsTexts>>({})
  const targetPositionsRef = useRef<Record<string, { x: number; y: number }>>({})
  const textureCacheRef = useRef<Record<string, PIXI.Texture>>({})

  // --- 盤面サイズ設定 (前回調整したサイズ) ---
  const CELL_W = 70
  const CELL_H = 64
  const GAP_X = 6
  const GAP_Y = 16 
  const OFFSET_X = 28
  
  const getPos = (r: number, c: number, originX: number, originY: number) => ({
    x: originX + (c * (CELL_W + GAP_X)) + (r % 2 === 1 ? OFFSET_X : 0),
    y: originY + (r * (CELL_H + GAP_Y))
  })

  // PIXIの初期化 (1回だけ実行)
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

      // ユニットレイヤーを追加
      app.stage.addChild(unitLayerRef.current)

      app.ticker.add(() => {
        for (const id in spriteMapRef.current) {
          const target = targetPositionsRef.current[id]
          const container = spriteMapRef.current[id]
          if (target && container) {
            // なめらかな移動
            container.x += (target.x - container.x) * 0.2
            container.y += (target.y - container.y) * 0.2
          }
        }
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

  // 盤面の描画更新 (★ここを差分更新に修正)
  // 盤面の描画更新 (★ここを修正)
  // 盤面の描画更新
  useEffect(() => {
    const app = appRef.current
    if (!app) return

    // --- ここを大幅に修正 ---
    const originX = (app.screen.width - ((BATTLE_COLS * CELL_W) + OFFSET_X)) / 2
    
    const originY = -0; 

    const CURRENT_GAP_Y = 8; // ★ 16 や 8 からさらに 4 まで詰める
    // -----------------------

    const currentIds = new Set(board.map(u => u.instanceId));

    // 消去ロジック（変更なし）
    Object.keys(spriteMapRef.current).forEach(id => {
      if (!currentIds.has(id)) {
        const container = spriteMapRef.current[id];
        unitLayerRef.current.removeChild(container);
        container.destroy({ children: true });
        delete spriteMapRef.current[id];
        delete statsTextMapRef.current[id];
        delete targetPositionsRef.current[id];
      }
    });

    board.forEach(async (u) => {
      const pos = u.pos ?? { r: 0, c: 0 }
      
      // 座標計算に新しい originY と CURRENT_GAP_Y を適用
      const tPos = {
        x: originX + (pos.c * (CELL_W + GAP_X)) + (pos.r % 2 === 1 ? OFFSET_X : 0),
        y: originY + (pos.r * (CELL_H + CURRENT_GAP_Y)) 
      }

      targetPositionsRef.current[u.instanceId] = tPos;

      if (spriteMapRef.current[u.instanceId]) {
        const texts = statsTextMapRef.current[u.instanceId];
        if (texts) {
          texts.atkText.text = `${Math.round(u.atk)}`;
          texts.hpText.text = `${Math.round(u.hp)}`;
          texts.atkText.style.fill = u.atk > (u.baseAtk ?? 0) ? "#6bff8a" : "#ffffff";
        }
        return; 
      }

      // --- ここから新規作成 (グールなど) ---
      const container = new PIXI.Container()
      
      // 召喚時は、目標地点にパッと出すか、ふわっと出すか
      container.x = tPos.x
      container.y = tPos.y
      
      // 召喚演出: ちょっと小さく始めて大きくする
      container.scale.set(0.5);
      container.alpha = 0;

      // --- ユニット画像 ---
      const unitVisual = new PIXI.Container()
      let texture = textureCacheRef.current[u.unitId]
      if (!texture) {
        try {
          texture = await PIXI.Assets.load(`/units/${u.unitId}.jpg`)
          textureCacheRef.current[u.unitId] = texture
        } catch (e) {
          // 画像がない場合のプレースホルダー
          texture = PIXI.Texture.WHITE;
        }
      }
      
      const sprite = new PIXI.Sprite(texture)
      sprite.anchor.set(0.5); sprite.x = CELL_W / 2; sprite.y = CELL_H / 2
      if (texture !== PIXI.Texture.WHITE) {
        sprite.scale.set(Math.max(CELL_W / texture.width, CELL_H / texture.height))
      } else {
        sprite.width = CELL_W; sprite.height = CELL_H; sprite.tint = 0xff0000; // 赤い四角
      }

      const mask = new PIXI.Graphics().beginFill(0xffffff)
        .moveTo(CELL_W * 0.25, 0).lineTo(CELL_W * 0.75, 0).lineTo(CELL_W, CELL_H * 0.5)
        .lineTo(CELL_W * 0.75, CELL_H).lineTo(CELL_W * 0.25, CELL_H).lineTo(0, CELL_H * 0.5)
        .closePath().endFill()
      unitVisual.addChild(sprite, mask); unitVisual.mask = mask
      container.addChild(unitVisual)

      // --- 枠線 ---
      const border = new PIXI.Graphics().lineStyle(2, 0xffffff, 0.2)
        .moveTo(CELL_W * 0.25, 0).lineTo(CELL_W * 0.75, 0).lineTo(CELL_W, CELL_H * 0.5)
        .lineTo(CELL_W * 0.75, CELL_H).lineTo(CELL_W * 0.25, CELL_H).lineTo(0, CELL_H * 0.5)
        .closePath(); container.addChild(border)

      // --- スタッツ表示 ---
      const statsContainer = new PIXI.Container()
      const STATS_BG_W = 52
      const statsBg = new PIXI.Graphics().beginFill(0x2d2620, 0.85).drawRoundedRect(0, 0, STATS_BG_W, 16, 8).endFill()
      const style = { fontSize: 11, fontWeight: '900' as any, fill: '#ffffff' }
      
      const atkText = new PIXI.Text(`${Math.round(u.atk)}`, style)
      const slashText = new PIXI.Text("/", { ...style, fill: '#aaa', fontSize: 9 })
      const hpText = new PIXI.Text(`${Math.round(u.hp)}`, style)

      atkText.anchor.set(1, 0.5);   atkText.position.set(22, 8)
      slashText.anchor.set(0.5, 0.5); slashText.position.set(26, 8)
      hpText.anchor.set(0, 0.5);    hpText.position.set(30, 8)

      statsContainer.addChild(statsBg, atkText, slashText, hpText)
      statsContainer.position.set((CELL_W - STATS_BG_W) / 2, CELL_H - 8)
      container.addChild(statsContainer)

      // レイヤーに追加
      unitLayerRef.current.addChild(container)
      
      // キャッシュに保存
      spriteMapRef.current[u.instanceId] = container
      statsTextMapRef.current[u.instanceId] = { atkText, slashText, hpText }

      // 召喚アニメーション (Tween的な処理を簡易的にTickerで行う)
      let summonAge = 0;
      const summonTicker = (delta: PIXI.Ticker) => {
        summonAge += delta.deltaTime;
        const progress = Math.min(1, summonAge / 10); // 10フレームで完了
        
        container.scale.set(0.5 + 0.5 * progress); // 0.5 -> 1.0
        container.alpha = progress; // 0 -> 1

        if (progress >= 1) {
          app.ticker.remove(summonTicker);
        }
      };
      app.ticker.add(summonTicker);
    })
  }, [board]) // board が変わるたびに差分更新が走る

  // ヒール演出 (logsを監視して、新しいhealログがあれば演出を出す)
  const processedLogsRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    const app = appRef.current;
    if (!app) return;

    logs.forEach((log) => {
      // 一意なキーを作成
      const logKey = `${log.time}-${log.instanceId}-${log.action}-${(log as any).value}`;
      if (processedLogsRef.current.has(logKey)) return; // 処理済みならスキップ
      processedLogsRef.current.add(logKey);

      if ((log as any).action === "heal" && log.instanceId) {
        const unit = spriteMapRef.current[log.instanceId];
        if (!unit) return;

        const value = (log as any).value || 0;
        const text = new PIXI.Text(`+${Math.round(value)}`, {
          fontSize: 20, fontWeight: '900' as any, fill: '#6bff8a', stroke: { color: '#004400', width: 4 }
        })
        text.anchor.set(0.5)
        // ユニットの頭上に表示
        text.x = unit.x + CELL_W / 2
        text.y = unit.y - 10
        app.stage.addChild(text)

        let age = 0
        const ticker = (delta: PIXI.Ticker) => {
          age += delta.deltaTime
          text.y -= 1.5 // ふわっと浮き上がる
          text.alpha = 1 - (age / 40) // 徐々に消える
          if (age > 40) {
            app.stage.removeChild(text)
            text.destroy()
            app.ticker.remove(ticker)
          }
        }
        app.ticker.add(ticker)
      }
    });
  }, [logs]); // logs が更新されるたびにチェック

  return <div ref={containerRef} style={{ position: "absolute", inset: 0, pointerEvents: "none" }} />
}