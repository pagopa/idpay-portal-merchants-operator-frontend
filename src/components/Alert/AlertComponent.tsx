import { Alert, Box, Slide, SxProps, Theme } from '@mui/material';
import ErrorOutline from '@mui/icons-material/ErrorOutline';
import CheckCircleOutline from '@mui/icons-material/CheckCircleOutline';

interface AlertProps {
    isOpen?: boolean;
    error?: boolean;
    message: string;
    sx?: SxProps<Theme>
}

const AlertComponent = ({ isOpen, error, message, sx }: AlertProps) => {
    return (
        <Slide direction="left" in={isOpen} mountOnEnter unmountOnExit>
            <Box sx={{
                display: 'flex',
                alignItems: 'flex-end',
                justifyContent: 'flex-end',
                position: 'sticky',
                bottom: '128px',
                zIndex: '1300',
                height: '100%'
            }}>
                <Alert
                data-testid="alert"
                severity={error ? 'error' : 'success'}
                icon={error ? <ErrorOutline /> : <CheckCircleOutline />}
                sx={{
                    ...sx,
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
                }}
                >
                    {message}
                </Alert>
            </Box>
        </Slide>
    );
};

export default AlertComponent;