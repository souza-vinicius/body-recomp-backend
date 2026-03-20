import React from 'react';

interface TextFieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
}

export function TextField({ label, error, className = '', id, ...props }: TextFieldProps) {
  return (
    <div className={`flex flex-col gap-1.5 ${className}`}>
      <label htmlFor={id} className="text-sm font-semibold text-surface-700">
        {label}
      </label>
      <input
        id={id}
        className={`px-3.5 py-2.5 text-sm bg-white border-2 rounded-xl shadow-sm transition-all duration-200 
          focus:outline-none focus:ring-0
          ${error
            ? 'border-red-400 focus:border-red-500 text-red-900 bg-red-50/50'
            : 'border-surface-200 focus:border-primary-500 hover:border-surface-300'
          }
          placeholder:text-surface-300
        `}
        {...props}
      />
      {error && <span className="text-xs font-medium text-red-600">{error}</span>}
    </div>
  );
}
