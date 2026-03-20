import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { TrendSummaryCards } from '@/components/domain/history/trend-summary-cards';

describe('Trend Summary Cards', () => {
  it('renders trends properly', () => {
    const mockTrends = {
      trend_status: 'ON_TRACK',
      weekly_weight_change: -0.5
    };
    render(<TrendSummaryCards trends={mockTrends} />);
    expect(screen.getByText(/Pace/i)).toBeInTheDocument();
    expect(screen.getByText(/ON TRACK/i)).toBeInTheDocument();
    expect(screen.getByText(/-0.50 kg/i)).toBeInTheDocument();
  });
});
