import { Loader2 } from 'lucide-react';

export function LoadingState({ message = 'Loading...' }: { message?: string }) {
  return (
    <div className="flex flex-col items-center justify-center p-12 gap-4 animate-fade-in">
      <div className="relative">
        <div className="w-10 h-10 rounded-full border-[3px] border-surface-100" />
        <Loader2
          size={40}
          className="absolute inset-0 animate-spin text-primary-500"
          strokeWidth={3}
        />
      </div>
      <p className="text-sm font-medium text-surface-400">{message}</p>
    </div>
  );
}
