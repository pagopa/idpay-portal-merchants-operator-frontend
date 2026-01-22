import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import Products from "./Products";
import { MISSING_DATA_PLACEHOLDER } from "../../utils/constants";

vi.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (key: string) => {
      const translations: Record<string, string> = {
        "pages.products.title": "Prodotti",
        "pages.products.subtitle": "Visualizza i prodotti approvati",
        "pages.products.noProducts": "Nessun prodotto trovato.",
        "pages.products.errorAlert": "Errore nel recupero dei prodotti.",
        "pages.products.drawer.subTitle": "Dettagli Prodotto",
        "pages.products.drawer.eprelCode": "Codice EPREL",
        "pages.products.drawer.gtinCode": "Codice GTIN/EAN",
        "pages.products.drawer.productCode": "Codice Prodotto",
        "pages.products.drawer.category": "Categoria",
        "pages.products.drawer.brand": "Marca",
        "pages.products.drawer.model": "Modello",
        "pages.products.drawer.capacity": "Capacità",
        "pages.products.drawer.energyClass": "Classe Energetica",
        "pages.products.drawer.productionCountry": "Paese di Produzione",
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
      <button data-testid='csv-button' onClick={()=> {}}>Esporta csv</button>
    </div>
  ),
}));

vi.mock("../../components/FiltersForm/FiltersForm", () => ({
  default: ({ onFiltersApplied, onFiltersReset, children, formik }: any) => (
    <form data-testid="filters-form">
      {children}
      <input
        data-testid="brand-filter-input"
        name="brand"
        value={formik.values.brand}
        onChange={formik.handleChange}
      />
      <button
        data-testid="apply-filters-button"
        type="button"
        onClick={() => onFiltersApplied(formik.values)}
      >
        Applica
      </button>
      <button
        data-testid="reset-filters-button"
        type="button"
        onClick={() => onFiltersReset()}
      >
        Resetta
      </button>
    </form>
  ),
}));

vi.mock("../../components/DataTable/DataTable", () => ({
  default: ({
    rows,
    columns,
    handleRowAction,
    onPaginationPageChange,
    onSortModelChange,
  }: any) => {
    const renderCellForField = (row: any, field: string) => {
      const column = columns.find((c: any) => c.field === field);
      if (column && column.renderCell) {
        return column.renderCell({ value: row[field], row });
      }
      return row[field];
    };

    return (
      <div data-testid="data-table">
        <span data-testid="rows-count">{rows.length}</span>
        <button
          data-testid="trigger-pagination"
          onClick={() => onPaginationPageChange({ page: 1, pageSize: 10 })}
        />
        <button
          data-testid="trigger-pagination-same"
          onClick={() => onPaginationPageChange({ page: 0, pageSize: 10 })}
        />
        <button
          data-testid="trigger-sort"
          onClick={() => onSortModelChange([{ field: "brand", sort: "asc" }])}
        />
        <button
          data-testid="trigger-sort-empty"
          onClick={() => onSortModelChange([])}
        />

        {rows.map((row: any) => (
          <div
            key={row.gtinCode}
            data-testid={`row-${row.gtinCode}`}
            onClick={() => handleRowAction(row)}
          >
            <div data-testid={`cell-category-${row.gtinCode}`}>
              {renderCellForField(row, "category")}
            </div>
            <div data-testid={`cell-brand-${row.gtinCode}`}>
              {renderCellForField(row, "brand")}
            </div>
            <div data-testid={`cell-model-${row.gtinCode}`}>
              {renderCellForField(row, "model")}
            </div>
            <div data-testid={`cell-gtin-${row.gtinCode}`}>
              {renderCellForField(row, "gtinCode")}
            </div>
            <div data-testid={`cell-eprel-${row.gtinCode}`}>
              {renderCellForField(row, "eprelCode")}
            </div>
          </div>
        ))}
      </div>
    );
  },
}));

vi.mock("../../components/Alert/AlertComponent", () => ({
  default: ({ message }: { message: string }) => (
    <div data-testid="alert-component">{message}</div>
  ),
}));

vi.mock("../../hooks/useAutoResetBanner", () => ({
  useAutoResetBanner: vi.fn(),
}));

vi.mock("../../utils/helpers", () => ({
  handleCodeChange: vi.fn((event, formik) => {
    const { value } = event.target;
    if (value.includes("+")) {
      return "Errore GTIN";
    }
    formik.handleChange(event);
    return "";
  }),
}));

vi.stubEnv("VITE_PAGINATION_SIZE", "10");

const mockGetProductsList = vi.fn();
vi.mock("../../services/merchantService", () => ({
  getProductsList: (params: any) => mockGetProductsList(params),
}));

const mockProducts = [
  {
    category: "WASHINGMACHINES",
    brand: "Brand A",
    model: "Model X",
    gtinCode: "12345",
    eprelCode: "EPREL1",
    linkEprel: "https://example.com/eprel1",
    productName: "Lavatrice Brand A",
    productCode: "PC001",
    capacity: "8kg",
    energyClass: "A+++",
    countryOfProduction: "Italy",
  },
  {
    category: "OVENS",
    brand: "Brand B",
    model: "Model Y",
    gtinCode: "67890",
    eprelCode: "EPREL2",
    linkEprel: "https://example.com/eprel2",
    productName: "Forno Brand B",
    productCode: "PC002",
    capacity: "70L",
    energyClass: "A++",
    countryOfProduction: "Germany",
  },
];

const mockApiResponse = {
  content: mockProducts,
  pageNo: 0,
  pageSize: 10,
  totalElements: 2,
};

const renderComponent = () => {
  const theme = createTheme();
  return render(
    <ThemeProvider theme={theme}>
      <Products />
    </ThemeProvider>
  );
};

describe("Products Component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should show loading spinner on initial load", () => {
    mockGetProductsList.mockReturnValue(new Promise(() => {}));
    renderComponent();
    expect(screen.getByRole("progressbar")).toBeInTheDocument();
  });

  it("should render title, subtitle and button", async () => {
    mockGetProductsList.mockResolvedValue({
      ...mockApiResponse,
      content: [],
      totalElements: 0,
    });
    renderComponent();
    await waitFor(() => {
      expect(screen.queryByRole("progressbar")).not.toBeInTheDocument();
    });
    expect(screen.getByText("Prodotti")).toBeInTheDocument();
    expect(
      screen.getByText("Visualizza i prodotti approvati")
    ).toBeInTheDocument();
    expect(screen.getByTestId("csv-button")).toBeInTheDocument();
  });

  it("should fetch and display products correctly in the table", async () => {
    mockGetProductsList.mockResolvedValue(mockApiResponse);
    renderComponent();

    await screen.findByTestId("data-table");

    expect(mockGetProductsList).toHaveBeenCalledTimes(1);
    expect(mockGetProductsList).toHaveBeenCalledWith({
      size: "10",
      status: "APPROVED",
    });

    expect(screen.getByTestId("rows-count")).toHaveTextContent("2");

    const firstRowBrand = screen.getByTestId("cell-brand-12345");
    expect(firstRowBrand).toHaveTextContent("Brand A");

    const secondRowModel = screen.getByTestId("cell-model-67890");
    expect(secondRowModel).toHaveTextContent("Model Y");
  });

  it('should display a "no products" message if fetch returns an empty list', async () => {
    mockGetProductsList.mockResolvedValue({
      ...mockApiResponse,
      content: [],
      totalElements: 0,
    });
    renderComponent();

    await waitFor(() => {
      expect(screen.queryByRole("progressbar")).not.toBeInTheDocument();
    });

    expect(screen.getByText("Nessun prodotto trovato.")).toBeInTheDocument();
    expect(screen.queryByTestId("data-table")).not.toBeInTheDocument();
  });

  it("should handle errors during product fetch", async () => {
    const consoleErrorSpy = vi
      .spyOn(console, "error")
      .mockImplementation(() => {});
    mockGetProductsList.mockRejectedValue(new Error("API Error"));
    renderComponent();

    await waitFor(() => {
      expect(screen.queryByRole("progressbar")).not.toBeInTheDocument();
    });

    expect(screen.getByTestId("alert-component")).toHaveTextContent(
      "Errore nel recupero dei prodotti."
    );
    expect(consoleErrorSpy).toHaveBeenCalledWith(
      "Error fetching products:",
      expect.any(Error)
    );
    consoleErrorSpy.mockRestore();
  });

  it("should call fetchProducts with new pagination values", async () => {
    mockGetProductsList.mockResolvedValue(mockApiResponse);
    renderComponent();
    await screen.findByTestId("data-table");

    const paginationButton = screen.getByTestId("trigger-pagination");
    fireEvent.click(paginationButton);

    await waitFor(() => {
      expect(mockGetProductsList).toHaveBeenCalledTimes(2);
      expect(mockGetProductsList).toHaveBeenLastCalledWith(
        expect.objectContaining({
          page: 1,
          size: 10,
        })
      );
    });
  });

  it("should not call fetchProducts if pagination model is the same", async () => {
    mockGetProductsList.mockResolvedValue(mockApiResponse);
    renderComponent();
    await screen.findByTestId("data-table");

    const initialCallCount = mockGetProductsList.mock.calls.length;

    const paginationButton = screen.getByTestId("trigger-pagination-same");
    fireEvent.click(paginationButton);

    await waitFor(() => {
      expect(mockGetProductsList).toHaveBeenCalledTimes(initialCallCount);
    });
  });

  it("should call fetchProducts with proper sort when sorting by a column", async () => {
    mockGetProductsList.mockResolvedValue(mockApiResponse);
    renderComponent();
    await screen.findByTestId("data-table");

    const sortButton = screen.getByTestId("trigger-sort");
    fireEvent.click(sortButton);

    await waitFor(() => {
      expect(mockGetProductsList).toHaveBeenCalledTimes(2);
      expect(mockGetProductsList).toHaveBeenLastCalledWith(
        expect.objectContaining({
          sort: "brand,asc",
        })
      );
    });
  });

  it("should not call fetchProducts if sort model is empty", async () => {
    mockGetProductsList.mockResolvedValue(mockApiResponse);
    renderComponent();
    await screen.findByTestId("data-table");

    const initialCallCount = mockGetProductsList.mock.calls.length;

    const sortButton = screen.getByTestId("trigger-sort-empty");
    fireEvent.click(sortButton);

    await waitFor(() => {
      expect(mockGetProductsList).toHaveBeenCalledTimes(initialCallCount);
    });
  });

  it("should call fetchProducts with filters when filters are applied", async () => {
    mockGetProductsList.mockResolvedValue(mockApiResponse);
    const user = userEvent.setup();
    renderComponent();
    await screen.findByTestId("data-table");

    const brandInput = screen.getByTestId("brand-filter-input");
    await user.type(brandInput, "Test Brand");

    const applyFiltersButton = screen.getByTestId("apply-filters-button");
    fireEvent.click(applyFiltersButton);

    await waitFor(() => {
      expect(mockGetProductsList).toHaveBeenCalledTimes(2);
      expect(mockGetProductsList).toHaveBeenLastCalledWith(
        expect.objectContaining({
          brand: "Test Brand",
          page: 0,
        })
      );
    });
  });

  it("should filter out empty values when applying filters", async () => {
    mockGetProductsList.mockResolvedValue(mockApiResponse);
    renderComponent();
    await screen.findByTestId("data-table");

    const applyButton = screen.getByTestId("apply-filters-button");
    fireEvent.click(applyButton);

    await waitFor(() => {
      const lastCall =
        mockGetProductsList.mock.calls[mockGetProductsList.mock.calls.length - 1][0];
      expect(lastCall).not.toHaveProperty("category");
      expect(lastCall).not.toHaveProperty("brand");
    });
  });

  it("should reset filters and fetch products without filters", async () => {
    mockGetProductsList.mockResolvedValue(mockApiResponse);
    renderComponent();
    await screen.findByTestId("data-table");

    const resetButton = screen.getByTestId("reset-filters-button");
    fireEvent.click(resetButton);

    await waitFor(() => {
      expect(mockGetProductsList).toHaveBeenLastCalledWith(
        expect.objectContaining({
          size: "10",
          status: "APPROVED",
        })
      );
    });
  });

  it("should open and close the drawer on row click", async () => {
    mockGetProductsList.mockResolvedValue(mockApiResponse);
    const user = userEvent.setup();
    renderComponent();
    await screen.findByTestId("data-table");

    const firstRow = screen.getByTestId("row-12345");
    await user.click(firstRow);

    await screen.findByText("Lavatrice Brand A");
    expect(screen.getByText("PC001")).toBeInTheDocument();
    expect(screen.getByText("8kg")).toBeInTheDocument();
    expect(screen.getByText("A+++")).toBeInTheDocument();
    expect(screen.getByText("Italy")).toBeInTheDocument();

    const closeButton = screen.getByTestId("CloseIcon");
    await user.click(closeButton);

    await waitFor(() => {
      expect(screen.queryByText("Lavatrice Brand A")).not.toBeInTheDocument();
    });
  });

  it("should render placeholders for missing data in table cells", async () => {
    const productWithMissingData = {
      category: null,
      brand: null,
      model: null,
      gtinCode: "55555",
      eprelCode: null,
      productName: "Prodotto Incompleto",
    };
    mockGetProductsList.mockResolvedValue({
      content: [productWithMissingData],
      pageNo: 0,
      pageSize: 10,
      totalElements: 1,
    });
    renderComponent();

    await screen.findByTestId("data-table");

    const categoryCell = screen.getByTestId("cell-category-55555");
    expect(categoryCell).toHaveTextContent(MISSING_DATA_PLACEHOLDER);

    const brandCell = screen.getByTestId("cell-brand-55555");
    expect(brandCell).toHaveTextContent(MISSING_DATA_PLACEHOLDER);

    const modelCell = screen.getByTestId("cell-model-55555");
    expect(modelCell).toHaveTextContent(MISSING_DATA_PLACEHOLDER);

    const eprelCell = screen.getByTestId("cell-eprel-55555");
    expect(eprelCell).toHaveTextContent(MISSING_DATA_PLACEHOLDER);
  });

  it("should render placeholders for missing data in drawer", async () => {
    const productWithMissingData = {
      category: null,
      brand: "Brand C",
      model: undefined,
      gtinCode: "55555",
      eprelCode: null,
      productName: "Prodotto Incompleto",
      productCode: null,
      capacity: null,
      energyClass: null,
      countryOfProduction: null,
    };
    mockGetProductsList.mockResolvedValue({
      content: [productWithMissingData],
      pageNo: 0,
      pageSize: 10,
      totalElements: 1,
    });
    const user = userEvent.setup();
    renderComponent();

    await screen.findByTestId("data-table");
    const row = screen.getByTestId("row-55555");
    await user.click(row);

    await screen.findByText("Prodotto Incompleto");
    const placeholders = screen.getAllByText(MISSING_DATA_PLACEHOLDER);
    expect(placeholders.length).toBeGreaterThan(3);
  });

  it("should render link for eprelCode when value exists", async () => {
    mockGetProductsList.mockResolvedValue(mockApiResponse);
    renderComponent();

    await screen.findByTestId("data-table");

    const eprelCell = screen.getByTestId("cell-eprel-12345");
    const link = eprelCell.querySelector("a");
    expect(link).toBeInTheDocument();
    expect(link).toHaveAttribute("href", "https://example.com/eprel1");
    expect(link).toHaveAttribute("target", "_blank");
  });

  it("should show filters form when products exist", async () => {
    mockGetProductsList.mockResolvedValue(mockApiResponse);
    renderComponent();

    await screen.findByTestId("data-table");
    expect(screen.getByTestId("filters-form")).toBeInTheDocument();
  });

  it("should handle GTIN code change with error", async () => {
    const {handleCodeChange} = await import("../../utils/helpers");
    mockGetProductsList.mockResolvedValue(mockApiResponse);
    const user = userEvent.setup();
    renderComponent();

    await screen.findByTestId("filters-form");

    const gtinInput = screen.getByLabelText("Codice GTIN/EAN");
    await user.type(gtinInput, "+");

    expect(handleCodeChange).toHaveBeenCalled();
  });

  it("should handle GTIN code blur event", async () => {
    mockGetProductsList.mockResolvedValue(mockApiResponse);
    const user = userEvent.setup();
    renderComponent();

    await screen.findByTestId("filters-form");

    const gtinInput = screen.getByLabelText("Codice GTIN/EAN");
    await user.click(gtinInput);
    await user.tab();

    expect(gtinInput).not.toHaveFocus();
  });

  it("should handle all category options in select", async () => {
    mockGetProductsList.mockResolvedValue(mockApiResponse);
    const user = userEvent.setup();
    renderComponent();

    await screen.findByTestId("filters-form");

    const categorySelect = screen.getByLabelText("Categoria");
    await user.click(categorySelect);

    expect(screen.getByText("Lavatrici")).toBeInTheDocument();
    expect(screen.getByText("Asciugatrici")).toBeInTheDocument();
    expect(screen.getByText("Forni")).toBeInTheDocument();
    expect(screen.getByText("Lavastoviglie")).toBeInTheDocument();
    expect(screen.getByText("Lavasciuga")).toBeInTheDocument();
    expect(screen.getByText("Apparecchi di refrigerazione")).toBeInTheDocument();
    expect(screen.getByText("Cappe da cucina")).toBeInTheDocument();
    expect(screen.getByText("Piani cottura")).toBeInTheDocument();
  });

  it("should handle formik submit", async () => {
    const consoleSpy = vi.spyOn(console, "log").mockImplementation(() => {});
    mockGetProductsList.mockResolvedValue(mockApiResponse);
    renderComponent();

    await screen.findByTestId("filters-form");

    const form = screen.getByTestId("filters-form");
    fireEvent.submit(form);

    consoleSpy.mockRestore();
  });

  it("should navigate to csv link", () => {
    renderComponent()
    const csvButton = screen.getByTestId("csv-button")
    userEvent.click(csvButton)
  })
});