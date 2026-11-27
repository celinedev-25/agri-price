import { useState } from "react";
import { formatRwf } from "../../services/marketService.js";

/**
 * Interactive SVG Bar Chart showing average price (RWF/kg) by crop.
 */
export function CropPriceBarChart({ data = [] }) {
  const [hoveredIdx, setHoveredIdx] = useState(null);

  if (data.length === 0) {
    return (
      <div className="h-64 flex items-center justify-center text-sm text-slate-400">
        No crop price data to plot yet.
      </div>
    );
  }

  const maxVal = Math.max(...data.map((d) => d.price), 100);
  const roundedMax = Math.ceil(maxVal / 500) * 500;
  const chartHeight = 200;
  const chartWidth = 520;
  const paddingLeft = 56;
  const paddingBottom = 38;
  const paddingTop = 16;
  const innerWidth = chartWidth - paddingLeft - 16;
  const innerHeight = chartHeight - paddingTop - paddingBottom;
  const barGap = 14;
  const barWidth = Math.max(
    18,
    Math.min(48, (innerWidth - barGap * (data.length - 1)) / data.length)
  );

  const gridLines = [0, 0.25, 0.5, 0.75, 1];
  const hovered = hoveredIdx !== null ? data[hoveredIdx] : null;

  return (
    <div className="w-full">
      {/* Dynamic Hover Readout */}
      <div className="h-7 mb-2 flex items-center justify-between text-xs">
        <span className="text-slate-500">
          Hover a bar to inspect exact RWF/kg
        </span>
        {hovered && (
          <span className="px-2.5 py-1 rounded-full bg-emerald-900 text-amber-300 font-bold">
            {hovered.label}: {formatRwf(hovered.price)}/kg
          </span>
        )}
      </div>

      <svg
        viewBox={`0 0 ${chartWidth} ${chartHeight}`}
        className="w-full h-auto overflow-visible"
        role="img"
        aria-label="Average crop prices bar chart"
      >
        <defs>
          <linearGradient id="barGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#059669" />
            <stop offset="100%" stopColor="#064e3b" />
          </linearGradient>
          <linearGradient id="barHoverGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#fbbf24" />
            <stop offset="100%" stopColor="#d97706" />
          </linearGradient>
        </defs>

        {/* Horizontal gridlines */}
        {gridLines.map((ratio) => {
          const y = paddingTop + innerHeight * (1 - ratio);
          const val = Math.round(roundedMax * ratio);
          return (
            <g key={ratio}>
              <line
                x1={paddingLeft}
                x2={chartWidth - 10}
                y1={y}
                y2={y}
                stroke="#e2e8f0"
                strokeDasharray="3 3"
              />
              <text
                x={paddingLeft - 8}
                y={y + 4}
                textAnchor="end"
                className="fill-slate-400 text-[10px] font-medium"
              >
                {val.toLocaleString()}
              </text>
            </g>
          );
        })}

        {/* Bars */}
        {data.map((item, idx) => {
          const totalBarsWidth =
            data.length * barWidth + (data.length - 1) * barGap;
          const startX = paddingLeft + (innerWidth - totalBarsWidth) / 2;
          const x = startX + idx * (barWidth + barGap);
          const h = Math.max(4, (item.price / roundedMax) * innerHeight);
          const y = paddingTop + innerHeight - h;
          const isHovered = hoveredIdx === idx;

          return (
            <g
              key={item.label}
              onMouseEnter={() => setHoveredIdx(idx)}
              onMouseLeave={() => setHoveredIdx(null)}
              className="cursor-pointer"
            >
              <rect
                x={x}
                y={y}
                width={barWidth}
                height={h}
                rx={6}
                fill={isHovered ? "url(#barHoverGrad)" : "url(#barGrad)"}
                className="transition-all duration-200"
              />
              <text
                x={x + barWidth / 2}
                y={chartHeight - 14}
                textAnchor="middle"
                className={`text-[10px] font-semibold ${
                  isHovered ? "fill-emerald-900" : "fill-slate-500"
                }`}
              >
                {item.label.length > 9
                  ? `${item.label.slice(0, 8)}…`
                  : item.label}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}

/**
 * Smooth SVG Area/Line Chart for recent market price submissions.
 */
export function PriceTrendAreaChart({ points = [] }) {
  const [activeIdx, setActiveIdx] = useState(null);

  if (points.length < 2) {
    return (
      <div className="h-56 flex items-center justify-center text-sm text-slate-400">
        Add at least 2 price entries to view the price movement curve.
      </div>
    );
  }

  const width = 520;
  const height = 200;
  const padL = 52;
  const padR = 18;
  const padT = 18;
  const padB = 34;
  const innerW = width - padL - padR;
  const innerH = height - padT - padB;

  const maxVal = Math.max(...points.map((p) => p.price), 100);
  const minVal = Math.min(...points.map((p) => p.price), 0);
  const range = Math.max(maxVal - minVal, 100);

  const coords = points.map((p, idx) => {
    const x = padL + (idx / (points.length - 1)) * innerW;
    const y = padT + innerH - ((p.price - minVal) / range) * innerH;
    return { ...p, x, y };
  });

  const linePath = coords
    .map((c, i) => `${i === 0 ? "M" : "L"} ${c.x} ${c.y}`)
    .join(" ");

  const areaPath = `${linePath} L ${coords[coords.length - 1].x} ${
    padT + innerH
  } L ${coords[0].x} ${padT + innerH} Z`;

  const activePoint = activeIdx !== null ? coords[activeIdx] : null;

  return (
    <div className="w-full">
      <div className="h-7 mb-2 flex items-center justify-between text-xs">
        <span className="text-slate-500">Recent market price trajectory</span>
        {activePoint && (
          <span className="px-2.5 py-1 rounded-full bg-amber-100 text-amber-950 font-bold">
            {activePoint.label} — {formatRwf(activePoint.price)}/kg
          </span>
        )}
      </div>

      <svg
        viewBox={`0 0 ${width} ${height}`}
        className="w-full h-auto overflow-visible"
        role="img"
        aria-label="Market price trend area chart"
      >
        <defs>
          <linearGradient id="areaFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#10b981" stopOpacity="0.35" />
            <stop offset="100%" stopColor="#10b981" stopOpacity="0.02" />
          </linearGradient>
        </defs>

        {/* Reference gridlines */}
        {[0, 0.5, 1].map((r) => {
          const y = padT + innerH * (1 - r);
          const v = Math.round(minVal + range * r);
          return (
            <g key={r}>
              <line
                x1={padL}
                x2={width - padR}
                y1={y}
                y2={y}
                stroke="#e2e8f0"
                strokeDasharray="3 3"
              />
              <text
                x={padL - 8}
                y={y + 4}
                textAnchor="end"
                className="fill-slate-400 text-[10px]"
              >
                {v.toLocaleString()}
              </text>
            </g>
          );
        })}

        <path d={areaPath} fill="url(#areaFill)" />
        <path
          d={linePath}
          fill="none"
          stroke="#047857"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {coords.map((c, idx) => (
          <g
            key={`${c.label}-${idx}`}
            onMouseEnter={() => setActiveIdx(idx)}
            onMouseLeave={() => setActiveIdx(null)}
            className="cursor-pointer"
          >
            <circle
              cx={c.x}
              cy={c.y}
              r={activeIdx === idx ? 6 : 4}
              fill={activeIdx === idx ? "#f59e0b" : "#047857"}
              stroke="#ffffff"
              strokeWidth="2"
            />
            <text
              x={c.x}
              y={height - 10}
              textAnchor="middle"
              className="fill-slate-400 text-[9px] font-medium"
            >
              {c.shortDate}
            </text>
          </g>
        ))}
      </svg>
    </div>
  );
}

/**
 * Clean Horizontal Bar Breakdown by Product Category.
 */
export function CategoryBreakdownChart({ items = [] }) {
  const total = items.reduce((sum, i) => sum + i.count, 0) || 1;
  const colors = [
    "bg-emerald-700",
    "bg-amber-400",
    "bg-emerald-500",
    "bg-teal-600",
    "bg-lime-600",
  ];

  return (
    <div className="space-y-3.5">
      {items.map((item, idx) => {
        const pct = Math.round((item.count / total) * 100);
        return (
          <div key={item.category}>
            <div className="flex items-center justify-between text-xs font-semibold mb-1">
              <span className="text-slate-700">{item.category}</span>
              <span className="text-slate-500">
                {item.count} products ({pct}%)
              </span>
            </div>
            <div className="h-2.5 w-full rounded-full bg-slate-100 overflow-hidden">
              <div
                className={`h-full rounded-full ${
                  colors[idx % colors.length]
                } transition-all duration-500`}
                style={{ width: `${pct}%` }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}
