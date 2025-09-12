import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import ErrorAlert from './ErrorAlert';

const setup = (message: string) => {
  render(<ErrorAlert message={message} />);
};

describe('ErrorAlert', () => {
  it('should render the component with the correct message', () => {
    const testMessage = 'This is a test error message.';
    setup(testMessage);

    const alertMessage = screen.getByText(testMessage);

    expect(alertMessage).toBeInTheDocument();
  });

  it('should apply the correct severity and icon', () => {
    const testMessage = 'Another test message.';
    setup(testMessage);

    const alertElement = screen.getByRole('alert');

    expect(alertElement).toHaveClass('MuiAlert-standardError');

    const iconElement = screen.getByTestId('ErrorOutlineIcon');
    expect(iconElement).toBeInTheDocument();
  });
});