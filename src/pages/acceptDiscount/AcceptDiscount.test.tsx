import { describe, it, expect, vi, beforeEach} from "vitest";
import {
  render,
  screen,
  fireEvent,
  waitFor,
  act,
} from "@testing-library/react";

import { REQUIRED_FIELD_ERROR } from "../../utils/constants";
import ROUTES from "../../routes";
import {
  getProductsList,
  previewPayment,
} from "../../services/merchantService";
import { ProductDTO } from "../../api/generated/merchants/ProductDTO";
import AcceptDiscount from "./AcceptDiscount";

const mockNavigate = vi.fn();
vi.mock("react-router-dom", () => ({
  useNavigate: () => mockNavigate,
}));

const mockGetProductsList = vi.fn();
const mockPreviewPayment = vi.fn();
vi.mock("../../services/merchantService", () => {
  return {
    getProductsList: vi.fn(() => mockGetProductsList()),
    previewPayment: vi.fn(() => mockPreviewPayment()),
  };
});

vi.mock("../../components/BreadcrumbsBox/BreadcrumbsBox", () => ({
  default: vi.fn(() => <div data-testid="BreadcrumbsBox" />),
}));
vi.mock("@pagopa/selfcare-common-frontend/lib", () => ({
  TitleBox: vi.fn(() => <div data-testid="TitleBox" />),
}));
vi.mock("../AcceptDiscountCard", () => ({
  default: vi.fn(({ children, titleBox, subTitleBox }) => (
    <div
      data-testid="AcceptDiscountCard"
      data-title={titleBox}
      data-subtitle={subTitleBox}
    >
      {children}
    </div>
  )),
}));
vi.mock("../../components/Modal/ModalComponent", () => ({
  default: vi.fn(({ open, children }) =>
    open ? <div data-testid="ModalComponent">{children}</div> : null
  ),
}));

vi.mock("../../components/Autocomplete/AutocompleteComponent", () => ({
  default: vi.fn(
    ({ options, onChangeDebounce, onChange, value, inputError }) => (
      <input
        data-testid="Autocomplete"
        data-error={inputError}
        value={value?.productName || ""}
        onChange={(e) => onChangeDebounce(e.target.value)}
        onBlur={() => {
          if (options.length > 0) {
            onChange(options[0]);
          }
        }}
      />
    )
  ),
}));
vi.mock("../../components/Alert/AlertComponent", () => ({
  default: vi.fn(({ message }) => (
    <div data-testid="AlertComponent">{message}</div>
  )),
}));

const mockT = vi.fn((key) => key);
vi.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: mockT,
    i18n: {
      changeLanguage: vi.fn(),
    },
  }),
}));

const mockSessionStorage = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: vi.fn((key) => store[key] || null),
    setItem: vi.fn((key, value) => {
      store[key] = value;
    }),
    removeItem: vi.fn((key) => {
      delete store[key];
    }),
    clear: vi.fn(() => {
      store = {};
    }),
  };
})();
Object.defineProperty(window, "sessionStorage", { value: mockSessionStorage });

const mockProducts: ProductDTO[] = [
  { gtinCode: "123", productName: "Prodotto Test 1" } as ProductDTO,
  { gtinCode: "456", productName: "Prodotto Test 2" } as ProductDTO,
];

const mockDiscountCoupon = {
  product: mockProducts[0],
  originalAmountCents: 10000, // 100.00 EUR
  trxCode: "TRX12345",
};

const renderComponent = () => render(<AcceptDiscount />);

const getProductAutocomplete = () => screen.getByTestId("Autocomplete");
const getTotalAmountInput = () =>
  screen.getByLabelText(mockT("pages.acceptDiscount.expenditureAmount"));
const getDiscountCodeInput = () =>
  screen.getByLabelText(mockT("pages.acceptDiscount.discountCode"));
const getContinueButton = () =>
  screen.getByRole("button", { name: mockT("commons.continueBtn") });
const getBackButton = () => screen.getByRole("button", { name: "Indietro" });

describe("AcceptDiscount Component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockSessionStorage.clear();
    mockGetProductsList.mockResolvedValue({ content: mockProducts });
  });

  it("should render the component correctly and fetch products list on mount", async () => {
    renderComponent();

    expect(screen.getByTestId("BreadcrumbsBox")).toBeInTheDocument();
    expect(getProductAutocomplete()).toBeInTheDocument();
    expect(getTotalAmountInput()).toBeInTheDocument();
    expect(getDiscountCodeInput()).toBeInTheDocument();
  });

  it("should load data from sessionStorage on mount if available", async () => {
    mockSessionStorage.setItem(
      "discountCoupon",
      JSON.stringify(mockDiscountCoupon)
    );

    renderComponent();

    await waitFor(() => {
      expect(getProductAutocomplete()).toHaveValue(
        mockDiscountCoupon.product.productName
      );
      expect(getTotalAmountInput()).toHaveValue("100");
      expect(getDiscountCodeInput()).toHaveValue(mockDiscountCoupon.trxCode);
    });
  });

  it("should show error messages when required fields are empty on continue click", async () => {
    renderComponent();

    await act(async () => {
      fireEvent.click(getContinueButton());
    });

    expect(getProductAutocomplete()).toHaveAttribute("data-error", "true");

    expect(getTotalAmountInput()).toHaveAttribute("aria-invalid", "true");
    expect(screen.getAllByText("Campo obbligatorio")[0]).toBeInTheDocument();

    expect(getDiscountCodeInput()).toHaveAttribute("aria-invalid", "true");
    expect(screen.getAllByText(REQUIRED_FIELD_ERROR).length).toBe(2);

    expect(mockPreviewPayment).not.toHaveBeenCalled();
  });

  it("should open and close the exit modal", () => {
    renderComponent();

    fireEvent.click(getBackButton());

    expect(screen.getByTestId("ModalComponent")).toBeInTheDocument();
    expect(
      screen.getByText(mockT("pages.acceptDiscount.modalTitle"))
    ).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Torna indietro" }));

    expect(screen.queryByTestId("ModalComponent")).not.toBeInTheDocument();
  });

  it('should exit the page and clear sessionStorage when clicking "Esci" in the modal', () => {
    renderComponent();

    fireEvent.click(getBackButton());

    fireEvent.click(screen.getByRole("button", { name: "Esci" }));

    expect(mockSessionStorage.removeItem).toHaveBeenCalledWith(
      "discountCoupon"
    );

    expect(mockNavigate).toHaveBeenCalledWith(ROUTES.BUY_MANAGEMENT);
  });

  it("should correctly handle comma separator and restrict to two decimal places for totalAmount", () => {
    renderComponent();
    const totalAmountInput = getTotalAmountInput();

    fireEvent.change(totalAmountInput, { target: { value: "123" } });
    expect(totalAmountInput).toHaveValue("123");

    fireEvent.change(totalAmountInput, { target: { value: "123," } });
    expect(totalAmountInput).toHaveValue("123,");

    fireEvent.change(totalAmountInput, { target: { value: "123,45" } });
    expect(totalAmountInput).toHaveValue("123,45");

    fireEvent.change(totalAmountInput, { target: { value: "123,456" } });
    expect(totalAmountInput).toHaveValue("123,45");

    fireEvent.change(totalAmountInput, { target: { value: "" } });
    fireEvent.change(totalAmountInput, { target: { value: "12A" } });
    expect(totalAmountInput).toHaveValue("");

    fireEvent.change(totalAmountInput, { target: { value: "1,2,3" } });
    expect(totalAmountInput).toHaveValue("");
    fireEvent.change(totalAmountInput, { target: { value: "123" } });
    fireEvent.change(totalAmountInput, { target: { value: "123,45" } });
    fireEvent.change(totalAmountInput, { target: { value: "123,45,6" } });
    expect(totalAmountInput).toHaveValue("123,45");
  });

  it("should correctly handle comma separator and restrict to two decimal places for totalAmount", () => {
    renderComponent();
    const discountCodeInput = getDiscountCodeInput();

    fireEvent.change(discountCodeInput, { target: { value: "123" } });
    expect(discountCodeInput).toHaveValue("123");

    fireEvent.change(discountCodeInput, { target: { value: "" } });
    expect(discountCodeInput).toHaveValue("");
  });

  describe("AcceptDiscount focus/blur", () => {
    it("mostra l'icona Euro al focus e la nasconde al blur", () => {
      renderComponent();

      const input = screen.getByLabelText(
        "pages.acceptDiscount.expenditureAmount"
      );

      expect(screen.queryByTestId("EuroIcon")).not.toBeInTheDocument();

      fireEvent.focus(input);
      expect(screen.getByTestId("EuroIcon")).toBeInTheDocument();

      fireEvent.blur(input);
      expect(screen.queryByTestId("EuroIcon")).not.toBeInTheDocument();
    });
  });

  it("chiama fetchProductsList (quindi getProductsList) quando cambia l'input dell'Autocomplete", async () => {
    (getProductsList as vi.Mock).mockResolvedValue({ content: [] });

    renderComponent();

    const autocompleteInput = screen.getByTestId("Autocomplete");

    fireEvent.change(autocompleteInput, { target: { value: "ProdottoX" } });

    await waitFor(() => {
      expect(getProductsList).toHaveBeenCalledWith({
        productName: "ProdottoX",
        size: 50,
      });
    });
  });

  it("imposta productsList vuoto se getProductsList lancia un errore", async () => {
    (getProductsList as vi.Mock).mockRejectedValue(new Error("API Error"));

    renderComponent();

    const autocompleteInput = screen.getByTestId("Autocomplete");
    fireEvent.change(autocompleteInput, { target: { value: "Prodotto" } });

    await waitFor(() => {
      expect(getProductsList).toHaveBeenCalledWith({
        productName: "Prodotto",
        size: 50,
      });
    });

    expect(screen.queryByRole("option")).not.toBeInTheDocument();
  });

  it("setta fieldErrors.discountCodeWrong se codice scaduto o già autorizzato", async () => {
    (previewPayment as vi.Mock).mockRejectedValue({
      response: { data: { code: "PAYMENT_NOT_FOUND_OR_EXPIRED" } },
    });

    renderComponent();

    fireEvent.change(
      screen.getByLabelText("pages.acceptDiscount.expenditureAmount"),
      {
        target: { value: "10" },
      }
    );
    fireEvent.change(
      screen.getByLabelText("pages.acceptDiscount.discountCode"),
      {
        target: { value: "ABC123" },
      }
    );
    fireEvent.change(screen.getByTestId("Autocomplete"), {
      target: { value: { gtinCode: "123", productName: "Prodotto" } },
    });

    fireEvent.click(screen.getByText("commons.continueBtn"));

    await waitFor(() => {
      const discountField = screen.getByLabelText(
        "pages.acceptDiscount.discountCode"
      );
    });
  });
});

describe("AcceptDiscount try/catch coverage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    sessionStorage.clear();
  });

  const fillForm = async () => {
    fireEvent.change(
      screen.getByLabelText("pages.acceptDiscount.expenditureAmount"),
      {
        target: { value: "10" },
      }
    );
    fireEvent.change(
      screen.getByLabelText("pages.acceptDiscount.discountCode"),
      {
        target: { value: "ABC123" },
      }
    );
    fireEvent.change(screen.getByTestId("Autocomplete"), {
      target: { value: { gtinCode: "123", productName: "Prodotto" } },
    });
  };

  it("setta fieldErrors.discountCodeWrong se codice scaduto o già autorizzato", async () => {
    (previewPayment as vi.Mock).mockRejectedValue({
      response: { data: { code: "PAYMENT_NOT_FOUND_OR_EXPIRED" } },
    });

    renderComponent();

    await fillForm();
    fireEvent.click(screen.getByText("commons.continueBtn"));

    await waitFor(() => {
      const discountField = screen.getByLabelText(
        "pages.acceptDiscount.discountCode"
      );
    });
  });
});
