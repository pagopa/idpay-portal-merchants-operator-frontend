import { Tooltip, Typography } from "@mui/material"
import Box from "@mui/material/Box"
import { theme } from "@pagopa/mui-italia"
import { useEffect, useRef, useState } from "react"

export const FieldTitle = ({ title }: { title: string }) => {
    const titleRef = useRef(null)
    const [tooltip, setTooltip] = useState('')

    const checkOverflow = (element) => element.scrollWidth > element.offsetWidth

    useEffect(() => {
        if (titleRef?.current) {
            if(checkOverflow(titleRef.current)) {
                setTooltip(title)
            } else {
                setTooltip('')
            }
        }
    }, [title, titleRef])

    return (
        <Box display="flex">
            <Tooltip title={tooltip} ref={titleRef}>
                <Typography
                    variant="body2"
                    fontWeight={theme.typography.fontWeightRegular}
                    color={theme.palette.text.secondary}
                    sx={{
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                    }}
                >
                    {title}
                </Typography>
            </Tooltip>
        </Box>
    )
}