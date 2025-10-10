import { describe, it, expect, vi, beforeEach, afterEach} from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import Profile from "./Profile";
import { useAuth } from "../../contexts/AuthContext";
import { authStore } from "../../store/authStore";
import { getPointOfSaleDetails } from "../../services/merchantService";
import { jwtDecode } from "jwt-decode";

vi.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (key) => key,
  }),
}));

vi.mock("../../contexts/AuthContext");
vi.mock("../../store/authStore");
vi.mock("../../services/merchantService");
vi.mock("jwt-decode");

vi.mock("../../components/DetailsCard/DetailsCard", () => ({
  default: ({ title, item }) => (
    <div
      data-testid={`details-card-${title.toLowerCase().replace(/\s/g, "-")}`}
    >
      <h3>{title}</h3>
      <pre>{JSON.stringify(item)}</pre>
    </div>
  ),
}));

vi.mock("../../components/Alert/AlertComponent", () => ({
  default: ({ message }) => <div data-testid="alert-component">{message}</div>,
}));

const mockToken = "mock-jwt-token";
const mockUserId = "merchant-123";
const mockPointOfSaleId = "pos-456";

const mockDecodedToken = {
  point_of_sale_id: mockPointOfSaleId,
};

const mockUserDetails = {
  user: {
    merchant_id: mockUserId,
  },
};

const mockResponse = {
  id: "POS123",
  address: "Via Test 1",
  zipCode: "00100",
  city: "Roma",
  province: "RM",
  channelPhone: "06123456",
  channelEmail: "vendita@test.it",
  contactName: "Mario",
  contactSurname: "Rossi",
  contactEmail: "contatto@test.it",
};

beforeEach(() => {
  vi.useRealTimers();

  useAuth.mockReturnValue(mockUserDetails);
  authStore.getState.mockReturnValue({ token: mockToken });
  jwtDecode.mockReturnValue(mockDecodedToken);
  getPointOfSaleDetails.mockResolvedValue(mockResponse);
});

afterEach(() => {
  vi.clearAllMocks();
});

describe("Profile Component (Vitest)", () => {
  it("should show loading spinner", () => {
    render(<Profile />);
    expect(screen.getByTestId("loading")).toBeInTheDocument();
  });

  it("should call API, map data and show DetailsCards", async () => {
    render(<Profile />);

    await waitFor(() => {
      expect(screen.getByTestId("details-cards")).toBeInTheDocument();
    });

    expect(jwtDecode).toHaveBeenCalledWith(mockToken);
    expect(getPointOfSaleDetails).toHaveBeenCalledWith(
      mockUserId,
      mockPointOfSaleId
    );

    expect(
      screen.getByTestId("details-card-dati-punto-vendita")
    ).toBeInTheDocument();
    expect(
      screen.getByTestId("details-card-dati-referente")
    ).toBeInTheDocument();

    expect(screen.queryByTestId("loading")).not.toBeInTheDocument();
    expect(screen.queryByTestId("alert-component")).not.toBeInTheDocument();
  });

  it("should show AlertComponent in case of API error", async () => {
    const consoleErrorSpy = vi
      .spyOn(console, "error")
      .mockImplementation(() => {});
    const mockError = new Error("API Error Test");
    getPointOfSaleDetails.mockRejectedValue(mockError);

    render(<Profile />);

    await waitFor(() => {
      expect(screen.getByTestId("alert-component")).toBeInTheDocument();
    });

    expect(screen.getByText("pages.profile.errorAlert")).toBeInTheDocument();
    expect(consoleErrorSpy).toHaveBeenCalledWith(
      "Error fetching details:",
      mockError
    );
    expect(screen.queryByTestId("details-cards")).not.toBeInTheDocument();

    consoleErrorSpy.mockRestore();
  });

  it("should handle API returning empty fields", async () => {
    const emptyResponse = {
      id: null,
      address: null,
      zipCode: null,
      city: null,
      province: null,
      channelPhone: null,
      channelEmail: null,
      contactName: null,
      contactSurname: null,
      contactEmail: null,
    };
    getPointOfSaleDetails.mockResolvedValue(emptyResponse);

    render(<Profile />);

    await waitFor(() =>
      expect(screen.getByTestId("details-cards")).toBeInTheDocument()
    );

    const firstCard = screen.getByTestId("details-card-dati-punto-vendita");
    expect(firstCard).toHaveTextContent('ID univoco":""');

    const secondCard = screen.getByTestId("details-card-dati-referente");
    expect(secondCard).toHaveTextContent('Nome":""');
    expect(secondCard).toHaveTextContent('Cognome":""');
    expect(secondCard).toHaveTextContent('Email":""');
  });
});
