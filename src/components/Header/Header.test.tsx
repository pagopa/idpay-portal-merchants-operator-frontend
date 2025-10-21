import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach, afterAll } from "vitest";
import Header from "./Header";
import keycloak from "../../config/keycloak";
import { getPointOfSaleDetails } from "../../services/merchantService.ts";
import { jwtDecode } from "jwt-decode";

vi.mock("../../config/keycloak", () => ({
  default: {
    logout: vi.fn(),
  },
}));

vi.mock("../../contexts/AuthContext", () => ({
  useAuth: () => ({
    user: {
      id: "test-user-id",
      email: "m.rossi@example.com",
      merchant_id: "merchant-123",
    },
  }),
}));

vi.mock("../../store/authStore.ts", () => ({
  authStore: {
    getState: vi.fn(() => ({
      token: "mock-token-123",
    })),
  },
}));

vi.mock("../../services/merchantService.ts", () => ({
  getPointOfSaleDetails: vi.fn(),
}));

vi.mock("jwt-decode", () => ({
  jwtDecode: vi.fn(() => ({
    point_of_sale_id: "pos-123",
  })),
}));

vi.stubEnv('VITE_MANUAL_LINK', 'https://manual.example.com');

vi.mock("@pagopa/mui-italia", () => ({
  HeaderAccount: (props: any) => (
      <div data-testid="header-account">
        <span data-testid="logged-user-email">{props.loggedUser.email}</span>
        <a href={props.rootLink.href}>{props.rootLink.label}</a>
        <button onClick={props.onLogout}>Logout</button>
        <button data-testid="documentation-button" onClick={props.onDocumentationClick}>
          Documentazione
        </button>
        <button data-testid="assistance-button" onClick={props.onAssistanceClick}>
          Assistenza
        </button>
      </div>
  ),
  HeaderProduct: (props: any) => {
    const selectedParty = props.partyList.find((p: any) => p.id === props.partyId);
    return (
        <div data-testid="header-product">
          <span data-testid="product-title">{props.productsList[0].title}</span>
          {selectedParty && <span data-testid="party-name">{selectedParty.name}</span>}
          <button
              data-testid="select-party-button"
              onClick={() =>
                  props.onSelectedParty({
                    id: props.partyId,
                    name: selectedParty.name,
                  })
              }
          >
            Select Party
          </button>
        </div>
    );
  },
}));

const consoleLogSpy = vi.spyOn(console, "log").mockImplementation(() => {});
const consoleErrorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
const windowOpenSpy = vi.spyOn(window, "open").mockImplementation(() => null);

const mockUserProps = {
  id: "123",
  email: "mario.bianchi@example.com",
  merchant_id: "merchant-456",
};

beforeEach(() => {
  vi.clearAllMocks();
  consoleLogSpy.mockClear();
  consoleErrorSpy.mockClear();
  windowOpenSpy.mockClear();
  (getPointOfSaleDetails as any).mockResolvedValue({
    franchiseName: "Test Franchise",
  });
});

describe("Header Component - Basic Rendering", () => {
  it("should render HeaderAccount with logged user email", async () => {
    render(<Header userProps={mockUserProps} />);

    await waitFor(() => {
      expect(screen.getByTestId("logged-user-email")).toHaveTextContent(
          "mario.bianchi@example.com"
      );
    });

    const pagopaLink = screen.getByText("PagoPA S.p.A.");
    expect(pagopaLink).toBeInTheDocument();
    expect(pagopaLink).toHaveAttribute("href", "https://www.pagopa.it/it/");
  });

  it("should render HeaderProduct with product title", async () => {
    render(<Header userProps={mockUserProps} />);

    await waitFor(() => {
      expect(screen.getByTestId("product-title")).toHaveTextContent(
          "Bonus Elettrodomestici"
      );
    });
  });

  it("should have both HeaderAccount and HeaderProduct components in the document", () => {
    render(<Header userProps={mockUserProps} />);

    expect(screen.getByTestId("header-account")).toBeInTheDocument();
    expect(screen.getByTestId("header-product")).toBeInTheDocument();
  });
});

describe("Header Component - User Props vs useAuth", () => {
  it("should use useAuth when userProps is not provided", async () => {
    render(<Header />);

    await waitFor(() => {
      expect(screen.getByTestId("logged-user-email")).toHaveTextContent(
          "m.rossi@example.com"
      );
    });
    expect(screen.getByTestId("header-account")).toBeInTheDocument();
  });

  it("should use userProps when provided", async () => {
    render(<Header userProps={mockUserProps} />);

    await waitFor(() => {
      expect(screen.getByTestId("logged-user-email")).toHaveTextContent(
          "mario.bianchi@example.com"
      );
    });

    const logoutButton = screen.getByRole("button", { name: /logout/i });
    expect(logoutButton).toBeInTheDocument();
  });
});

describe("Header Component - Franchise Name Fetch", () => {
  it("should fetch and display franchise name when user and token are available", async () => {
    render(<Header userProps={mockUserProps} />);

    await waitFor(() => {
      expect(getPointOfSaleDetails).toHaveBeenCalledWith(
          "merchant-456",
          "pos-123"
      );
    });

    await waitFor(() => {
      expect(screen.getByTestId("party-name")).toHaveTextContent(
          "Test Franchise"
      );
    });
  });

  it("should handle error when fetching franchise details fails", async () => {
    const error = new Error("API Error");
    (getPointOfSaleDetails as any).mockRejectedValueOnce(error);

    render(<Header userProps={mockUserProps} />);

    await waitFor(() => {
      expect(consoleErrorSpy).toHaveBeenCalledWith("Error:", error);
    });
  });

  it("should use empty string when franchiseName is not returned", async () => {
    (getPointOfSaleDetails as any).mockResolvedValueOnce({});

    render(<Header userProps={mockUserProps} />);

    await waitFor(() => {
      expect(getPointOfSaleDetails).toHaveBeenCalled();
    });

    await waitFor(() => {
      const partyName = screen.getByTestId("party-name");
      expect(partyName).toHaveTextContent("");
    });
  });
});

describe("Header Component - User Actions", () => {
  it("should call keycloak.logout when onLogout is triggered", async () => {
    render(<Header userProps={mockUserProps} />);

    const logoutButton = screen.getByRole("button", { name: /logout/i });
    fireEvent.click(logoutButton);

    expect(keycloak.logout).toHaveBeenCalledTimes(1);
  });

  it("should call console.log when onSelectedParty is triggered in HeaderProduct", async () => {
    render(<Header userProps={mockUserProps} />);

    await waitFor(() => {
      expect(screen.getByTestId("party-name")).toHaveTextContent(
          "Test Franchise"
      );
    });

    const selectPartyButton = screen.getByTestId("select-party-button");
    fireEvent.click(selectPartyButton);

    expect(consoleLogSpy).toHaveBeenCalledWith(
        "Selected Item:",
        "Test Franchise"
    );
    expect(consoleLogSpy).toHaveBeenCalledTimes(1);
  });

  it("should open manual link when onDocumentationClick is triggered", async () => {
    render(<Header userProps={mockUserProps} />);

    const documentationButton = screen.getByTestId("documentation-button");
    fireEvent.click(documentationButton);

    expect(windowOpenSpy).toHaveBeenCalledWith(
        import.meta.env.VITE_MANUAL_LINK || '',
        "_blank"
    );
  });

  it("should call onAssistanceClick without errors", async () => {
    render(<Header userProps={mockUserProps} />);

    const assistanceButton = screen.getByTestId("assistance-button");

    expect(() => {
      fireEvent.click(assistanceButton);
    }).not.toThrow();
  });
});

describe("Header Component - JWT Decoding", () => {
  it("should decode JWT token correctly", async () => {
    render(<Header userProps={mockUserProps} />);

    await waitFor(() => {
      expect(jwtDecode).toHaveBeenCalledWith("mock-token-123");
    });
  });
});

afterAll(() => {
  consoleLogSpy.mockRestore();
  consoleErrorSpy.mockRestore();
  windowOpenSpy.mockRestore();
});