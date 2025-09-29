import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import DetailsCard from "./DetailsCard";

const DetailsCardSetup = ( item: Record<string, string | number>, title?: string) => {
  render(<DetailsCard title={title} item={item} />);
};

describe('DetailsCard', () => {
  it('should render the component with full content', () => {
    const testTitle = "This is a test title"
    const testItem = {id: "01", email: "test@test.com"}
    DetailsCardSetup(testItem, testTitle)

    const cardTitle = screen.getByText(testTitle);
    const cardItem = screen.getByTestId("list-test");
    expect(cardTitle).toBeInTheDocument();
    expect(cardItem).toBeInTheDocument();
  });

  it('should render the component without title', () => {
    const testItem = {id: "01", email: "test@test.com"}
    DetailsCardSetup(testItem)

    const cardItem = screen.getByTestId("list-test");
    expect(cardItem).toBeInTheDocument();
  });

  it('should render the component with empty values', () => {
    const testTitle = "This is a test title"
    const testItem = {id: "", email: "test@test.com"}
    DetailsCardSetup(testItem, testTitle)

    const cardTitle = screen.getByText(testTitle);
    const cardItem = screen.getByTestId("list-test");
    expect(cardTitle).toBeInTheDocument();
    expect(cardItem).toBeInTheDocument();
  });
});