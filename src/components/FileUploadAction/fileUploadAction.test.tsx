import { vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import FileUploadAction from "./FileUploadAction";
import { Router } from "react-router-dom";

const mockFileUpload = {
  titleKey: "titleKeyTest",
  subtitleKey: "subtitlekeyTest",
  i18nBlockKey: "blockKeyTest",
  successStateKey: "succesKeyTest",
  breadcrumbsLabelKey: "breadcrumbsKeyTest",
  manualLink: "manualLinkTest",
};

const mockDownloadInvoiceFileApi = vi.fn();
vi.mock("../../services/merchantService", () => {
  return {
    downloadInvoiceFileApi: (params: any) => mockDownloadInvoiceFileApi(params),
  };
});

vi.mock("../Alert/AlertComponent", () => ({
  default: ({ message }) => <div data-testid="alert-component">{message}</div>,
}));

vi.mock("../BreadcrumbsBox/BreadcrumbsBox", () => ({
  default: vi.fn(() => <div data-testid="BreadcrumbsBox" />),
}));

const renderComponent = () =>
  render(
    <Router location={""} navigator={undefined}>
      <FileUploadAction
        apiCall={() => {}}
        styleClass={""}
        {...mockFileUpload}
      />
    </Router>
  );

describe("fileUploadAction component test", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should render component", async () => {
    // mockDownloadInvoiceFileApi.mockResolvedValue({ content: "test" });

    renderComponent();

    // expect(mockDownloadInvoiceFileApi).toHaveBeenCalledTimes(1);
    expect(screen.getByText("titleKeyTest")).toBeInTheDocument();
    expect(screen.getByText("subtitlekeyTest")).toBeInTheDocument();
    expect(screen.getByTestId("BreadcrumbsBox")).toBeInTheDocument();
  });

  // it("should show error alert", async () => {
  //   mockDownloadInvoiceFileApi.mockRejectedValue(new Error("API Error"));

  //   renderComponent();

  //   expect(screen.getByTestId("alert-component")).toBeInTheDocument();

  //   expect(mockDownloadInvoiceFileApi).toHaveBeenCalledTimes(1);
  // });
});
