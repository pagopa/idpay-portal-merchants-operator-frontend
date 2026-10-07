import { Button, Tooltip, Typography } from "@mui/material"
import { theme } from "@pagopa/mui-italia"
import { useNavigate } from "react-router-dom"
import { MISSING_DATA_PLACEHOLDER } from "../../utils/constants"

export const NavigationLink = ({ label, path, tooltip }: { label: string, path: string, tooltip?: boolean }) => {
    const navigate = useNavigate()
    return <Button sx={{paddingX: 0}} className='name:navigation'>
        <Tooltip title={tooltip && (label || MISSING_DATA_PLACEHOLDER)}>
            {label ?
                <Typography
                    sx={{
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                        color: theme.palette.primary.main,
                        fontWeight: theme.typography.fontWeightMedium,
                        cursor: "pointer"
                    }}
                    onClick={() => navigate(path, { replace: true })}
                >
                    {label}
                </Typography> :
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
    </Button>
}