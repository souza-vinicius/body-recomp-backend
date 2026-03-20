import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { GoalSummaryCard } from '@/components/domain/dashboard/goal-summary-card';

describe('Dashboard Summary Card', () => {
  it('renders goal data properly', () => {
    const mockGoal = {
      goal_type: 'CUTTING',
      target_body_fat_percentage: 12,
      status: 'ACTIVE'
    };
    
    render(<GoalSummaryCard goal={mockGoal} />);
    
    expect(screen.getByText(/Current Goal/i)).toBeInTheDocument();
    expect(screen.getByText(/CUTTING/i)).toBeInTheDocument();
    expect(screen.getByText(/Target: 12%/i)).toBeInTheDocument();
  });
});
