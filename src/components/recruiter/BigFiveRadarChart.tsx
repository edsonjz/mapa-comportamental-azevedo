import React from 'react';

interface BigFiveRadarChartProps {
  openness: number;
  conscientiousness: number;
  extraversion: number;
  agreeableness: number;
  emotionalStability: number;
  size?: number;
}

export const BigFiveRadarChart: React.FC<BigFiveRadarChartProps> = ({
  openness,
  conscientiousness,
  extraversion,
  agreeableness,
  emotionalStability,
  size = 320
}) => {
  const center = size / 2;
  const radius = (size / 2) - 50;

  const factors = [
    { label: 'Abertura (O)', value: openness },
    { label: 'Conscienciosidade (C)', value: conscientiousness },
    { label: 'Extroversão (E)', value: extraversion },
    { label: 'Amabilidade (A)', value: agreeableness },
    { label: 'Estabilidade Emocional (ES)', value: emotionalStability }
  ];

  const numAxes = factors.length;

  // Calculate coordinates for a factor value on an axis (angle rotated so top axis points up)
  const getCoordinates = (index: number, value: number) => {
    const angle = (Math.PI * 2 / numAxes) * index - Math.PI / 2;
    const distance = (value / 100) * radius;
    const x = center + distance * Math.cos(angle);
    const y = center + distance * Math.sin(angle);
    return { x, y };
  };

  // Generate polygon points for value shape
  const points = factors
    .map((f, i) => {
      const { x, y } = getCoordinates(i, f.value);
      return `${x},${y}`;
    })
    .join(' ');

  // Grid concentric circles/polygons (20%, 40%, 60%, 80%, 100%)
  const levels = [20, 40, 60, 80, 100];

  return (
    <div className="flex flex-col items-center justify-center">
      <svg width={size} height={size} className="overflow-visible">
        {/* Background Grid Polygons */}
        {levels.map(lvl => {
          const gridPoints = factors
            .map((_, i) => {
              const { x, y } = getCoordinates(i, lvl);
              return `${x},${y}`;
            })
            .join(' ');
          return (
            <g key={lvl}>
              <polygon
                points={gridPoints}
                className="fill-none stroke-slate-700/60 print:stroke-slate-300"
                strokeWidth="1"
                strokeDasharray={lvl === 100 ? 'none' : '2,2'}
              />
              <text
                x={center + 4}
                y={center - (lvl / 100) * radius + 3}
                className="text-[9px] fill-slate-500 font-medium print:fill-slate-400"
              >
                {lvl}
              </text>
            </g>
          );
        })}

        {/* Axis Lines & Labels */}
        {factors.map((f, i) => {
          const outerCoord = getCoordinates(i, 100);
          const labelCoord = getCoordinates(i, 120);

          return (
            <g key={i}>
              <line
                x1={center}
                y1={center}
                x2={outerCoord.x}
                y2={outerCoord.y}
                className="stroke-slate-700/80 print:stroke-slate-300"
                strokeWidth="1"
              />
              <text
                x={labelCoord.x}
                y={labelCoord.y}
                textAnchor="middle"
                dominantBaseline="middle"
                className="text-[11px] font-semibold fill-slate-200 print:fill-slate-900"
              >
                {f.label}
              </text>
            </g>
          );
        })}

        {/* Data Shape */}
        <polygon
          points={points}
          className="fill-indigo-500/25 stroke-indigo-400 print:fill-indigo-500/20 print:stroke-indigo-600"
          strokeWidth="2.5"
        />

        {/* Data Points / Circles */}
        {factors.map((f, i) => {
          const { x, y } = getCoordinates(i, f.value);
          return (
            <circle
              key={i}
              cx={x}
              cy={y}
              r="4"
              className="fill-indigo-400 stroke-slate-950 print:stroke-white"
              strokeWidth="2"
            />
          );
        })}
      </svg>
    </div>
  );
};
