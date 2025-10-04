import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import ModalComponent from "./ModalComponent";
const theme = createTheme();

const renderComponent = (props: any) => {
  return render(
    <ThemeProvider theme={theme}>
      <ModalComponent {...props} />
    </ThemeProvider>
  );
};

describe("ModalComponent", () => {
  const mockOnClose = vi.fn();

  const mockChildren = (
    <div data-testid="modal-children">Contenuto di Test</div>
  );

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should not render the modal content when open is false", () => {
    renderComponent({
      open: false,
      onClose: mockOnClose,
      children: mockChildren,
    });

    expect(screen.queryByTestId("iban-modal-content")).not.toBeInTheDocument();
  });

  it("should render the children content when open is true", () => {
    renderComponent({
      open: true,
      onClose: mockOnClose,
      children: mockChildren,
    });

    const modalContent = screen.getByTestId("iban-modal-content");
    expect(modalContent).toBeInTheDocument();
    expect(screen.getByTestId("modal-children")).toBeInTheDocument();
    expect(screen.getByText("Contenuto di Test")).toBeInTheDocument();
  });

  it.skip("should call onClose when clicking the backdrop", async () => {
    const user = userEvent.setup();

    renderComponent({
      open: true,
      onClose: mockOnClose,
      children: mockChildren,
    });
    const modalRoot = screen.getByRole("presentation", {
      hidden: true,
    }).parentElement;

    if (modalRoot) {
      await user.click(modalRoot);
    }

    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it("should call onClose when pressing the Escape key", () => {
    renderComponent({
      open: true,
      onClose: mockOnClose,
      children: mockChildren,
    });

    const modalContent = screen.getByTestId("iban-modal-content");

    fireEvent.keyDown(modalContent, { key: "Escape", code: "Escape" });

    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it("should apply custom styles when style prop is provided", () => {
    const customStyle: React.CSSProperties = {
      backgroundColor: "red",
      border: "2px solid black",
      width: 800,
    };

    renderComponent({
      open: true,
      onClose: mockOnClose,
      children: mockChildren,
      style: customStyle,
    });

    const modalContent = screen.getByTestId("iban-modal-content");

    expect(modalContent).toHaveStyle("width: 800px");
    expect(modalContent).not.toHaveStyle("position: absolute");
  });

  it("should apply custom class name to the Modal root element", () => {
    const customClassName = "custom-test-class";

    renderComponent({
      open: true,
      onClose: mockOnClose,
      children: mockChildren,
      className: customClassName,
    });

    const modalRoot = screen
      .getByRole("presentation")
      .closest(".MuiModal-root");

    expect(modalRoot).toHaveClass(customClassName);
  });
});
