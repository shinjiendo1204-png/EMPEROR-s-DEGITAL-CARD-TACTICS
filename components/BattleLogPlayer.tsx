import { BattleLog } from "@/types"
import { useBattleTimeline } from "@/hooks/useBattleTimeline"

type Props = {
  logs: BattleLog[]
}

export function BattleLogPlayer({ logs }: Props) {
  const {
    currentLog,
    index,
    isPlaying,
    isEnd,
    next,
    prev,
    play,
    pause,
    reset,
  } = useBattleTimeline(logs, {
    intervalMs: 600,
    autoPlay: false,
  })

  if (!logs || logs.length === 0) {
    return <div>ログがありません</div>
  }

  return (
    <div style={{ border: "1px solid #444", padding: 12 }}>
      <div style={{ minHeight: 40, marginBottom: 8 }}>
        {currentLog ? currentLog.text : "—"}
      </div>

      <div style={{ fontSize: 12, opacity: 0.7 }}>
        {index + 1} / {logs.length}
      </div>

      <div style={{ marginTop: 8, display: "flex", gap: 8 }}>
        <button onClick={prev} disabled={index === 0}>
          ◀
        </button>

        {!isPlaying ? (
          <button onClick={play}>▶</button>
        ) : (
          <button onClick={pause}>⏸</button>
        )}

        <button onClick={next} disabled={isEnd}>
          ▶▶
        </button>

        <button onClick={reset}>↺</button>
      </div>
    </div>
  )
}
