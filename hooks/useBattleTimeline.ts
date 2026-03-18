import { useEffect, useRef, useState } from "react"
import { BattleLog } from "@/types"

type Options = {
  intervalMs?: number
  autoPlay?: boolean
}

export function useBattleTimeline(
  logs: BattleLog[],
  options: Options = {}
) {
  const { intervalMs = 600, autoPlay = false } = options

  const [index, setIndex] = useState(0)
  const [isPlaying, setIsPlaying] = useState(autoPlay)
  const timerRef = useRef<number | null>(null)

  const currentLog = logs[index] ?? null
  const isEnd = index >= logs.length - 1

  function next() {
    setIndex(i => Math.min(i + 1, logs.length - 1))
  }

  function prev() {
    setIndex(i => Math.max(i - 1, 0))
  }

  function reset() {
    setIndex(0)
    setIsPlaying(false)
  }

  function play() {
    if (logs.length === 0) return
    setIsPlaying(true)
  }

  function pause() {
    setIsPlaying(false)
  }

  // 再生ループ
  useEffect(() => {
    if (!isPlaying || isEnd) {
      if (timerRef.current) {
        clearInterval(timerRef.current)
        timerRef.current = null
      }
      return
    }

    timerRef.current = window.setInterval(() => {
      setIndex(i => {
        if (i >= logs.length - 1) {
          setIsPlaying(false)
          return i
        }
        return i + 1
      })
    }, intervalMs)

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current)
        timerRef.current = null
      }
    }
  }, [isPlaying, intervalMs, logs.length, isEnd])

  return {
    // 状態
    currentLog,
    index,
    isPlaying,
    isEnd,

    // 操作
    next,
    prev,
    play,
    pause,
    reset,
  }
}
