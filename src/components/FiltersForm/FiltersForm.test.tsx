import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import FiltersForm from "./FiltersForm";
import React from "react";

vi.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (key: string) =>
      ({
        "commons.filterBtn": "Apply Filters",
        "commons.removeFiltersBtn": "Reset Filters",
      }[key] || key),
  }),
}));

describe("FiltersForm", () => {
  const mockFormik = {
    values: { name: "Mario" },
    handleChange: vi.fn(),
    handleBlur: vi.fn(),
    resetForm: vi.fn(),
    isSubmitting: false,
  };

  it("renders Apply and Reset buttons with translated text", () => {
    render(<FiltersForm formik={mockFormik as any} />);

    expect(screen.getByTestId("apply-filters-test")).toHaveTextContent(
      "Apply Filters"
    );
    expect(screen.getByTestId("reset-filters-test")).toHaveTextContent(
      "Reset Filters"
    );
  });

  it("calls onFiltersApplied when Apply button is clicked", () => {
    const onFiltersApplied = vi.fn();

    render(
      <FiltersForm formik={mockFormik as any} onFiltersApplied={onFiltersApplied} />
    );

    fireEvent.click(screen.getByTestId("apply-filters-test"));

    expect(onFiltersApplied).toHaveBeenCalledWith(mockFormik.values);
  });

  it("calls formik.resetForm and onFiltersReset when Reset button is clicked", () => {
    const onFiltersReset = vi.fn();

    render(
      <FiltersForm formik={mockFormik as any} onFiltersReset={onFiltersReset} />
    );

    fireEvent.click(screen.getByTestId("reset-filters-test"));

    expect(mockFormik.resetForm).toHaveBeenCalled();
    expect(onFiltersReset).toHaveBeenCalled();
  });

  it("clones children with formik props", () => {
    const ChildInput = (props: any) => (
      <input data-testid="child-input" {...props} />
    );

    render(
      <FiltersForm formik={mockFormik as any}>
        <ChildInput name="name" />
      </FiltersForm>
    );

    const input = screen.getByTestId("child-input");

    expect(input).toHaveValue("Mario");

    fireEvent.change(input, { target: { name: "name", value: "Luigi" } });
    expect(mockFormik.handleChange).toHaveBeenCalled();

    fireEvent.blur(input);
    expect(mockFormik.handleBlur).toHaveBeenCalled();
  });
});
