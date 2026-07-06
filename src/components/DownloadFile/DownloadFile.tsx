import { Button, CircularProgress, Typography } from "@mui/material"
import { ReactNode } from "react"
import { MISSING_DATA_PLACEHOLDER } from "../../utils/constants";

type Props = {
    isLoading: boolean;
    onClick: () => void;
    icon?: ReactNode;
    text?: string
}

export const DownloadFile = ({isLoading, onClick, icon, text}: Props) => {
    return (
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
                <span
                    style={{
                        display: "flex",
                        alignItems: "flex-start",
                        textAlign: "left",
                        gap: 6,
                        width: "100%",
                        marginTop: 2,
                    }}
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
                        {text ?? MISSING_DATA_PLACEHOLDER}
                    </Typography>
                </span>
            )}
        </Button>
    )
}