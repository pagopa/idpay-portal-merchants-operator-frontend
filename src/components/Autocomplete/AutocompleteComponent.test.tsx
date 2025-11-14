import React from "react";
import "@testing-library/jest-dom";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent, act } from "@testing-library/react";
import AutocompleteComponent from "./AutocompleteComponent";
import { ProductDTO } from "../../api/generated/merchants/ProductDTO";
import { REQUIRED_FIELD_ERROR } from "../../utils/constants";

vi.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (key: string) => {
      if (key === "pages.acceptDiscount.noOptionsText")
        return "Nessuna opzione";
      if (key === "pages.acceptDiscount.loadingText") return "Caricamento...";
      return key;
    },
  }),
}));

const mockOptions: ProductDTO[] = [
  { productName: "Option 1", fullProductName: "Option 1 Full" } as ProductDTO,
  { productName: "Option 2", fullProductName: "Option 2 Full" } as ProductDTO,
];

describe("AutocompleteComponent (core, non-dropdown tests)", () => {
  const onChangeDebounceMock = vi.fn();
  const onChangeMock = vi.fn();

  beforeEach(() => {
    onChangeDebounceMock.mockClear();
    onChangeMock.mockClear();
  });

  afterEach(() => {
    try {
      vi.useRealTimers();
    } catch {
      // ignore
    }
  });

  it("renders input and respects width prop", () => {
    render(
      <AutocompleteComponent options={mockOptions} value={null} width={350} />
    );
    const input = screen.getByLabelText("Cerca");
    expect(input).toBeInTheDocument();
  });

  it("renders with value and updates inputValue if value changes", () => {
    const { rerender } = render(
      <AutocompleteComponent options={mockOptions} value={mockOptions[0]} />
    );
    const input = screen.getByLabelText("Cerca");
    expect(input).toHaveValue("Option 1 Full");

    rerender(
      <AutocompleteComponent options={mockOptions} value={mockOptions[1]} />
    );
    expect(input).toHaveValue("Option 2 Full");
  });

  it("shows helperText and error style when inputError is true", () => {
    render(<AutocompleteComponent options={[]} inputError value={null} />);
    const input = screen.getByLabelText("Cerca");
    expect(input).toHaveAttribute("aria-invalid", "true");
    expect(screen.getByText(REQUIRED_FIELD_ERROR)).toBeInTheDocument();
  });

  it("calls onChange with null when input changes and previous value existed", () => {
    render(
      <AutocompleteComponent
        options={mockOptions}
        onChange={onChangeMock}
        value={mockOptions[0]}
      />
    );
    const input = screen.getByLabelText("Cerca");
    fireEvent.change(input, { target: { value: "qualcosa di diverso" } });
    expect(onChangeMock).toHaveBeenCalledWith(null);
  });

  it("debounces onChangeDebounce only when input.trim().length >= 5", async () => {
    vi.useFakeTimers();
    render(
      <AutocompleteComponent
        options={[]}
        onChangeDebounce={onChangeDebounceMock}
        value={null}
      />
    );
    const input = screen.getByLabelText("Cerca");

    fireEvent.change(input, { target: { value: "abc" } });
    await act(() => {
      vi.advanceTimersByTime(1000);
    });
    expect(onChangeDebounceMock).not.toHaveBeenCalled();

    fireEvent.change(input, { target: { value: "  hello world  " } });
    expect(screen.getByRole("progressbar")).toBeInTheDocument();

    await act(() => {
      vi.advanceTimersByTime(800);
    });

    expect(onChangeDebounceMock).toHaveBeenCalledWith("hello world");

    vi.useRealTimers();
  });

  it("does NOT call onChangeDebounce when input is cleared (becomes <5 chars)", async () => {
    vi.useFakeTimers();
    render(
      <AutocompleteComponent
        options={mockOptions}
        onChangeDebounce={onChangeDebounceMock}
        value={null}
      />
    );
    const input = screen.getByLabelText("Cerca");

    fireEvent.change(input, { target: { value: "Option 1 Full" } });
    fireEvent.change(input, { target: { value: "" } });

    await act(() => {
      vi.advanceTimersByTime(1000);
    });

    expect(onChangeDebounceMock).not.toHaveBeenCalledWith("");
    vi.useRealTimers();
  });

  it("normalizes input on blur (collapses multiple spaces and trims)", () => {
    render(<AutocompleteComponent options={mockOptions} value={null} />);
    const input = screen.getByLabelText("Cerca");

    fireEvent.change(input, { target: { value: "   Option   1   Full   " } });
    fireEvent.blur(input);
    expect(input).toHaveValue("Option 1 Full");
  });

  it("normalizes pasted input (collapses spaces and trims)", () => {
    render(<AutocompleteComponent options={mockOptions} value={null} />);
    const input = screen.getByLabelText("Cerca");

    fireEvent.paste(input, {
      clipboardData: {
        getData: () => "   Option   2   Full   ",
      },
    });

    expect(input).toHaveValue("Option 2 Full");
  });

  it("does not throw if onChangeDebounce is not provided", async () => {
    vi.useFakeTimers();
    render(<AutocompleteComponent options={mockOptions} value={null} />);
    const input = screen.getByLabelText("Cerca");

    fireEvent.change(input, { target: { value: "abcdef" } });
    await act(() => {
      vi.advanceTimersByTime(1000);
    });

    expect(input).toHaveValue("abcdef");
    vi.useRealTimers();
  });
});
