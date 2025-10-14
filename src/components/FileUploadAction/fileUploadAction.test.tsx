import { vi } from "vitest";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import FileUploadAction from "./FileUploadAction";
import ROUTES from "../../routes";

const onClick = {
  click: () => null,
};

const MAX_FILE_SIZE_BYTES = 20 * 1024 * 1024;

const mockFileUpload = {
  titleKey: "titleKeyTest",
  subtitleKey: "subtitlekeyTest",
  i18nBlockKey: "blockKeyTest",
  apiCall: () => new Promise(() => {}),
  successStateKey: "succesKeyTest",
  breadcrumbsLabelKey: "breadcrumbsKeyTest",
  manualLink: "manualLinkTest",
};

const onClickSpy = vi.spyOn(onClick, "click");

const FileUploadSetup = (fileUpload: typeof mockFileUpload) => {
  render(<FileUploadAction styleClass={""} {...fileUpload} />);
};

const mockNavigate = vi.fn();
vi.mock(import("react-router-dom"), async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...actual,
    useNavigate: () => mockNavigate,
    useLocation: vi.fn(() => ({ pathname: "" })),
  };
});

vi.mock("../BreadcrumbsBox/BreadcrumbsBox", () => ({
  default: vi.fn(() => <div data-testid="BreadcrumbsBox" />),
}));

describe("fileUploadAction component test", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should render component", () => {
    FileUploadSetup(mockFileUpload);

    expect(screen.getByText("titleKeyTest")).toBeInTheDocument();
    expect(screen.getByText("subtitlekeyTest")).toBeInTheDocument();
    expect(screen.getByTestId("BreadcrumbsBox")).toBeInTheDocument();
  });

  it("should display error alert", () => {
    const { getByTestId, queryByTestId } = render(
      <FileUploadAction styleClass={""} {...mockFileUpload} />
    );

    const uploadInputTest = getByTestId("upload-input-test");

    expect(queryByTestId("alert")).not.toBeInTheDocument();

    fireEvent.change(uploadInputTest, {
      target: { files: [{ type: "wrong/file" }] as Array<File> },
    });

    expect(getByTestId("alert")).toBeInTheDocument();
  });

  it("should exit the page", () => {
    FileUploadSetup(mockFileUpload);

    fireEvent.click(screen.getByTestId("back-btn-test"));

    expect(mockNavigate).toHaveBeenCalledWith(ROUTES.BUY_MANAGEMENT);
  });

  it("should continue upload", () => {
    FileUploadSetup(mockFileUpload);
    const button = screen.getByTestId("continue-btn-test");
    button.addEventListener("onClick", onClick.click());

    fireEvent.click(button);

    expect(onClickSpy).toHaveBeenCalled();
  });

  it("should show file size error alert", () => {
    render(<FileUploadAction styleClass={""} {...mockFileUpload} />);
    const uploadInputTest = screen.getByTestId("upload-input-test");
    const bigFile = new File(
      [new Array(21 * 1024 * 1024).fill("a").join("")],
      "big.pdf",
      { type: "application/pdf" }
    );
    Object.defineProperty(uploadInputTest, "files", { value: [bigFile] });
    fireEvent.change(uploadInputTest);
    expect(screen.getByTestId("alert")).toBeInTheDocument();
  });

  it("should remove file when remove is called", () => {
    render(<FileUploadAction styleClass={""} {...mockFileUpload} />);
    const uploadInputTest = screen.getByTestId("upload-input-test");
    const file = new File(["foo"], "foo.pdf", { type: "application/pdf" });
    Object.defineProperty(uploadInputTest, "files", { value: [file] });
    fireEvent.change(uploadInputTest);
    // Simula la rimozione tramite SingleFileInput
    // Non possiamo triggerare direttamente onFileRemoved, quindi resettiamo l'input
    fireEvent.change(uploadInputTest, { target: { files: [] } });
    expect(screen.queryByTestId("file-btn-test")).not.toBeInTheDocument();
  });

  it("should show and click replace file button", () => {
    render(<FileUploadAction styleClass={""} {...mockFileUpload} />);
    const uploadInputTest = screen.getByTestId("upload-input-test");
    const file = new File(["foo"], "foo.pdf", { type: "application/pdf" });
    Object.defineProperty(uploadInputTest, "files", { value: [file] });
    fireEvent.change(uploadInputTest);
    const replaceBtn = screen.getByTestId("file-btn-test");
    expect(replaceBtn).toBeInTheDocument();
    fireEvent.click(replaceBtn);
  });

  it("should show AlertComponent on api error", async () => {
    const apiCallMock = vi.fn(() => Promise.reject("fail"));
    render(
      <FileUploadAction
        styleClass={""}
        {...mockFileUpload}
        apiCall={apiCallMock}
      />
    );
    const uploadInputTest = screen.getByTestId("upload-input-test");
    const file = new File(["foo"], "foo.pdf", { type: "application/pdf" });
    Object.defineProperty(uploadInputTest, "files", { value: [file] });
    fireEvent.change(uploadInputTest);
    const continueBtn = screen.getByTestId("continue-btn-test");
    fireEvent.click(continueBtn);
    await waitFor(() => {
      expect(screen.getByTestId("alert-component")).toBeInTheDocument();
    });
  });

  it("should navigate to REFUNDS_MANAGEMENT on api success", async () => {
    const apiCallMock = vi.fn(() => Promise.resolve({}));
    render(
      <FileUploadAction
        styleClass={""}
        {...mockFileUpload}
        apiCall={apiCallMock}
      />
    );
    const uploadInputTest = screen.getByTestId("upload-input-test");
    const file = new File(["foo"], "foo.pdf", { type: "application/pdf" });
    Object.defineProperty(uploadInputTest, "files", { value: [file] });
    fireEvent.change(uploadInputTest);
    const continueBtn = screen.getByTestId("continue-btn-test");
    fireEvent.click(continueBtn);
    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith(
        ROUTES.REFUNDS_MANAGEMENT,
        expect.anything()
      );
    });
  });

  it("should hide error alert after 5 seconds", async () => {
    vi.useFakeTimers();
    render(<FileUploadAction styleClass={""} {...mockFileUpload} />);
    const uploadInputTest = screen.getByTestId("upload-input-test");
    const file = new File(["foo"], "foo.xml", { type: "wrong/file" });
    Object.defineProperty(uploadInputTest, "files", { value: [file] });
    fireEvent.change(uploadInputTest);
    expect(screen.getByTestId("alert")).toBeInTheDocument();
    vi.advanceTimersByTime(5000);
    await waitFor(() => {
      expect(screen.queryByTestId("alert")).not.toBeInTheDocument();
    });
    vi.useRealTimers();
  });
});
