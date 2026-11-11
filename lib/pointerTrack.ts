// Remembers where the mouse last was. Pages change under a cursor that is not moving (clicking "Show more events" lands the
// pointer on a card on the next page) and the browser sends no events until the mouse moves again, so hover effects ask
// this instead. Module state survives client-side navigation.
let last: { x: number; y: number } | null = null
let installed = false

export function trackPointer() {
  if (installed || typeof window === 'undefined') return
  installed = true
  window.addEventListener('pointermove', e => { if (e.pointerType === 'mouse') last = { x: e.clientX, y: e.clientY } }, { passive: true, capture: true })
}

export function getPointer() {
  return last
}
