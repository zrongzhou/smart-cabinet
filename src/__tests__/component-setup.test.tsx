import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';

// Simple test to verify component testing setup
describe('Component Test Setup', () => {
  it('should render a simple component', () => {
    const TestComponent = () => <div>Hello, World!</div>;
    render(<TestComponent />);
    expect(screen.getByText('Hello, World!')).toBeInTheDocument();
  });

  it('should handle button clicks', () => {
    const handleClick = vi.fn();
    const TestButton = () => <button onClick={handleClick}>Click me</button>;
    
    render(<TestButton />);
    const button = screen.getByText('Click me');
    button.click();
    
    expect(handleClick).toHaveBeenCalledTimes(1);
  });
});
