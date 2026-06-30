import { Button, Tooltip } from "@mui/material"
import { useNavigate } from "react-router-dom"
import { MISSING_DATA_PLACEHOLDER } from "../../utils/constants"

export const NavigationLink = ({ label, path }: { label: string, path: string }) => {
    const navigate = useNavigate()
    return <Tooltip title={label || MISSING_DATA_PLACEHOLDER}>
        <Button variant='text' onClick={() => navigate(path, { replace: true })}>
            {label}
        </Button>
    </Tooltip>
}