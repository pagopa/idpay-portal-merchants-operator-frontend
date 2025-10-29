import {Trans, useTranslation} from 'react-i18next';
import { FooterPostLogin, FooterLegal } from '@pagopa/mui-italia';
import {CONFIG} from "@pagopa/selfcare-common-frontend/lib/config/env";
import ROUTES from '../../routes';
import { useNavigate } from 'react-router-dom';


const openExternalLink = (url: string) => window.open(url, '_blank')?.focus();

export const CustomFooter = () => {
  const navigate = useNavigate()
  const { t } = useTranslation();

  const companyLegalInfo = (
      <Trans i18nKey="common.footer.legalInfoText">
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
              href:  CONFIG.FOOTER.LINK.PAGOPALINK,
              onClick: () => openExternalLink(CONFIG.FOOTER.LINK.PAGOPALINK)
            }}
            links={[
              {
                label: t('common.footer.postLoginLinks.privacyPolicy'),
                ariaLabel: t('common.footer.postLoginLinks.privacyPolicy'),
                href: `/esercente${ROUTES.PRIVACY_POLICY}`,
                linkType: 'internal',
                onClick: () => navigate(ROUTES.PRIVACY_POLICY)
              },
              {
                label: t('common.footer.postLoginLinks.protectionofpersonaldata'),
                ariaLabel: t('common.footer.postLoginLinks.protectionofpersonaldata'),
                linkType: 'external',
                href: import.meta.env.VITE_PROTECTIONOFPERSONALDATA,
                onClick: () => openExternalLink(import.meta.env.VITE_PROTECTIONOFPERSONALDATA)
              },
              {
                label: t('common.footer.postLoginLinks.termsandconditions'),
                ariaLabel: t('common.footer.postLoginLinks.termsandconditions'),
                href: `/esercente${ROUTES.TOS}`,
                linkType: 'internal',
                onClick: () => navigate(ROUTES.TOS)
              },
              {
                label: t('common.footer.postLoginLinks.accessibility'),
                ariaLabel: t('common.footer.postLoginLinks.accessibility'),
                linkType: 'external',
                onClick: () => openExternalLink(import.meta.env.VITE_ACCESSIBILITY)
              }
            ]}
            currentLangCode={'it'}
            languages={{
              it: {
                it: 'Italiano'
              }
            }}
            onLanguageChanged={() => { }}
        />
        <FooterLegal
            content={companyLegalInfo}
        />
      </>
  );
};