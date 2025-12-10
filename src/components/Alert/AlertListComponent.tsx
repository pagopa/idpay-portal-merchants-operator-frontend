import { Alert, Box, Slide, SxProps, Theme } from '@mui/material';
import ErrorOutline from '@mui/icons-material/ErrorOutline';
import CheckCircleOutline from '@mui/icons-material/CheckCircleOutline';

type AlertProps = {
    isOpen?: boolean;
    error?: boolean;
    message: string;
}[]

type Props = {
    alertList: AlertProps;
    containerStyle?: SxProps<Theme>;
    contentStyle?: SxProps<Theme>;
}

const cmpList = (alertList: AlertProps) => {
    return alertList.map(({ isOpen, error, message }) => {
        return <Slide direction="left" in={isOpen} mountOnEnter unmountOnExit>
            <Alert
                data-testid="alert"
                severity={error ? 'error' : 'success'}
                icon={error ? <ErrorOutline /> : <CheckCircleOutline />}
                sx={{
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
        </Slide>
    })
}

const AlertListComponent = ({ alertList, containerStyle, contentStyle }: Props) => {

    return (
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
            <Box sx={{
                display: "flex",
                flexDirection: "column",
                rowGap: "1rem",
                position: 'absolute',
                bottom: '-108px',
                width: 'fit-content',
                zIndex: 1300,
                ...contentStyle,
            }}>
                {cmpList(alertList)}
            </Box>
        </Box>
    );
};

export default AlertListComponent;