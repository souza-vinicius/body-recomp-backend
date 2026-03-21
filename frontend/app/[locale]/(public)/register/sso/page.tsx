import { SsoRegisterForm } from '@/components/domain/auth/sso-register-form';

export default function SsoRegisterPage() {
  return (
    <div className="w-full animate-slide-up">
      <div className="bg-white/95 backdrop-blur-sm px-6 py-8 shadow-elevated rounded-2xl">
        <h2 className="text-xl font-black mb-1 text-center text-surface-900">Quase lá!</h2>
        <p className="text-sm text-surface-400 text-center mb-6">Precisamos de alguns detalhes finais para personalizar seu plano corporal.</p>
        <SsoRegisterForm />
      </div>
    </div>
  );
}
