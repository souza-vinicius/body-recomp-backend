import { PublicGuard } from '@/lib/auth/guards';

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <PublicGuard>
      <div className="min-h-screen bg-gradient-dark flex flex-col justify-center items-center p-4">
        <div className="w-full max-w-sm space-y-8 animate-fade-in">
          <div className="flex flex-col items-center gap-3">
            <div className="w-14 h-14 rounded-2xl bg-gradient-primary flex items-center justify-center shadow-glow-orange">
              <span className="text-white font-black text-xl">BR</span>
            </div>
            <h1 className="text-2xl font-black tracking-tight text-white">
              Body Recomp
            </h1>
            <p className="text-surface-400 text-sm">
              Transform your body composition
            </p>
          </div>
          {children}
        </div>
      </div>
    </PublicGuard>
  );
}
