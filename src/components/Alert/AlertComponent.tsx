import { Alert, Box, Slide, SxProps, Theme } from '@mui/material';
import ErrorOutline from '@mui/icons-material/ErrorOutline';
import CheckCircleOutline from '@mui/icons-material/CheckCircleOutline';

interface AlertProps {
    isOpen?: boolean;
    error?: boolean;
    message: string;
    containerStyle?: SxProps<Theme>;
    contentStyle?: SxProps<Theme>;
}

const AlertComponent = ({ isOpen, error, message, containerStyle, contentStyle }: AlertProps) => {
    return (
        <Slide direction="left" in={isOpen} mountOnEnter unmountOnExit>
            <Box sx={{
                display: 'flex',
                alignItems: 'flex-end',
                justifyContent: 'flex-end',
                position: 'sticky',
                bottom: '128px',
                zIndex: '1300',
                height: '100%',
                ...containerStyle,
            }}>
                <Alert
                data-testid="alert"
                severity={error ? 'error' : 'success'}
                icon={error ? <ErrorOutline /> : <CheckCircleOutline />}
                sx={{
                    position: 'absolute',
                    bottom: '-108px',
                    backgroundColor: 'white',
                    width: 'auto',
                    maxWidth: '400px',
                    minWidth: '300px',
                    zIndex: 1300,
                    boxShadow: 3,
                    borderRadius: 1,
                    '& .MuiAlert-icon': {
                        color: error ? '#FF5C5C' : '#6CC66A',
                    },
                    ...contentStyle,
                }}
                >
                    {message}
                </Alert>
            </Box>
        </Slide>
    );
};

export default AlertComponent;