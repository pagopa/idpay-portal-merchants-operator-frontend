import { Chip, ChipOwnProps } from "@mui/material"
import { useScopedTranslation } from "../../hooks/useScopedTranslation"

export const StatusChip = ({ field, value }: { field: string, value: string }) => {
    const { t, config } = useScopedTranslation();
    const chipColor = config(`commons.statusEnum.${field}.${value}.color`) as unknown as ChipOwnProps['color']
    return <Chip
        label={t(`commons.statusEnum.${field}.${value}`)}
        size="small"
        color={chipColor}
    />
}