export default function CardBorderTrace({
  radius = 16,
}: {
  radius?: number
}) {
  return (
    <svg
      style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none', zIndex: 2 }}
      preserveAspectRatio="none"
    >
      <rect
        className="card-trace-right"
        x="1" y="1" width="calc(100% - 2px)" height="calc(100% - 2px)"
        rx={radius} ry={radius}
        fill="none"
        stroke="var(--accent)"
        strokeWidth="2"
        pathLength="1"
        strokeDasharray="0 1"
        strokeDashoffset="0.368"
        strokeLinecap="round"
      />
      <rect
        className="card-trace-left"
        x="1" y="1" width="calc(100% - 2px)" height="calc(100% - 2px)"
        rx={radius} ry={radius}
        fill="none"
        stroke="var(--accent)"
        strokeWidth="2"
        pathLength="1"
        strokeDasharray="0 1"
        strokeDashoffset="0.375"
        strokeLinecap="round"
        style={{ transform: 'scaleX(-1)', transformOrigin: 'center' }}
      />
    </svg>
  )
}