import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import Reverse from "./Reverse";
import ROUTES from "../../routes";

vi.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (key: string) => {
      const translations: Record<string, string> = {
        "commons.exitBtn": "Esci",
        "pages.reverse.title": "Storna transazione",
        "pages.reverse.subtitle": "Sottotitolo storno",
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

vi.mock("../../components/BreadcrumbsBox/BreadcrumbsBox", () => ({
  default: ({ backLabel, items, onClickBackButton }: any) => (
    <div>
      <span>{backLabel}</span>
      <button onClick={onClickBackButton}>Back</button>
      {items.map((item: string) => (
        <span key={item}>{item}</span>
      ))}
    </div>
  ),
}));

vi.mock("@pagopa/selfcare-common-frontend/lib", () => ({
  TitleBox: ({ title, subTitle }: any) => (
    <div>
      <h4>{title}</h4>
      <p>{subTitle}</p>
    </div>
  ),
}));

describe("Reverse component", () => {
  it("renders breadcrumbs and title with translations", () => {
    render(<Reverse />);

    expect(screen.getByText("Esci")).toBeInTheDocument();
    expect(screen.getByText("Gestione acquisti")).toBeInTheDocument();
    expect(screen.getAllByText("Storna transazione")[0]).toBeInTheDocument();

    expect(
      screen.getByRole("heading", { name: "Storna transazione" })
    ).toBeInTheDocument();
    expect(screen.getByText("Sottotitolo storno")).toBeInTheDocument();
  });

  it("calls navigate when back button is clicked", () => {
    render(<Reverse />);
    fireEvent.click(screen.getByText("Back"));

    expect(navigateMock).toHaveBeenCalledWith(ROUTES.BUY_MANAGEMENT);
  });
});
