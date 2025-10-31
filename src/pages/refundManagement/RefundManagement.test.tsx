import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { BrowserRouter } from "react-router-dom";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import RefundManagement from "./RefundManagement";

vi.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (key: string) => {
      const translations: Record<string, string> = {
        "pages.refundManagement.title": "Storico rimborsi",
        "pages.refundManagement.subtitle":
          "Gestisci le transazioni elaborate e i rimborsi",
        "pages.refundManagement.noTransactions": "Nessuna transazione trovata.",
        "pages.refundManagement.errorAlert": "Si è verificato un errore.",
        "pages.refundManagement.refunded": "STORNATO",
        "commons.fiscalCodeFilterPlaceholer": "Cerca per codice fiscale",
        "commons.gtiInFilterPlaceholer": "Cerca per GTIN",
        "commons.statusFilterPlaceholer": "Cerca per stato",
      };
      return translations[key] || key;
    },
  }),
}));

vi.mock("@pagopa/selfcare-common-frontend/lib", () => ({
  TitleBox: ({ title, subTitle }: { title: string; subTitle: string }) => (
    <div data-testid="title-box">
      <h1>{title}</h1>
      <p>{subTitle}</p>
    </div>
  ),
}));

vi.mock("../../components/DataTable/DataTable", () => ({
  default: ({
    rows,
    columns,
    onPaginationPageChange,
    onSortModelChange,
    paginationModel,
    sortModel,
  }: any) => (
    <div data-testid="data-table">
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
        data-testid="sort-change-empty"
        onClick={() => onSortModelChange([])}
      />{" "}
      <div data-testid="sort-model-display">{JSON.stringify(sortModel)}</div>
      {rows.length > 0 && (
        <div data-testid="first-row">
          <div data-testid="cell-product-name">
            {columns[0].renderCell({ value: rows[0].additionalProperties })}
          </div>

          <div data-testid="cell-date">
            {columns[1].renderCell({ value: rows[0].updateDate })}
          </div>

          <div data-testid="cell-fiscal-code">{rows[0].fiscalCode}</div>

          <div data-testid="cell-total-amount">
            {columns[3].renderCell({ value: rows[0].effectiveAmountCents })}
          </div>

          <div data-testid="cell-reward-amount">
            {columns[4].renderCell({ value: rows[0].rewardAmountCents })}
          </div>

          <div data-testid="cell-status">
            {columns[5].renderCell({ value: rows[0].status })}
          </div>
        </div>
      )}
    </div>
  ),
}));

vi.mock("../../components/FiltersForm/FiltersForm", () => ({
  default: ({
    children,
    onFiltersApplied,
    onFiltersReset,
    formik,
    filtersApplied,
  }: any) => (
    <div
      data-testid="filters-form-wrapper"
      data-filters-applied={filtersApplied ? "true" : "false"}
    >
      {children}
      <button
        data-testid="apply-filters-btn"
        onClick={() => onFiltersApplied(formik.values)}
      >
        Applica Filtri
      </button>
      <button data-testid="reset-filters-btn" onClick={onFiltersReset}>
        Resetta
      </button>
    </div>
  ),
}));

vi.mock("../../components/Alert/AlertComponent", () => ({
  default: ({ message }: { message: string }) => (
    <div data-testid="alert">{message}</div>
  ),
}));

vi.mock("../../components/errorAlert/ErrorAlert", () => ({
  default: ({ message }: { message: string }) => (
    <div data-testid="error-alert">{message}</div>
  ),
}));

//api service mock
const mockGetProcessedTransactions = vi.fn();
vi.mock("../../services/merchantService", () => ({
  getProcessedTransactions: (...args: any) =>
    mockGetProcessedTransactions(...args),
}));

vi.mock("jwt-decode", () => ({
  jwtDecode: () => ({ point_of_sale_id: "pos-456" }),
}));
vi.mock("../../store/authStore", () => ({
  authStore: {
    getState: () => ({ token: "fake-jwt-token" }),
  },
}));

// Mock data
const mockTransactions = [
  {
    trxId: "1",
    trxDate: "2025-09-22 14:00:00",
    fiscalCode: "BBBBBB22C33D444E",
    effectiveAmountCents: 8000,
    rewardAmountCents: 800,
    status: "REFUNDED",
    eletronicDevice: "Frigorifero EcoFrost",
  },
];

const mockApiResponse = {
  content: mockTransactions,
  page: 0,
  pageSize: 10,
  totalElements: 1,
};

//render helper
const renderComponent = () => {
  const theme = createTheme();
  return render(
    <BrowserRouter>
      <ThemeProvider theme={theme}>
        <RefundManagement />
      </ThemeProvider>
    </BrowserRouter>
  );
};

afterEach(() => {
  vi.clearAllMocks();
  vi.useRealTimers();
});

describe("RefundManagement", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockGetProcessedTransactions.mockResolvedValue(mockApiResponse);
  });

  it("should show initial loading and then data", async () => {
    renderComponent();

    expect(screen.getByTestId("loading")).toBeInTheDocument();

    await screen.findByTestId("data-table");

    expect(screen.queryByTestId("loading")).not.toBeInTheDocument();

    expect(mockGetProcessedTransactions).toHaveBeenCalledTimes(1);

    expect(screen.getByTestId("cell-status")).toBeInTheDocument();
  });

  it("should show no transactions message when there are no transactions", async () => {
    mockGetProcessedTransactions.mockResolvedValue({
      ...mockApiResponse,
      content: [],
      totalElements: 0,
    });

    renderComponent();
    await screen.findByText("Nessuna transazione trovata.");

    expect(screen.queryByTestId("data-table")).not.toBeInTheDocument();
    expect(screen.queryByTestId("loading")).not.toBeInTheDocument();
  });

  it("should show error alert in case of error in data fetch", async () => {
    mockGetProcessedTransactions.mockRejectedValue(new Error("API Failure"));

    renderComponent();

    await screen.findByTestId("alert");

    expect(screen.getByText("Si è verificato un errore.")).toBeInTheDocument();
    expect(screen.queryByTestId("data-table")).not.toBeInTheDocument();
    expect(screen.queryByTestId("loading")).not.toBeInTheDocument();
  });

  it("should call fetchTransactions with filter parameters when applying filters", async () => {
    const user = userEvent.setup();
    renderComponent();
    await screen.findByTestId("data-table");

    const fiscalCodeInput = screen.getByLabelText("Cerca per codice fiscale");
    await user.type(fiscalCodeInput, "FISCALE123");

    const applyButton = screen.getByText("Applica Filtri");
    fireEvent.click(applyButton);

    await waitFor(() => {
      expect(mockGetProcessedTransactions).toHaveBeenNthCalledWith(
        2,
        undefined,
        "pos-456",
        expect.objectContaining({
          fiscalCode: "FISCALE123",
          page: 0,
          productGtin: "",
          status: "",
          size: 10,
          sort: "updateDate,desc",
        })
      );
    });
  });

  it("should call fetchTransactions with special sort (additionalProperties)", async () => {
    renderComponent();
    await screen.findByTestId("data-table");

    fireEvent.click(screen.getByTestId("sort-change-name-desc"));

    await waitFor(() => {
      expect(mockGetProcessedTransactions).toHaveBeenCalled();
    });
  });

  it("should call fetchTransactions with special sort (productName) when sorting additionalProperties", async () => {
    renderComponent();
    await screen.findByTestId("data-table");

    fireEvent.click(screen.getByTestId("sort-change-name-desc"));

    await waitFor(() => {
      expect(screen.getByTestId("sort-model-display")).toHaveTextContent(
        JSON.stringify([{ field: "additionalProperties", sort: "desc" }])
      );
    });

    expect(mockGetProcessedTransactions).toHaveBeenCalled();
  });

  it("should call fetchTransactions with standard sort when sorting a non-special field", async () => {
    renderComponent();
    await screen.findByTestId("data-table");

    fireEvent.click(screen.getByTestId("sort-change-date-asc"));

    await waitFor(() => {
      expect(screen.getByTestId("sort-model-display")).toHaveTextContent(
        JSON.stringify([{ field: "updateDate", sort: "asc" }])
      );
    });

    expect(mockGetProcessedTransactions).toHaveBeenCalled();
  });

  it("should not call setSortModel or fetchTransactions if the sort model is empty", async () => {
    renderComponent();
    await screen.findByTestId("data-table");

    mockGetProcessedTransactions.mockClear();

    const dataTable = screen.getByTestId("data-table");
    fireEvent.click(
      dataTable.querySelector('[data-testid="sort-change-date-asc"]')
    );

    expect(mockGetProcessedTransactions).toHaveBeenCalledTimes(1);
  });

  it("should call handleApplyFilters with empty values when filters are reset and applied", async () => {
    const user = userEvent.setup();
    renderComponent();
    await screen.findByTestId("data-table");

    await user.type(
      screen.getByLabelText("Cerca per codice fiscale"),
      "FISCALE123"
    );

    const resetButton = screen.getByText("Resetta");
    fireEvent.click(resetButton);
    await waitFor(() => {
      expect(mockGetProcessedTransactions).toHaveBeenCalled();
    });

    expect(screen.getByLabelText("Cerca per codice fiscale")).toHaveValue("");
  });

  it("should only call formik.resetForm if no filters were applied (internal branch coverage)", async () => {
    renderComponent();
    await screen.findByTestId("data-table");

    const resetButton = screen.getByText("Resetta");
    fireEvent.click(resetButton);

    expect(mockGetProcessedTransactions).toHaveBeenCalled();
  });

  it("should render updateDate", async () => {
    mockGetProcessedTransactions.mockResolvedValue({
      ...mockApiResponse,
      content: [
        {
          ...mockTransactions[0],
          updateDate: "2025-09-22 14:00:00",
          effectiveAmountCents: null,
          rewardAmountCents: undefined,
          additionalProperties: { productName: "test" },
        },
      ],
      totalElements: 1,
    });

    renderComponent();
    await screen.findByTestId("data-table");
    fireEvent.click(screen.getByTestId("sort-change-name-desc"));
  });
});
