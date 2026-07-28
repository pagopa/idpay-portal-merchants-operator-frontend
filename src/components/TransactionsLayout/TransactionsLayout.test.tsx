import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import TransactionsLayout from './TransactionsLayout';

vi.mock('@pagopa/selfcare-common-frontend/lib', () => ({
  TitleBox: vi.fn(({ title, subTitle }) => (
    <div data-testid="title-box">
      {title} - {subTitle}
    </div>
  )),
}));

vi.mock('../Alert/AlertComponent', () => ({
  default: vi.fn(({ message, isOpen }) => 
    isOpen ? <div data-testid="alert-component">{message}</div> : null
  ),
}));

vi.mock('../Alert/AlertListComponent', () => ({
  default: vi.fn(({ alertList }) => (
    <div data-testid="alert-list-component">
      {alertList.map((alert: any, index: number) => (
        <span key={index} data-testid={`alert-list-item-${index}`}>
          {alert.message}
        </span>
      ))}
    </div>
  )),
}));

vi.mock('../../hooks/useScopedTranslation', () => ({
  useScopedTranslation: vi.fn(() => ({
    t: (key: string) => key,
  })),
}));

const mockUseAutoResetBanner = vi.fn();
vi.mock('../../hooks/useAutoResetBanner', () => ({
  useAutoResetBanner: (...args: any[]) => mockUseAutoResetBanner(...args),
}));

describe('TransactionsLayout component', () => {
  const mockGenericErrorState = [false, vi.fn()] as [boolean, (value: boolean) => void];
  const mockAlerts = [[false, vi.fn()]] as Array<[boolean, (value: boolean) => void]>;

  const defaultProps = {
    title: 'Test Title',
    subtitle: 'Test Subtitle',
    tableTitle: 'Test Table Title',
    alerts: mockAlerts,
    genericErrorState: mockGenericErrorState,
    alertMessages: {
      error: 'Generic Error',
    },
    isAlertVisible: true,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders correctly with base props', () => {
    render(
      <TransactionsLayout {...defaultProps}>
        <div data-testid="child-element">Child Content</div>
      </TransactionsLayout>
    );

    expect(screen.getByTestId('title-box')).toHaveTextContent('Test Title - Test Subtitle');
    
    expect(screen.getByText('Test Table Title')).toBeInTheDocument();
    expect(screen.getByTestId('child-element')).toBeInTheDocument();

    expect(mockUseAutoResetBanner).toHaveBeenCalledWith([
      mockGenericErrorState,
      ...mockAlerts,
    ]);
  });

  it('renders the additional button and handles click', () => {
    const mockOnClick = vi.fn();
    const additionalButton = {
      label: 'Custom Action',
      icon: <span data-testid="btn-icon" />,
      onClick: mockOnClick,
    };

    render(<TransactionsLayout {...defaultProps} additionalButton={additionalButton} />);

    const button = screen.getByRole('button', { name: /Custom Action/i });
    expect(button).toBeInTheDocument();
    expect(screen.getByTestId('btn-icon')).toBeInTheDocument();

    fireEvent.click(button);
    expect(mockOnClick).toHaveBeenCalledTimes(1);
  });

  it('renders AlertComponent for keys containing "error" in externalState', () => {
    const externalState = {
      downloadError: true,
    };
    const alertMessages = {
      downloadError: 'Download failed',
      error: 'Generic Error',
    };

    render(
      <TransactionsLayout 
        {...defaultProps} 
        externalState={externalState} 
        alertMessages={alertMessages} 
      />
    );

    const errorAlert = screen.getByTestId('alert-list-component');
    expect(errorAlert).toHaveTextContent('Download failed');
  });

  it('does not render AlertComponent if isAlertVisible is false', () => {
    const externalState = {
      downloadError: true,
    };
    const alertMessages = {
      downloadError: 'Download failed',
    };

    render(
      <TransactionsLayout 
        {...defaultProps} 
        externalState={externalState} 
        alertMessages={alertMessages} 
        isAlertVisible={false} 
      />
    );

    expect(screen.queryByTestId('alert-component')).not.toBeInTheDocument();
  });

  it('passes non-error states and generic error to AlertListComponent', () => {
    const externalState = {
      successEvent: true,
      downloadError: true,
    };
    const alertMessages = {
      successEvent: 'Operation successful',
      downloadError: 'Download failed',
      error: 'Default error fallback',
    };

    render(
      <TransactionsLayout 
        {...defaultProps} 
        externalState={externalState} 
        alertMessages={alertMessages} 
      />
    );

    const alertListContainer = screen.getByTestId('alert-list-component');

    expect(alertListContainer).toHaveTextContent('Operation successful');

    expect(alertListContainer).toHaveTextContent('Default error fallback');
  });

  it('uses translation for fallback generic error if alertMessages.error is undefined', () => {
    render(
      <TransactionsLayout 
        {...defaultProps} 
        alertMessages={{}}
      />
    );

    const alertListContainer = screen.getByTestId('alert-list-component');
    expect(alertListContainer).toHaveTextContent('pages.refundManagement.errorAlert');
  });
});