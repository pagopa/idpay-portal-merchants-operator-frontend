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
});
