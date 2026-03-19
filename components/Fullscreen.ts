export function enterFullscreen() {
  const el = document.documentElement

  if (el.requestFullscreen) {
    el.requestFullscreen()
  } else if ((el as any).webkitRequestFullscreen) {
    (el as any).webkitRequestFullscreen()
  }
}

export function exitFullscreen() {
  if (document.exitFullscreen) {
    document.exitFullscreen()
  }
}

export function isFullscreen() {
  return !!document.fullscreenElement
}