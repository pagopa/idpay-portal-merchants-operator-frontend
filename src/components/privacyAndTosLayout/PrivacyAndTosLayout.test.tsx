import { describe, vi } from "vitest";
import { render } from '@testing-library/react';
import {PrivacyAndTosLayout} from './PrivacyAndTosLayout';

vi.mock('../../components/OneTrustContentWrapper', () => (props: { idSelector: string }) => (
  <div data-testid="onetrust-wrapper" data-idselector={props.idSelector} />
));

vi.mock('../../../utils/env', () => ({
  ENV: {
    ONE_TRUST: {
      TOS_JSON_URL: 'mock-tos-json-url',
      TOS_ID: 'mock-tos-id',
    },
  },
}));
vi.mock('../../../routes', () => ({
  TOS: '/mock-tos-route',
}));

describe('Layout component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test('should render component', () => {
    render(<PrivacyAndTosLayout text={{ html: '' }} title={""} />);
  });
});
