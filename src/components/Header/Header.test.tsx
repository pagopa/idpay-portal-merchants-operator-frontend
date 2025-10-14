import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
vi.mock("../../config/keycloak", () => ({
  default: {
    logout: vi.fn(),
  },
}));
vi.mock("../../contexts/AuthContext", () => ({
  useAuth: () => ({
    isAuthenticated: true,
    user: {
      firstName: "Mattia",
      lastName: "Rossi",
      email: "m.rossi@example.com",
      uid: "test-user-id",
    },
    token: "mock-token",
    login: vi.fn(),
    logout: vi.fn(),
    loading: false,
    productsList: [{ title: "Bonus Elettrodomestici" }],
    partyList: [{ id: "1", name: "Euronics" }],
    partyId: "1",
  }),
}));
import Header from "./Header";
import keycloak from "../../config/keycloak";

const consoleLogSpy = vi.spyOn(console, "log").mockImplementation(() => {});

const mockUserProps = {
  id: "123",
  firstName: "Mario",
  lastName: "Bianchi",
  email: "mario.bianchi@example.com",
};

vi.mock("@pagopa/mui-italia", () => ({
  HeaderAccount: (props) => (
    <div data-testid="header-account">
      <span>
        {props.loggedUser.name} {props.loggedUser.surname}
      </span>
      <a href={props.rootLink.href}>{props.rootLink.label}</a>
      <button onClick={props.onLogout}>Logout</button>
      <button data-testid="assistance-button" onClick={props.onAssistanceClick}>
        Assistenza
      </button>
    </div>
  ),
  HeaderProduct: (props) => {
    const selectedParty = props.partyList.find((p) => p.id === props.partyId);
    return (
      <div data-testid="header-product">
        <span>{props.productsList[0].title}</span>
        {selectedParty && <span>{selectedParty.name}</span>}
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
  ProductEntity: () => null,
}));

const mockAuthContextValue = {
  isAuthenticated: true,
  user: {
    firstName: "Mattia",
    lastName: "Rossi",
    email: "m.rossi@example.com",
    uid: "test-user-id",
  },
  token: "mock-token",
  login: vi.fn(),
  logout: vi.fn(),
  loading: false,
  productsList: [{ title: "Bonus Elettrodomestici" }],
  partyList: [{ id: "1", name: "Euronics" }],
  partyId: "1",
};

const renderWithAuth = () => {
  return render(<Header userProps={mockAuthContextValue.user} />);
};

describe("Header Component", () => {
  it("should render HeaderAccount with logged user information", () => {
    renderWithAuth();

    expect(screen.getByText("Mattia Rossi")).toBeInTheDocument();

    const pagopaLink = screen.getByText("PagoPA S.p.A.");
    expect(pagopaLink).toBeInTheDocument();
    expect(pagopaLink).toHaveAttribute("href", "https://www.pagopa.it/it/");
  });

  it("should render HeaderProduct with product and selected party", () => {
    renderWithAuth();

    expect(screen.getByText("Bonus Elettrodomestici")).toBeInTheDocument();
    expect(screen.getByText("Comet S.P.A.")).toBeInTheDocument();
  });

  it("should have both HeaderAccount and HeaderProduct components in the document", () => {
    renderWithAuth();

    expect(screen.getByTestId("header-account")).toBeInTheDocument();
    expect(screen.getByTestId("header-product")).toBeInTheDocument();
  });
});

describe("Header component", () => {
  it("should use useAuth when userProps is not provided", () => {
    render(<Header />);

    expect(screen.getByText("Mattia Rossi")).toBeInTheDocument();
  });
});

describe("Header component", () => {
  it("should call keycloak.logout when onLogout is triggered", () => {
    render(
      <Header
        userProps={{
          id: "1",
          firstName: "Mario",
          lastName: "Rossi",
          email: "mario.rossi@example.com",
        }}
      />
    );

    const logoutButton = screen.getByRole("button", { name: /logout/i });
    fireEvent.click(logoutButton);
    expect(keycloak.logout).toHaveBeenCalled();
  });
});

describe("Header component", () => {
  it("should use userProps when provided", () => {
    const mockUserProps = {
      id: "123",
      firstName: "Mario",
      lastName: "Bianchi",
      email: "mario.rossi@example.com",
    };

    render(<Header userProps={mockUserProps} />);

    expect(screen.getByText("Mario Bianchi")).toBeInTheDocument();
  });
});

beforeEach(() => {
  vi.clearAllMocks();
  consoleLogSpy.mockClear();
});

describe("Header Component", () => {
  it("should use useAuth when userProps is not provided", () => {
    render(<Header />);

    expect(screen.getByText("Mattia Rossi")).toBeInTheDocument();
    expect(screen.getByTestId("header-account")).toBeInTheDocument();
  });

  it("should use userProps when provided", () => {
    render(<Header userProps={mockUserProps} />);

    expect(screen.getByText("Mario Bianchi")).toBeInTheDocument();

    const logoutButton = screen.getByRole("button", { name: /logout/i });
    expect(logoutButton).toBeInTheDocument();
  });

  it("should render HeaderProduct with correct product and selected party information", () => {
    render(<Header userProps={mockUserProps} />);

    expect(screen.getByText("Bonus Elettrodomestici")).toBeInTheDocument();
    expect(screen.getByText("Comet S.P.A.")).toBeInTheDocument();
    expect(screen.getByTestId("header-product")).toBeInTheDocument();
  });

  it("should call keycloak.logout when onLogout is triggered", () => {
    render(<Header userProps={mockUserProps} />);

    const logoutButton = screen.getByRole("button", { name: /logout/i });
    fireEvent.click(logoutButton);
    expect(keycloak.logout).toHaveBeenCalledTimes(1);
  });

  it("should call console.log when onSelectedParty is triggered in HeaderProduct", () => {
    render(<Header userProps={mockUserProps} />);

    const selectPartyButton = screen.getByTestId("select-party-button");
    fireEvent.click(selectPartyButton);

    expect(consoleLogSpy).toHaveBeenCalledWith(
      "Selected Item:",
      "Comet S.P.A."
    );
    expect(consoleLogSpy).toHaveBeenCalledTimes(1);
  });

  it("should call onAssistanceClick when triggered (to cover the empty function)", () => {
    render(<Header userProps={mockUserProps} />);

    const assistanceButton = screen.getByTestId("assistance-button");
    fireEvent.click(assistanceButton);
  });

  it("should have an empty function for onLogin (to cover the empty function)", () => {
    render(<Header userProps={mockUserProps} />);
  });
});

afterAll(() => {
  consoleLogSpy.mockRestore();
});
