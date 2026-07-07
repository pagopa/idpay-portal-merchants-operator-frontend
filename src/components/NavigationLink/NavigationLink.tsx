import { Button, Tooltip } from "@mui/material"
import { theme } from "@pagopa/mui-italia"
import { useNavigate } from "react-router-dom"

export const NavigationLink = ({ label, path }: { label: string, path: string }) => {
    const navigate = useNavigate()
    return <Tooltip title={label}>
        <Button sx={{":hover": {color: `${theme.palette.primary.main} !important`}}} variant='text' onClick={() => navigate(path, { replace: true })}>
            {label}
        </Button>
    </Tooltip>
}