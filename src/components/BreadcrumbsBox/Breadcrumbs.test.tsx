import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import BreadcrumbsBox from "./BreadcrumbsBox";
import { BrowserRouter } from "react-router-dom";

// mock useNavigate
const mockNavigate = vi.fn();
vi.mock("react-router-dom", async () => {
  const actual: any = await vi.importActual("react-router-dom");
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

describe("BreadcrumbsBox", () => {
  beforeEach(() => {
    mockNavigate.mockClear();
  });

  const items = [
    { label: "Home", path: "Home" },
    { label: "Page 1", path: "Page 1" },
    { label: "Page 2", path: "Page 2" },
  ];

  it("renderizza correttamente le voci dei breadcrumb e il back button", () => {
    render(
      <BrowserRouter>
        <BreadcrumbsBox backLabel="Indietro" items={items} active />
      </BrowserRouter>
    );

    // verifica back button
    expect(screen.getByTestId("back-btn-test")).toHaveTextContent("Indietro");

    // verifica breadcrumb
    items.forEach((item) => {
      expect(screen.getByText(item.label)).toBeInTheDocument();
    });
  });

  it("chiama onClickBackButton se fornito", () => {
    const onClickMock = vi.fn();

    render(
      <BrowserRouter>
        <BreadcrumbsBox
          backLabel="Indietro"
          items={items}
          active
          onClickBackButton={onClickMock}
        />
      </BrowserRouter>
    );

    const backButton = screen.getByTestId("back-btn-test");
    fireEvent.click(backButton);

    expect(onClickMock).toHaveBeenCalledTimes(1);
    expect(mockNavigate).not.toHaveBeenCalled();
  });

  it("chiama navigate con backButtonPath se onClickBackButton non fornito", () => {
    render(
      <BrowserRouter>
        <BreadcrumbsBox
          backLabel="Indietro"
          items={items}
          active
          backButtonPath="/test-path"
        />
      </BrowserRouter>
    );

    const backButton = screen.getByTestId("back-btn-test");
    fireEvent.click(backButton);

    expect(mockNavigate).toHaveBeenCalledWith("/test-path");
  });

  it("chiama navigate(-1) se nessuna callback o path", () => {
    render(
      <BrowserRouter>
        <BreadcrumbsBox backLabel="Indietro" items={items} active />
      </BrowserRouter>
    );

    const backButton = screen.getByTestId("back-btn-test");
    fireEvent.click(backButton);

    expect(mockNavigate).toHaveBeenCalledWith(-1);
  });

  it("non fa nulla se active è false", () => {
    const onClickMock = vi.fn();

    render(
      <BrowserRouter>
        <BreadcrumbsBox
          backLabel="Indietro"
          items={items}
          active={false}
          onClickBackButton={onClickMock}
        />
      </BrowserRouter>
    );

    const backButton = screen.getByTestId("back-btn-test");
    fireEvent.click(backButton);

    expect(onClickMock).not.toHaveBeenCalled();
    expect(mockNavigate).not.toHaveBeenCalled();
  });

  it("naviga al percorso corretto quando si clicca su una voce intermedia del breadcrumb", () => {
    render(
      <BrowserRouter>
        <BreadcrumbsBox backLabel="Indietro" items={items} active />
      </BrowserRouter>
    );

    // Trova e clicca sulla seconda voce del breadcrumb ("Page 1")
    const breadcrumbItem = screen.getByText("Page 1");
    fireEvent.click(breadcrumbItem);

    // Verifica che la navigazione sia stata chiamata con il path corretto
    expect(mockNavigate).toHaveBeenCalledTimes(1);
    expect(mockNavigate).toHaveBeenCalledWith("Page 1");
  });

  it("non naviga quando si clicca sull'ultima voce del breadcrumb", () => {
    render(
      <BrowserRouter>
        <BreadcrumbsBox backLabel="Indietro" items={items} active />
      </BrowserRouter>
    );

    // Trova e clicca sull'ultima voce ("Page 2")
    const lastBreadcrumbItem = screen.getByText("Page 2");
    fireEvent.click(lastBreadcrumbItem);

    // Verifica che la navigazione NON sia stata chiamata
    expect(mockNavigate).not.toHaveBeenCalled();
  });
});
