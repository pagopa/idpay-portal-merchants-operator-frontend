import { HeaderAccount, HeaderProduct } from '@pagopa/mui-italia';
import type { DecodedJwtToken } from '../../utils/types';
import keycloak from '../../config/keycloak';
import { jwtDecode } from 'jwt-decode';
import { getPointOfSaleDetails } from '../../services/merchantService.ts';
import { useEffect, useState } from 'react';
import { authStore } from '../../store/authStore.ts';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../contexts/AuthContext.tsx';

const Header = () => {
  const { user } = useAuth()
  const token = authStore((state) => state.token);
  const [franchiseName, setFranchiseName] = useState<string>('');
  const { t } = useTranslation()
  
  useEffect(() => {
    const fetchDetails = async () => {
      try {
        const decodeToken: DecodedJwtToken = jwtDecode(token);
        const response = await getPointOfSaleDetails(decodeToken?.merchant_id, decodeToken?.point_of_sale_id)
        setFranchiseName(response?.franchiseName || '')
      } catch {
        setFranchiseName('')
      }
    };
    if (user && token) {
      fetchDetails();
    }
  }, [user, token]);

  return (
    <>
      <HeaderAccount
        rootLink={{
          href: 'https://www.pagopa.it/it/',
          label: 'PagoPA S.p.A.',
          ariaLabel: 'PagoPA S.p.A.',
          title: 'PagoPA S.p.A.',
        }}
        loggedUser={user}
        onDocumentationClick={() => window.open(import.meta.env.VITE_MANUAL_LINK || '', '_blank')}
        onAssistanceClick={() => window.open(import.meta.env.VITE_ASSISTANCE || '', '_blank')}
        onLogout={() => keycloak.logout()}
        onLogin={() => keycloak.login()}
      />

      <HeaderProduct
        productsList={[{
          id: 'prod-idpay-merchants',
          title: t('commons.headerTitle'),
          productUrl: 'test',
          linkType: 'internal',
        }]}
        partyList={[
          {
            id: 'party-idpay-merchants',
            name: franchiseName,
            logoUrl: 'https://www.pagopa.it/it/img/logo-pagopa.svg',
            productRole: 'Operatore',
          },
        ]}
        partyId="party-idpay-merchants"
      />
    </>
  );
};
export default Header;
