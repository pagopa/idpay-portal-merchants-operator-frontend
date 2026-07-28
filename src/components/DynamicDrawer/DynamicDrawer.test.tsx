import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import React from "react";
import DynamicDrawer from "./DynamicDrawer";
import { normalizeObj } from "../../utils/helpers";

vi.mock("../../hooks/useScopedTranslation", () => ({
  useScopedTranslation: () => ({
    t: vi.fn((key) => `translated_${key}`)
  })
}));

vi.mock("../../utils/renderFields", () => ({
  renderFields: () => ({
    text: (params: any) => <div data-testid={`cell-text-${params.row.id}`}>{params.value}</div>,
    number: (params: any) => <div data-testid={`cell-number-${params.row.id}`}>{params.value}</div>
  })
}));

vi.mock("../../utils/helpers", () => ({
  normalizeObj: vi.fn((obj) => obj)
}));

vi.mock("@pagopa/mui-italia", () => ({
  theme: {
    palette: {
      text: { primary: "#000", secondary: "#666" },
      background: { paper: "#fff" }
    },
    typography: {
      fontWeightBold: 700,
      fontWeightRegular: 400
    }
  }
}));

describe("DynamicDrawer Component", () => {
  const mockSetIsOpen = vi.fn();

  const defaultProps = {
    isOpen: true,
    setIsOpen: mockSetIsOpen,
    title: "Drawer Title",
    fieldsDef: [],
    fieldsValues: { id: "1" }
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should render the drawer with correct title", () => {
    render(<DynamicDrawer {...defaultProps} />);
    
    expect(screen.getByText("Drawer Title")).toBeInTheDocument();
  });

  it("should render the subtitle in uppercase if provided", () => {
    render(<DynamicDrawer {...defaultProps} subtitle="Sub Title" />);
    
    expect(screen.getByText("SUB TITLE")).toBeInTheDocument();
  });

  it("should call setIsOpen when close button is clicked", () => {
    render(<DynamicDrawer {...defaultProps} />);
    
    const closeButton = screen.getByTestId("close-button");
    fireEvent.click(closeButton);
    
    expect(mockSetIsOpen).toHaveBeenCalledTimes(1);
  });

  it("should render dynamic fields using renderFields and mapped translations", () => {
    const fieldsDef = [
      { field: "firstName", headerName: "nameKey", cell: { type: "text" } },
      { field: "age", headerName: "ageKey", cell: { type: "number" } }
    ];
    const fieldsValues = { id: "1", firstName: "John", age: "30" };

    render(<DynamicDrawer {...defaultProps} fieldsDef={fieldsDef as any} fieldsValues={fieldsValues} />);

    expect(screen.getByText("translated_nameKey")).toBeInTheDocument();
    expect(screen.getByTestId("cell-text-1")).toHaveTextContent("John");

    expect(screen.getByText("translated_ageKey")).toBeInTheDocument();
    expect(screen.getByTestId("cell-number-1")).toHaveTextContent("30");
  });

  it("should render buttons and handle their click events", () => {
    const mockButtonClick = vi.fn();
    const buttons = [
      { title: "Confirm", onClick: mockButtonClick, dataTestId: "confirm-btn" },
      { title: "Cancel", "data-testid": "cancel-btn" } as any
    ];

    render(<DynamicDrawer {...defaultProps} buttons={buttons} />);

    const confirmBtn = screen.getByText("Confirm");
    const cancelBtn = screen.getByText("Cancel");

    expect(confirmBtn).toBeInTheDocument();
    expect(confirmBtn).toHaveTextContent("Confirm");
    expect(cancelBtn).toBeInTheDocument();
    expect(cancelBtn).toHaveTextContent("Cancel");

    fireEvent.click(confirmBtn);
    expect(mockButtonClick).toHaveBeenCalledTimes(1);
  });

  it("should not render the buttons box if buttons array is empty", () => {
    render(<DynamicDrawer {...defaultProps} buttons={[]} />);
    
    expect(screen.queryByTestId("buttons-box")).not.toBeInTheDocument();
  });
});