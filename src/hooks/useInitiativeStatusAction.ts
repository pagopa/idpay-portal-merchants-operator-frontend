import { useAppSelector } from "../redux/hooks"
import { currentInitiativeSelector } from "../redux/slices/initiativesSlice"
import { useActionPermission } from "./useActionPermission"

export const useInitiativeStatusAction = (initiativeId: string) => {
    const currentInitiative = useAppSelector(state => currentInitiativeSelector(state, initiativeId))
    const { getPermission } = useActionPermission()
    const isActionPermitted = getPermission('commons.permissions.initiativeStatus', currentInitiative?.status)
    return { isActionPermitted }
}