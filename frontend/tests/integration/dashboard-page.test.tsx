import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import DashboardPage from '@/app/(app)/dashboard/page';

// Mock dependencies
vi.mock('@/lib/api/dashboard', () => ({
  loadDashboardData: vi.fn().mockResolvedValue({
    goal: { goal_type: 'CUTTING', target_body_fat_percentage: 12, status: 'ACTIVE' },
    trends: { estimated_weeks_to_goal: 8, trend_status: 'ON_TRACK' }
  }),
}));

describe('Dashboard Page Integration', () => {
  it('renders loading state initially', () => {
    render(<DashboardPage />);
    expect(screen.getByText(/Loading/i)).toBeInTheDocument();
  });
});
