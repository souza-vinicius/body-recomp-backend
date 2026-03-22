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

  const areaPath = `${smoothPath} L ${bfPoints[bfPoints.length-1].x},100 L ${bfPoints[0].x},100 Z`;

  return (
    <section className="relative h-64 sm:h-72 w-full mb-12">
      <div className="absolute inset-0 w-full h-full pb-2">
        <svg 
          className="absolute inset-0 w-full h-full overflow-visible pointer-events-none" 
          viewBox="0 0 100 100" 
          preserveAspectRatio="none"
        >
          <defs>
            <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#e4e4e7" stopOpacity="0.05" />
              <stop offset="100%" stopColor="#e4e4e7" stopOpacity="0.0" />
            </linearGradient>
            <linearGradient id="barGradientHover" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#d4d4d8" stopOpacity="0.15" />
              <stop offset="100%" stopColor="#e4e4e7" stopOpacity="0.0" />
            </linearGradient>
            <linearGradient id="lineGrad" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#ea580c" />
              <stop offset="100%" stopColor="#f97316" />
            </linearGradient>
            <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#f97316" stopOpacity="0.3" />
              <stop offset="100%" stopColor="#f97316" stopOpacity="0" />
            </linearGradient>
            <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
               <feDropShadow dx="0" dy="4" stdDeviation="4" floodColor="#f97316" floodOpacity="0.4" />
            </filter>
          </defs>

          {/* Bars for Weight */}
          {chartData.map((entry, idx) => {
            const barWidth = 100 / chartData.length;
            const gap = barWidth * 0.35; 
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
          
          {/* Gradient Area for Body Fat */}
          <path
            d={areaPath}
            fill="url(#chartGradient)"
            className="transition-all duration-300"
          />

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
              className="flex-1 h-full relative cursor-pointer group"
              onMouseEnter={() => setHoveredIdx(idx)}
              onMouseLeave={() => setHoveredIdx(null)}
              onTouchStart={() => setHoveredIdx(idx)}
            >
                <div 
                  className={`absolute -top-14 sm:-top-16 left-1/2 -translate-x-1/2 bg-surface-800 border border-white/10 text-white py-2 px-3 sm:px-4 rounded-xl pointer-events-none z-30 shadow-elevated flex flex-col items-center gap-1 min-w-[110px] sm:min-w-[130px] transition-all duration-300 ease-out origin-bottom ${
                    hoveredIdx === idx ? 'opacity-100 scale-100 translate-y-0' : 'opacity-0 scale-95 translate-y-2'
                  }`}
                >
                  <span className="text-surface-400 font-bold text-[9px] uppercase tracking-wider">
                    {new Date(entry.logged_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric'})}
                  </span>
                  <div className="flex items-center justify-between w-full font-bold">
                    <span className="text-xs sm:text-sm text-surface-200">{entry.weight_kg} kg</span>
                    <span className="text-surface-600 text-[10px] mx-2">|</span>
                    <span className="text-primary-500 text-xs sm:text-sm">{entry.body_fat_percentage}%</span>
                  </div>
                  {/* Tooltip caret */}
                  <div className="absolute top-full left-1/2 -translate-x-1/2 w-0 h-0 border-l-[6px] border-r-[6px] border-t-[6px] border-l-transparent border-r-transparent border-t-surface-800" />
                </div>
            </div>
          ))}
        </div>
      </div>
      
      {/* X Axis Labels */}
      <div className="absolute -bottom-6 w-full flex justify-between px-1 text-[10px] font-bold text-surface-500 uppercase tracking-widest pointer-events-none">
        {chartData.map((entry, idx) => {
           // Display only the first, middle, and last to reduce clutter like in Stitch UI
           if (idx === 0 || idx === chartData.length - 1 || idx === Math.floor(chartData.length / 2)) {
             return (
               <span key={`label-${idx}`} className={hoveredIdx === idx ? 'text-primary-500 transition-colors' : ''}>
                 {new Date(entry.logged_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric'})}
               </span>
             );
           }
           return <span key={`label-${idx}`} className="opacity-0">.</span>;
        })}
      </div>
    </section>
  );
}
