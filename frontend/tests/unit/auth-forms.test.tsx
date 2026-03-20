import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { LoginForm } from '@/components/domain/auth/login-form';
import { RegisterForm } from '@/components/domain/auth/register-form';

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn() }),
}));

describe('Auth Forms', () => {
  it('renders login form properly', () => {
    render(<LoginForm isLoading={false} onSubmit={vi.fn()} />);
    expect(screen.getByLabelText(/Email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Password/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Sign in/i })).toBeInTheDocument();
  });

  it('renders register form properly', () => {
    render(<RegisterForm isLoading={false} onSubmit={vi.fn()} />);
    expect(screen.getByLabelText(/Full Name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Password/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Create Account/i })).toBeInTheDocument();
  });

  it('calls onSubmit when login form is submitted', async () => {
    const handleSubmit = vi.fn();
    render(<LoginForm isLoading={false} onSubmit={handleSubmit} />);
    
    // Fill out form
    fireEvent.change(screen.getByLabelText(/Email/i), { target: { value: 'test@example.com' } });
    fireEvent.change(screen.getByLabelText(/Password/i), { target: { value: 'password123' } });
    
    // Submit
    fireEvent.click(screen.getByRole('button', { name: /Sign in/i }));
    
    expect(handleSubmit).toHaveBeenCalledWith(expect.anything());
  });
});
