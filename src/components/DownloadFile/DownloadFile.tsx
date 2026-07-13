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
    return (text ?
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
                    marginTop={2}
                >
                    {icon}
                    <Typography
                        component="span"
                        variant="inherit"
                        sx={{
                            whiteSpace: "normal",
                            wordBreak: "break-word",
                            lineHeight: 1.4,
                        }}
                    >
                        {text}
                    </Typography>
                </Box>
            )}
        </Button> :
        <Tooltip title={tooltip && MISSING_DATA_PLACEHOLDER}>
            <Typography
                sx={{
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                }}
            >
                {MISSING_DATA_PLACEHOLDER}
            </Typography>
        </Tooltip>
    )
}