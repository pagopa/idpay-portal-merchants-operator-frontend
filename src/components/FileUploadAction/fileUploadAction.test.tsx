import { vi } from "vitest";
import "@testing-library/jest-dom";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import FileUploadAction from "./FileUploadAction";
import ROUTES from "../../routes";

const MAX_FILE_SIZE_BYTES = 20 * 1024 * 1024;

let mockNavigate = vi.fn();

vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual<typeof import("react-router-dom")>(
    "react-router-dom",
  );
  return {
    ...actual,
    useNavigate: () => mockNavigate,
    useParams: () => ({ trxId: "test-transaction-123" }),
    useLocation: vi.fn(() => ({ pathname: "" })),
  };
});

vi.mock("@pagopa/mui-italia", async () => {
  const actual = await vi.importActual("@pagopa/mui-italia");
  return {
    ...actual,
    SingleFileInput: vi.fn(
      ({
        value,
        onFileRemoved,
        dropzoneLabel,
      }: {
        value: File | null;
        onFileRemoved: () => void;
        dropzoneLabel: string;
      }) => (
        <div data-testid="mock-single-file-input">
          {value ? (
            <div>
              <span>{value.name}</span>
              <button onClick={onFileRemoved}>Rimuovi</button>
            </div>
          ) : (
            <span>{dropzoneLabel}</span>
          )}
        </div>
      ),
    ),
  };
});

vi.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (key: string) => key,
  }),
}));

vi.mock("../../utils/constants.ts", () => ({
  REQUIRED_FIELD_ERROR: "Campo obbligatorio",
}));

vi.mock("../BreadcrumbsBox/BreadcrumbsBox", () => ({
  default: vi.fn(() => <div data-testid="BreadcrumbsBox" />),
}));

vi.mock("../Alert/AlertComponent", () => ({
  default: vi.fn(() => <div data-testid="alert-component" />),
}));

describe("fileUploadAction component test", () => {
  const baseProps = {
    titleKey: "titleKeyTest",
    subtitleKey: "subtitlekeyTest",
    i18nBlockKey: "blockKeyTest",
    successStateKey: "successKeyTest",
    breadcrumbsLabelKey: "breadcrumbsKeyTest",
    breadcrumbsProp: {
      label: "Breadcrumb Label",
      path: ROUTES.BUY_MANAGEMENT,
    },
    manualLink: "manualLinkTest",
    docNumberTitle: "Doc Number Title",
    docNumberInsert: "Insert Document Number",
    docNumberLabel: "Document Number",
    styleClass: "",
    apiCall: vi.fn(() => Promise.resolve()),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    mockNavigate = vi.fn();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("should render component", () => {
    render(<FileUploadAction {...baseProps} />);

    expect(screen.getByText("titleKeyTest")).toBeInTheDocument();
    expect(screen.getByText("subtitlekeyTest")).toBeInTheDocument();
    expect(screen.getByTestId("BreadcrumbsBox")).toBeInTheDocument();
    expect(screen.getByText("Doc Number Title")).toBeInTheDocument();
    expect(screen.getByText("Insert Document Number")).toBeInTheDocument();
  });

  it("should display file type error alert", () => {
    const { getByTestId, queryByTestId } = render(
      <FileUploadAction {...baseProps} />,
    );

    const uploadInputTest = getByTestId("upload-input-test");

    expect(queryByTestId("alert")).not.toBeInTheDocument();

    fireEvent.change(uploadInputTest, {
      target: {
        files: [{ type: "wrong/file", name: "test.txt" }] as Array<File>,
      },
    });

    expect(getByTestId("alert")).toBeInTheDocument();
  });

  it("should exit the page", () => {
    render(<FileUploadAction {...baseProps} />);

    fireEvent.click(screen.getByTestId("back-btn-test"));

    expect(mockNavigate).toHaveBeenCalledWith(ROUTES.BUY_MANAGEMENT);
  });

  test("should call apiCall with docNumber and navigate on success", async () => {
    const mockApiCall = vi.fn().mockResolvedValue({ status: 200 });
    const user = userEvent.setup({ delay: null });

    render(<FileUploadAction {...baseProps} apiCall={mockApiCall} />);

    const file = new File(["test"], "test.pdf", { type: "application/pdf" });
    const uploadInput = screen.getByTestId("upload-input-test");
    await user.upload(uploadInput, file);

    const docNumberInput = screen.getByLabelText("Document Number");
    await user.type(docNumberInput, "DOC123");
    fireEvent.blur(docNumberInput);

    const continueButton = screen.getByTestId("continue-btn-test");
    await user.click(continueButton);

    expect(mockApiCall).toHaveBeenCalledWith(
      "test-transaction-123",
      file,
      "DOC123",
    );

    await waitFor(
      () => {
        expect(mockNavigate).toHaveBeenCalledWith(ROUTES.BUY_MANAGEMENT, {
          state: {
            [baseProps.successStateKey]: true,
          },
        });
      },
      { timeout: 3000 },
    );
  });

  test("should show an error alert on apiCall failure", async () => {
    const mockApiCall = vi.fn().mockRejectedValue(new Error("API Error"));
    const user = userEvent.setup({ delay: null });

    render(<FileUploadAction {...baseProps} apiCall={mockApiCall} />);

    const file = new File(["test"], "test.pdf", { type: "application/pdf" });
    const uploadInput = screen.getByTestId("upload-input-test");
    await user.upload(uploadInput, file);

    const docNumberInput = screen.getByLabelText("Document Number");
    await user.type(docNumberInput, "DOC123");
    fireEvent.blur(docNumberInput);

    const continueButton = screen.getByTestId("continue-btn-test");
    await user.click(continueButton);

    expect(mockApiCall).toHaveBeenCalledWith(
      "test-transaction-123",
      expect.any(File),
      "DOC123",
    );

    await waitFor(() => {
      expect(screen.getByTestId("alert-component")).toBeInTheDocument();
    });

    expect(mockNavigate).not.toHaveBeenCalled();
  });

  it("should show a file size error when the uploaded file is too large", async () => {
    const user = userEvent.setup({ delay: null });

    render(<FileUploadAction {...baseProps} />);

    const oversizedFile = new File(["content"], "oversized-file.pdf", {
      type: "application/pdf",
    });
    Object.defineProperty(oversizedFile, "size", {
      value: MAX_FILE_SIZE_BYTES + 1,
      writable: false,
    });

    const uploadInput = screen.getByTestId("upload-input-test");

    await user.upload(uploadInput, oversizedFile);

    const errorAlert = screen.getByTestId("alert");
    expect(errorAlert).toBeInTheDocument();

    expect(errorAlert).toHaveTextContent("commons.fileSizeError");
  });

  it("should clear the file when the remove button is clicked", async () => {
    const user = userEvent.setup({ delay: null });
    render(<FileUploadAction {...baseProps} />);

    const fileInput = screen.getByTestId(
      "upload-input-test",
    ) as HTMLInputElement;

    const fileToUpload = new File(["content"], "documento.pdf", {
      type: "application/pdf",
    });
    await user.upload(fileInput, fileToUpload);

    expect(screen.getByText("documento.pdf")).toBeInTheDocument();

    const removeButton = screen.getByRole("button", { name: /rimuovi/i });
    await user.click(removeButton);

    expect(screen.queryByText("documento.pdf")).not.toBeInTheDocument();

    expect(fileInput.value).toBe("");

    expect(
      screen.getByText(`${baseProps.i18nBlockKey}.uploadFile`),
    ).toBeInTheDocument();
  });

  it("should trigger the file input click when the replace button is clicked", async () => {
    const user = userEvent.setup({ delay: null });
    render(<FileUploadAction {...baseProps} />);

    const fileInput = screen.getByTestId("upload-input-test");

    const inputClickSpy = vi.spyOn(fileInput, "click");

    const initialFile = new File(["content"], "initial.pdf", {
      type: "application/pdf",
    });
    await user.upload(fileInput, initialFile);

    const replaceButton = screen.getByTestId("file-btn-test");

    await user.click(replaceButton);

    expect(inputClickSpy).toHaveBeenCalledTimes(1);

    inputClickSpy.mockRestore();
  });

  it("should open manual link when link is clicked", () => {
    const windowOpenSpy = vi
      .spyOn(window, "open")
      .mockImplementation(() => null);

    render(<FileUploadAction {...baseProps} />);

    expect(screen.getByText("blockKeyTest.manualLink")).toBeInTheDocument();

    fireEvent.click(screen.getByText("blockKeyTest.manualLink"));

    expect(windowOpenSpy).toHaveBeenCalledWith("manualLinkTest", "_blank");

    windowOpenSpy.mockRestore();
  });

  it("should show error when docNumber is less than 2 characters", async () => {
    const user = userEvent.setup({ delay: null });
    render(<FileUploadAction {...baseProps} />);

    const docNumberInput = screen.getByLabelText("Document Number");

    await user.type(docNumberInput, "A");
    fireEvent.blur(docNumberInput);

    await waitFor(() => {
      expect(
        screen.getByText("Lunghezza minima 2 caratteri"),
      ).toBeInTheDocument();
    });
  });

  it("should not show error when docNumber is valid", async () => {
    const user = userEvent.setup({ delay: null });
    render(<FileUploadAction {...baseProps} />);

    const docNumberInput = screen.getByLabelText("Document Number");

    await user.type(docNumberInput, "AB");
    fireEvent.blur(docNumberInput);

    await waitFor(() => {
      expect(screen.queryByText("Campo obbligatorio")).not.toBeInTheDocument();
      expect(
        screen.queryByText("Lunghezza minima 2 caratteri"),
      ).not.toBeInTheDocument();
    });
  });

  it("should not call apiCall when docNumber has error", async () => {
    const mockApiCall = vi.fn().mockResolvedValue({ status: 200 });
    const user = userEvent.setup({ delay: null });

    render(<FileUploadAction {...baseProps} apiCall={mockApiCall} />);

    const file = new File(["test"], "test.pdf", { type: "application/pdf" });
    const uploadInput = screen.getByTestId("upload-input-test");
    await user.upload(uploadInput, file);

    const docNumberInput = screen.getByLabelText("Document Number");
    await user.type(docNumberInput, "A");
    fireEvent.blur(docNumberInput);

    const continueButton = screen.getByTestId("continue-btn-test");
    await user.click(continueButton);

    expect(mockApiCall).not.toHaveBeenCalled();
    expect(mockNavigate).not.toHaveBeenCalled();
  });

  it.skip("should hide error alert after 5 seconds", async () => {
    vi.useFakeTimers();

    const mockApiCall = vi.fn().mockRejectedValue(new Error("API Error"));
    const user = userEvent.setup({ delay: null });

    render(<FileUploadAction {...baseProps} apiCall={mockApiCall} />);

    const file = new File(["test"], "test.pdf", { type: "application/pdf" });
    const uploadInput = screen.getByTestId("upload-input-test");
    await user.upload(uploadInput, file);

    const docNumberInput = screen.getByLabelText("Document Number");
    await user.type(docNumberInput, "DOC123");
    fireEvent.blur(docNumberInput);

    const continueButton = screen.getByTestId("continue-btn-test");
    fireEvent.click(continueButton);

    await vi.runAllTimersAsync();

    expect(screen.getByTestId("alert-component")).toBeInTheDocument();

    vi.advanceTimersByTime(5100);

    expect(screen.queryByTestId("alert-component")).not.toBeInTheDocument();

    vi.useRealTimers();
  }, 10000);

  it("should show error when continue is clicked without uploading a file", async () => {
    const user = userEvent.setup({ delay: null });
    render(<FileUploadAction {...baseProps} />);

    const continueButton = screen.getByTestId("continue-btn-test");
    await user.click(continueButton);

    expect(screen.getByTestId("alert")).toBeInTheDocument();
  });

  it("should show required error when docNumber is empty and continue is clicked", async () => {
    const user = userEvent.setup({ delay: null });
    render(<FileUploadAction {...baseProps} />);

    const file = new File(["test"], "test.pdf", { type: "application/pdf" });
    const uploadInput = screen.getByTestId("upload-input-test");
    await user.upload(uploadInput, file);

    const continueButton = screen.getByTestId("continue-btn-test");
    await user.click(continueButton);

    expect(screen.getByText("Campo obbligatorio")).toBeInTheDocument();
  });

  it("should not call apiCall if continue is clicked without file", async () => {
    const mockApiCall = vi.fn();
    const user = userEvent.setup({ delay: null });

    render(<FileUploadAction {...baseProps} apiCall={mockApiCall} />);

    const continueButton = screen.getByTestId("continue-btn-test");
    await user.click(continueButton);

    expect(mockApiCall).not.toHaveBeenCalled();
  });

  it("should not render replace button when no file is uploaded", () => {
    render(<FileUploadAction {...baseProps} />);

    expect(screen.queryByTestId("file-btn-test")).not.toBeInTheDocument();
  });

  it("should show deniedSentError message when API returns REWARD_BATCH_STATUS_NOT_ALLOWED", async () => {
    const mockApiCall = vi.fn().mockRejectedValue({
      response: {
        data: {
          code: "REWARD_BATCH_STATUS_NOT_ALLOWED",
        },
      },
    });

    const user = userEvent.setup({ delay: null });

    render(<FileUploadAction {...baseProps} apiCall={mockApiCall} />);

    const file = new File(["test"], "test.pdf", { type: "application/pdf" });
    const uploadInput = screen.getByTestId("upload-input-test");
    await user.upload(uploadInput, file);

    const docNumberInput = screen.getByLabelText("Document Number");
    await user.type(docNumberInput, "DOC123");
    fireEvent.blur(docNumberInput);

    const continueButton = screen.getByTestId("continue-btn-test");
    await user.click(continueButton);

    await waitFor(() => {
      expect(screen.getByTestId("alert-component")).toBeInTheDocument();
    });
  });

  it("should show alreadySentError message when API returns REWARD_BATCH_ALREADY_SENT", async () => {
    const mockApiCall = vi.fn().mockRejectedValue({
      response: {
        data: {
          code: "REWARD_BATCH_ALREADY_SENT",
        },
      },
    });

    const user = userEvent.setup({ delay: null });

    render(<FileUploadAction {...baseProps} apiCall={mockApiCall} />);

    const file = new File(["test"], "test.pdf", { type: "application/pdf" });
    const uploadInput = screen.getByTestId("upload-input-test");
    await user.upload(uploadInput, file);

    const docNumberInput = screen.getByLabelText("Document Number");
    await user.type(docNumberInput, "DOC123");
    fireEvent.blur(docNumberInput);

    const continueButton = screen.getByTestId("continue-btn-test");
    await user.click(continueButton);

    await waitFor(() => {
      expect(screen.getByTestId("alert-component")).toBeInTheDocument();
    });
  });

  it.skip("should prefill docNumber from fileDocNumber param (base64 decoded)", async () => {
    const encodedDocNumber = btoa("DOC_FROM_URL");

    vi.mocked(require("react-router-dom").useParams).mockReturnValue({
      trxId: "test-transaction-123",
      fileDocNumber: encodedDocNumber,
    });

    render(<FileUploadAction {...baseProps} />);

    const docNumberInput = screen.getByLabelText(
      "Document Number",
    ) as HTMLInputElement;

    await waitFor(() => {
      expect(docNumberInput.value).toBe("DOC_FROM_URL");
    });
  });

});
