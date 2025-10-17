import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import AutocompleteComponent from "./AutocompleteComponent";
import { ProductDTO } from "../../api/generated/merchants/ProductDTO";

// mock i18n
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

describe("AutocompleteComponent", () => {
  const onChangeDebounceMock = vi.fn();
  const onChangeMock = vi.fn();

  const mockOptions: ProductDTO[] = [
    { productName: "Option 1" } as ProductDTO,
    { productName: "Option 2" } as ProductDTO,
  ];

  beforeEach(() => {
    vi.useFakeTimers();
    onChangeDebounceMock.mockClear();
    onChangeMock.mockClear();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("should show CircularProgress when input length >= 5", () => {
    render(
      <AutocompleteComponent
        options={[]}
        onChangeDebounce={onChangeDebounceMock}
        value={""}
      />
    );

    const input = screen.getByLabelText("Cerca");
    fireEvent.change(input, { target: { value: "Looooong" } });

    vi.advanceTimersByTime(0);
    expect(screen.getByRole("progressbar")).toBeInTheDocument();
  });

  it("manage inputError showing helperText", () => {
    render(
      <AutocompleteComponent
        options={[]}
        inputError
        onChangeDebounce={onChangeDebounceMock}
      />
    );

    const input = screen.getByLabelText("Cerca");
    expect(input).toHaveAttribute("aria-invalid", "true");
    expect(screen.getByText("Campo obbligatorio")).toBeInTheDocument();
  });

  it("call onChange when an options is selected", () => {
    render(
      <AutocompleteComponent options={mockOptions} onChange={onChangeMock} />
    );

    const input = screen.getByLabelText("Cerca");
    fireEvent.change(input, { target: { value: "Option 1" } });

    fireEvent.keyDown(input, { key: "ArrowDown" });
    fireEvent.keyDown(input, { key: "Enter" });

    expect(onChangeMock).toHaveBeenCalledTimes(1);
    expect(onChangeMock).toHaveBeenCalledWith(mockOptions[0]);
  });
});
