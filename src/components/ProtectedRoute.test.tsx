import { render, screen } from "@testing-library/react";
import { vi, describe, it, expect, beforeEach } from "vitest";
import ProtectedRoute from "./ProtectedRoute";

let mockUseAuth: ReturnType<typeof vi.fn>;

vi.mock("../contexts/AuthContext", () => ({
  useAuth: () => mockUseAuth(),
}));

const TestChild = () => <div>Contenuto Protetto</div>;

describe("ProtectedRoute", () => {
  beforeAll(() => {
    mockUseAuth = vi.fn();
  });

  const setupMock = (isAuthenticated: boolean, loading: boolean) => {
    mockUseAuth.mockReturnValue({
      isAuthenticated,
      loading,
    });
  };

  beforeEach(() => {
    mockUseAuth.mockClear();
  });

  it("render CircularProgress when loading is true", () => {
    setupMock(false, true);

    render(
      <ProtectedRoute>
        <TestChild />
      </ProtectedRoute>
    );

    expect(screen.getByRole("progressbar")).toBeInTheDocument();
  });

  it("render redirect message if isAuthenticated eq false and loading eq true", () => {
    setupMock(false, false);

    render(
      <ProtectedRoute>
        <TestChild />
      </ProtectedRoute>
    );

    expect(
      screen.getByText("Reindirizzamento al login...")
    ).toBeInTheDocument();
  });

  it("render children if isAuthenticated = true and loading = false", () => {
    setupMock(true, false);

    render(
      <ProtectedRoute>
        <TestChild />
      </ProtectedRoute>
    );

    expect(screen.getByText("Contenuto Protetto")).toBeInTheDocument();
  });
});
