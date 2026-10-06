import { Trans, useTranslation } from 'react-i18next';
import { FooterPostLogin, FooterLegal } from '@pagopa/mui-italia';
import { CONFIG } from '@pagopa/selfcare-common-frontend/lib/config/env';
import ROUTES from '../../routes';

const openExternalLink = (url: string) => window.open(url, '_blank')?.focus();

export const CustomFooter = () => {
  const { t } = useTranslation();

  const companyLegalInfo = (
    <Trans i18nKey="commons.footer.legalInfoText">
      <strong>PagoPA S.p.A.</strong> - Società per azioni con socio unico - Capitale sociale di euro
      1,000,000 interamente versato - Sede legale in Roma, Piazza Colonna 370, <br />
      CAP 00187 - N. di iscrizione a Registro Imprese di Roma, CF e P.IVA 15376371009
    </Trans>
  );

  return (
    <>
      <FooterPostLogin
        companyLink={{
          ariaLabel: 'PagoPA SPA',
          href: CONFIG.FOOTER.LINK.PAGOPALINK,
          onClick: () => openExternalLink(CONFIG.FOOTER.LINK.PAGOPALINK),
        }}
        links={[
          {
            label: t('commons.footer.postLoginLinks.privacyPolicy'),
            ariaLabel: t('commons.footer.postLoginLinks.privacyPolicy'),
            href: `/esercente${ROUTES.PRIVACY_POLICY}`,
            linkType: 'external',
            onClick: () => openExternalLink('/esercente' + ROUTES.PRIVACY_POLICY),
          },
          {
            label: t('commons.footer.postLoginLinks.protectionofpersonaldata'),
            ariaLabel: t('commons.footer.postLoginLinks.protectionofpersonaldata'),
            linkType: 'external',
            href: import.meta.env.VITE_PROTECTIONOFPERSONALDATA,
            onClick: () => openExternalLink(import.meta.env.VITE_PROTECTIONOFPERSONALDATA),
          },
          {
            label: t('commons.footer.postLoginLinks.termsandconditions'),
            ariaLabel: t('commons.footer.postLoginLinks.termsandconditions'),
            href: `/esercente${ROUTES.TOS}`,
            linkType: 'external',
            onClick: () => openExternalLink('/esercente' + ROUTES.TOS),
          },
          {
            label: t('commons.footer.postLoginLinks.accessibility'),
            ariaLabel: t('commons.footer.postLoginLinks.accessibility'),
            linkType: 'external',
            onClick: () => openExternalLink(import.meta.env.VITE_ACCESSIBILITY),
          },
        ]}
        currentLangCode={'it'}
        languages={{
          it: {
            it: 'Italiano',
          },
        }}
        onLanguageChanged={() => {}}
      />
      <FooterLegal content={companyLegalInfo} />
    </>
  );
};
