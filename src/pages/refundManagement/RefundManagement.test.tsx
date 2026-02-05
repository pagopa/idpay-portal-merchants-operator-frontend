import "@testing-library/jest-dom";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import RefundManagement from "./RefundManagement";

let mockLocationState: unknown = undefined;
const navigateMock = vi.fn();

vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual<typeof import("react-router-dom")>(
    "react-router-dom",
  );
  return {
    ...actual,
    useNavigate: () => navigateMock,
    useLocation: () => ({ state: mockLocationState }),
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

const downloadInvoiceFileApi =
  vi.fn<(...args: unknown[]) => Promise<unknown>>();

vi.mock("../../services/merchantService", () => ({
  getProcessedTransactions: vi.fn(),
  downloadInvoiceFileApi: (...args: unknown[]) =>
    downloadInvoiceFileApi(...args),
}));

vi.mock("../../components/DetailsDrawer/DetailsDrawer", () => ({
  DetailsDrawer: ({
    isOpen,
    invoiceStatus,
    primaryButton,
    secondaryButton,
    onFileDownloadCallback,
  }: {
    isOpen: boolean;
    invoiceStatus?: string;
    primaryButton?: { disabled?: boolean; onClick: () => void };
    secondaryButton?: { onClick: () => void };
    onFileDownloadCallback: () => void;
  }) => (
    <div data-testid="drawer">
      <div data-testid="drawer-open">{String(isOpen)}</div>
      <div data-testid="invoice-status">{invoiceStatus}</div>

      {primaryButton && (
        <button
          data-testid="primary-button"
          disabled={primaryButton.disabled}
          onClick={primaryButton.onClick}
        />
      )}

      {secondaryButton && (
        <button
          data-testid="secondary-button"
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
    externalState,
    DrawerComponent,
  }: {
    onRowAction: (row: unknown) => void;
    externalState: Record<string, boolean>;
    DrawerComponent: React.ReactNode;
  }) => (
    <div>
      <div data-testid="state-refund">
        {String(externalState.transactionRefundSuccess)}
      </div>
      <div data-testid="state-reverse">
        {String(externalState.transactionReverseSuccess)}
      </div>
      <div data-testid="state-error">
        {String(externalState.errorDownloadAlert)}
      </div>

      <button
        data-testid="open-invoiced"
        onClick={() =>
          onRowAction({
            id: "trx-invoiced",
            status: "INVOICED",
            rewardBatchTrxStatus: "PENDING",
            invoiceFile: { filename: "fattura.pdf" },
          })
        }
      />

      <button
        data-testid="open-refunded"
        onClick={() =>
          onRowAction({
            id: "trx-refunded",
            status: "REFUNDED",
            rewardBatchTrxStatus: "APPROVED",
            invoiceFile: { filename: "nota.pdf" },
          })
        }
      />

      <button
        data-testid="open-cancelled"
        onClick={() =>
          onRowAction({
            id: "trx-cancelled",
            status: "CANCELLED",
            rewardBatchTrxStatus: "PENDING",
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
    mockLocationState = undefined;
  });

  it("sets refund success alert from location.state", () => {
    mockLocationState = { refundUploadSuccess: true };
    renderComponent();
    expect(screen.getByTestId("state-refund")).toHaveTextContent("true");
  });

  it("sets reverse success alert from location.state", () => {
    mockLocationState = { reverseUploadSuccess: true };
    renderComponent();
    expect(screen.getByTestId("state-reverse")).toHaveTextContent("true");
  });

  it("opens drawer for INVOICED and allows reverse", () => {
    renderComponent();
    fireEvent.click(screen.getByTestId("open-invoiced"));
    expect(screen.getByTestId("drawer-open")).toHaveTextContent("true");
    expect(screen.getByTestId("invoice-status")).toHaveTextContent("INVOICED");
    expect(screen.getByTestId("secondary-button")).toBeInTheDocument();
  });

  it("disables modify button when rewardBatchTrxStatus is APPROVED", () => {
    renderComponent();
    fireEvent.click(screen.getByTestId("open-refunded"));
    const primary = screen.getByTestId("primary-button");
    expect(primary).toBeDisabled();
    expect(screen.getByTestId("invoice-status")).toHaveTextContent("REFUNDED");
  });

  it("does not show secondary button for CANCELLED", () => {
    renderComponent();
    fireEvent.click(screen.getByTestId("open-cancelled"));
    expect(screen.queryByTestId("secondary-button")).toBeNull();
    expect(screen.getByTestId("invoice-status")).toHaveTextContent("CANCELLED");
  });

  it("handles successful invoice download", async () => {
    downloadInvoiceFileApi.mockResolvedValueOnce({
      invoiceUrl: "https://example.com/file.pdf",
    });

    const clickSpy = vi.fn();
    const originalCreateElement = document.createElement.bind(document);

    vi.spyOn(document, "createElement").mockImplementation(((tag: string) => {
      if (tag === "a") {
        return {
          click: clickSpy,
          set href(_v: string) {},
          set download(_v: string) {},
        } as unknown as HTMLAnchorElement;
      }
      return originalCreateElement(tag);
    }) as typeof document.createElement);

    renderComponent();
    fireEvent.click(screen.getByTestId("open-invoiced"));
    fireEvent.click(screen.getByTestId("download"));

    await waitFor(() => {
      expect(clickSpy).toHaveBeenCalled();
    });
  });

  it("navigates to reverse transaction when secondary button is clicked", () => {
    renderComponent();
    fireEvent.click(screen.getByTestId("open-invoiced"));
    fireEvent.click(screen.getByTestId("secondary-button"));
    expect(navigateMock).toHaveBeenCalledWith(
      "/storna-transazione/trx-invoiced",
      expect.objectContaining({
        state: { backTo: expect.any(String) },
      }),
    );
  });

  it("navigates to modify document when primary button is clicked", () => {
    renderComponent();
    fireEvent.click(screen.getByTestId("open-invoiced"));
    fireEvent.click(screen.getByTestId("primary-button"));
    expect(navigateMock).toHaveBeenCalledWith(
      expect.stringContaining("/modifica-documento/trx-invoiced/"),
    );
  });

  it("opens drawer for all supported statuses without crashing", () => {
    renderComponent();
    fireEvent.click(screen.getByTestId("open-invoiced"));
    fireEvent.click(screen.getByTestId("open-refunded"));
    fireEvent.click(screen.getByTestId("open-cancelled"));
    expect(screen.getByTestId("drawer")).toBeInTheDocument();
  });
});
