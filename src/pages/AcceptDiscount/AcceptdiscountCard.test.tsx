import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import AcceptDiscountCard from './AcceptDiscountCard';

describe('AcceptDiscountCard', () => {

  it('renders without crashing', () => {
    render(<AcceptDiscountCard />);
  });

  it('renders children correctly', () => {
    const childrenText = 'This is a test child element.';
    render(<AcceptDiscountCard>{childrenText}</AcceptDiscountCard>);
    expect(screen.getByText(childrenText)).toBeInTheDocument();
  });

  it('renders title and subtitle props correctly', () => {
    const title = 'Test Title';
    const subtitle = 'Test Subtitle';
    render(<AcceptDiscountCard titleBox={title} subTitleBox={subtitle} />);
    expect(screen.getByText(title)).toBeInTheDocument();
    expect(screen.getByText(subtitle)).toBeInTheDocument();
  });

  it('renders inputTitle prop correctly', () => {
    const inputTitle = 'Input Title';
    render(<AcceptDiscountCard inputTitle={inputTitle} />);
    expect(screen.getByText(inputTitle)).toHaveStyle('font-weight: 700;'); 
  });

});