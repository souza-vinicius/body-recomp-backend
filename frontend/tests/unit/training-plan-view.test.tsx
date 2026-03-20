import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { TrainingPlanPanel } from '@/components/domain/plans/training-plan-panel';

describe('Training Plan Panel', () => {
  it('renders plan text', () => {
    const mockPlan = {
      training_plan: 'Push Pull Legs 4x a week',
      notes: 'Make sure to rest'
    };
    render(<TrainingPlanPanel planData={mockPlan} />);
    expect(screen.getByText(/Push Pull Legs/i)).toBeInTheDocument();
    expect(screen.getByText(/Make sure to rest/i)).toBeInTheDocument();
  });
});
