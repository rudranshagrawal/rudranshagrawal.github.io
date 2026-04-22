/**
 * Minimal hand-rolled SVG line chart for weight-over-time.
 */
export default function WeightChart({ data = [], goalKg }) {
  const W = 360;
  const H = 140;
  const PAD = 16;

  if (!data.length) {
    return (
      <div className="h-[140px] flex items-center justify-center text-fg-muted text-sm bg-bg-elev rounded-xl">
        No weight data yet. Log weight from the Today tab.
      </div>
    );
  }

  const kgs = data.map((d) => d.kg);
  const minKg = Math.min(...kgs, goalKg ?? Infinity) - 1;
  const maxKg = Math.max(...kgs, goalKg ?? -Infinity) + 1;
  const range = maxKg - minKg || 1;

  const xStep = data.length > 1 ? (W - PAD * 2) / (data.length - 1) : 0;
  const points = data.map((d, i) => {
    const x = PAD + i * xStep;
    const y = PAD + (1 - (d.kg - minKg) / range) * (H - PAD * 2);
    return [x, y];
  });

  const path = points
    .map(([x, y], i) => (i === 0 ? `M${x},${y}` : `L${x},${y}`))
    .join(" ");

  // Build an area under the line for soft fill
  const areaPath =
    points.length > 1
      ? `${path} L${points[points.length - 1][0]},${H - PAD} L${points[0][0]},${H - PAD} Z`
      : "";

  const first = data[0];
  const last = data[data.length - 1];
  const delta = last.kg - first.kg;

  return (
    <div>
      <div className="flex items-baseline justify-between mb-3">
        <div>
          <div className="text-2xl font-semibold tabular-nums text-fg">
            {last.kg} kg
          </div>
          <div
            className={`text-sm font-medium ${
              delta < 0
                ? "text-amber"
                : delta > 0
                  ? "text-term-red"
                  : "text-fg-muted"
            }`}
          >
            {delta >= 0 ? "+" : ""}
            {delta.toFixed(1)} kg total
          </div>
        </div>
        <div className="text-xs text-fg-muted">
          {data.length} entr{data.length === 1 ? "y" : "ies"}
        </div>
      </div>
      <svg
        viewBox={`0 0 ${W} ${H}`}
        className="w-full h-auto"
        preserveAspectRatio="none"
      >
        <defs>
          <linearGradient id="fit-area" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor="#4A7F6A" stopOpacity="0.2" />
            <stop offset="100%" stopColor="#4A7F6A" stopOpacity="0" />
          </linearGradient>
        </defs>

        {/* Baseline */}
        <line
          x1={PAD}
          y1={H - PAD}
          x2={W - PAD}
          y2={H - PAD}
          stroke="currentColor"
          strokeOpacity="0.1"
        />

        {/* Goal line */}
        {goalKg != null && goalKg >= minKg && goalKg <= maxKg && (
          <line
            x1={PAD}
            x2={W - PAD}
            y1={PAD + (1 - (goalKg - minKg) / range) * (H - PAD * 2)}
            y2={PAD + (1 - (goalKg - minKg) / range) * (H - PAD * 2)}
            stroke="#4A7F6A"
            strokeDasharray="3,3"
            strokeOpacity="0.5"
          />
        )}

        {/* Area */}
        {areaPath && <path d={areaPath} fill="url(#fit-area)" />}

        {/* Line */}
        <path
          d={path}
          fill="none"
          stroke="#4A7F6A"
          strokeWidth="2"
          strokeLinejoin="round"
          strokeLinecap="round"
        />

        {/* Dots */}
        {points.map(([x, y], i) => (
          <circle key={i} cx={x} cy={y} r="3" fill="#4A7F6A" />
        ))}
      </svg>
    </div>
  );
}
