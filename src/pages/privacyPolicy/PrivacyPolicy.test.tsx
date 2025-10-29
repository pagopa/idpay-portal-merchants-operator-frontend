import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import PrivacyPolicy from '../PrivacyPolicy';
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
      PRIVACY_POLICY_JSON_URL: 'mock-privacy-policy-url',
      PRIVACY_POLICY_ID: 'mock-privacy-policy-id',
    },
  },
}));

jest.mock('../../../routes', () => ({
  PRIVACY_POLICY: '/mock-privacy-route',
}));

describe('PrivacyPolicy', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('should render component and navigate back', () => {
    render(<PrivacyPolicy />);

    const backButton = screen.getByTestId('back-stores-button');

    fireEvent.click(backButton);
  });
});
