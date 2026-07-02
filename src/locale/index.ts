import i18n from '@pagopa/selfcare-common-frontend/lib/locale/locale-utils';
import { initReactI18next } from 'react-i18next';
import common from './it/common.json';
import commonConfig from './it/config.json';
import defaultCopy from './it/default/copy.json'
import defaultConfig from './it/default/config.json'

export const DEFAULT_LANG = 'it';

const defaultResources = {
  copy: 'default/copy',
  config: 'default/config'
}

export const initI18n = async (namespaces: Array<string>) => {
  await i18n.use(initReactI18next).init({
    lng: DEFAULT_LANG,
    fallbackLng: DEFAULT_LANG,
    defaultNS: 'common',
    ns: namespaces.reduce((acc, namespace) => [...acc, `${namespace}/copy`, `${namespace}/config`], []),
    fallbackNS: 'default',
    interpolation: {
      escapeValue: false,
    },
    react: {
      useSuspense: true,
    },
    resources: {
      [DEFAULT_LANG]: {
        common,
        config: commonConfig,
        [defaultResources.copy]: defaultCopy,
        [defaultResources.config]: defaultConfig
      },
    },
  });

  await Promise.all(
    namespaces.map(async (ns) => {
      const copy = await import(`./it/${ns}/copy.json`);
      const config = await import(`./it/${ns}/config.json`);

      i18n.addResourceBundle(DEFAULT_LANG, `${ns}/copy`, copy.default, true, true);
      i18n.addResourceBundle(DEFAULT_LANG, `${ns}/config`, config.default, true, true);
    })
  );
}

export { useTranslation } from "react-i18next"
export { i18n }