import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import AlertListComponent from './AlertListComponent';

vi.mock('@mui/material', () => ({
  Alert: ({ children, icon, severity }: any) => (
    <div data-severity={severity} role="alert">
      {icon}
      {children}
    </div>
  ),
  Box: ({ children }: any) => <div>{children}</div>,
  Slide: ({ children, in: isOpen }: any) => (isOpen ? <>{children}</> : null),
}));

vi.mock('@mui/icons-material/ErrorOutline', () => ({
  default: () => <span data-testid="ErrorOutlineIcon" />,
}));

vi.mock('@mui/icons-material/CheckCircleOutline', () => ({
  default: () => <span data-testid="CheckCircleOutlineIcon" />,
}));

describe('AlertListComponent', () => {
  it('renders all open alerts with the correct severity icons', () => {
    render(
      <AlertListComponent
        alertList={[
          { isOpen: true, error: true, message: 'Upload failed' },
          { isOpen: true, error: false, message: 'Upload completed' },
        ]}
      />
    );

    expect(screen.getAllByRole('alert')).toHaveLength(2);
    expect(screen.getByText('Upload failed')).toBeInTheDocument();
    expect(screen.getByText('Upload completed')).toBeInTheDocument();
    expect(screen.getByTestId('ErrorOutlineIcon')).toBeInTheDocument();
    expect(screen.getByTestId('CheckCircleOutlineIcon')).toBeInTheDocument();
  });

  it('does not mount closed alerts', () => {
    render(
      <AlertListComponent
        alertList={[
          { isOpen: false, error: true, message: 'Hidden alert' },
          { isOpen: true, error: false, message: 'Visible alert' },
        ]}
      />
    );

    expect(screen.queryByText('Hidden alert')).not.toBeInTheDocument();
    expect(screen.getByText('Visible alert')).toBeInTheDocument();
  });
});
