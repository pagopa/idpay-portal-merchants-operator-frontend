import { Link as MUILink, Tooltip, Typography } from "@mui/material"
import { theme } from "@pagopa/mui-italia"
import { MISSING_DATA_PLACEHOLDER } from "../../utils/constants"

export const Link = ({ label, href, tooltip }: { label: string, href: string, tooltip?: boolean }) =>
    <Tooltip title={tooltip && (label || MISSING_DATA_PLACEHOLDER)}>
        {label ?
            <MUILink
                sx={{
                    color: theme.palette.primary.main,
                    fontWeight: theme.typography.fontWeightMedium
                }}
                href={href}
                target="_blank"
            >
                {label}
            </MUILink> :
            <Typography
                sx={{
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap'
                }}
            >
                {MISSING_DATA_PLACEHOLDER}
            </Typography>
        }
    </Tooltip>