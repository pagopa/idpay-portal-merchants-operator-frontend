import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import FiltersForm from "./FiltersForm";

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
    isSubmitting: false
  };

  it("renders Apply and Reset buttons with translated text", () => {
    render(<FiltersForm formik={mockFormik as any} />);

    expect(screen.getByTestId("apply-filters-test")).toBeInTheDocument();
    expect(screen.getByTestId("reset-filters-test")).toBeInTheDocument();

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
      <FiltersForm formik={mockFormik as any} onFiltersApplied={onFiltersApplied} filtersApplied={true}/>
    );

    fireEvent.click(screen.getByTestId("apply-filters-test"));

    expect(onFiltersApplied).toHaveBeenCalledWith(mockFormik.values);
    expect(onFiltersApplied).toHaveBeenCalled();
  });

  it("calls formik.resetForm and onFiltersReset when Reset button is clicked", () => {
    const onFiltersReset = vi.fn();

    render(
      <FiltersForm formik={mockFormik as any} onFiltersReset={onFiltersReset} filtersApplied={true}/>
    );

    fireEvent.click(screen.getByTestId("reset-filters-test"));

    expect(mockFormik.resetForm).toHaveBeenCalled();
    expect(onFiltersReset).toHaveBeenCalled();
  });

  it("clones children with formik props", () => {
    const childChange = vi.fn();
    const childBlur = vi.fn();
    const ChildInput = (props: any) => (
      <input data-testid="child-input" {...props} />
    );

    render(
      <FiltersForm formik={mockFormik as any}>
        <ChildInput name="name" onChange={childChange} onBlur={childBlur} />
      </FiltersForm>
    );

    const input = screen.getByTestId("child-input");

    expect(input).toHaveValue("Mario");

    fireEvent.change(input, { target: { name: "name", value: "Luigi" } });
    expect(mockFormik.handleChange).toHaveBeenCalled();

    fireEvent.blur(input);
    expect(mockFormik.handleBlur).toHaveBeenCalled();
  });
  it("return child", () => {
    const ChildInput = (props: any) => (
      <input data-testid="child-input" {...props} />
    );

    render(
      <FiltersForm formik={mockFormik as any}>
        <ChildInput />
      </FiltersForm>
    );
    expect(screen.getByTestId("child-input")).toBeInTheDocument();
    
  });
  it("return empty field", () => {
    const ChildInput = (props: any) => (
      <input data-testid="child-input" {...props} />
    );

    render(
      <FiltersForm formik={mockFormik as any}>
        <ChildInput name="test" />
      </FiltersForm>
    );
    expect(screen.getByTestId("child-input")).toHaveValue("");
    
  });
});
