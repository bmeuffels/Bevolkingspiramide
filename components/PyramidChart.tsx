
import React, { useMemo } from 'react';
import { AgeGroupData } from '../types';

interface PyramidChartProps {
  data: AgeGroupData[];
  maxVal: number;
}

const PyramidChart: React.FC<PyramidChartProps> = ({ data, maxVal }) => {
  const width = 800;
  const height = 500;
  const margin = { top: 20, right: 40, bottom: 40, left: 40 };
  const chartWidth = (width - margin.left - margin.right - 60) / 2;
  const barHeight = (height - margin.top - margin.bottom) / data.length;

  const xScale = (val: number) => (val / maxVal) * chartWidth;

  return (
    <div className="w-full overflow-hidden flex justify-center items-center bg-white rounded-xl shadow-inner p-4">
      <svg width="100%" height="500" viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="xMidYMid meet">
        {/* Central Age Labels */}
        <g transform={`translate(${width / 2}, ${margin.top})`}>
          {data.map((d, i) => (
            <text
              key={d.ageRange}
              x="0"
              y={i * barHeight + barHeight / 2}
              dy=".35em"
              textAnchor="middle"
              className="text-[10px] fill-slate-400 font-medium"
            >
              {d.ageRange}
            </text>
          ))}
        </g>

        {/* Male Bars (Left) */}
        <g transform={`translate(${margin.left + chartWidth}, ${margin.top})`}>
          {data.map((d, i) => (
            <rect
              key={`male-${d.ageRange}`}
              x={-xScale(d.male)}
              y={i * barHeight + 1}
              width={xScale(d.male)}
              height={barHeight - 2}
              className="fill-blue-500 transition-all duration-300 ease-out opacity-80 hover:opacity-100"
              rx="2"
            />
          ))}
        </g>

        {/* Female Bars (Right) */}
        <g transform={`translate(${width - margin.right - chartWidth}, ${margin.top})`}>
          {data.map((d, i) => (
            <rect
              key={`female-${d.ageRange}`}
              x="0"
              y={i * barHeight + 1}
              width={xScale(d.female)}
              height={barHeight - 2}
              className="fill-rose-500 transition-all duration-300 ease-out opacity-80 hover:opacity-100"
              rx="2"
            />
          ))}
        </g>

        {/* Labels */}
        <text
          x={margin.left + chartWidth / 2}
          y={height - 10}
          textAnchor="middle"
          className="text-xs font-bold fill-blue-600 uppercase tracking-widest"
        >
          Male (Mannen)
        </text>
        <text
          x={width - margin.right - chartWidth / 2}
          y={height - 10}
          textAnchor="middle"
          className="text-xs font-bold fill-rose-600 uppercase tracking-widest"
        >
          Female (Vrouwen)
        </text>

        {/* X-Axis scale indicators */}
        {[0, 0.25, 0.5, 0.75, 1].map((p) => {
          const val = (p * maxVal).toFixed(0);
          return (
            <g key={`axis-${p}`}>
              <text x={margin.left + chartWidth - xScale(p * maxVal)} y={height - 25} className="text-[9px] fill-slate-300" textAnchor="middle">{val}M</text>
              <text x={width - margin.right - chartWidth + xScale(p * maxVal)} y={height - 25} className="text-[9px] fill-slate-300" textAnchor="middle">{val}M</text>
            </g>
          );
        })}
      </svg>
    </div>
  );
};

export default PyramidChart;
