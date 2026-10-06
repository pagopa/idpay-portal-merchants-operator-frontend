import { Chip, ChipOwnProps, Tooltip, Typography } from "@mui/material"
import { useScopedTranslation } from "../../hooks/useScopedTranslation"
import { MISSING_DATA_PLACEHOLDER } from "../../utils/constants"

export type StatusChipConfigProps = {
    label: string,
    color: ChipOwnProps['color']
}

export const StatusChip = ({ context, value, tooltip }: { context: string, value: string, tooltip?: boolean }) => {
    const { t, config } = useScopedTranslation();
    const chipProps = config<StatusChipConfigProps>(`${context}.${value}`)
    return <Tooltip title={tooltip && (value ? t(chipProps.label) : MISSING_DATA_PLACEHOLDER)}>
        {value ? <Chip
            label={t(chipProps.label)}
            size="small"
            color={chipProps.color}
        /> :
            <Typography
                sx={{
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                }}
            >
                {MISSING_DATA_PLACEHOLDER}
            </Typography>
    }
    </Tooltip>
}