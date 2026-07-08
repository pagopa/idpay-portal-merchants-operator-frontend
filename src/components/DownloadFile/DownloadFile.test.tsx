import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import React from "react";
import { DownloadFile } from "./DownloadFile";
import { MISSING_DATA_PLACEHOLDER } from "../../utils/constants";

describe("DownloadFile component", () => {
  it("should correctly render component with text, icon and handle click events", () => {
    const props = {
      isLoading: false,
      onClick: vi.fn(),
      text: "test download",
      icon: <span data-testid="custom-icon">📁</span>
    };

    render(<DownloadFile {...props} />);

    const linkText = screen.getByText("test download");
    expect(linkText).toBeInTheDocument();

    expect(screen.getByTestId("custom-icon")).toBeInTheDocument();

    const btn = screen.getByTestId("btn-test");
    fireEvent.click(btn);
    expect(props.onClick).toHaveBeenCalledTimes(1);
  });

  it("should show loader when isLoading is true and text is provided", () => {
    const props = {
      isLoading: true,
      onClick: vi.fn(),
      text: "test download"
    };

    render(<DownloadFile {...props} />);

    expect(screen.getByTestId("item-loader")).toBeInTheDocument();
    expect(screen.queryByText("test download")).not.toBeInTheDocument();
  });

  it("should correctly render missing data placeholder when text is not provided", () => {
    const props = {
      isLoading: false,
      onClick: vi.fn(),
      text: undefined,
      tooltip: true
    };

    render(<DownloadFile {...props} />);

    expect(screen.getByText(MISSING_DATA_PLACEHOLDER)).toBeInTheDocument();
    expect(screen.queryByTestId("btn-test")).not.toBeInTheDocument();
  });
});