import { Button, Tooltip } from "@mui/material"
import { useNavigate } from "react-router-dom"

export const NavigationLink = ({ label, path }: { label: string, path: string }) => {
    const navigate = useNavigate()
    return <Tooltip title={label}>
        <Button sx={{textDecoration: 'underline', ":hover": {textDecoration: 'underline'}}} variant='text' onClick={() => navigate(path, { replace: true })}>
            {label}
        </Button>
    </Tooltip>
}