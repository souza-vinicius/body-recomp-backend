import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { ProgressHistoryList } from '@/components/domain/history/progress-history-list';

describe('Progress History List', () => {
  it('renders records properly', () => {
    const mockEntries = [
      { id: 1, date: '2023-10-01', weight: 80, body_fat_percentage: 15 },
    ];
    render(<ProgressHistoryList entries={mockEntries} />);
    expect(screen.getByText(/80 kg/i)).toBeInTheDocument();
  });

  it('renders empty state properly', () => {
    render(<ProgressHistoryList entries={[]} />);
    expect(screen.getByText(/No history records found/i)).toBeInTheDocument();
  });
});
