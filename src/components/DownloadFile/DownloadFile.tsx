import { Box, Button, CircularProgress, Tooltip, Typography } from "@mui/material"
import { ReactNode } from "react"
import { MISSING_DATA_PLACEHOLDER } from "../../utils/constants";

type Props = {
    isLoading: boolean;
    onClick: () => void;
    icon?: ReactNode;
    text?: string;
    tooltip?: boolean;
}

export const DownloadFile = ({ isLoading, onClick, icon, text, tooltip }: Props) => {
    const sx = {
        ...(tooltip ? {
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
        } : {
            wordWrap: "break-word",
            maxWidth: "100%"
        }),
    }
    return (
        <Tooltip title={tooltip && (text || MISSING_DATA_PLACEHOLDER)}>
            {text ?
                <Button
                    data-testid="btn-test"
                    sx={{
                        padding: "0",
                        alignItems: "flex-start",
                    }}
                    onClick={onClick}
                >
                    {isLoading ? (
                        <CircularProgress
                            color="inherit"
                            size={20}
                            data-testid="item-loader"
                        />
                    ) : (
                        <Box
                            display="flex"
                            alignItems="start"
                            textAlign="left"
                            columnGap={6}
                            width="100%"
                        >
                            {icon}
                            <Typography
                                component="span"
                                variant="inherit"
                                sx={{
                                    whiteSpace: "normal",
                                    lineHeight: 1.4,
                                    ...sx
                                }}
                            >
                                {text}
                            </Typography>
                        </Box>
                    )}
                </Button> :
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
    )
}