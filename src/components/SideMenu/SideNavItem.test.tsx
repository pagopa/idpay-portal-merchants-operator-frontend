import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import SideNavItem from "./SideNavItem";
import HomeIcon from "@mui/icons-material/Home";

describe("SideNavItem", () => {
  it("renders title and icon", () => {
    render(
      <SideNavItem
        handleClick={() => {}}
        title="Dashboard"
        icon={HomeIcon}
        level={2}
      />
    );

    expect(screen.getByText("Dashboard")).toBeInTheDocument();
    expect(screen.getByTestId("HomeIcon")).toBeInTheDocument();
  });

  it("calls handleClick when clicked", () => {
    const handleClick = vi.fn();
    render(
      <SideNavItem
        handleClick={handleClick}
        title="Clickable"
        icon={HomeIcon}
        level={1}
      />
    );

    fireEvent.click(screen.getByRole("button"));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it("applies selected state", () => {
    render(
      <SideNavItem
        handleClick={() => {}}
        title="Selected item"
        icon={HomeIcon}
        level={1}
        isSelected
      />
    );

    const button = screen.getByRole("button");
    fireEvent.click(button);
    expect(button).toHaveClass("Mui-selected");
  });
});
