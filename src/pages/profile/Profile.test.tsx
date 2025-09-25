import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import Profile from './Profile';
import { AuthProvider } from '../../contexts/AuthContext';

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => {
      const translations: Record<string, string> = {
        'pages.profile.title': "Profilo",
        'pages.profile.subtitle': "Consulta i dati identificativi dell'azienda",
        'pages.profile.errorAlert': "Non è stato possibile recuperare i dati. Riprova."
      };
      return translations[key] || key;
    },
  }),
}));

vi.mock('@pagopa/selfcare-common-frontend/lib', () => ({
  TitleBox: ({ title, subTitle }: { title: string; subTitle: string }) => (
    <div data-testid="title-box">
      <h1>{title}</h1>
      <p>{subTitle}</p>
    </div>
  ),
}));

vi.mock('../../components/DetailsCard/DetailsCard', () => ({
  default: ({ title, item }: { title: string, item: Record<string, string | number> }) => {
    const mappedItem = Object.entries(item)
    return (
        <div data-testid="details-card">
            <h1>{title}</h1>
            <div> {mappedItem.map(([key, value], index) => {
                    return <div key={index}>
                        <p>{key}</p>
                        <p>{value}</p>
                    </div>
                })}
            </div>
        </div>
    )
  },
}));

//api service mock
const mockGetPointOfSaleDetails = vi.fn();
vi.mock('../../services/merchantService', () => ({
  getPointOfSaleDetails: (merchantId: string, pointOfSaleId: string) => mockGetPointOfSaleDetails(merchantId, pointOfSaleId),
}));

vi.mock('jwt-decode', () => ({
  jwtDecode: () => ({ point_of_sale_id: 'pos-456' }),
}));

const mockDetails = [
  {
    "id": "68c199bc3b741ec5f8054a1e",
    "type": "PHYSICAL",
    "franchiseName": "trony",
    "region": "Puglia",
    "province": "LE",
    "city": "Matino",
    "zipCode": "73046",
    "address": "Via Bolzano4",
    "contactEmail": "referente2345@gmail.com",
    "contactName": "Giuseppe",
    "contactSurname": "Verdi",
    "channelEmail": "",
    "channelPhone": "",
    "channelGeolink": "",
    "channelWebsite": ""
}
];

const mockApiResponse = {content: mockDetails};

const renderComponent = () => {
  const theme = createTheme();
  return render(
    <AuthProvider>  
        <BrowserRouter>
      <ThemeProvider theme={theme}>
        <Profile />
      </ThemeProvider>
    </BrowserRouter></AuthProvider>
  
  );
};

describe('Profile', () => {

  beforeEach(() => {
    vi.clearAllMocks();
    mockGetPointOfSaleDetails.mockResolvedValue(mockApiResponse);
  });

  it('should show initial loading and then data', async () => {
    renderComponent();

    expect(screen.getByTestId('loading')).toBeInTheDocument();

    await screen.findByTestId('details-card');
    
    expect(screen.queryByTestId('loading')).not.toBeInTheDocument();
    
    expect(mockGetPointOfSaleDetails).toHaveBeenCalledTimes(1);
    expect(mockGetPointOfSaleDetails).toHaveBeenCalledWith(undefined, "pos-456");
  });

  it('should show no cards when there are no point of sale details', async () => {
    mockGetPointOfSaleDetails.mockResolvedValue({ ...mockApiResponse, content: [], totalElements: 0 });
    
    renderComponent();
    await screen.findByText('Nessun elemento trovato');

    expect(screen.queryByTestId('details-card')).not.toBeInTheDocument();
    expect(screen.queryByTestId('loading')).not.toBeInTheDocument();
  });

  it('should show error alert in case of error in data fetch', async () => {
    mockGetPointOfSaleDetails.mockRejectedValue(new Error('API Failure'));
    
    renderComponent();
    
    await screen.findByTestId('alert');
    
    expect(screen.getByText('Non è stato possibile recuperare i dati. Riprova.')).toBeInTheDocument();
    expect(screen.queryByTestId('details-card')).not.toBeInTheDocument();
    expect(screen.queryByTestId('loading')).not.toBeInTheDocument();
  });
});