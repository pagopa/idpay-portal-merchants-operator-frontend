import { useTranslation } from "react-i18next"
import { useAppSelector } from "../redux/hooks"
import { currentInitiativeSelector } from "../redux/slices/initiativesSlice"
import { useParams } from "react-router-dom"
import { DEFAULT_LANG, i18n } from "../locale"
import { buildNamespaceKey } from "../utils/helpers"

export const useScopedTranslation = () => {
    const { initiativeId } = useParams();
    const { t: translation } = useTranslation()

    const currentInitiative = useAppSelector(state => currentInitiativeSelector(state, initiativeId))

    const namespace = buildNamespaceKey(currentInitiative?.initiativeName, currentInitiative?.startDate)
    const existentNamespaces = {
        copy: i18n.hasResourceBundle(DEFAULT_LANG, `${namespace}/copy`) ? `${namespace}/copy` : 'default/copy',
        config: i18n.hasResourceBundle(DEFAULT_LANG, `${namespace}/config`) ? `${namespace}/config` : 'default/config'
    }

    const t = (key: string) => {
        const res = key ? translation(key, { ns: key.startsWith('commons') ? 'common' : existentNamespaces.copy }) : ''
        if (res === key) {
            return translation(key, { ns: 'common' })
        }
        return res
    }
    function config<T>(key: string) {
        const res = key ? translation(key, { ns: key.startsWith('commons') ? 'config' : existentNamespaces.config, returnObjects: true }) : {}
        return res as T
    }

    return { t, config }
}

