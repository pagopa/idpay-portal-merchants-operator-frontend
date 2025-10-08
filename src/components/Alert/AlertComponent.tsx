import { Alert } from '@mui/material';
import ErrorOutline from '@mui/icons-material/ErrorOutline';
import CheckCircleOutline from '@mui/icons-material/CheckCircleOutline';

interface AlertProps {
        error: boolean;
        message: string;
}

const AlertComponent = ({ error, message }: AlertProps) => {
    return (
        <Alert
            data-testid="alert"
            severity={error ? 'error' : 'success'}
            icon={error ? <ErrorOutline /> : <CheckCircleOutline />}
            sx={{
                position: 'fixed',
                bottom: 20,
                right: 20,
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
    );
};

export default AlertComponent;