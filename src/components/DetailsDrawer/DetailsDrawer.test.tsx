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
const testPrimaryButton = { label: "primary button", url: "/" };
const testSecondaryButton = { label: "secondary button", url: "/" };
let testIsLoading = false;

const DetailsDrawerSetup = (
  item: Record<string, string | number | JSX.Element>,
  title: string,
  subtitle?: string,
  isLoading?: boolean,
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
      testIsLoading,
      testPrimaryButton,
      testSecondaryButton
    );

    const drawerTitle = screen.getByText(testTitle);
    const drawerSubtitle = screen.getByText(testSubtitle);
    const drawerItem = screen.getByTestId("item-test");
    const drawerPrimaryButton = screen.getByText(testPrimaryButton.label);
    const drawerSecondaryButton = screen.getByText(testSecondaryButton.label);

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

  it("should click file button", async () => {
    DetailsDrawerSetup(
      testItem,
      testTitle,
      testSubtitle,
      testIsLoading,
      testPrimaryButton,
      testSecondaryButton,
      () => console.log("button clicked")
    );

    const onClick = {
      click: () => {},
    };

    const onClickSpy = vi.spyOn(onClick, "click");

    const button = screen.getByTestId("btn-test");
    screen.debug(undefined, Infinity);
    button.addEventListener("click", onClick.click);
    await userEvent.click(button);

    expect(onClickSpy).toBeCalledTimes(1);
  });

  it("should show loader", () => {
    testIsLoading = true;
    DetailsDrawerSetup(testItem, testTitle, testSubtitle, testIsLoading);

    const drawerLoader = screen.getByTestId("item-loader");

    expect(drawerLoader).toBeInTheDocument();
  });
});

