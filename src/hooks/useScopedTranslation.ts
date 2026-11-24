import { useTranslation } from "react-i18next"
import { useParams } from "react-router-dom"
import { DEFAULT_LANG, i18n } from "../locale"
import { BONUS_DECODER_2026, BONUS_ELETTRODOMESTICI_2025 } from "../utils/constants"

export const initiativeConfigMap = {
  [BONUS_ELETTRODOMESTICI_2025]: 'bonusElettrodomestici2025',
  [BONUS_DECODER_2026]: 'bonusDecoder2026'
}

export const useScopedTranslation = () => {
    const { initiativeId } = useParams();
    const { t: translation } = useTranslation()

    const namespace = initiativeConfigMap?.[initiativeId]

    const existentNamespaces = {
        copy: i18n.hasResourceBundle(DEFAULT_LANG, `${namespace}/copy`) ? `${namespace}/copy` : 'default/copy',
        config: i18n.hasResourceBundle(DEFAULT_LANG, `${namespace}/config`) ? `${namespace}/config` : 'default/config'
    }

    const t = (key: string, options?: Record<string, string | Element>) => {
        const res = key ? translation(key, { ns: key.startsWith('commons') ? 'common' : existentNamespaces.copy, ...options }) : ''
        if (res === key) {
            return translation(key, { ns: 'common', ...options })
        }
        return res
    }
    function config<T>(key: string) {
        const res = key ? translation(key, { ns: key.startsWith('commons') ? 'config' : existentNamespaces.config, returnObjects: true }) : {}
        return res as T
    }

    return { t, config }
}

