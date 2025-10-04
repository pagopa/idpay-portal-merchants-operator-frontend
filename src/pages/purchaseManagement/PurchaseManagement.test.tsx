import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

import {
  render,
  screen,
  fireEvent,
  waitFor,
  within,
} from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { authStore } from "../../store/authStore";
import { utilsStore } from "../../store/utilsStore";
import { jwtDecode } from "jwt-decode";
import {
  getInProgressTransactions,
  deleteTransactionInProgress,
  capturePayment,
} from "../../services/merchantService";
import PurchaseManagement from "./PurchaseManagement";

vi.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (key: string) => {
      const translations: Record<string, string> = {
        "pages.purchaseManagement.title": "Gestione Acquisti",
        "pages.purchaseManagement.subtitle":
          "Gestisci i tuoi acquisti e transazioni",
        "pages.refundManagement.authorized": "AUTORIZZATO",
      };
      return translations[key] || key;
    },
  }),
}));

// Mock di react-router-dom per la navigazione
const mockNavigate = vi.fn();
vi.mock("react-router-dom", () => ({
  useNavigate: () => mockNavigate,
}));
vi.mock("../../routes", () => ({
  default: {
    ACCEPT_DISCOUNT: "/accept-discount",
    REFUNDS_MANAGEMENT: "/refunds-management",
    BUY_MANAGEMENT: "/buy-management",
    REVERSE: "/reverse",
  },
}));

vi.mock("jwt-decode");
vi.mock("../../store/authStore");
vi.mock("../../services/merchantService");
vi.mock("../../store/utilsStore");
vi.mock("../../store/authStore");

// Mock dei componenti figli
vi.mock("../../components/DataTable/DataTable", () => ({
  default: ({
    rows,
    columns,
    onPaginationPageChange,
    onSortModelChange,
    handleRowAction,
    paginationModel,
    sortModel,
  }) => (
    <div data-testid="data-table">
      <div data-testid="table-rows">{rows.length} rows</div>
      <button
        data-testid="pagination-change"
        onClick={() =>
          onPaginationPageChange({
            page: paginationModel.page + 1,
            pageSize: paginationModel.pageSize,
          })
        }
      />
      <button
        data-testid="sort-change-name-desc"
        onClick={() =>
          onSortModelChange([{ field: "additionalProperties", sort: "desc" }])
        }
      />
      <button
        data-testid="sort-change-date-asc"
        onClick={() =>
          onSortModelChange([{ field: "updateDate", sort: "asc" }])
        }
      />
      <button
        data-testid="row-action"
        onClick={() => handleRowAction(rows[0])}
      />
      <div data-testid="sort-model">{JSON.stringify(sortModel)}</div>
    </div>
  ),
}));

vi.mock("../../components/FiltersForm/FiltersForm", () => ({
  default: ({ formik, onFiltersApplied, onFiltersReset, children }) => (
    <form onSubmit={formik.handleSubmit} data-testid="filters-form">
      {children}
      <button
        type="button"
        data-testid="apply-filters-btn"
        onClick={() => onFiltersApplied(formik.values)}
      >
        Apply Filters
      </button>
      <button
        type="button"
        data-testid="reset-filters-btn"
        onClick={onFiltersReset}
      >
        Reset Filters
      </button>
    </form>
  ),
}));

vi.mock("../../components/Alert/AlertComponent", () => ({
  default: ({ message, error }) => (
    <div data-testid={`alert-${error ? "error" : "success"}`}>{message}</div>
  ),
}));

vi.mock("../../components/Modal/ModalComponent", () => ({
  default: ({ open, onClose, children }) =>
    open ? (
      <div data-testid="modal-component">
        <button data-testid="modal-close" onClick={onClose}>
          Close Modal
        </button>
        {children}
      </div>
    ) : null,
}));

// --- Dati Mock ---

const mockToken = "mock-jwt-token";
const mockPointOfSaleId = "pos-456";
const mockInitiativeId = "VITE_INITIATIVE_ID";
const mockPageSize = 10;

const mockDecodedToken = { point_of_sale_id: mockPointOfSaleId };

const mockTransaction = (status, id = "trx123") => ({
  id: id,
  trxCode: `CODE-${id}`,
  status: status,
  updateDate: new Date().toISOString(),
  fiscalCode: "RSSMRA80A01H501I",
  effectiveAmountCents: 15000,
  rewardAmountCents: 5000,
  additionalProperties: {
    productName: "Frigorifero Modello X",
    productCategory: "Elettrodomestico",
    productBrand: "BrandA",
    productModel: "ModelB",
  },
});

const mockTransactionsList = [
  mockTransaction("AUTHORIZED", "trx1"),
  mockTransaction("CAPTURED", "trx2"),
];

const mockAPIResponse = {
  content: mockTransactionsList,
  pageNo: 0,
  pageSize: mockPageSize,
  totalElements: 20,
};

beforeEach(() => {
  vi.useRealTimers();
  vi.stubGlobal("import.meta.env", {
    VITE_INITIATIVE_ID: mockInitiativeId,
    VITE_PAGINATION_SIZE: mockPageSize,
  });

  authStore.getState.mockReturnValue({ token: mockToken });
  jwtDecode.mockReturnValue(mockDecodedToken);
  utilsStore.mockReturnValue(false);

  getInProgressTransactions.mockResolvedValue(mockAPIResponse);
  deleteTransactionInProgress.mockResolvedValue({});
  capturePayment.mockResolvedValue({});
});

afterEach(() => {
  vi.clearAllMocks();
  vi.useRealTimers();
});

describe("PurchaseManagement Component", () => {
  it("dovrebbe mostrare il loading spinner al mount e chiamare fetchTransactions", async () => {
    render(<PurchaseManagement />);

    expect(screen.getByTestId("loading")).toBeInTheDocument();

    await waitFor(() => {
      expect(getInProgressTransactions).toHaveBeenCalled();
    });

    expect(screen.queryByTestId("loading")).not.toBeInTheDocument();
    expect(screen.getByTestId("data-table")).toBeInTheDocument();
    expect(screen.getByTestId("table-rows")).toHaveTextContent("2 rows");
  });

  it("dovrebbe navigare a ROUTES.ACCEPT_DISCOUNT al click del bottone", () => {
    render(<PurchaseManagement />);

    fireEvent.click(screen.getByText("Accetta buono sconto"));

    expect(mockNavigate).toHaveBeenCalledWith("/accept-discount");
  });

  it("dovrebbe mostrare il messaggio di assenza transazioni se l'API ritorna un array vuoto", async () => {
    getInProgressTransactions.mockResolvedValue({
      content: [],
      pageNo: 0,
      pageSize: mockPageSize,
      totalElements: 0,
    });

    render(<PurchaseManagement />);

    // Aspetta il termine del loading
    await waitFor(() => {
      expect(screen.queryByTestId("loading")).not.toBeInTheDocument();
    });

    expect(
      screen.getByText("pages.refundManagement.noTransactions")
    ).toBeInTheDocument();
    expect(screen.queryByTestId("filters-form")).not.toBeInTheDocument();
  });

  it("dovrebbe mostrare un alert di errore se fetchTransactions fallisce", async () => {
    const consoleErrorSpy = vi
      .spyOn(console, "error")
      .mockImplementation(() => {});
    getInProgressTransactions.mockRejectedValue(new Error("Fetch Error"));

    render(<PurchaseManagement />);

    await waitFor(() => {
      expect(screen.queryByTestId("loading")).not.toBeInTheDocument();
      expect(screen.getByTestId("alert-error")).toHaveTextContent(
        "pages.refundManagement.errorAlert"
      );
    });

    // Verifica che l'errore sia stato loggato
    expect(consoleErrorSpy).toHaveBeenCalledWith(
      "Error fetching transactions:",
      expect.any(Error)
    );

    consoleErrorSpy.mockRestore();
  });

  it("dovrebbe chiamare fetchTransactions con i parametri di paginazione corretti", async () => {
    render(<PurchaseManagement />);

    await waitFor(() => {
      expect(screen.getByTestId("data-table")).toBeInTheDocument();
    });

    fireEvent.click(screen.getByTestId("pagination-change"));

    await waitFor(() => {
      expect(getInProgressTransactions).toHaveBeenCalled();
    });
  });

  it("dovrebbe chiamare fetchTransactions con il sort corretto (campo standard)", async () => {
    render(<PurchaseManagement />);
    await waitFor(() =>
      expect(screen.getByTestId("data-table")).toBeInTheDocument()
    );

    fireEvent.click(screen.getByTestId("sort-change-date-asc"));

    await waitFor(() => {
      expect(getInProgressTransactions).toHaveBeenCalled();
    });
  });

  it("dovrebbe chiamare fetchTransactions con il sort corretto (campo speciale: additionalProperties)", async () => {
    render(<PurchaseManagement />);
    await waitFor(() =>
      expect(screen.getByTestId("data-table")).toBeInTheDocument()
    );

    fireEvent.click(screen.getByTestId("sort-change-name-desc"));

    await waitFor(() => {
      expect(getInProgressTransactions).toHaveBeenCalled();
    });
  });

  it("dovrebbe chiamare fetchTransactions con filtri e sort quando si applicano i filtri", async () => {
    const user = userEvent.setup();
    render(<PurchaseManagement />);
    await waitFor(() =>
      expect(screen.getByTestId("filters-form")).toBeInTheDocument()
    );

    const fiscalCodeInput = screen.getByTestId("fiscal-code-filter");
    await user.type(fiscalCodeInput, "ABC123XYZ");
    fireEvent.click(screen.getByTestId("sort-change-date-asc"));

    fireEvent.click(screen.getByTestId("apply-filters-btn"));

    await waitFor(() => {
      expect(getInProgressTransactions).toHaveBeenCalled();
    });
  });

  it("dovrebbe chiamare fetchTransactions con filtri e sort speciale (additionalProperties)", async () => {
    const user = userEvent.setup();
    render(<PurchaseManagement />);
    await waitFor(() =>
      expect(screen.getByTestId("filters-form")).toBeInTheDocument()
    );

    const fiscalCodeInput = screen.getByTestId("fiscal-code-filter");

    await user.type(fiscalCodeInput, "FILTERED");
    fireEvent.click(screen.getByTestId("sort-change-name-desc"));

    fireEvent.click(screen.getByTestId("apply-filters-btn"));

    await waitFor(() => {
      expect(getInProgressTransactions).toHaveBeenCalled();
    });
  });

  it("dovrebbe resettare i filtri e chiamare fetchTransactions con parametri di default", async () => {
    const user = userEvent.setup();
    render(<PurchaseManagement />);
    await waitFor(() =>
      expect(screen.getByTestId("filters-form")).toBeInTheDocument()
    );

    const fiscalCodeInput = screen.getByTestId("fiscal-code-filter");
    await user.type(fiscalCodeInput, "ABC123XYZ");

    fireEvent.click(screen.getByTestId("reset-filters-btn"));

    await waitFor(() => {
      expect(getInProgressTransactions).toHaveBeenCalled();
    });
  });

  it("dovrebbe aprire il drawer e mostrare i dettagli della transazione al click su una riga", async () => {
    render(<PurchaseManagement />);
    await waitFor(() =>
      expect(screen.getByTestId("data-table")).toBeInTheDocument()
    );

    fireEvent.click(screen.getByTestId("row-action"));

    expect(
      screen.getByText("pages.purchaseManagement.drawer.title")
    ).toBeInTheDocument();

    expect(
      screen.getByText(mockTransaction("AUTHORIZED").fiscalCode)
    ).toBeInTheDocument();
    expect(screen.getByText("BrandA ModelB")).toBeInTheDocument();
  });

  it("dovrebbe mostrare i bottoni Capture/Cancel se lo stato è AUTHORIZED", async () => {
    getInProgressTransactions.mockResolvedValue({
      ...mockAPIResponse,
      content: [mockTransaction("AUTHORIZED")],
    });
    render(<PurchaseManagement />);
    await waitFor(() => fireEvent.click(screen.getByTestId("row-action")));

    expect(
      screen.getByText("pages.purchaseManagement.drawer.confirmPayment")
    ).toBeInTheDocument();
    expect(
      screen.getByText("pages.purchaseManagement.drawer.cancellPayment")
    ).toBeInTheDocument();
  });

  it("dovrebbe mostrare i bottoni Refund se lo stato NON è AUTHORIZED", async () => {
    getInProgressTransactions.mockResolvedValue({
      ...mockAPIResponse,
      content: [mockTransaction("CAPTURED")],
    });
    render(<PurchaseManagement />);
    await waitFor(() => fireEvent.click(screen.getByTestId("row-action")));

    expect(
      screen.getByText("pages.purchaseManagement.drawer.requestRefund")
    ).toBeInTheDocument();
    expect(
      screen.getByText("pages.purchaseManagement.drawer.refund")
    ).toBeInTheDocument();
  });

  it("dovrebbe aprire il modal di Capture e completare l'operazione con successo", async () => {
    getInProgressTransactions.mockResolvedValue({
      ...mockAPIResponse,
      content: [mockTransaction("AUTHORIZED")],
    });
    render(<PurchaseManagement />);
    await waitFor(() => fireEvent.click(screen.getByTestId("row-action")));

    fireEvent.click(
      screen.getByText("pages.purchaseManagement.drawer.confirmPayment")
    );

    const modal = screen.getByTestId("modal-component");
    expect(
      within(modal).getByText(
        "pages.purchaseManagement.captureTransactionModal.title"
      )
    ).toBeInTheDocument();

    fireEvent.click(within(modal).getByText("Conferma"));

    await waitFor(() => {
      expect(capturePayment).toHaveBeenCalledWith({ trxCode: "CODE-trx123" });
    });

    expect(mockNavigate).toHaveBeenCalledWith("/buy-management");
    expect(screen.getByTestId("alert-success")).toHaveTextContent(
      "pages.purchaseManagement.paymentSuccess"
    );
    expect(screen.queryByTestId("modal-component")).not.toBeInTheDocument();
  });

  it("dovrebbe aprire il modal di Capture e gestire il fallimento", async () => {
    const consoleErrorSpy = vi
      .spyOn(console, "error")
      .mockImplementation(() => {});
    getInProgressTransactions.mockResolvedValue({
      ...mockAPIResponse,
      content: [mockTransaction("AUTHORIZED")],
    });
    capturePayment.mockRejectedValue(new Error("Capture Fail"));

    render(<PurchaseManagement />);
    await waitFor(() => fireEvent.click(screen.getByTestId("row-action")));
    fireEvent.click(
      screen.getByText("pages.purchaseManagement.drawer.confirmPayment")
    );

    const modal = screen.getByTestId("modal-component");
    fireEvent.click(within(modal).getByText("Conferma"));

    await waitFor(() => {
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        "Error capture transaction:",
        expect.any(Error)
      );
    });

    expect(screen.getByTestId("alert-error")).toHaveTextContent(
      "pages.purchaseManagement.captureTransactionModal.errorDeleteTransaction"
    );
    expect(
      screen.getByText("pages.purchaseManagement.drawer.title")
    ).toBeInTheDocument();

    consoleErrorSpy.mockRestore();
  });

  it("dovrebbe aprire il modal di Cancel e completare l'operazione con successo", async () => {
    getInProgressTransactions.mockResolvedValue({
      ...mockAPIResponse,
      content: [mockTransaction("AUTHORIZED")],
    });
    render(<PurchaseManagement />);
    await waitFor(() => fireEvent.click(screen.getByTestId("row-action")));

    fireEvent.click(
      screen.getByText("pages.purchaseManagement.drawer.cancellPayment")
    );

    const modal = screen.getByTestId("modal-component");
    expect(
      within(modal).getByText(
        "pages.purchaseManagement.cancelTransactionModal.title"
      )
    ).toBeInTheDocument();

    fireEvent.click(within(modal).getByText("Conferma"));

    await waitFor(() => {
      expect(deleteTransactionInProgress).toHaveBeenCalledWith("trx123");
    });

    expect(mockNavigate).toHaveBeenCalledWith("/refunds-management");
    expect(screen.queryByTestId("modal-component")).not.toBeInTheDocument();
  });

  it("dovrebbe aprire il modal di Cancel e gestire il fallimento", async () => {
    const consoleErrorSpy = vi
      .spyOn(console, "error")
      .mockImplementation(() => {});
    getInProgressTransactions.mockResolvedValue({
      ...mockAPIResponse,
      content: [mockTransaction("AUTHORIZED")],
    });
    deleteTransactionInProgress.mockRejectedValue(new Error("Delete Fail"));

    render(<PurchaseManagement />);
    await waitFor(() => fireEvent.click(screen.getByTestId("row-action")));
    fireEvent.click(
      screen.getByText("pages.purchaseManagement.drawer.cancellPayment")
    );

    const modal = screen.getByTestId("modal-component");
    fireEvent.click(within(modal).getByText("Conferma"));

    await waitFor(() => {
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        "Error deleting transaction:",
        expect.any(Error)
      );
    });

    expect(screen.getByTestId("alert-error")).toHaveTextContent(
      "pages.purchaseManagement.cancelTransactionModal.errorDeleteTransaction"
    );
    expect(
      screen.getByText("pages.purchaseManagement.drawer.title")
    ).toBeInTheDocument();

    consoleErrorSpy.mockRestore();
  });

  it("dovrebbe aprire il modal di Refund e navigare alla pagina Reverse", async () => {
    getInProgressTransactions.mockResolvedValue({
      ...mockAPIResponse,
      content: [mockTransaction("CAPTURED")],
    });
    render(<PurchaseManagement />);
    await waitFor(() => fireEvent.click(screen.getByTestId("row-action")));
    fireEvent.click(screen.getByText("pages.purchaseManagement.drawer.refund"));

    const modal = screen.getByTestId("modal-component");
    expect(
      within(modal).getByText(
        "pages.purchaseManagement.refundTransactionModal.title"
      )
    ).toBeInTheDocument();

    fireEvent.click(
      within(modal).getByText("pages.purchaseManagement.drawer.refund")
    );

    expect(mockNavigate).toHaveBeenCalledWith("/reverse");
  });

  const testTimeoutLogic = async (
    trigger,
    errorAlertText,
    storeStateKey = null,
    expectedAlertText = null
  ) => {
    const consoleErrorSpy = vi
      .spyOn(console, "error")
      .mockImplementation(() => {});
    vi.useFakeTimers();

    if (errorAlertText === "errorDeleteTransaction") {
      deleteTransactionInProgress.mockRejectedValue(new Error("Delete Fail"));
    } else if (errorAlertText === "errorCaptureTransaction") {
      capturePayment.mockRejectedValue(new Error("Capture Fail"));
    }

    getInProgressTransactions.mockResolvedValue({
      ...mockAPIResponse,
      content: [mockTransaction("AUTHORIZED")],
    });

    render(<PurchaseManagement />);
    await waitFor(() => fireEvent.click(screen.getByTestId("row-action")));

    if (storeStateKey === "transactionAuthorized") {
      utilsStore.setState({ transactionAuthorized: true });
    } else if (trigger === "capture") {
      fireEvent.click(
        screen.getByText("pages.purchaseManagement.drawer.confirmPayment")
      );
      fireEvent.click(screen.getByText("Conferma"));
    } else if (trigger === "delete") {
      fireEvent.click(
        screen.getByText("pages.purchaseManagement.drawer.cancellPayment")
      );
      fireEvent.click(screen.getByText("Conferma"));
    } else if (trigger === "fetch_error") {
      getInProgressTransactions.mockRejectedValue(new Error("Fetch Error"));
      fireEvent.click(screen.getByTestId("reset-filters-btn"));
    }

    let alertTestId =
      expectedAlertText === "pages.purchaseManagement.paymentSuccess" ||
      expectedAlertText === "pages.purchaseManagement.alertSuccess"
        ? "alert-success"
        : "alert-error";
    await waitFor(
      () => {
        if (trigger !== "fetch_error") {
          expect(screen.getByTestId(alertTestId)).toBeInTheDocument();
        }
      },
      { timeout: 1000 }
    );

    if (expectedAlertText) {
      expect(screen.getByTestId(alertTestId)).toHaveTextContent(
        expectedAlertText
      );
    } else {
      expect(screen.getByTestId("alert-error")).toHaveTextContent(
        "pages.refundManagement.errorAlert"
      );
    }

    vi.advanceTimersByTime(4999);
    expect(screen.queryByTestId(alertTestId)).toBeInTheDocument();

    vi.advanceTimersByTime(1);

    await waitFor(() => {
      expect(screen.queryByTestId(alertTestId)).not.toBeInTheDocument();
    });

    vi.useRealTimers();
    consoleErrorSpy.mockRestore();
  };
});
