import type { ProductEntity } from '@pagopa/mui-italia';
import { HeaderAccount, HeaderProduct } from '@pagopa/mui-italia';
import type {DecodedJwtToken, LoggedUser} from '../../utils/types';
import {useAuth} from "../../contexts/AuthContext";
// import type { JwtUser } from '../../utils/types';
import keycloak from '../../config/keycloak';
import {jwtDecode} from "jwt-decode";
import {getPointOfSaleDetails} from "../../services/merchantService.ts";
import {useEffect, useState} from "react";
import {authStore} from "../../store/authStore.ts";

interface HeaderProps {
    userProps?: LoggedUser & { merchant_id?: string };
}

const Header = ({userProps}: HeaderProps) => {
    const { user } = userProps ? { user: userProps } : useAuth();
    const token = authStore.getState().token;
    const [franchiseName, setFranchiseName] = useState<string>('');

  const loggedUser: LoggedUser = {
    id: userProps ? userProps.id : user.id,
    email: userProps ? userProps.email : user.email,
  }
    const fetchDetails = async (user: any) => {
        const decodeToken: DecodedJwtToken = jwtDecode(token);
        try {
            const response = await getPointOfSaleDetails(
                user.merchant_id,
                decodeToken?.point_of_sale_id
            );
            setFranchiseName(response?.franchiseName || '');
        } catch (err) {
            console.error('Error:', err);
        }
    };

    useEffect(() => {
        if (user && token) {
            fetchDetails(user);
        }
    }, [user, token]);


  const welfareProduct: ProductEntity = {
    // TODO check if correct
    id: 'prod-idpay-merchants',
    title: "Bonus Elettrodomestici",
    productUrl: "test",
    linkType: 'internal',
  };

  const activeProducts = [
    {
      id: welfareProduct.id,
      title: welfareProduct.title,
      publicUrl: welfareProduct.productUrl,
    }
  ]

  return (

    <>
      <HeaderAccount rootLink={{
        href: "https://www.pagopa.it/it/",
        label: "PagoPA S.p.A.",
        ariaLabel: "PagoPA S.p.A.",
        title: "PagoPA S.p.A.",
      }} loggedUser={loggedUser} onDocumentationClick={() => window.open(import.meta.env.VITE_MANUAL_LINK || '', '_blank')} onAssistanceClick={() => window.open(import.meta.env.VITE_ASSISTANCE || '', '_blank')} onLogin={() => { }} onLogout={() => { keycloak.logout()}}
      />

      <HeaderProduct
        productsList={activeProducts.map((p) => ({
          id: p.id,
          title: p.title,
          productUrl: p.publicUrl,
          linkType: 'internal',
        }))}
        partyList={[{
          id: 'party-idpay-merchants',
          name: franchiseName,
          logoUrl: 'https://www.pagopa.it/it/img/logo-pagopa.svg',
          productRole: "Operatore",
        }
      ]}
        partyId="party-idpay-merchants"
        onSelectedParty={e => console.log("Selected Item:", e.name)}
      />
    </>
  );
};
export default Header;
