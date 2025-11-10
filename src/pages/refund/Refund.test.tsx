import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import ROUTES from "../../routes";
import Refund from "./Refund";

vi.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (key: string) => {
      const translations: Record<string, string> = {
        "commons.exitBtn": "Esci",
        "pages.refund.title": "title test",
        "pages.refund.subtitle": "subtitle test",
      };
      return translations[key] || key;
    },
  }),
}));

const navigateMock = vi.fn();
vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual<any>("react-router-dom");
  return {
    ...actual,
    useNavigate: () => navigateMock,
  };
});

vi.mock("@pagopa/selfcare-common-frontend/lib", () => ({
  TitleBox: ({ title, subTitle }: any) => (
    <div>
      <h4>{title}</h4>
      <p>{subTitle}</p>
    </div>
  ),
}));

describe("Refund component", () => {
  it("renders title with translations", () => {
    render(<Refund />);

    expect(screen.getByText("Esci")).toBeInTheDocument();
    expect(screen.getAllByText("title test")[0]).toBeInTheDocument();

    expect(
      screen.getByRole("heading", { name: "title test" })
    ).toBeInTheDocument();
  });

  it("calls navigate when back button is clicked", () => {
    render(<Refund />);
    fireEvent.click(screen.getByText("Esci"));

    expect(navigateMock).toHaveBeenCalledWith(ROUTES.BUY_MANAGEMENT);
  });
});
