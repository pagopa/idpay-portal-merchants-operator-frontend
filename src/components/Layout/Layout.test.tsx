import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import {afterEach, vi } from "vitest";
import Layout from "./Layout";
import ROUTES from "../../routes";
import { useLocation } from "react-router-dom";

vi.mock("../Header/Header", () => ({
  default: () => <div data-testid="header">MockHeader</div>,
}));
vi.mock("../SideMenu/SideMenu", () => ({
  default: ({
    isOpen,
    setIsOpen,
  }: {
    isOpen: boolean;
    setIsOpen: (value: boolean) => void;
  }) => (
    <div data-testid="sidemenu">
      <span>SideMenu is {isOpen ? "open" : "closed"}</span>
      <button onClick={() => setIsOpen(!isOpen)}>Toggle Menu</button>
    </div>
  ),
}));

vi.mock("../Footer/CustomFooter", () => ({
  CustomFooter: () => <div data-testid="footer">MockCustomFooter</div>,
}));

vi.mock("react-router-dom", async (importOriginal) => {
  const actual = await importOriginal<typeof import("react-router-dom")>();
  return {
    ...actual,
    useLocation: vi.fn(),
  };
});

describe("Layout component", () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it("renders header and footer always", () => {
    (useLocation as vi.Mock).mockReturnValue({ pathname: ROUTES.HOME });
    render(
      <Layout>
        <div data-testid="child">ChildContent</div>
      </Layout>
    );
    expect(screen.getByTestId("header")).toBeInTheDocument();
    expect(screen.getByTestId("footer")).toBeInTheDocument();
  });

  it("renders SideMenu when route matches", () => {
    (useLocation as vi.Mock).mockReturnValue({ pathname: ROUTES.PRODUCTS });
    render(
      <Layout>
        <div data-testid="child">ChildContent</div>
      </Layout>
    );
    expect(screen.getByTestId("sidemenu")).toBeInTheDocument();
    expect(screen.getByTestId("child")).toBeInTheDocument();
  });

  it("renders single column layout when route does not match", () => {
    (useLocation as vi.Mock).mockReturnValue({ pathname: "/random" });
    render(
      <Layout>
        <div data-testid="child">ChildContent</div>
      </Layout>
    );
    expect(screen.queryByTestId("sidemenu")).not.toBeInTheDocument();
    expect(screen.getByTestId("child")).toBeInTheDocument();
  });

  it("applies maxWidth=100% for privacy policy and tos routes", () => {
    (useLocation as vi.Mock).mockReturnValue({
      pathname: ROUTES.PRIVACY_POLICY,
    });
    const { rerender } = render(
      <Layout>
        <div data-testid="child">ChildContent</div>
      </Layout>
    );
    const childBox = screen.getByTestId("child").parentElement;
    expect(childBox).toHaveStyle({ maxWidth: "100%" });

    (useLocation as vi.Mock).mockReturnValue({ pathname: ROUTES.TOS });
    rerender(
      <Layout>
        <div data-testid="child">ChildContent</div>
      </Layout>
    );
    const childBox2 = screen.getByTestId("child").parentElement;
    expect(childBox2).toHaveStyle({ maxWidth: "100%" });
  });

  it("should change layout when SideMenu is closed", async () => {
    (useLocation as vi.Mock).mockReturnValue({ pathname: ROUTES.HOME });
    const user = userEvent.setup();
    render(<Layout />);

    const sideMenuContainer = screen.getByTestId("sidemenu").parentElement;
    expect(sideMenuContainer).toHaveStyle("width: 300px");
    expect(screen.getByText("SideMenu is open")).toBeInTheDocument();

    const toggleButton = screen.getByRole("button", { name: /toggle menu/i });
    await user.click(toggleButton);

    expect(sideMenuContainer).toHaveStyle("width: min-content");
    expect(screen.getByText("SideMenu is closed")).toBeInTheDocument();
  });

  it("applies default maxWidth for other non-matching routes", () => {
    (useLocation as vi.Mock).mockReturnValue({ pathname: "/about" });
    render(
      <Layout>
        <div data-testid="child">ChildContent</div>
      </Layout>
    );
    const childBox = screen.getByTestId("child").parentElement;
    expect(childBox).toHaveStyle({ maxWidth: "920px" });
  });
});
