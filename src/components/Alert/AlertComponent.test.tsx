import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import AlertComponent from './AlertComponent';

const errorSetup = ( isOpen: boolean, message: string) => {
  render(<AlertComponent isOpen={isOpen} error={true} message={message} />);
};

const successSetup = ( isOpen: boolean, message: string) => {
  render(<AlertComponent isOpen={isOpen} error={false} message={message} />);
};

describe('ErrorAlert', () => {
  it('should render the component with the correct message', () => {
    const testMessage = 'This is a test error message.';
    errorSetup(true, testMessage);

    const alertMessage = screen.getByText(testMessage);

    expect(alertMessage).toBeInTheDocument();
  });

  it('should apply the correct severity and icon', () => {
    const testMessage = 'Another test message.';
    errorSetup(true, testMessage);

    const alertElement = screen.getByRole('alert');

    expect(alertElement).toHaveClass('MuiAlert-standardError');

    const iconElement = screen.getByTestId('ErrorOutlineIcon');
    expect(iconElement).toBeInTheDocument();
  });
});

it('should render the component with the correct message', () => {
  const testMessage = 'This is a test success message.';
  successSetup(true, testMessage);

  const alertMessage = screen.getByText(testMessage);

  expect(alertMessage).toBeInTheDocument();
});