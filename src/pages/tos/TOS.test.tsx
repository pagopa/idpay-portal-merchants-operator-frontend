import { render } from "@testing-library/react";
import { vi } from "vitest";
import TOS from './TOS'

const mockNavigate = vi.fn();
vi.mock("react-router-dom", () => ({
  useNavigate: () => mockNavigate,
}));

describe('TOS component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test('should render component', () => {
    render(<TOS/>);
  });
});