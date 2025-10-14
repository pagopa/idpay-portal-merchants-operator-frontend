import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { BrowserRouter } from "react-router-dom";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import TransactionsLayout from "./TransactionsLayout";

vi.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (key: string) => key, 
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

vi.mock("../DataTable/DataTable", () => ({
  default: ({
    rows,
    columns,
    onPaginationPageChange,
    onSortModelChange,
  }: any) => (
    <div data-testid="data-table">
      <button
        data-testid="sort-by-name"
        onClick={() => onSortModelChange([{ field: "additionalProperties", sort: "desc" }])}
      />
      <button
        data-testid="sort-by-date"
        onClick={() => onSortModelChange([{ field: "updateDate", sort: "asc" }])}
      />
      <button
        data-testid="paginate"
        onClick={() => onPaginationPageChange({ page: 1, pageSize: 10 })}
      />
      {rows.length > 0 && <div data-testid="data-row">{rows[0].id}</div>}
    </div>
  ),
}));

vi.mock("../FiltersForm/FiltersForm", () => ({
  default: ({ children, onFiltersApplied, onFiltersReset, formik }: any) => (
    <div data-testid="filters-form">
      {children}
      <button data-testid="apply-filters" onClick={() => onFiltersApplied(formik.values)}>
        Applica
      </button>
      <button data-testid="reset-filters" onClick={onFiltersReset}>
        Resetta
      </button>
    </div>
  ),
}));

vi.mock("../Alert/AlertComponent", () => ({
  default: ({ message }: { message: string }) => (
    <div data-testid="alert">{message}</div>
  ),
}));

// Mock del servizio API
const mockFetchTransactionsApi = vi.fn();

// Mock di jwt-decode e authStore
vi.mock("jwt-decode", () => ({
  jwtDecode: () => ({ point_of_sale_id: "pos-123" }),
}));
vi.mock("../../store/authStore", () => ({
  authStore: {
    getState: () => ({ token: "fake-jwt-token" }),
  },
}));

vi.mock("../../hooks/useAutoResetBanner", () => ({
    useAutoResetBanner: vi.fn(),
}));

// Dati di mock
const mockTransactions = [
  { id: "trx1", fiscalCode: "AAAAAA11B22C333D", status: "COMPLETED" },
  { id: "trx2", fiscalCode: "BBBBBB22C33D444E", status: "REJECTED" },
];

const mockApiResponse = {
  content: mockTransactions,
  pageNo: 0,
  pageSize: 10,
  totalElements: 2,
};

const mockColumns = [{ field: "id", headerName: "ID" }];

// Funzione helper per il rendering del componente
const renderComponent = (props = {}) => {
  const defaultProps = {
    title: "Test Title",
    subtitle: "Test Subtitle",
    tableTitle: "Test Table Title",
    fetchTransactionsApi: mockFetchTransactionsApi,
    columns: mockColumns,
    statusOptions: ["COMPLETED", "REJECTED"],
    alerts: [],
    alertMessages: { error: "Si è verificato un errore." },
    noDataMessage: "Nessun dato trovato.",
    onRowAction: vi.fn(),
    ...props,
  };
  const theme = createTheme();
  return render(
    <BrowserRouter>
      <ThemeProvider theme={theme}>
        <TransactionsLayout {...defaultProps} />
      </ThemeProvider>
    </BrowserRouter>
  );
};

// Suite di test
describe("TransactionsLayout", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockFetchTransactionsApi.mockResolvedValue(mockApiResponse);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("should show initial loading and then render the data table", async () => {
    renderComponent();
    expect(screen.getByTestId("loading")).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByTestId("data-table")).toBeInTheDocument();
    });

    expect(screen.queryByTestId("loading")).not.toBeInTheDocument();
    expect(screen.getByText("Test Title")).toBeInTheDocument();
    expect(mockFetchTransactionsApi).toHaveBeenCalledTimes(1);
  });

  it('should show "no data" message when API returns an empty array', async () => {
    mockFetchTransactionsApi.mockResolvedValue({
      ...mockApiResponse,
      content: [],
      totalElements: 0,
    });
    renderComponent();

    await waitFor(() => {
      expect(screen.getByText("Nessun dato trovato.")).toBeInTheDocument();
    });

    expect(screen.queryByTestId("data-table")).not.toBeInTheDocument();
  });

  it("should show an error alert when the API call fails", async () => {
    mockFetchTransactionsApi.mockRejectedValue(new Error("API Error"));
    renderComponent();

    await waitFor(() => {
      expect(screen.getByTestId("alert")).toBeInTheDocument();
    });

    expect(screen.getByText("Si è verificato un errore.")).toBeInTheDocument();
    expect(screen.queryByTestId("data-table")).not.toBeInTheDocument();
  });

  it("should call the fetch API with filter values when filters are applied", async () => {
    const user = userEvent.setup();
    renderComponent();
    await waitFor(() => expect(screen.queryByTestId("loading")).not.toBeInTheDocument());

    const fiscalCodeInput = screen.getByLabelText("commons.fiscalCodeFilterPlaceholer");
    await user.type(fiscalCodeInput, "TESTCF123");
    
    fireEvent.click(screen.getByTestId("apply-filters"));

    await waitFor(() => {
      expect(mockFetchTransactionsApi).toHaveBeenCalledTimes(2); // 1 initial, 1 after filter
    });

    expect(mockFetchTransactionsApi).toHaveBeenLastCalledWith(
      undefined,
      "pos-123",
      expect.objectContaining({ fiscalCode: "TESTCF123" })
    );
  });

  it("should reset the form and refetch data when reset is clicked", async () => {
    const user = userEvent.setup();
    renderComponent();
    await waitFor(() => expect(screen.queryByTestId("loading")).not.toBeInTheDocument());

    const fiscalCodeInput = screen.getByLabelText("commons.fiscalCodeFilterPlaceholer");
    await user.type(fiscalCodeInput, "TESTCF123");

    fireEvent.click(screen.getByTestId("reset-filters"));

    await waitFor(() => {
      expect(mockFetchTransactionsApi).toHaveBeenCalledTimes(2);
    });

    expect(mockFetchTransactionsApi).toHaveBeenLastCalledWith(
      undefined,
      "pos-123",
      expect.objectContaining({ fiscalCode: "" })
    );
    expect(fiscalCodeInput).toHaveValue("");
  });

  it('should handle special "additionalProperties" sorting correctly', async () => {
    renderComponent();
    await waitFor(() => expect(screen.queryByTestId("loading")).not.toBeInTheDocument());

    fireEvent.click(screen.getByTestId("sort-by-name"));

    await waitFor(() => {
      expect(mockFetchTransactionsApi).toHaveBeenCalledTimes(2);
    });
    
    expect(mockFetchTransactionsApi).toHaveBeenLastCalledWith(
      undefined,
      "pos-123",
      expect.objectContaining({ sort: "productName,desc" })
    );
  });

  it("should handle standard sorting correctly", async () => {
    renderComponent();
    await waitFor(() => expect(screen.queryByTestId("loading")).not.toBeInTheDocument());

    fireEvent.click(screen.getByTestId("sort-by-date"));

    await waitFor(() => {
      expect(mockFetchTransactionsApi).toHaveBeenCalledTimes(2);
    });

    expect(mockFetchTransactionsApi).toHaveBeenLastCalledWith(
      undefined,
      "pos-123",
      expect.objectContaining({ sort: "updateDate,asc" })
    );
  });

  it("should refetch data with new page number on pagination change", async () => {
    renderComponent();
    await waitFor(() => expect(screen.queryByTestId("loading")).not.toBeInTheDocument());
    
    fireEvent.click(screen.getByTestId("paginate"));

    await waitFor(() => {
        expect(mockFetchTransactionsApi).toHaveBeenCalledTimes(2);
    });

    expect(mockFetchTransactionsApi).toHaveBeenLastCalledWith(
        undefined,
        "pos-123",
        expect.objectContaining({ page: 1, size: 10 })
    );
  });

  it("should render the additional button and call its onClick handler", async () => {
    const mockOnClick = vi.fn();
    renderComponent({
        additionalButton: {
            label: "Azione Extra",
            icon: <span>+</span>,
            onClick: mockOnClick
        }
    });

    await waitFor(() => expect(screen.queryByTestId("loading")).not.toBeInTheDocument());
    
    const button = screen.getByRole('button', {name: /Azione Extra/i});
    expect(button).toBeInTheDocument();
    
    fireEvent.click(button);
    expect(mockOnClick).toHaveBeenCalledTimes(1);
  });

  it("should refetch data when triggerFetchTransactions becomes true", async () => {
    const { rerender } = renderComponent({ triggerFetchTransactions: false });
    await waitFor(() => expect(mockFetchTransactionsApi).toHaveBeenCalledTimes(1));

    rerender(
        <BrowserRouter>
            <ThemeProvider theme={createTheme()}>
                <TransactionsLayout 
                    title="Test"
                    subtitle="Test"
                    tableTitle="Test"
                    fetchTransactionsApi={mockFetchTransactionsApi}
                    columns={mockColumns}
                    statusOptions={[]}
                    alerts={[]}
                    alertMessages={{}}
                    noDataMessage=""
                    onRowAction={vi.fn()}
                    triggerFetchTransactions={true} 
                />
            </ThemeProvider>
        </BrowserRouter>
    );

    await waitFor(() => expect(mockFetchTransactionsApi).toHaveBeenCalledTimes(2));
  });
});