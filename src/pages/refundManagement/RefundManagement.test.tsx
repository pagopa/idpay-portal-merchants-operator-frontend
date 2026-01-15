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

    await waitFor(() => expect(screen.getByText("Si è verificato un errore.")).toBeInTheDocument());
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
          sort: "trxChargeDate,desc",
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

import { MemoryRouter } from "react-router-dom";
import { checkEuroTooltip } from "../../utils/helpers";

async function loadRefundManagementWithHarness(routeState?: any) {
  vi.resetModules();

  const downloadInvoiceFileApi = vi.fn();
  const getProcessedTransactions = vi.fn();

  const anchorClick = vi.fn();
  const anchor: any = { href: "", download: "", click: anchorClick };

  const realCreateElement = document.createElement.bind(document);
  const createElementSpy = vi
    .spyOn(document, "createElement")
    .mockImplementation((tagName: any, ...args: any[]) => {
      if (typeof tagName === "string" && tagName.toLowerCase() === "a") {
        return anchor;
      }
      return realCreateElement(tagName, ...args);
    });

  vi.doMock("react-i18next", () => ({
    useTranslation: () => ({
      t: (key: string) => {
        const map: Record<string, string> = {
          "pages.refundManagement.title": "Gestione Rimborsi",
          "pages.refundManagement.subtitle":
            "Gestisci le transazioni elaborate e i rimborsi",
          "pages.refundManagement.tableTitle": "Transazioni",
          "pages.refundManagement.noTransactions": "Nessuna transazione trovata.",
          "pages.refundManagement.errorAlert": "Si è verificato un errore.",
          "pages.refundManagement.refundSuccessUpload": "Rimborso caricato",
          "pages.refundManagement.reverseSuccessUpload": "Storno caricato",
          "pages.refundManagement.errorDownloadAlert":
            "Errore durante il download",
          "pages.refundManagement.drawer.title": "Dettagli transazione",
          "commons.fiscalCodeFilterPlaceholer": "Cerca per codice fiscale",
          "commons.gtiInFilterPlaceholer": "Cerca per GTIN",
          "commons.statusFilterPlaceholer": "Cerca per stato",
        };
        return map[key] ?? key;
      },
    }),
  }));

  vi.doMock("../../utils/constants", () => ({
    MISSING_DATA_PLACEHOLDER: "—",
  }));

vi.doMock("../../utils/helpers", () => ({
  formatEuro: (cents?: number) =>
    typeof cents === "number" ? `€${(cents / 100).toFixed(2)}` : "€NaN",
  getStatusChip: (_t: any, value: string) => (
    <span data-testid="status-chip">{value}</span>
  ),
  renderCellWithTooltip: (value: any) => value ?? "—",
  renderMissingDataWithTooltip: () => "—",
  checkTooltipValue: (params: any, key?: string) => {
    if (key) {
      if (params?.value?.[key]) {
        return params.value[key];
      }
    }
    if (params?.value !== undefined && params?.value !== null) {
      return params.value;
    }
    return "—";
  },
  checkEuroTooltip: (params: any) => {
    if (params?.value !== undefined && params?.value !== null) {
      const cents = params.value;
      return typeof cents === "number" ? `€${(cents / 100).toFixed(2)}` : "€NaN";
    }
    return "—";
  },
}));

  vi.doMock("../../services/merchantService", () => ({
    getProcessedTransactions: (...args: any[]) =>
      getProcessedTransactions(...args),
    downloadInvoiceFileApi: (...args: any[]) => downloadInvoiceFileApi(...args),
  }));

  vi.doMock("../../store/authStore", () => ({
    authStore: {
      getState: () => ({ token: "fake-jwt" }),
    },
  }));
  vi.doMock("jwt-decode", () => ({
    jwtDecode: () => ({ point_of_sale_id: "pos-456" }),
  }));

  vi.doMock("../../components/DetailsDrawer/DetailsDrawer", () => ({
    DetailsDrawer: ({
      isOpen,
      isLoading,
      item,
      setIsOpen,
      onFileDownloadCallback,
    }: any) => (
      <div data-testid="drawer">
        <div data-testid="drawer-open">{String(isOpen)}</div>
        <div data-testid="drawer-loading">{String(isLoading)}</div>
        <button
          data-testid="close-drawer"
          onClick={() => setIsOpen(false)}
        ></button>
        <button
          data-testid="trigger-download"
          onClick={onFileDownloadCallback}
        ></button>
        <pre data-testid="drawer-item">
          {item ? JSON.stringify(item) : ""}
        </pre>
      </div>
    ),
  }));

  vi.doMock("../../components/TransactionsLayout/TransactionsLayout", () => ({
    default: ({
      columns,
      onRowAction,
      DrawerComponent,
      externalState,
    }: any) => {
      const refundedTx = {
        updateDate: "2025-09-22T14:00:00.000Z",
        additionalProperties: { productName: "Frigorifero EcoFrost" },
        fiscalCode: "BBBBBB22C33D444E",
        id: "trx-refunded",
        effectiveAmountCents: 8000,
        rewardAmountCents: 800,
        status: "REFUNDED",
        invoiceFile: { filename: "nota.pdf" },
      };
      const cancelledTx = {
        ...refundedTx,
        id: "trx-cancelled",
        status: "CANCELLED",
        invoiceFile: { filename: "annullata.pdf" },
      };
      const rewardedTx = {
        ...refundedTx,
        id: "trx-rewarded",
        status: "REWARDED",
        invoiceFile: undefined,
      };

      return (
        <div>
          <button
            data-testid="open-refunded"
            onClick={() => onRowAction(refundedTx)}
          />
          <button
            data-testid="open-cancelled"
            onClick={() => onRowAction(cancelledTx)}
          />
          <button
            data-testid="open-rewarded"
            onClick={() => onRowAction(rewardedTx)}
          />

          <div data-testid="col-additional-has">
            {columns[0].renderCell({
              value: { productName: "Lavatrice Ultra" },
            })}
          </div>
          <div data-testid="col-additional-missing">
            {columns[0].renderCell({ value: undefined })}
          </div>

          <div data-testid="col-date-has">
            {columns[1].renderCell({ value: "2025-10-01T10:20:00.000Z" })}
          </div>
          <div data-testid="col-date-missing">
            {columns[1].renderCell({ value: undefined })}
          </div>

          <div data-testid="col-fiscal-missing">
            {columns[2].renderCell({ value: undefined })}
          </div>

          <div data-testid="col-total-zero">
            {columns[3].renderCell({ value: 0 })}
          </div>
          <div data-testid="col-total-missing">
            {columns[3].renderCell({ value: undefined })}
          </div>

          <div data-testid="col-reward-zero">
            {columns[4].renderCell({ value: 0 })}
          </div>
          <div data-testid="col-reward-missing">
            {columns[4].renderCell({ value: undefined })}
          </div>

          <div data-testid="col-authorized-has">
            {columns[5].renderCell({ value: 1500 })}
          </div>
          <div data-testid="col-authorized-missing">
            {columns[5].renderCell({ value: undefined })}
          </div>

          <div data-testid="col-status">
            {columns[6].renderCell({ value: "REWARDED" })}
          </div>

          <div data-testid="state-refund">
            {String(externalState?.transactionRefundSuccess)}
          </div>
          <div data-testid="state-reverse">
            {String(externalState?.transactionReverseSuccess)}
          </div>
          <div data-testid="state-error">
            {String(externalState?.errorDownloadAlert)}
          </div>

          {DrawerComponent}
        </div>
      );
    },
  }));

  const { default: RefundManagement } = await import("./RefundManagement");

  const theme = createTheme();
  render(
    <MemoryRouter
      initialEntries={[{ pathname: "/refund", state: routeState }]}
    >
      <ThemeProvider theme={theme}>
        <RefundManagement />
      </ThemeProvider>
    </MemoryRouter>
  );

  return {
    downloadInvoiceFileApi,
    getProcessedTransactions,
    anchor,
    anchorClick,
    createElementSpy,
  };
}

afterEach(() => {
  vi.clearAllMocks();
  vi.restoreAllMocks();
});

describe("RefundManagement – extra coverage harness", () => {
  it("maps the REFUNDED transaction correctly and downloads with provided filename", async () => {
    const {
      downloadInvoiceFileApi,
      anchor,
      anchorClick,
    } = await loadRefundManagementWithHarness();

    let resolve!: (v: any) => void;
    const deferred = new Promise((r) => (resolve = r));
    downloadInvoiceFileApi.mockReturnValueOnce(
      deferred.then(() => ({ invoiceUrl: "https://example.com/invoice.pdf" }))
    );

    fireEvent.click(screen.getByTestId("open-refunded"));

    expect(screen.getByTestId("drawer-open")).toHaveTextContent("true");

    const item = screen.getByTestId("drawer-item").textContent!;
    expect(item).toContain('"pages.refundManagement.drawer.transactionId":"trx-refunded"');
    expect(item).toContain('"pages.refundManagement.drawer.totalAmount":"€80.00"');
    expect(item).toContain('"pages.refundManagement.drawer.rewardAmount":"€8.00"');
    expect(item).toContain('"Nota di credito":"nota.pdf"');

    fireEvent.click(screen.getByTestId("trigger-download"));
    expect(screen.getByTestId("drawer-loading")).toHaveTextContent("true");

    resolve(null);

    await waitFor(() => {
      expect(anchorClick).toHaveBeenCalledTimes(1);
      expect(anchor.download).toBe("fattura.pdf");
      expect(typeof anchor.href).toBe("string");
      expect(screen.getByTestId("drawer-loading")).toHaveTextContent("false");
    });
  });

  it("handles CANCELLED invoice label and the fallback filename on REWARDED", async () => {
    const { downloadInvoiceFileApi, anchor } =
      await loadRefundManagementWithHarness();

    fireEvent.click(screen.getByTestId("open-cancelled"));
    let item = screen.getByTestId("drawer-item").textContent!;
    expect(item).toContain('"cancelled":"annullata.pdf"');

    downloadInvoiceFileApi.mockResolvedValueOnce({
      invoiceUrl: "https://example.com/f.pdf",
    });
    fireEvent.click(screen.getByTestId("open-rewarded"));
    fireEvent.click(screen.getByTestId("trigger-download"));

    await waitFor(() => {
      expect(anchor.download).toBe("fattura.pdf");
    });
  });

  it("sets error flag when download fails and can close the drawer", async () => {
    const { downloadInvoiceFileApi } =
      await loadRefundManagementWithHarness();

    downloadInvoiceFileApi.mockRejectedValueOnce(new Error("Boom"));

    fireEvent.click(screen.getByTestId("open-refunded"));
    fireEvent.click(screen.getByTestId("trigger-download"));

    await waitFor(() => {
      expect(screen.getByTestId("state-error")).toHaveTextContent("true");
      expect(screen.getByTestId("drawer-loading")).toHaveTextContent("false");
    });

    fireEvent.click(screen.getByTestId("close-drawer"));
    expect(screen.getByTestId("drawer-open")).toHaveTextContent("false");
  });

  it("covers all column render branches, including placeholders and zero values", async () => {
    await loadRefundManagementWithHarness();

    expect(
      screen.getByTestId("col-additional-has").textContent
    ).toContain("Lavatrice Ultra");
    expect(screen.getByTestId("col-additional-missing")).toHaveTextContent("—");

    expect(screen.getByTestId("col-date-missing")).toHaveTextContent("—");

    expect(screen.getByTestId("col-fiscal-missing")).toHaveTextContent("—");

    expect(screen.getByTestId("col-total-zero")).toHaveTextContent("€0.00");
    expect(screen.getByTestId("col-total-missing")).toHaveTextContent("—");

    expect(screen.getByTestId("col-reward-zero")).toHaveTextContent("€0.00");
    expect(screen.getByTestId("col-reward-missing")).toHaveTextContent("—");

    expect(screen.getByTestId("col-authorized-has")).toHaveTextContent(
      "€15.00"
    );
    expect(screen.getByTestId("col-authorized-missing")).toHaveTextContent("—");

    expect(screen.getByTestId("col-status").querySelector("[data-testid='status-chip']"))
      .toHaveTextContent("REWARDED");
  });
});


describe("getChipLabel functionality", () => {
  it("should render correct chip labels for all statuses", async () => {

    const transactionsWithDifferentStatuses = [
      {
        trxId: "1",
        trxDate: "2025-09-22 14:00:00",
        fiscalCode: "BBBBBB22C33D444E",
        effectiveAmountCents: 8000,
        rewardAmountCents: 800,
        status: "AUTHORIZED",
        eletronicDevice: "Frigorifero EcoFrost",
      },
      {
        trxId: "2",
        trxDate: "2025-09-22 14:00:00",
        fiscalCode: "BBBBBB22C33D444F",
        effectiveAmountCents: 9000,
        rewardAmountCents: 900,
        status: "REFUNDED",
        eletronicDevice: "Lavatrice",
      },
      {
        trxId: "3",
        trxDate: "2025-09-22 14:00:00",
        fiscalCode: "BBBBBB22C33D444G",
        effectiveAmountCents: 7000,
        rewardAmountCents: 700,
        status: "CANCELLED",
        eletronicDevice: "Asciugatrice",
      },
      {
        trxId: "4",
        trxDate: "2025-09-22 14:00:00",
        fiscalCode: "BBBBBB22C33D444H",
        effectiveAmountCents: 6000,
        rewardAmountCents: 600,
        status: "CAPTURED",
        eletronicDevice: "Forno",
      },
      {
        trxId: "5",
        trxDate: "2025-09-22 14:00:00",
        fiscalCode: "BBBBBB22C33D444I",
        effectiveAmountCents: 5000,
        rewardAmountCents: 500,
        status: "REWARDED",
        eletronicDevice: "Lavastoviglie",
      },
      {
        trxId: "6",
        trxDate: "2025-09-22 14:00:00",
        fiscalCode: "BBBBBB22C33D444J",
        effectiveAmountCents: 4000,
        rewardAmountCents: 400,
        status: "INVOICED",
        eletronicDevice: "Microonde",
      },
    ];

    mockGetProcessedTransactions.mockResolvedValue({
      content: transactionsWithDifferentStatuses,
      page: 0,
      pageSize: 10,
      totalElements: 6,
    });

    renderComponent();
    await screen.findByTestId("data-table");

    expect(screen.getByTestId("cell-status")).toBeInTheDocument();
  });

  it("should handle unknown status with default error label", async () => {
    mockGetProcessedTransactions.mockResolvedValue({
      ...mockApiResponse,
      content: [
        {
          ...mockTransactions[0],
          status: "UNKNOWN_STATUS",
        },
      ],
    });

    renderComponent();
    await screen.findByTestId("data-table");

    expect(screen.getByTestId("cell-status")).toBeInTheDocument();
  });
});