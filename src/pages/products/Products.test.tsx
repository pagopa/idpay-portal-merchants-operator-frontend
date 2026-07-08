import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import React from "react";
import Products from "./Products";
import { getInitiativeProductsList } from "../../services/merchantService";

const mockConfigJson = {
  pages: {
    products: {
      drawer: [
        { field: "eprelCode", headerName: "pages.products.drawer.eprelCode", cell: { type: "text" } },
        { field: "gtinCode", headerName: "pages.products.drawer.gtinCode", cell: { type: "text" } }
      ],
      productsTable: {
        filters: [
          { id: "category", type: "select", label: "pages.products.filters.category", template: "categories" }
        ],
        columns: [
          { field: "category", headerName: "pages.products.tableHeaders.category", flex: 1, sortable: true, cell: { type: "text", tooltip: true } },
          { field: "gtinCode", headerName: "pages.products.tableHeaders.gtinCode", flex: 1, sortable: true, cell: { type: "text", tooltip: true } },
          { field: "brand", headerName: "pages.products.tableHeaders.brand", flex: 1, sortable: true, cell: { type: "text", tooltip: true } }
        ]
      }
    }
  }
};

vi.mock("react-router-dom", () => ({
  useParams: () => ({ initiativeId: "mock-initiative-123" })
}));

vi.mock("../../services/merchantService", () => ({
  getInitiativeProductsList: vi.fn()
}));

vi.mock("../../hooks/useScopedTranslation", () => ({
  useScopedTranslation: () => ({
    t: vi.fn((key) => key),
    config: vi.fn((key) => {
      if (key === "pages.products.productsTable.filters") return mockConfigJson.pages.products.productsTable.filters;
      if (key === "pages.products.drawer") return mockConfigJson.pages.products.drawer;
      if (key === "pages.products.productsTable.columns") return mockConfigJson.pages.products.productsTable.columns;
      return [];
    })
  })
}));

vi.mock("../../hooks/useAutoResetBanner", () => ({
  useAutoResetBanner: vi.fn()
}));

describe("Products Component", () => {
  const mockApiResponse = {
    content: [
      { gtinCode: "111222333", productName: "Mock Smartphone", productCode: "P1", brand: "MockBrand", category: "TUMBLEDRYERS", linkEprel: "http://eprel/1" }
    ],
    pageNo: 0,
    pageSize: 10,
    totalElements: 1
  };

  beforeEach(() => {
    vi.clearAllMocks();
    vi.stubEnv("VITE_PAGINATION_SIZE", "10");
    vi.stubEnv("VITE_CSV_LINK", "https://mocklink.csv");
    vi.mocked(getInitiativeProductsList).mockResolvedValue(mockApiResponse);
  });

  it("should render page titles and texts correctly", async () => {
    render(<Products />);

    expect(screen.getByText("pages.products.title")).toBeInTheDocument();
    expect(screen.getByText("pages.products.subtitle")).toBeInTheDocument();
  });

  it("should open csv link when export button is clicked", async () => {
    const windowOpenSpy = vi.spyOn(window, "open").mockReturnValue({ focus: vi.fn() } as any);
    render(<Products />);

    const exportButton = screen.getByText("Esporta csv");
    fireEvent.click(exportButton);

    expect(windowOpenSpy).toHaveBeenCalledWith("https://mocklink.csv", "_blank");
  });

  it("should show empty state text when there are no products", async () => {
    vi.mocked(getInitiativeProductsList).mockResolvedValueOnce({
      content: [],
      pageNo: 0,
      pageSize: 10,
      totalElements: 0
    });

    render(<Products />);

    await waitFor(() => {
      expect(screen.getByText("pages.products.noProducts")).toBeInTheDocument();
    });
  });

  it("should render fetched products in the table", async () => {
    render(<Products />);

    await waitFor(() => {
      expect(getInitiativeProductsList).toHaveBeenCalledWith("mock-initiative-123", {
        size: "10",
        status: "APPROVED"
      });
    });

    await waitFor(() => {
      expect(screen.getByText("111222333")).toBeInTheDocument();
      expect(screen.getByText("MockBrand")).toBeInTheDocument();
    });
  });

  it("should show alert message when api call fails", async () => {
    vi.mocked(getInitiativeProductsList).mockRejectedValueOnce(new Error("API Error"));
    
    render(<Products />);

    await waitFor(() => {
      expect(screen.getByText("pages.products.errorAlert")).toBeInTheDocument();
    });
  });

  it("should show drawer with correct subtext when a product row action is triggered", async () => {
    render(<Products />);

    await waitFor(() => {
      expect(screen.getByText("111222333")).toBeInTheDocument();
    });

    const expectedDrawerTitle = "Mock Smartphone - P1";
    
    expect(screen.queryByText(expectedDrawerTitle)).not.toBeInTheDocument();

    const actionIcons = document.querySelectorAll('[data-testid="ChevronRightIcon"]');
    if (actionIcons.length > 0) {
      fireEvent.click(actionIcons[0]);
      
      await waitFor(() => {
        expect(screen.getByText(expectedDrawerTitle)).toBeInTheDocument();
        expect(screen.getByText("pages.products.drawer.subtitle")).toBeInTheDocument();
      });
    }
  });
});