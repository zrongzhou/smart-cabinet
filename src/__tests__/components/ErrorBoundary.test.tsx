import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ErrorBoundary } from '@/components/ErrorBoundary';

describe('ErrorBoundary Component', () => {
  it('should render children when there is no error', () => {
    render(
      <ErrorBoundary>
        <div>Test Content</div>
      </ErrorBoundary>
    );

    expect(screen.getByText('Test Content')).toBeInTheDocument();
  });

  it('should render error UI when there is an error', () => {
    // Suppress console.error for this test
    const originalError = console.error;
    console.error = vi.fn();

    const ThrowError = () => {
      throw new Error('Test error');
    };

    render(
      <ErrorBoundary>
        <ThrowError />
      </ErrorBoundary>
    );

    // Check that error UI is shown - use more specific query for heading
    expect(screen.getByText(/Client-side Rendering Error/i)).toBeInTheDocument();
    // Check that error message appears in the details section
    const errorMessages = screen.getAllByText(/Test error/i);
    expect(errorMessages.length).toBeGreaterThan(0);
    expect(errorMessages[0]).toBeInTheDocument();

    // Restore console.error
    console.error = originalError;
  });
});
