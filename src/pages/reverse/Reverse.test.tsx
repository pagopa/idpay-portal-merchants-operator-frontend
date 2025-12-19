import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import Reverse from "./Reverse";
import {
  reverseTransactionApi,
  reverseInvoicedTransactionApi,
} from "../../services/merchantService";
import ROUTES from "../../routes";

vi.mock("react-router-dom", () => ({
  useLocation: vi.fn(),
}));

vi.mock("react-i18next", () => ({
  useTranslation: vi.fn(),
}));

vi.mock("../../services/merchantService", () => ({
  reverseTransactionApi: vi.fn(function reverseTransactionApi() {
    return "reverseTransactionApi";
  }),
  reverseInvoicedTransactionApi: vi.fn(function reverseInvoicedTransactionApi() {
    return "reverseInvoicedTransactionApi";
  }),
}));

vi.mock("./reverse.module.css", () => ({
  default: {
    uploadFileContainer: "uploadFileContainer",
  },
}));

vi.mock("../../components/FileUploadAction/FileUploadAction", () => ({
  default: vi.fn((props) => (
      <div data-testid="file-upload-action">
        <div data-testid="title-key">{props.titleKey}</div>
        <div data-testid="subtitle-key">{props.subtitleKey}</div>
        <div data-testid="i18n-block-key">{props.i18nBlockKey}</div>
        <div data-testid="api-call">{props.apiCall?.name || 'unknown'}</div>
        <div data-testid="success-state-key">{props.successStateKey}</div>
        <div data-testid="breadcrumbs-label-key">{props.breadcrumbsLabelKey}</div>
        <div data-testid="breadcrumb-path">{props.breadcrumbsProp?.path}</div>
        <div data-testid="breadcrumb-label">{props.breadcrumbsProp?.label}</div>
        <div data-testid="manual-link">{props.manualLink}</div>
        <div data-testid="style-class">{props.styleClass}</div>
        <div data-testid="doc-number-title">{props.docNumberTitle}</div>
        <div data-testid="doc-number-insert">{props.docNumberInsert}</div>
        <div data-testid="doc-number-label">{props.docNumberLabel}</div>
      </div>
  )),
}));

describe("Reverse Component", () => {
  const mockT = vi.fn((key) => `translated_${key}`);

  beforeEach(() => {
    vi.clearAllMocks();
    useTranslation.mockReturnValue({ t: mockT });
    import.meta.env.VITE_MANUAL_LINK = "https://manual.example.com";
  });

  describe("Context Resolution - breadcrumbsProp path", () => {
    it("should use reverseInvoicedTransactionApi when breadcrumbsProp.path is REFUNDS_MANAGEMENT", () => {
      useLocation.mockReturnValue({
        state: {
          breadcrumbsProp: {
            path: ROUTES.REFUNDS_MANAGEMENT,
            label: "Refund Management",
          },
        },
      });

      render(<Reverse />);

      expect(screen.getByTestId("breadcrumb-path")).toHaveTextContent(
          ROUTES.REFUNDS_MANAGEMENT
      );
      expect(screen.getByTestId("breadcrumb-label")).toHaveTextContent(
          "Refund Management"
      );
      expect(screen.getByTestId("api-call")).toHaveTextContent(
          "reverseInvoicedTransactionApi"
      );
    });

    it("should use reverseTransactionApi when breadcrumbsProp.path is BUY_MANAGEMENT", () => {
      useLocation.mockReturnValue({
        state: {
          breadcrumbsProp: {
            path: ROUTES.BUY_MANAGEMENT,
            label: "Buy Management",
          },
        },
      });

      render(<Reverse />);

      expect(screen.getByTestId("breadcrumb-path")).toHaveTextContent(
          ROUTES.BUY_MANAGEMENT
      );
      expect(screen.getByTestId("breadcrumb-label")).toHaveTextContent(
          "Buy Management"
      );
      expect(screen.getByTestId("api-call")).toHaveTextContent(
          "reverseTransactionApi"
      );
    });

    it("should fallback to reverseTransactionApi when breadcrumbsProp.path is unknown", () => {
      useLocation.mockReturnValue({
        state: {
          breadcrumbsProp: {
            path: "/unknown-route",
            label: "Unknown",
          },
        },
      });

      render(<Reverse />);

      expect(screen.getByTestId("breadcrumb-path")).toHaveTextContent(
          "/unknown-route"
      );
      expect(screen.getByTestId("api-call")).toHaveTextContent(
          "reverseTransactionApi"
      );
    });
  });

  describe("Context Resolution - backTo state", () => {
    it("should use reverseInvoicedTransactionApi when backTo is REFUNDS_MANAGEMENT", () => {
      useLocation.mockReturnValue({
        state: {
          backTo: ROUTES.REFUNDS_MANAGEMENT,
        },
      });

      render(<Reverse />);

      expect(mockT).toHaveBeenCalledWith("routes.refundManagement");
      expect(screen.getByTestId("breadcrumb-path")).toHaveTextContent(
          ROUTES.REFUNDS_MANAGEMENT
      );
      expect(screen.getByTestId("breadcrumb-label")).toHaveTextContent(
          "translated_routes.refundManagement"
      );
      expect(screen.getByTestId("api-call")).toHaveTextContent(
          "reverseInvoicedTransactionApi"
      );
    });

    it("should use reverseTransactionApi when backTo is BUY_MANAGEMENT", () => {
      useLocation.mockReturnValue({
        state: {
          backTo: ROUTES.BUY_MANAGEMENT,
        },
      });

      render(<Reverse />);

      expect(mockT).toHaveBeenCalledWith("routes.buyManagement");
      expect(screen.getByTestId("breadcrumb-path")).toHaveTextContent(
          ROUTES.BUY_MANAGEMENT
      );
      expect(screen.getByTestId("breadcrumb-label")).toHaveTextContent(
          "translated_routes.buyManagement"
      );
      expect(screen.getByTestId("api-call")).toHaveTextContent(
          "reverseTransactionApi"
      );
    });

    it("should use default context when backTo is unknown route", () => {
      useLocation.mockReturnValue({
        state: {
          backTo: "/unknown-route",
        },
      });

      render(<Reverse />);

      expect(mockT).toHaveBeenCalledWith("routes.buyManagement");
      expect(screen.getByTestId("breadcrumb-path")).toHaveTextContent(
          ROUTES.BUY_MANAGEMENT
      );
      expect(screen.getByTestId("api-call")).toHaveTextContent(
          "reverseTransactionApi"
      );
    });
  });

  describe("Context Resolution - default fallback", () => {
    it("should use default BUY_MANAGEMENT context when no state is provided", () => {
      useLocation.mockReturnValue({
        state: null,
      });

      render(<Reverse />);

      expect(mockT).toHaveBeenCalledWith("routes.buyManagement");
      expect(screen.getByTestId("breadcrumb-path")).toHaveTextContent(
          ROUTES.BUY_MANAGEMENT
      );
      expect(screen.getByTestId("api-call")).toHaveTextContent(
          "reverseTransactionApi"
      );
    });

    it("should use default BUY_MANAGEMENT context when state is empty object", () => {
      useLocation.mockReturnValue({
        state: {},
      });

      render(<Reverse />);

      expect(mockT).toHaveBeenCalledWith("routes.buyManagement");
      expect(screen.getByTestId("breadcrumb-path")).toHaveTextContent(
          ROUTES.BUY_MANAGEMENT
      );
      expect(screen.getByTestId("api-call")).toHaveTextContent(
          "reverseTransactionApi"
      );
    });

    it("should use default context when location has no pathname", () => {
      useLocation.mockReturnValue({});

      render(<Reverse />);

      expect(screen.getByTestId("api-call")).toHaveTextContent(
          "reverseTransactionApi"
      );
    });
  });

  describe("FileUploadAction Props", () => {
    beforeEach(() => {
      useLocation.mockReturnValue({
        state: {
          breadcrumbsProp: {
            path: ROUTES.BUY_MANAGEMENT,
            label: "Buy Management",
          },
        },
      });
    });

    it("should pass correct static props to FileUploadAction", () => {
      render(<Reverse />);

      expect(screen.getByTestId("title-key")).toHaveTextContent(
          "pages.reverse.title"
      );
      expect(screen.getByTestId("subtitle-key")).toHaveTextContent(
          "pages.reverse.subtitle"
      );
      expect(screen.getByTestId("i18n-block-key")).toHaveTextContent(
          "pages.reverse"
      );
      expect(screen.getByTestId("success-state-key")).toHaveTextContent(
          "reverseUploadSuccess"
      );
    });

    it("should pass translated props to FileUploadAction", () => {
      render(<Reverse />);

      expect(mockT).toHaveBeenCalledWith("routes.reverse");
      expect(mockT).toHaveBeenCalledWith("pages.reverse.creditNoteTitle");
      expect(mockT).toHaveBeenCalledWith("pages.reverse.insertCreditNote");
      expect(mockT).toHaveBeenCalledWith("pages.reverse.creditNoteLabel");

      expect(screen.getByTestId("breadcrumbs-label-key")).toHaveTextContent(
          "translated_routes.reverse"
      );
      expect(screen.getByTestId("doc-number-title")).toHaveTextContent(
          "translated_pages.reverse.creditNoteTitle"
      );
      expect(screen.getByTestId("doc-number-insert")).toHaveTextContent(
          "translated_pages.reverse.insertCreditNote"
      );
      expect(screen.getByTestId("doc-number-label")).toHaveTextContent(
          "translated_pages.reverse.creditNoteLabel"
      );
    });

    it("should pass environment variable manualLink", () => {
      render(<Reverse />);

      expect(screen.getByTestId("manual-link")).toHaveTextContent(
          "https://manual.example.com"
      );
    });

    it("should pass correct styleClass from CSS module", () => {
      render(<Reverse />);

      expect(screen.getByTestId("style-class")).toHaveTextContent(
          "uploadFileContainer"
      );
    });

    it("should pass breadcrumbsProp correctly", () => {
      render(<Reverse />);

      expect(screen.getByTestId("breadcrumb-path")).toHaveTextContent(
          ROUTES.BUY_MANAGEMENT
      );
      expect(screen.getByTestId("breadcrumb-label")).toHaveTextContent(
          "Buy Management"
      );
    });
  });

  describe("Translation calls", () => {
    it("should call translation function with correct keys", () => {
      useLocation.mockReturnValue({
        state: null,
      });

      render(<Reverse />);

      expect(mockT).toHaveBeenCalledWith("routes.buyManagement");
      expect(mockT).toHaveBeenCalledWith("routes.reverse");
      expect(mockT).toHaveBeenCalledWith("pages.reverse.creditNoteTitle");
      expect(mockT).toHaveBeenCalledWith("pages.reverse.insertCreditNote");
      expect(mockT).toHaveBeenCalledWith("pages.reverse.creditNoteLabel");
    });
  });

  describe("Edge cases", () => {
    it("should handle breadcrumbsProp with null path", () => {
      useLocation.mockReturnValue({
        state: {
          breadcrumbsProp: {
            path: null,
            label: "Test",
          },
        },
      });

      render(<Reverse />);

      expect(screen.getByTestId("api-call")).toHaveTextContent(
          "reverseTransactionApi"
      );
    });

    it("should handle breadcrumbsProp with undefined path", () => {
      useLocation.mockReturnValue({
        state: {
          breadcrumbsProp: {
            path: undefined,
            label: "Test",
          },
        },
      });

      render(<Reverse />);

      expect(screen.getByTestId("api-call")).toHaveTextContent(
          "reverseTransactionApi"
      );
    });
  });
});