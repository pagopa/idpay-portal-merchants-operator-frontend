import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { formatEuro, getStatusChip } from "../../utils/helpers";
import { t } from "i18next";
import { DetailsDrawer } from "./DetailsDrawer";
import userEvent from "@testing-library/user-event";

const mockedTransactionDetails = {
  "Data e ora": "",
  Elettrodomestico: "Aspirapolvere",
  "Codice Fiscale": "123",
  "Totale della spesa": formatEuro(50000),
  "Sconto applicato": formatEuro(10000),
  "Importo autorizzato": formatEuro(50000 - 10000),
  Stato: getStatusChip(t, "REWARDED"),
  Fattura: "file",
};

const testTitle = "This is a test title";
const testSubtitle = "This is a test subtitle";
const testItem = mockedTransactionDetails;
const testPrimaryButton = { label: "test primary button", url: "/" };
const testSecondaryButton = { label: "secondary button", url: "/" };

const DetailsDrawerSetup = (
    item: Record<string, string | number | JSX.Element>,
    title: string,
    subtitle?: string,
    isLoading?: boolean,
    isInvoiced?: boolean,
    primaryButton?: typeof testPrimaryButton,
    secondaryButton?: typeof testSecondaryButton,
    onFileDownloadCallback?: () => void
) => {
  render(
      <DetailsDrawer
          isOpen
          isLoading={isLoading}
          setIsOpen={() => null}
          title={title}
          subtitle={subtitle}
          item={item}
          isInvoiced={isInvoiced}
          primaryButton={primaryButton}
          secondaryButton={secondaryButton}
          onFileDownloadCallback={onFileDownloadCallback}
      />
  );
};

describe("DetailsDrawer", () => {
  it("should render the component with full content", () => {
    DetailsDrawerSetup(
        testItem,
        testTitle,
        testSubtitle,
        false,
        true,
        testPrimaryButton,
        testSecondaryButton
    );

    const drawerTitle = screen.getByText(testTitle);
    const drawerSubtitle = screen.getByText(testSubtitle);
    const drawerItem = screen.getByTestId("item-test");
    const drawerPrimaryButton = screen.getByText("test primary button");
    const drawerSecondaryButton = screen.getByText("secondary button");

    expect(drawerTitle).toBeInTheDocument();
    expect(drawerSubtitle).toBeInTheDocument();
    expect(drawerItem).toBeInTheDocument();
    expect(drawerPrimaryButton).toBeInTheDocument();
    expect(drawerSecondaryButton).toBeInTheDocument();
  });

  it("should render the component without optional properties", () => {
    DetailsDrawerSetup(testItem, testTitle);

    const drawerTitle = screen.getByText(testTitle);
    const drawerItem = screen.getByTestId("item-test");

    expect(drawerTitle).toBeInTheDocument();
    expect(drawerItem).toBeInTheDocument();
  });

  it("should render only secondary button when isInvoiced is false", () => {
    DetailsDrawerSetup(
        testItem,
        testTitle,
        testSubtitle,
        false,
        false,
        testPrimaryButton,
        testSecondaryButton
    );

    const drawerSecondaryButton = screen.getByText("secondary button");
    expect(drawerSecondaryButton).toBeInTheDocument();
    expect(screen.queryByText("test primary button")).not.toBeInTheDocument();
  });

  it("should call file download callback when file button is clicked", async () => {
    const mockCallback = vi.fn();

    DetailsDrawerSetup(
        testItem,
        testTitle,
        testSubtitle,
        false,
        false,
        undefined,
        undefined,
        mockCallback
    );

    const button = screen.getByTestId("btn-test");
    await userEvent.click(button);

    expect(mockCallback).toHaveBeenCalledTimes(1);
  });

  it("should close drawer when close button is clicked", async () => {
    const mockSetIsOpen = vi.fn();

    render(
        <DetailsDrawer
            isOpen
            isLoading={false}
            setIsOpen={mockSetIsOpen}
            title={testTitle}
            item={testItem}
        />
    );

    const closeButton = screen.getByTestId("close-details-drawer-button");
    await userEvent.click(closeButton);

    expect(mockSetIsOpen).toHaveBeenCalledWith(false);
  });

  it("should show loader when isLoading is true", () => {
    DetailsDrawerSetup(testItem, testTitle, testSubtitle, true);

    const drawerLoader = screen.getByTestId("item-loader");

    expect(drawerLoader).toBeInTheDocument();
  });

  it("should not show loader when isLoading is false", () => {
    DetailsDrawerSetup(testItem, testTitle, testSubtitle, false);

    expect(screen.queryByTestId("item-loader")).not.toBeInTheDocument();
  });

  it("should display file button for download fields", () => {
    DetailsDrawerSetup(testItem, testTitle);

    const fileButton = screen.getByTestId("btn-test");

    expect(fileButton).toBeInTheDocument();
    expect(fileButton).toHaveTextContent("file");
  });

  it("should not render id and cancelled fields", () => {
    const itemWithIdAndCancelled = {
      ...testItem,
      id: "123",
      cancelled: true,
    };

    DetailsDrawerSetup(itemWithIdAndCancelled, testTitle);

    expect(screen.queryByText("id")).not.toBeInTheDocument();
    expect(screen.queryByText("cancelled")).not.toBeInTheDocument();
  });
});