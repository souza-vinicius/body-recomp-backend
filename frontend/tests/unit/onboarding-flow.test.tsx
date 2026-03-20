import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { MeasurementStep } from '@/components/domain/onboarding/measurement-step';
import { GoalStep } from '@/components/domain/onboarding/goal-step';
import { GoalSuccessPanel } from '@/components/domain/onboarding/goal-success-panel';

describe('Onboarding Flow Components', () => {
  it('renders measurement step properly', () => {
    const handleNext = vi.fn();
    render(<MeasurementStep onNext={handleNext} />);
    
    expect(screen.getByText(/Current Status/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Weight/i)).toBeInTheDocument();
  });

  it('renders goal step properly', () => {
    const handleSubmit = vi.fn();
    render(<GoalStep isLoading={false} onSubmit={handleSubmit} recommendedGoalType="CUTTING" initialMeasurementId="123" />);
    
    expect(screen.getByText(/Choose Your Goal/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Start Journey/i })).toBeInTheDocument();
  });

  it('renders success panel properly', () => {
    render(<GoalSuccessPanel goalId="123" />);
    
    expect(screen.getByText(/Goal Created Successfully/i)).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Go to Dashboard/i })).toBeInTheDocument();
  });
});
