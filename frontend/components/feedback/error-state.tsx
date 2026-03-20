import { AlertTriangle } from 'lucide-react';

export function ErrorState({ 
  title = "Something went wrong", 
  message, 
  onRetry 
}: { 
  title?: string;
  message: string;
  onRetry?: () => void;
}) {
  return (
    <div className="flex flex-col items-center justify-center p-8 gap-4 text-center rounded-2xl bg-red-50 border border-red-100 animate-fade-in">
      <div className="w-14 h-14 rounded-2xl bg-red-100 flex items-center justify-center">
        <AlertTriangle size={24} className="text-red-500" />
      </div>
      <div>
        <h3 className="text-lg font-bold text-red-800">{title}</h3>
        <p className="text-sm text-red-600 max-w-sm mt-1">{message}</p>
      </div>
      {onRetry && (
        <button 
          onClick={onRetry}
          className="px-5 py-2 text-sm font-semibold text-white bg-red-600 rounded-xl hover:bg-red-700 transition-colors active:scale-[0.98]"
        >
          Try again
        </button>
      )}
    </div>
  );
}
