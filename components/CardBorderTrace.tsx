export default function CardBorderTrace({
  radius = 16,
  inset = 1.5,
}: {
  radius?: number
  inset?: number
}) {
  const insetRadius = Math.max(radius - inset, 0)
  return (
    <svg
      style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none', zIndex: 2 }}
      preserveAspectRatio="none"
    >
      <rect
        className="card-trace-right"
        x={inset} y={inset} width={`calc(100% - ${inset * 2}px)`} height={`calc(100% - ${inset * 2}px)`}
        rx={insetRadius} ry={insetRadius}
        fill="none"
        stroke="var(--accent)"
        strokeWidth="3"
        pathLength="1"
        strokeDasharray="0 1"
        strokeDashoffset="0.368"
        strokeLinecap="round"
      />
      <rect
        className="card-trace-left"
        x={inset} y={inset} width={`calc(100% - ${inset * 2}px)`} height={`calc(100% - ${inset * 2}px)`}
        rx={insetRadius} ry={insetRadius}
        fill="none"
        stroke="var(--accent)"
        strokeWidth="3"
        pathLength="1"
        strokeDasharray="0 1"
        strokeDashoffset="0.375"
        strokeLinecap="round"
        style={{ transform: 'scaleX(-1)', transformOrigin: 'center' }}
      />
    </svg>
  )
}