import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { DietPlanPanel } from '@/components/domain/plans/diet-plan-panel';

describe('Diet Plan Panel', () => {
  it('renders diet plan text', () => {
    const mockPlan = {
      diet_plan: 'High protein, low carb'
    };
    render(<DietPlanPanel planData={mockPlan} />);
    expect(screen.getByText(/High protein, low carb/i)).toBeInTheDocument();
  });
});
