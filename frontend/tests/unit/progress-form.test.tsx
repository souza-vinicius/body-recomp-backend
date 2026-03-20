import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { ProgressEntryForm } from '@/components/domain/progress/progress-entry-form';

describe('Progress Form', () => {
  it('renders progress form fields correctly', () => {
    const handleSubmit = vi.fn();
    render(<ProgressEntryForm onSubmit={handleSubmit} isLoading={false} />);
    
    expect(screen.getByLabelText(/Weight \(kg\)/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Energy Level/i)).toBeInTheDocument();
  });
});
