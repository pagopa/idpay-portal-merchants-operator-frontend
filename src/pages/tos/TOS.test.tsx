import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import TOS from '../TOS';
import { useOneTrustNotice } from '../../../hooks/useOneTrustNotice';
import { ENV } from '../../../utils/env';
import routes from '../../../routes';

jest.mock('../../../hooks/useOneTrustNotice');
jest.mock('../../components/OneTrustContentWrapper', () => (props: { idSelector: string }) => (
  <div data-testid="onetrust-wrapper" data-idselector={props.idSelector} />
));

jest.mock('../../../utils/env', () => ({
  ENV: {
    ONE_TRUST: {
      TOS_JSON_URL: 'mock-tos-json-url',
      TOS_ID: 'mock-tos-id',
    },
  },
}));
jest.mock('../../../routes', () => ({
  TOS: '/mock-tos-route',
}));

describe('TOS component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('should render component and navigate back', () => {
    render(<TOS />);

    const backButton = screen.getByTestId('back-stores-button');

    fireEvent.click(backButton);
  });
});
