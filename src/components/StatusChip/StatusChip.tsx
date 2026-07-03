import { Chip, ChipOwnProps } from "@mui/material"
import { useScopedTranslation } from "../../hooks/useScopedTranslation"

export type StatusChipConfigProps = {
    label: string,
    color: ChipOwnProps['color']
}

export const StatusChip = ({ field, value }: { field: string, value: string }) => {
    const { t, config } = useScopedTranslation();
    const chipProps = config<StatusChipConfigProps>(`commons.statusEnum.${field}.${value}`)
    return <Chip
        label={t(chipProps.label)}
        size="small"
        color={chipProps.color}
    />
}