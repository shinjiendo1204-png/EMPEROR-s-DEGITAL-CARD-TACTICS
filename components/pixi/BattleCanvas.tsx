"use client"

import { useEffect, useRef } from "react"
import * as PIXI from "pixi.js"
import { BattleUnit, BattleLog } from "@/types"
import { BATTLE_COLS } from "@/lib/battle/boardsize" // ここが 6 になっていることを確認

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
  
  const spriteMapRef = useRef<Record<string, PIXI.Container>>({})
  const statsTextMapRef = useRef<Record<string, StatsTexts>>({})
  const targetPositionsRef = useRef<Record<string, { x: number; y: number }>>({})

  // 6列に合わせてサイズを微調整
  const CELL_W = 62
  const CELL_H = 58
  const GAP_X = 4
  const GAP_Y = 12 // 行間を詰めないと 8行（上下4行ずつ）入り切らない
  const OFFSET_X = 24
  
  // 座標計算
  const getPos = (r: number, c: number, originX: number, originY: number) => ({
    x: originX + (c * (CELL_W + GAP_X)) + (r % 2 === 1 ? OFFSET_X : 0),
    y: originY + (r * (CELL_H + GAP_Y))
  })

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

      app.ticker.add(() => {
        for (const id in spriteMapRef.current) {
          const target = targetPositionsRef.current[id]
          const container = spriteMapRef.current[id]
          if (target && container) {
            container.x += (target.x - container.x) * 0.2
            container.y += (target.y - container.y) * 0.2
          }
        }
      })
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

    // 1. 画面とキャッシュを完全にリセット（これで分身と消失の両方を防ぐ）
    app.stage.removeChildren();
    spriteMapRef.current = {};
    statsTextMapRef.current = {};
    targetPositionsRef.current = {};

    // 座標計算
    const estimatedRows = 10 
    const boardFullH = (estimatedRows * CELL_H) + ((estimatedRows - 1) * GAP_Y)
    const originX = (app.screen.width - ((BATTLE_COLS * CELL_W) + OFFSET_X)) / 2
    const originY = (app.screen.height - boardFullH) /  80;

    // 2. ユニットの描画（常に新規作成）
    board.forEach(async (u) => {
      const container = new PIXI.Container()
      const pos = u.pos ?? { r: 0, c: 0 }
      const tPos = getPos(pos.r, pos.c, originX, originY)

      container.x = tPos.x
      container.y = tPos.y

      // --- 1. ユニット画像 & マスク ---
      const unitVisual = new PIXI.Container()
      const texture = await PIXI.Assets.load(`/units/${u.unitId}.jpg`)
      const sprite = new PIXI.Sprite(texture)
      sprite.anchor.set(0.5)
      sprite.x = CELL_W / 2
      sprite.y = CELL_H / 2
      const scale = Math.max(CELL_W / texture.width, CELL_H / texture.height)
      sprite.scale.set(scale)

      const mask = new PIXI.Graphics()
        .beginFill(0xffffff)
        .moveTo(CELL_W * 0.25, 0).lineTo(CELL_W * 0.75, 0)
        .lineTo(CELL_W, CELL_H * 0.5).lineTo(CELL_W * 0.75, CELL_H)
        .lineTo(CELL_W * 0.25, CELL_H).lineTo(0, CELL_H * 0.5)
        .closePath().endFill()

      unitVisual.addChild(sprite, mask)
      unitVisual.mask = mask
      container.addChild(unitVisual)

      // --- 2. 枠線 ---
      const border = new PIXI.Graphics()
        .lineStyle(2, 0xffffff, 0.2)
        .moveTo(CELL_W * 0.25, 0).lineTo(CELL_W * 0.75, 0)
        .lineTo(CELL_W, CELL_H * 0.5).lineTo(CELL_W * 0.75, CELL_H)
        .lineTo(CELL_W * 0.25, CELL_H).lineTo(0, CELL_H * 0.5)
        .closePath()
      container.addChild(border)

      // --- 3. 装備アイコン ---
      if (u.equipments && u.equipments.length > 0) {
        const eqContainer = new PIXI.Container()
        const EQ_SIZE = 18
        const EQ_GAP = 4
        const totalW = (u.equipments.length * EQ_SIZE) + ((u.equipments.length - 1) * EQ_GAP)

        // 装備アイコンをループで追加
        for (const [index, eq] of u.equipments.entries()) {
          try {
            const eqTex = await PIXI.Assets.load(`/units/${eq.id}.jpg`)
            const eqSp = new PIXI.Sprite(eqTex)
            eqSp.width = eqSp.height = EQ_SIZE
            eqSp.x = index * (EQ_SIZE + EQ_GAP)
            
            const eqBg = new PIXI.Graphics()
              .lineStyle(1, 0xffffff, 0.6).beginFill(0x000000)
              .drawRoundedRect(eqSp.x, 0, EQ_SIZE, EQ_SIZE, 4).endFill()
            
            eqContainer.addChild(eqBg, eqSp)
          } catch (e) { console.error(e) }
        }
        eqContainer.x = (CELL_W - totalW) / 2
        eqContainer.y = -18
        container.addChild(eqContainer)
      }

      // --- 4. スタッツ表示 ---
      const statsContainer = new PIXI.Container()
      const STATS_BG_W = 48
      const statsBg = new PIXI.Graphics().beginFill(0x000000, 0.6).drawRoundedRect(0, 0, STATS_BG_W, 14, 6).endFill()
      const style = { fontSize: 9, fontWeight: '700' as any, fill: '#ffffff' }
      const atkText = new PIXI.Text("", style)
      const slashText = new PIXI.Text("/", { ...style, fill: '#aaa' })
      const hpText = new PIXI.Text("", style)

      atkText.anchor.set(1, 0.5);   atkText.position.set(20, 7)
      slashText.anchor.set(0.5, 0.5); slashText.position.set(24, 7)
      hpText.anchor.set(0, 0.5);    hpText.position.set(28, 7)

      statsContainer.addChild(statsBg, atkText, slashText, hpText)
      statsContainer.position.set((CELL_W - STATS_BG_W) / 2, CELL_H - 7)
      container.addChild(statsContainer)

      // ステージに追加してキャッシュを保存
      app.stage.addChild(container)
      spriteMapRef.current[u.instanceId] = container
      statsTextMapRef.current[u.instanceId] = { atkText, slashText, hpText }
      targetPositionsRef.current[u.instanceId] = tPos

      // 初回テキスト設定
      const BUFF = "#6bff8a", DEBUFF = "#ff6b6b", DEFAULT = "#ffffff"
      atkText.text = `${Math.round(u.atk)}`
      hpText.text = `${Math.round(u.hp)}`
      atkText.style.fill = u.atk > (u.baseAtk || 0) ? BUFF : u.atk < (u.baseAtk || 0) ? DEBUFF : DEFAULT
      hpText.style.fill = u.maxHp > (u.baseMaxHp || 0) ? BUFF : u.maxHp < (u.baseMaxHp || 0) ? DEBUFF : DEFAULT
    })
  }, [board])
  // ヒール演出
  const showHealEffect = (instanceId: string, value: number) => {
    const app = appRef.current
    const unit = spriteMapRef.current[instanceId]
    if (!app || !unit) return

    const text = new PIXI.Text(`+${Math.round(value)}`, {
      fontSize: 18, fontWeight: '900' as any, fill: '#6bff8a', stroke: { color: '#004400', width: 4 }
    })
    text.anchor.set(0.5)
    text.x = unit.x + CELL_W / 2
    text.y = unit.y
    app.stage.addChild(text)

    let age = 0
    const ticker = (delta: PIXI.Ticker) => {
      age += delta.deltaTime
      text.y -= 1.2
      text.alpha = 1 - (age / 40)
      if (age > 40) {
        app.stage.removeChild(text)
        text.destroy()
        app.ticker.remove(ticker)
      }
    }
    app.ticker.add(ticker)
  }

  useEffect(() => {
    logs.forEach((log) => {
      if ((log as any).action === "heal" && log.instanceId) {
        showHealEffect(log.instanceId, (log as any).value || 0)
      }
    })
  }, [logs])

  return <div ref={containerRef} style={{ position: "absolute", inset: 0, pointerEvents: "none" }} />
}