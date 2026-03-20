import React, { useState } from 'react';

interface BodyFatTrendChartProps {
  entries: any[];
}

const createSmoothPath = (points: {x: number, y: number}[]) => {
  if (points.length === 0) return '';
  if (points.length === 1) return `M ${points[0].x},${points[0].y}`;
  let path = `M ${points[0].x},${points[0].y} `;
  for (let i = 0; i < points.length - 1; i++) {
    const p1 = points[i];
    const p2 = points[i + 1];
    const cp1x = p1.x + (p2.x - p1.x) / 3;
    const cp2x = p1.x + (p2.x - p1.x) * (2/3);
    path += `C ${cp1x},${p1.y} ${cp2x},${p2.y} ${p2.x},${p2.y} `;
  }
  return path;
};

export function BodyFatTrendChart({ entries }: BodyFatTrendChartProps) {
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

  if (!entries || entries.length < 2) return null;

  const chartData = [...entries].slice(0, 10).reverse();
  
  const minWeight = Math.min(...chartData.map(e => e.weight_kg));
  const maxWeight = Math.max(...chartData.map(e => e.weight_kg));
  const weightRange = maxWeight - minWeight || 1;
  
  const minBf = Math.min(...chartData.map(e => e.body_fat_percentage));
  const maxBf = Math.max(...chartData.map(e => e.body_fat_percentage));
  const bfRange = maxBf - minBf || 1;

  // Transform functions
  const calcWeightY = (w: number) => {
    const percent = ((w - minWeight) / weightRange); 
    return 100 - (15 + percent * 70); // min height 15%, max height 85%
  };

  const calcBfY = (bf: number) => {
    const percent = ((bf - minBf) / bfRange);
    return 100 - (10 + percent * 80); // line range
  };

  const bfPoints = chartData.map((entry, idx) => {
    const barWidth = 100 / chartData.length;
    return {
      x: (idx * barWidth) + (barWidth / 2),
      y: calcBfY(entry.body_fat_percentage)
    };
  });

  const smoothPath = createSmoothPath(bfPoints);

  return (
    <div className="card p-5 sm:p-6 overflow-visible w-full max-w-full">
      <div className="flex justify-between items-center bg-surface-50 -mx-5 sm:-mx-6 -mt-5 sm:-mt-6 p-4 px-5 sm:px-6 border-b border-surface-100 rounded-t-2xl mb-8">
        <h3 className="text-xs font-bold text-surface-600 uppercase tracking-widest flex items-center gap-2">
          <span>Progress Timeline</span>
        </h3>
        <div className="flex gap-4">
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-sm bg-surface-300" />
            <span className="text-[10px] sm:text-xs font-semibold text-surface-500">Weight (kg)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full bg-primary-500" />
            <span className="text-[10px] sm:text-xs font-semibold text-surface-500">Body Fat (%)</span>
          </div>
        </div>
      </div>
      
      <div className="h-48 sm:h-64 relative w-full border-b border-surface-100 pb-2">
        <svg 
          className="absolute inset-0 w-full h-full overflow-visible pointer-events-none" 
          viewBox="0 0 100 100" 
          preserveAspectRatio="none"
        >
          <defs>
            <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#e4e4e7" stopOpacity="1" />
              <stop offset="100%" stopColor="#f4f4f5" stopOpacity="0.3" />
            </linearGradient>
            <linearGradient id="barGradientHover" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#d4d4d8" stopOpacity="1" />
              <stop offset="100%" stopColor="#e4e4e7" stopOpacity="0.5" />
            </linearGradient>
            <linearGradient id="lineGrad" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#ea580c" />
              <stop offset="100%" stopColor="#f97316" />
            </linearGradient>
            <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
               <feDropShadow dx="0" dy="4" stdDeviation="4" floodColor="#f97316" floodOpacity="0.3" />
            </filter>
          </defs>

          {/* Bars for Weight */}
          {chartData.map((entry, idx) => {
            const barWidth = 100 / chartData.length;
            const gap = barWidth * 0.35; // 35% gap offers elegant minimalist bars
            const w = barWidth - gap;
            const x = (idx * barWidth) + (gap / 2);
            const y = calcWeightY(entry.weight_kg);
            const rectHeight = Math.max(2, 100 - y);
            
            return (
              <rect
                key={`bar-${idx}`}
                x={x}
                y={y}
                width={w}
                height={rectHeight}
                fill={hoveredIdx === idx ? "url(#barGradientHover)" : "url(#barGradient)"}
                className="transition-all duration-300"
                rx="0.5"
              />
            );
          })}
          
          {/* Smooth Line for Body Fat */}
          <path
            d={smoothPath}
            fill="none"
            stroke="url(#lineGrad)"
            strokeWidth="3.5"
            vectorEffect="non-scaling-stroke"
            strokeLinecap="round"
            strokeLinejoin="round"
            filter="url(#shadow)"
          />
          
          {/* Dots for Body Fat */}
          {bfPoints.map((pt, idx) => (
            <circle
              key={`dot-${idx}`}
              cx={pt.x}
              cy={pt.y}
              r={hoveredIdx === idx ? "5.5" : "3.5"}
              fill="#fff"
              stroke="#ea580c"
              strokeWidth={hoveredIdx === idx ? "3" : "2.5"}
              vectorEffect="non-scaling-stroke"
              className="transition-all duration-300"
            />
          ))}
        </svg>
        
        {/* Hover Overlay */}
        <div className="absolute inset-0 flex justify-between z-20">
          {chartData.map((entry, idx) => (
            <div 
              key={`overlay-${idx}`} 
              className="flex-1 h-full relative cursor-pointer"
              onMouseEnter={() => setHoveredIdx(idx)}
              onMouseLeave={() => setHoveredIdx(null)}
              onTouchStart={() => setHoveredIdx(idx)}
            >
                <div 
                  className={`absolute -top-14 sm:-top-16 left-1/2 -translate-x-1/2 bg-surface-900 border border-surface-700 text-white py-2 px-3 sm:px-4 rounded-xl pointer-events-none z-30 shadow-elevated flex flex-col items-center gap-1 min-w-[110px] sm:min-w-[130px] transition-all duration-300 ease-out origin-bottom ${
                    hoveredIdx === idx ? 'opacity-100 scale-100 translate-y-0' : 'opacity-0 scale-95 translate-y-2'
                  }`}
                >
                  <span className="text-surface-400 font-bold text-[9px] uppercase tracking-wider">
                    {new Date(entry.logged_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric'})}
                  </span>
                  <div className="flex items-center justify-between w-full font-semibold">
                    <span className="text-xs sm:text-sm text-surface-200">{entry.weight_kg} kg</span>
                    <span className="text-surface-600 text-[10px] mx-2">|</span>
                    <span className="text-primary-400 text-xs sm:text-sm">{entry.body_fat_percentage}%</span>
                  </div>
                  {/* Tooltip caret */}
                  <div className="absolute top-full left-1/2 -translate-x-1/2 w-0 h-0 border-l-[6px] border-r-[6px] border-t-[6px] border-l-transparent border-r-transparent border-t-surface-900" />
                </div>
            </div>
          ))}
        </div>
      </div>
      
      {/* X Axis Labels */}
      <div className="flex justify-between mt-3">
        {chartData.map((entry, idx) => (
          <div key={`label-${idx}`} className={`flex-1 flex justify-center transition-colors duration-300 ${hoveredIdx === idx ? 'text-primary-600 font-bold' : 'text-surface-400 font-medium'}`}>
            <span className="text-[10px]">
              {new Date(entry.logged_at).toLocaleDateString(undefined, { month: '2-digit', day: '2-digit'})}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
