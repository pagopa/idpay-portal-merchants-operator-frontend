import { describe, vi, it, expect, beforeEach } from "vitest";
import { render, screen } from '@testing-library/react';
import { PrivacyAndTosLayout } from './PrivacyAndTosLayout';
import DOMPurify from 'dompurify';

// Mock dei moduli
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

vi.mock('@pagopa/selfcare-common-frontend/lib', () => ({
  TitleBox: ({ title }: { title: string }) => <h4 data-testid="title-box">{title}</h4>,
}));

vi.mock('@pagopa/mui-italia', () => ({
  HeaderAccount: ({ onAssistanceClick, enableLogin, rootLink }: any) => (
    <div data-testid="header-account">
      <button onClick={onAssistanceClick} data-testid="assistance-button">
        Assistenza
      </button>
      <div data-testid="enable-login">{enableLogin.toString()}</div>
      <div data-testid="root-link">{rootLink.href}</div>
    </div>
  ),
  HeaderProduct: ({ productsList }: any) => (
    <div data-testid="header-product">
      {productsList.map((product: any) => (
        <div key={product.id} data-testid={`product-${product.id}`}>
          {product.title}
        </div>
      ))}
    </div>
  ),
}));

vi.mock('../Footer/CustomFooter', () => ({
  CustomFooter: () => <footer data-testid="custom-footer">Footer</footer>,
}));

// Mock di DOMPurify
vi.mock('dompurify', () => ({
  default: {
    sanitize: vi.fn((html: string) => html),
  },
}));

describe('PrivacyAndTosLayout component', () => {
  const mockWindowOpen = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    window.open = mockWindowOpen;
    import.meta.env.VITE_ASSISTANCE = 'https://assistance.example.com';
  });

  it('should render component with empty text and title', () => {
    render(<PrivacyAndTosLayout text={{ html: '' }} title={""} />);
    
    expect(screen.getByTestId('header-account')).toBeInTheDocument();
    expect(screen.getByTestId('header-product')).toBeInTheDocument();
    expect(screen.getByTestId('custom-footer')).toBeInTheDocument();
  });

  it('should render component with title', () => {
    const title = 'Privacy Policy';
    render(<PrivacyAndTosLayout text={{ html: '' }} title={title} />);
    
    expect(screen.getByTestId('title-box')).toHaveTextContent(title);
  });

  it('should render component with HTML content', () => {
    const htmlContent = '<p>This is privacy policy content</p>';
    const text = { html: htmlContent };
    
    render(<PrivacyAndTosLayout text={text} title="Privacy" />);
    
    expect(DOMPurify.sanitize).toHaveBeenCalledWith(htmlContent);
  });

  it('should sanitize HTML content with DOMPurify', () => {
    const dangerousHtml = '<script>alert("xss")</script><p>Safe content</p>';
    const text = { html: dangerousHtml };
    
    render(<PrivacyAndTosLayout text={text} title="Terms" />);
    
    expect(DOMPurify.sanitize).toHaveBeenCalledWith(dangerousHtml);
  });

  it('should render HeaderAccount with correct props', () => {
    render(<PrivacyAndTosLayout text={{ html: '' }} title="Test" />);
    
    expect(screen.getByTestId('enable-login')).toHaveTextContent('false');
    expect(screen.getByTestId('root-link')).toHaveTextContent('https://www.pagopa.it/it/');
  });

  it('should open assistance link when onAssistanceClick is called', () => {
    render(<PrivacyAndTosLayout text={{ html: '' }} title="Test" />);
    
    const assistanceButton = screen.getByTestId('assistance-button');
    assistanceButton.click();
    
    expect(mockWindowOpen).toHaveBeenCalledWith('https://assistance.example.com', '_blank');
  });

  it('should handle empty VITE_ASSISTANCE env variable', () => {
    import.meta.env.VITE_ASSISTANCE = '';
    
    render(<PrivacyAndTosLayout text={{ html: '' }} title="Test" />);
    
    const assistanceButton = screen.getByTestId('assistance-button');
    assistanceButton.click();
    
    expect(mockWindowOpen).toHaveBeenCalledWith('', '_blank');
  });

  it('should render HeaderProduct with correct product', () => {
    render(<PrivacyAndTosLayout text={{ html: '' }} title="Test" />);
    
    expect(screen.getByTestId('product-prod-idpay-merchants')).toHaveTextContent('Bonus Elettrodomestici');
  });

  it('should render CustomFooter', () => {
    render(<PrivacyAndTosLayout text={{ html: '' }} title="Test" />);
    
    expect(screen.getByTestId('custom-footer')).toBeInTheDocument();
  });

  it('should render Paper component with content', () => {
    const htmlContent = '<div>Content inside paper</div>';
    const { container } = render(<PrivacyAndTosLayout text={{ html: htmlContent }} title="Test" />);
    
    const contentDiv = container.querySelector('.content');
    expect(contentDiv).toBeInTheDocument();
  });

  it('should render complete layout structure', () => {
    const title = 'Complete Test';
    const htmlContent = '<h1>Full HTML Content</h1>';
    
    render(<PrivacyAndTosLayout text={{ html: htmlContent }} title={title} />);
    
    expect(screen.getByTestId('header-account')).toBeInTheDocument();
    expect(screen.getByTestId('header-product')).toBeInTheDocument();
    expect(screen.getByTestId('title-box')).toBeInTheDocument();
    expect(screen.getByTestId('custom-footer')).toBeInTheDocument();
  });

  it('should handle complex HTML with multiple elements', () => {
    const complexHtml = `
      <div>
        <h1>Title</h1>
        <p>Paragraph 1</p>
        <p>Paragraph 2</p>
        <ul>
          <li>Item 1</li>
          <li>Item 2</li>
        </ul>
      </div>
    `;
    
    render(<PrivacyAndTosLayout text={{ html: complexHtml }} title="Complex" />);
    
    expect(DOMPurify.sanitize).toHaveBeenCalledWith(complexHtml);
  });
});