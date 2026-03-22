import React from 'react';
import { ChevronDown } from 'lucide-react';

interface SelectFieldProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label: string;
  options: { value: string; label: string }[];
  error?: string;
}

export function SelectField({ label, options, error, className = '', id, ...props }: SelectFieldProps) {
  return (
    <div className={`flex flex-col gap-1.5 ${className}`}>
      <label htmlFor={id} className="text-sm font-semibold text-surface-700">
        {label}
      </label>
      <div className="relative">
        <select
          id={id}
          className={`w-full appearance-none px-3.5 py-2.5 pr-10 text-sm bg-surface-50 border-2 rounded-xl shadow-sm transition-all duration-200
            focus:outline-none focus:ring-0
            ${error
              ? 'border-red-400 focus:border-red-500 text-red-900 bg-red-50/50'
              : 'border-surface-200 focus:border-primary-500 hover:border-surface-300'
            }
          `}
          {...props}
        >
          <option value="" disabled hidden>Select an option</option>
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        <ChevronDown
          size={16}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-surface-400 pointer-events-none"
        />
      </div>
      {error && <span className="text-xs font-medium text-red-600">{error}</span>}
    </div>
  );
}
