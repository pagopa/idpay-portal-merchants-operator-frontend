import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import AcceptDiscountCard from './AcceptDiscountCard';

test('renders without crashing', () => {
  render(<AcceptDiscountCard />);
});

test('renders children correctly', () => {
    const childrenText = 'This is a test child element.';
    render(<AcceptDiscountCard>{childrenText}</AcceptDiscountCard>);
    expect(screen.getByText(childrenText)).toBeInTheDocument();
});

test('renders title and subtitle props correctly', () => {
    const title = 'Test Title';
    const subtitle = 'Test Subtitle';
    render(<AcceptDiscountCard titleBox={title} subTitleBox={subtitle} />);
    expect(screen.getByText(title)).toBeInTheDocument();
    expect(screen.getByText(subtitle)).toBeInTheDocument();
});

test('renders inputTitle prop correctly', () => {
    const inputTitle = 'Input Title';
    render(<AcceptDiscountCard inputTitle={inputTitle} />);
    expect(screen.getByText(inputTitle)).toHaveStyle('font-weight: 700;');
});