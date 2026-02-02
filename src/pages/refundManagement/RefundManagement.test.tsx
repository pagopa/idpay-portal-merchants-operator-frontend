import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import RefundManagement from "./RefundManagement";

const navigateMock = vi.fn();

vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual<typeof import("react-router-dom")>(
    "react-router-dom",
  );
  return {
    ...actual,
    useNavigate: () => navigateMock,
    useLocation: () => ({ state: undefined }),
  };
});

vi.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (key: string) => key,
  }),
}));

vi.mock("../../store/authStore", () => ({
  authStore: {
    getState: () => ({ token: "fake-token" }),
  },
}));

vi.mock("jwt-decode", () => ({
  jwtDecode: () => ({ point_of_sale_id: "pos-123" }),
}));

const downloadInvoiceFileApi = vi.fn<(...args: unknown[]) => unknown>();
const getProcessedTransactions = vi.fn<(...args: unknown[]) => unknown>();

vi.mock("../../services/merchantService", () => ({
  getProcessedTransactions: (...args: unknown[]) =>
    getProcessedTransactions(...args),
  downloadInvoiceFileApi: (...args: unknown[]) =>
    downloadInvoiceFileApi(...args),
}));

vi.mock("../../components/DetailsDrawer/DetailsDrawer", () => ({
  DetailsDrawer: ({
    isOpen,
    item,
    onFileDownloadCallback,
    primaryButton,
    secondaryButton,
  }: {
    isOpen: boolean;
    item: unknown;
    onFileDownloadCallback: () => void;
    primaryButton?: { onClick: () => void };
    secondaryButton?: { onClick: () => void };
  }) => (
    <div data-testid="drawer">
      <div data-testid="drawer-open">{String(isOpen)}</div>
      <pre data-testid="drawer-item">{JSON.stringify(item)}</pre>

      {primaryButton && (
        <button data-testid="primary-action" onClick={primaryButton.onClick} />
      )}

      {secondaryButton && (
        <button
          data-testid="secondary-action"
          onClick={secondaryButton.onClick}
        />
      )}

      <button data-testid="download" onClick={onFileDownloadCallback} />
    </div>
  ),
}));

vi.mock("../../components/TransactionsLayout/TransactionsLayout", () => ({
  default: ({
    onRowAction,
    DrawerComponent,
  }: {
    onRowAction: (row: unknown) => void;
    DrawerComponent: React.ReactNode;
  }) => (
    <div>
      <button
        data-testid="open-row"
        onClick={() =>
          onRowAction({
            id: "trx-1",
            status: "INVOICED",
            trxChargeDate: "2025-01-01T10:00:00Z",
            fiscalCode: "ABC",
            effectiveAmountCents: 1000,
            rewardAmountCents: 200,
            authorizedAmountCents: 1200,
            additionalProperties: { productName: "Lavatrice" },
            invoiceFile: {
              filename: "fattura.pdf",
              docNumber: "123",
            },
          })
        }
      />
      {DrawerComponent}
    </div>
  ),
}));

const renderComponent = () =>
  render(
    <MemoryRouter>
      <ThemeProvider theme={createTheme()}>
        <RefundManagement />
      </ThemeProvider>
    </MemoryRouter>,
  );

describe("RefundManagement", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders TransactionsLayout and opens drawer on row action", async () => {
    renderComponent();

    fireEvent.click(screen.getByTestId("open-row"));

    expect(screen.getByTestId("drawer-open")).toHaveTextContent("true");
    expect(screen.getByTestId("drawer-item").textContent).toContain("trx-1");
    expect(screen.getByTestId("drawer-item").textContent).toContain(
      "Lavatrice",
    );
  });

  it("navigates to modify document on primary button click", async () => {
    renderComponent();

    fireEvent.click(screen.getByTestId("open-row"));
    fireEvent.click(screen.getByTestId("primary-action"));

    expect(navigateMock).toHaveBeenCalledWith(
      expect.stringContaining("/modifica-documento/trx-1/"),
    );
  });

  it("navigates to reverse transaction on secondary button click", async () => {
    renderComponent();

    fireEvent.click(screen.getByTestId("open-row"));
    fireEvent.click(screen.getByTestId("secondary-action"));

    expect(navigateMock).toHaveBeenCalledWith(
      "/storna-transazione/trx-1",
      expect.any(Object),
    );
  });

  it("downloads invoice successfully", async () => {
    downloadInvoiceFileApi.mockResolvedValueOnce({
      invoiceUrl: "https://example.com/file.pdf",
    });

    const clickSpy = vi.fn();

    const originalCreateElement = document.createElement.bind(document);

    vi.spyOn(document, "createElement").mockImplementation(((
      tagName: string,
    ) => {
      if (tagName === "a") {
        return {
          click: clickSpy,
          set href(_v: string) {},
          set download(_v: string) {},
        } as unknown as HTMLAnchorElement;
      }
      return originalCreateElement(tagName);
    }) as typeof document.createElement);

    renderComponent();

    fireEvent.click(screen.getByTestId("open-row"));
    fireEvent.click(screen.getByTestId("download"));

    await waitFor(() => {
      expect(downloadInvoiceFileApi).toHaveBeenCalled();
      expect(clickSpy).toHaveBeenCalled();
    });
  });

  it("handles error when download fails", async () => {
    downloadInvoiceFileApi.mockRejectedValueOnce(new Error("boom"));

    renderComponent();

    fireEvent.click(screen.getByTestId("open-row"));
    fireEvent.click(screen.getByTestId("download"));

    await waitFor(() => {
      expect(downloadInvoiceFileApi).toHaveBeenCalled();
    });
  });
});
