import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import OnboardingPage from '@/app/(app)/setup/page';

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn() }),
}));

vi.mock('@/lib/api/measurements', () => ({
  createMeasurement: vi.fn().mockResolvedValue({ id: 'meas_123', recommended_goal_type: 'CUTTING' }),
}));

vi.mock('@/lib/api/goals', () => ({
  createGoal: vi.fn().mockResolvedValue({ id: 'goal_123' }),
}));

describe('Onboarding Journey Integration', () => {
  it('renders initial measurement step on load', () => {
    render(<OnboardingPage />);
    expect(screen.getByText(/Current Status/i)).toBeInTheDocument();
  });
});
