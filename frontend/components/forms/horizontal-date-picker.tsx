import React, { useMemo } from 'react';

interface HorizontalDatePickerProps {
  value: string; // YYYY-MM-DD
  onChange: (date: string) => void;
}

export function HorizontalDatePicker({ value, onChange }: HorizontalDatePickerProps) {
  // Generate the last 7 days including today
  const dates = useMemo(() => {
    const arr = [];
    const today = new Date();
    for (let i = 6; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(today.getDate() - i);
      arr.push(d);
    }
    return arr;
  }, []);

  const formatHeader = (d: string) => {
    const date = new Date(d);
    return date.toLocaleString('en-US', { month: 'long', year: 'numeric' });
  };

  return (
    <div className="mb-10">
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-bold text-2xl tracking-tight">Weekly Check-in</h1>
        <span className="text-primary-500 text-[10px] tracking-widest uppercase font-bold">
          {formatHeader(value)}
        </span>
      </div>
      <div className="flex justify-between items-center gap-2 overflow-x-auto pb-2 no-scrollbar">
        {dates.map((d) => {
          const rawStr = d.toISOString().slice(0, 10);
          const isSelected = rawStr === value;
          const dayName = d.toLocaleString('en-US', { weekday: 'short' });
          const dayNum = d.getDate();

          return (
            <button
              key={rawStr}
              type="button"
              onClick={() => onChange(rawStr)}
              className={`flex flex-col items-center min-w-[3.5rem] py-3 rounded-xl transition-all ${
                isSelected
                  ? 'bg-primary-500 text-black shadow-glow-orange scale-110'
                  : 'bg-surface-50 text-surface-400 hover:bg-surface-100 border border-white/5'
              }`}
            >
              <span className="text-[10px] uppercase tracking-tighter mb-1 font-bold">
                {dayName}
              </span>
              <span className={`font-bold ${isSelected ? 'text-xl leading-none' : 'text-lg'}`}>
                {dayNum}
              </span>
              {isSelected && <div className="w-1 h-1 bg-black rounded-full mt-1"></div>}
            </button>
          );
        })}
      </div>
    </div>
  );
}
