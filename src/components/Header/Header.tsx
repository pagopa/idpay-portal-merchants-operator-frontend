import type { ProductEntity } from '@pagopa/mui-italia';
import { useAuth } from '../../contexts/AuthContext';
import { HeaderAccount, HeaderProduct } from '@pagopa/mui-italia';

const Header = () => {

  const { user } = useAuth();
  console.log("USER", user)

  const welfareProduct: ProductEntity = {
    // TODO check if correct
    id: 'prod-idpay-merchants',
    title: "portale esercenti",
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
      }} loggedUser={user} onAssistanceClick={() => { }} onLogin={() => { }} onLogout={() => { }}
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
          name: 'Euronics',
          logoUrl: 'https://www.pagopa.it/it/img/logo-pagopa.svg',
          productRole: "Operatore",
        },
        {
          id: 'party-mediaworld',
          name: 'MediaWorld',
          logoUrl: 'https://www.pagopa.it/it/img/logo-pagopa.svg',
          productRole: "Operatore"
        }]}
        partyId="party-idpay-merchants"
        onSelectedParty={e => console.log("Selected Item:", e.name)}
      />
    </>
  );
};
export default Header;
