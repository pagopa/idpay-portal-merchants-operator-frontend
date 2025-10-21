import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach, afterAll } from "vitest";
import { CustomFooter } from "./CustomFooter";
import { FooterPostLogin, FooterLegal } from "@pagopa/mui-italia";
import { useTranslation } from "react-i18next";
import { CONFIG } from "@pagopa/selfcare-common-frontend/lib/config/env";

vi.mock("@pagopa/mui-italia", () => ({
  FooterPostLogin: vi.fn(() => <div data-testid="footer-postlogin"></div>),
  FooterLegal: vi.fn(() => <div data-testid="footer-legal"></div>),
}));

vi.mock("react-i18next", () => ({
  useTranslation: vi.fn(),
  Trans: ({ children }: any) => <>{children}</>,
}));

vi.mock("@pagopa/selfcare-common-frontend/lib/config/env", () => ({
  CONFIG: {
    FOOTER: {
      LINK: {
        PAGOPALINK: "https://www.pagopa.it/it/",
      },
    },
  },
}));

vi.stubEnv("VITE_PROTECTIONOFPERSONALDATA", "https://privacy.example.com");
vi.stubEnv("VITE_ACCESSIBILITY", "https://accessibility.example.com");

const windowOpenSpy = vi.spyOn(window, "open").mockImplementation(() => ({
  focus: vi.fn(),
}) as any);

beforeEach(() => {
  vi.clearAllMocks();
  (useTranslation as any).mockReturnValue({
    t: (key: string) => key,
  });
});

describe("CustomFooter Component - Rendering", () => {
  it("should render FooterPostLogin and FooterLegal", () => {
    render(<CustomFooter />);

    expect(screen.getByTestId("footer-postlogin")).toBeInTheDocument();
    expect(screen.getByTestId("footer-legal")).toBeInTheDocument();
  });

  it("should render the legal info text inside FooterLegal", async () => {
    (FooterLegal as any).mockImplementationOnce(({ content }: any) => (
        <div data-testid="footer-legal">{content}</div>
    ));

    render(<CustomFooter />);

    const footerLegal = screen.getByTestId("footer-legal");
    expect(footerLegal).toHaveTextContent("PagoPA S.p.A.");
    expect(footerLegal).toHaveTextContent("Registro Imprese di Roma");
  });
});

describe("CustomFooter Component - Link Behavior", () => {
  it("should open external link when clicking PagoPA link", async () => {
    let companyProps: any = {};
    (FooterPostLogin as any).mockImplementationOnce((props: any) => {
      companyProps = props;
      return <div data-testid="footer-postlogin"></div>;
    });

    render(<CustomFooter />);

    await waitFor(() => {
      expect(companyProps.companyLink.href).toBe("https://www.pagopa.it/it/");
    });

    companyProps.companyLink.onClick();
    expect(windowOpenSpy).toHaveBeenCalledWith(
        "https://www.pagopa.it/it/",
        "_blank"
    );
  });

  it("should open external links from post-login links", async () => {
    let links: any[] = [];
    (FooterPostLogin as any).mockImplementationOnce((props: any) => {
      links = props.links;
      return <div data-testid="footer-postlogin"></div>;
    });

    render(<CustomFooter />);

    await waitFor(() => {
      expect(links.length).toBeGreaterThan(0);
    });

    links.forEach((link) => {
      link.onClick();
      expect(windowOpenSpy).toHaveBeenCalledWith(
          expect.stringMatching(/^https?:\/\//),
          "_blank"
      );
    });
  });
});

describe("CustomFooter Component - i18n integration", () => {
  it("should call useTranslation and translate labels", async () => {
    render(<CustomFooter />);

    expect(useTranslation).toHaveBeenCalled();

    await waitFor(() => {
      expect(screen.getByTestId("footer-postlogin")).toBeInTheDocument();
    });
  });
});

afterAll(() => {
  windowOpenSpy.mockRestore();
});
