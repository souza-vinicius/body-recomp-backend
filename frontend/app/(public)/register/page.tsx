import { RegisterForm } from '@/components/domain/auth/register-form';
import Link from 'next/link';

export default function RegisterPage() {
  return (
    <div className="w-full animate-slide-up">
      <div className="bg-white/95 backdrop-blur-sm px-6 py-8 shadow-elevated rounded-2xl">
        <h2 className="text-xl font-black mb-1 text-center text-surface-900">Create Account</h2>
        <p className="text-sm text-surface-400 text-center mb-6">Start your transformation today</p>
        <RegisterForm />
        <div className="mt-6 text-center text-sm text-surface-500">
          Already have an account?{' '}
          <Link href="/login" className="text-primary-600 hover:text-primary-700 font-semibold transition-colors">
            Sign in
          </Link>
        </div>
      </div>
    </div>
  );
}
