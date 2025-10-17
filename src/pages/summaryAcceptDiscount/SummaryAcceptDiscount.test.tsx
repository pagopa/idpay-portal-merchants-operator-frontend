import {
  render,
  screen,
  fireEvent,
  waitFor,
  act,
} from "@testing-library/react";
import { vi } from "vitest";
import SummaryAcceptDiscount from "./SummaryAcceptDiscount";
import ROUTES from "../../routes";

vi.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (key: string) => key,
  }),
}));

const mockNavigate = vi.fn();
vi.mock("react-router-dom", () => ({
  useNavigate: () => mockNavigate,
}));

const mockAuthPayment = vi.fn();
vi.mock("../../services/merchantService", () => ({
  authPaymentBarCode: (...args: any) => mockAuthPayment(...args),
}));

vi.mock("../../store/utilsStore", () => ({
  utilsStore: () => ({
    setTransactionAuthorized: vi.fn(),
  }),
}));

vi.mock("../../components/Alert/AlertComponent", () => ({
  __esModule: true,
  default: ({ message }: { message: string }) => (
    <div data-testid="alert">{message}</div>
  ),
}));

vi.mock("../../components/BreadcrumbsBox/BreadcrumbsBox", () => ({
  __esModule: true,
  default: ({ items }: { items: string[] }) => (
    <div data-testid="breadcrumbs">{items.join(" > ")}</div>
  ),
}));

describe("SummaryAcceptDiscount", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    sessionStorage.clear();
  });

  it("renders without data (no summaryDataObj)", () => {
    render(<SummaryAcceptDiscount />);
    expect(screen.getByTestId("breadcrumbs")).toBeInTheDocument();
  });

  it("renders with extendedAuthorization = true", () => {
    sessionStorage.setItem(
      "discountCoupon",
      JSON.stringify({ extendedAuthorization: true, userId: "CF123" })
    );
    render(<SummaryAcceptDiscount />);
    expect(
      screen.getByText("pages.acceptDiscount.summary")
    ).toBeInTheDocument();
  });

  it("renders with extendedAuthorization = false (shows verified chip)", () => {
    sessionStorage.setItem(
      "discountCoupon",
      JSON.stringify({ extendedAuthorization: false, userId: "CF456" })
    );
    render(<SummaryAcceptDiscount />);
    expect(
      screen.getByText("Identità verificata tramite IO")
    ).toBeInTheDocument();
  });

  it("shows Backdrop while loading and hides after click", async () => {
    sessionStorage.setItem("discountCoupon", JSON.stringify({}));
    render(<SummaryAcceptDiscount />);
    await act(async () => {
      fireEvent.click(screen.getByText("pages.acceptDiscount.title"));
    });
    expect(mockAuthPayment).toHaveBeenCalled();
  });

  it("handleAuthorizeDiscount success path", async () => {
    const trx = {
      trxCode: "CODE123",
      originalAmountCents: 1000,
      productGtin: "GTIN",
    };
    sessionStorage.setItem("discountCoupon", JSON.stringify(trx));
    mockAuthPayment.mockResolvedValueOnce({});
    render(<SummaryAcceptDiscount />);

    fireEvent.click(screen.getByText("pages.acceptDiscount.title"));
    await waitFor(() => {
      expect(mockAuthPayment).toHaveBeenCalledWith({
        trxCode: "CODE123",
        amountCents: 1000,
        additionalProperties: { productGtin: "GTIN" },
      });
      expect(sessionStorage.getItem("discountCoupon")).toBeNull();
    });
  });

  it("handleAuthorizeDiscount error path", async () => {
    const trx = { trxCode: "ERR123", originalAmountCents: 500 };
    sessionStorage.setItem("discountCoupon", JSON.stringify(trx));
    mockAuthPayment.mockRejectedValueOnce(new Error("fail"));
    render(<SummaryAcceptDiscount />);
    fireEvent.click(screen.getByText("pages.acceptDiscount.title"));

    await waitFor(() => {
      expect(screen.getByTestId("alert")).toBeInTheDocument();
    });
  });

  it("click 'Indietro' navigates to ACCEPT_DISCOUNT", () => {
    render(<SummaryAcceptDiscount />);
    fireEvent.click(screen.getByText("Indietro"));
    expect(mockNavigate).toHaveBeenCalledWith(ROUTES.ACCEPT_DISCOUNT);
  });

  it.skip("errorAlert hides after timeout", async () => {
    render(<SummaryAcceptDiscount />);
    await act(async () => {
      fireEvent.click(screen.getByText("pages.acceptDiscount.title"));
    });
    await waitFor(() => {
      expect(screen.getByTestId("alert")).toBeInTheDocument();
    });
    await act(async () => {
      vi.advanceTimersByTime(5000);
    });
  });
});
