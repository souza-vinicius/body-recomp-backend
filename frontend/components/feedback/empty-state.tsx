import { Inbox } from 'lucide-react';

export function EmptyState({ 
  title, 
  description, 
  action 
}: { 
  title: string;
  description: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center p-10 gap-4 text-center card animate-slide-up">
      <div className="w-16 h-16 rounded-2xl bg-surface-50 flex items-center justify-center">
        <Inbox size={28} className="text-surface-300" />
      </div>
      <div>
        <h3 className="text-lg font-bold text-surface-900">{title}</h3>
        <p className="text-sm text-surface-400 max-w-sm mt-1">{description}</p>
      </div>
      {action && <div className="pt-2">{action}</div>}
    </div>
  );
}
