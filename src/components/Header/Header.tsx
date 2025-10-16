import type { ProductEntity } from '@pagopa/mui-italia';
import { HeaderAccount, HeaderProduct } from '@pagopa/mui-italia';
import type { LoggedUser } from '../../utils/types';
import {useAuth} from "../../contexts/AuthContext";
// import type { JwtUser } from '../../utils/types';
import keycloak from '../../config/keycloak';

interface HeaderProps {
  userProps?: any;
}

const Header = ({userProps}: HeaderProps) => {

  const { user } = userProps ? userProps : useAuth();
  // const user: JwtUser = {
  //   id: "12345",
  //   username: "mattia.rossi",
  //   firstName: "Mattia",
  //   lastName: "Rossi",
  //   email: "mattia.rossi@example.com",
  //   emailVerified: true,
  //   userProfileMetadata: {
  //     role: "admin",
  //     permissions: ["READ", "WRITE", "DELETE"],
  //     lastLogin: "2025-08-29T14:35:00Z",
  //     language: "it"
  //   }
  // };

  const loggedUser: LoggedUser = {
    id: userProps ? userProps.id : user.id,
    name: userProps ? userProps.firstName : user.firstName,
    email: userProps ? userProps.email : user.email,
    surname: userProps ? userProps.lastName : user.lastName,
  }



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
      }} loggedUser={loggedUser} onDocumentationClick={() => window.open(import.meta.env.VITE_EIE_MANUAL || '', '_blank')} onAssistanceClick={() => { }} onLogin={() => { }} onLogout={() => { keycloak.logout()}}
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
          name: 'Comet S.P.A.',
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
