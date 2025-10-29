import { describe, vi } from "vitest";
import { fireEvent, render, screen } from '@testing-library/react';
import TOS from './TOS';

const mockNavigate = vi.fn();
vi.mock("react-router-dom", () => ({
  useNavigate: () => mockNavigate,
}));

vi.mock('../../../hooks/useOneTrustNotice');
vi.mock('../../components/OneTrustContentWrapper', () => (props: { idSelector: string }) => (
  <div data-testid="onetrust-wrapper" data-idselector={props.idSelector} />
));

vi.mock('../../../utils/env', () => ({
  ENV: {
    ONE_TRUST: {
      TOS_JSON_URL: 'mock-tos-json-url',
      TOS_ID: 'mock-tos-id',
    },
  },
}));
vi.mock('../../../routes', () => ({
  TOS: '/mock-tos-route',
}));

describe('TOS component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test('should render component and navigate back', () => {
    render(<TOS />);

    const backButton = screen.getByTestId('back-stores-button');

    fireEvent.click(backButton);
  });
});
