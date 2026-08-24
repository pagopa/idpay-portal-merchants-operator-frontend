import { useScopedTranslation } from "./useScopedTranslation"

export const useActionPermission = () => {
    const { config } = useScopedTranslation()

    const getPermission = (path: string, key: string | number) => {
        const permission = config<Array<string | number>>(path)
        return permission.includes(key)
    }

    return { getPermission }
}