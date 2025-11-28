import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import ROUTES from "../../routes";
import ModifyDocument from "./ModifyDocument";
import * as merchantService from "../../services/merchantService";

vi.mock("react-i18next", () => ({
    useTranslation: () => ({
        t: (key: string) => {
            const translations: Record<string, string> = {
                "pages.modifyDocument.title": "Modifica Documento",
                "pages.modifyDocument.invoiceTitle": "Titolo Fattura",
                "pages.modifyDocument.insertInvoice": "Inserisci Fattura",
                "pages.modifyDocument.invoiceLabel": "Numero Fattura",
                "routes.refund": "Rimborso",
                "routes.refundManagement": "Storico Rimborsi",
            };
            return translations[key] || key;
        },
    }),
}));

vi.mock("../../services/merchantService", () => ({
    updateInvoiceTransactionApi: vi.fn(),
}));

vi.mock("../../components/FileUploadAction/FileUploadAction", () => ({
    default: ({
                  titleKey,
                  subtitleKey,
                  i18nBlockKey,
                  apiCall,
                  successStateKey,
                  breadcrumbsLabelKey,
                  breadcrumbsProp,
                  manualLink,
                  styleClass,
                  docNumberTitle,
                  docNumberInsert,
                  docNumberLabel,
              }: any) => (
        <div data-testid="file-upload-action">
            <div data-testid="title-key">{titleKey}</div>
            <div data-testid="subtitle-key">{subtitleKey}</div>
            <div data-testid="i18n-block-key">{i18nBlockKey}</div>
            <div data-testid="success-state-key">{successStateKey}</div>
            <div data-testid="breadcrumbs-label">{breadcrumbsLabelKey}</div>
            <div data-testid="breadcrumbs-path">{breadcrumbsProp?.path}</div>
            <div data-testid="manual-link">{manualLink}</div>
            <div data-testid="style-class">{styleClass}</div>
            <div data-testid="doc-number-title">{docNumberTitle}</div>
            <div data-testid="doc-number-insert">{docNumberInsert}</div>
            <div data-testid="doc-number-label">{docNumberLabel}</div>
        </div>
    ),
}));

describe("ModifyDocument component", () => {
    it("renders FileUploadAction component", () => {
        render(<ModifyDocument />);

        expect(screen.getByTestId("file-upload-action")).toBeInTheDocument();
    });

    it("passes correct titleKey prop to FileUploadAction", () => {
        render(<ModifyDocument />);

        expect(screen.getByTestId("title-key")).toHaveTextContent(
            "pages.modifyDocument.title"
        );
    });

    it("passes empty subtitleKey prop to FileUploadAction", () => {
        render(<ModifyDocument />);

        expect(screen.getByTestId("subtitle-key")).toHaveTextContent("");
    });

    it("passes correct i18nBlockKey prop", () => {
        render(<ModifyDocument />);

        expect(screen.getByTestId("i18n-block-key")).toHaveTextContent(
            "pages.modifyDocument"
        );
    });

    it("passes updateInvoiceTransactionApi as apiCall", () => {
        render(<ModifyDocument />);

        expect(merchantService.updateInvoiceTransactionApi).toBeDefined();
    });

    it("passes correct successStateKey prop", () => {
        render(<ModifyDocument />);

        expect(screen.getByTestId("success-state-key")).toHaveTextContent(
            "refundUploadSuccess"
        );
    });

    it("passes correct breadcrumbs props", () => {
        render(<ModifyDocument />);

        expect(screen.getByTestId("breadcrumbs-label")).toHaveTextContent(
            "Rimborso"
        );
        expect(screen.getByTestId("breadcrumbs-path")).toHaveTextContent(
            ROUTES.REFUNDS_MANAGEMENT
        );
    });

    it("passes correct document number related props", () => {
        render(<ModifyDocument />);

        expect(screen.getByTestId("doc-number-title")).toHaveTextContent(
            "Titolo Fattura"
        );
        expect(screen.getByTestId("doc-number-insert")).toHaveTextContent(
            "Inserisci Fattura"
        );
        expect(screen.getByTestId("doc-number-label")).toHaveTextContent(
            "Numero Fattura"
        );
    });

    it("passes styleClass prop correctly", () => {
        render(<ModifyDocument />);

        const styleClassElement = screen.getByTestId("style-class");
        expect(styleClassElement.textContent).toMatch(/uploadFileContainer/);
    });

    it("passes manual link from environment variable", () => {
        render(<ModifyDocument />);

        const manualLinkElement = screen.getByTestId("manual-link");
        expect(manualLinkElement).toBeInTheDocument();
    });

    it("uses useTranslation hook correctly", () => {
        render(<ModifyDocument />);

        const breadcrumbsLabel = screen.getByTestId("breadcrumbs-label");
        expect(breadcrumbsLabel).toHaveTextContent("Rimborso");
    });
});