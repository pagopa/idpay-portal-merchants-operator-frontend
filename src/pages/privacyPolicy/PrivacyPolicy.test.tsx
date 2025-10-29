import { render } from "@testing-library/react";
import { vi } from "vitest";
import PrivacyPolicy from './PrivacyPolicy'

const mockNavigate = vi.fn();
vi.mock("react-router-dom", () => ({
  useNavigate: () => mockNavigate,
}));

describe('PrivacyPolicy component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test('should render component', () => {
    render(<PrivacyPolicy/>);
  });
});