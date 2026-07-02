import { Chip, ChipOwnProps } from "@mui/material"
import { useScopedTranslation } from "../../hooks/useScopedTranslation"

type ChipConfigProps = {
    label: string,
    color: ChipOwnProps['color']
}

export const StatusChip = ({ field, value }: { field: string, value: string }) => {
    const { t, config } = useScopedTranslation();
    const chipProps = config(`commons.statusEnum.${field}.${value}`) as ChipConfigProps
    return <Chip
        label={t(chipProps.label)}
        size="small"
        color={chipProps.color}
    />
}