import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { formatEuro, getStatusChip } from "../../utils/helpers";
import { t } from "i18next";
import { DetailsDrawer } from "./DetailsDrawer";

const mockedTransactionDetails = {
  "Data e ora": "",
  Elettrodomestico: "Aspirapolvere",
  "Codice Fiscale": "123",
  "Totale della spesa": formatEuro(50000),
  "Sconto applicato": formatEuro(10000),
  "Importo autorizzato": formatEuro(50000 - 10000),
  Stato: getStatusChip(t, "REWARDED"),
  Fattura: "",
};

const testTitle = "This is a test title";
const testSubtitle = "This is a test subtitle";
const testItem = mockedTransactionDetails;
const testPrimaryButton = {label: 'primary button', url: '/'}
const testSecondaryButton = {label: 'secondary button', url: '/'}

const DetailsDrawerSetup = (
  item: Record<string, string | number | JSX.Element>,
  title: string,
  subtitle?: string,
  primaryButton?: typeof testPrimaryButton,
  secondaryButton?: typeof testSecondaryButton
) => {
  render(
    <DetailsDrawer
      isOpen
      setIsOpen={() => null}
      title={title}
      subtitle={subtitle}
      item={item}
      primaryButton={primaryButton}
      secondaryButton={secondaryButton}
    />
  );
};

describe("DetailsDrawer", () => {
  it("should render the component with full content", () => {
    DetailsDrawerSetup(testItem, testTitle, testSubtitle, testPrimaryButton, testSecondaryButton);

    const drawerTitle = screen.getByText(testTitle);
    const drawerSubtitle = screen.getByText(testSubtitle);
    const drawerItem = screen.getByTestId("item-test");
    const drawerPrimaryButton = screen.getByText(testPrimaryButton.label)
    const drawerSecondaryButton = screen.getByText(testSecondaryButton.label)

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
});
