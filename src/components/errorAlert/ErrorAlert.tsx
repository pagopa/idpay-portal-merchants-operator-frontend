import { Alert } from '@mui/material';
import ErrorOutline from '@mui/icons-material/ErrorOutline';

interface ErrorAlertProps {
        message: string;
}

const ErrorAlert = ({ message }: ErrorAlertProps) => {
    return (
        <Alert
            severity="error"
            icon={<ErrorOutline />}
            sx={{
                position: 'fixed',
                bottom: 40,
                right: 20,
                backgroundColor: 'white',
                width: 'auto',
                maxWidth: '400px',
                minWidth: '300px',
                zIndex: 1300,
                boxShadow: 3,
                borderRadius: 1,
                '& .MuiAlert-icon': {
                    color: '#FF5C5C',
                },
            }}
        >
            {message}
        </Alert>
    );
};

export default ErrorAlert;