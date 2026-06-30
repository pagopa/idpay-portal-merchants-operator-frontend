import { Chip, ChipOwnProps } from "@mui/material"
import { useScopedTranslation } from "../../hooks/useScopedTranslation"

export const StatusChip = ({ value }: { value: string }) => {
    const { t, config } = useScopedTranslation();
    const chipColor = config(`commons.initiativeStatusEnum.${value}.color`) as unknown as ChipOwnProps['color']
    return <Chip
        label={t(`commons.initiativeStatusEnum.${value}`)}
        size="small"
        color={chipColor}
    />
}