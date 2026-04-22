/**
 * Minimal hand-rolled SVG line chart for weight-over-time. No chart lib.
 * `data` is an array of { date, kg }, sorted ascending.
 */
export default function WeightChart({ data = [], goalKg }) {
  const W = 360;
  const H = 140;
  const PAD = 16;

  if (!data.length) {
    return (
      <div className="h-[140px] flex items-center justify-center text-fg-faint text-xs border border-dashed border-line">
        no weight data yet — log your weight on the today tab
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

  const path = points.map(([x, y], i) => (i === 0 ? `M${x},${y}` : `L${x},${y}`)).join(" ");

  const first = data[0];
  const last = data[data.length - 1];
  const delta = last.kg - first.kg;

  return (
    <div>
      <div className="flex items-baseline justify-between mb-2">
        <div>
          <div className="text-xl text-fg tabular-nums">{last.kg} kg</div>
          <div className={`text-xs ${delta < 0 ? "text-term-green" : delta > 0 ? "text-term-red" : "text-fg-muted"}`}>
            {delta >= 0 ? "+" : ""}
            {delta.toFixed(1)} kg total
          </div>
        </div>
        <div className="text-[10px] text-fg-faint">
          {data.length} entr{data.length === 1 ? "y" : "ies"}
        </div>
      </div>
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto" preserveAspectRatio="none">
        {/* Grid */}
        <line x1={PAD} y1={H - PAD} x2={W - PAD} y2={H - PAD} stroke="currentColor" strokeOpacity="0.15" />
        <line x1={PAD} y1={PAD} x2={W - PAD} y2={PAD} stroke="currentColor" strokeOpacity="0.05" />

        {/* Goal line */}
        {goalKg != null && goalKg >= minKg && goalKg <= maxKg && (
          <line
            x1={PAD}
            x2={W - PAD}
            y1={PAD + (1 - (goalKg - minKg) / range) * (H - PAD * 2)}
            y2={PAD + (1 - (goalKg - minKg) / range) * (H - PAD * 2)}
            stroke="#34d399"
            strokeDasharray="3,3"
            strokeOpacity="0.6"
          />
        )}

        {/* Line */}
        <path d={path} fill="none" stroke="#fbbf24" strokeWidth="2" strokeLinejoin="round" />

        {/* Dots */}
        {points.map(([x, y], i) => (
          <circle key={i} cx={x} cy={y} r="2.5" fill="#fbbf24" />
        ))}
      </svg>
    </div>
  );
}
