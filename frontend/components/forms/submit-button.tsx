import React from 'react';
import { Loader2 } from 'lucide-react';

interface SubmitButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  isLoading?: boolean;
  variant?: 'primary' | 'secondary' | 'danger';
}

export function SubmitButton({ 
  children, 
  isLoading, 
  disabled, 
  variant = 'primary',
  className = '', 
  ...props 
}: SubmitButtonProps) {
  const variants = {
    primary: 'bg-gradient-primary text-white shadow-card hover:shadow-glow-orange active:scale-[0.98]',
    secondary: 'bg-surface-50 text-surface-700 border-2 border-surface-200 hover:border-surface-300 hover:bg-surface-100 active:scale-[0.98]',
    danger: 'bg-red-600 text-white hover:bg-red-700 active:scale-[0.98]',
  };

  return (
    <button
      disabled={isLoading || disabled}
      className={`px-5 py-2.5 font-semibold text-sm rounded-xl transition-all duration-200
        focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 
        disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100
        flex items-center justify-center gap-2
        ${variants[variant]}
        ${className}`}
      {...props}
    >
      {isLoading ? (
        <>
          <Loader2 size={18} className="animate-spin" />
          <span>Loading...</span>
        </>
      ) : (
        children
      )}
    </button>
  );
}
