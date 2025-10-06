import { Box, Typography, Link, Stack, Button } from '@mui/material';
import BreadcrumbsBox from '../../components/BreadcrumbsBox/BreadcrumbsBox';
import { useTranslation } from 'react-i18next';
import { TitleBox } from '@pagopa/selfcare-common-frontend/lib';
import { useNavigate, useParams } from 'react-router-dom';
import ROUTES from '../../routes';
import { theme } from '@pagopa/mui-italia';
import { SingleFileInput } from '@pagopa/mui-italia';
import { useState, useRef, useEffect } from 'react';
import styles from './reverse.module.css';
import FileUploadIcon from '@mui/icons-material/FileUpload';
import Alert from '@mui/material/Alert';
import { reverseTransactionApi } from '../../services/merchantService';
import AlertComponent from '../../components/Alert/AlertComponent';


const Reverse = () => {
    const [file, setFile] = useState<File | null>(null);
    const [fileSizeError, setFileSizeError] = useState<boolean>(false);
    const [loadingFile, setLoadingFile] = useState<boolean>(false);
    const [errorAlert, setErrorAlert] = useState<boolean>(false);
    const { t } = useTranslation();
    const navigate = useNavigate();
    const fileInputRef = useRef(null);
    const { trxId } = useParams<{ trxId: string }>();

    useEffect(() => {
        if (errorAlert){
            const timer = setTimeout(() => {
                setErrorAlert(false);
            }, 5000);
            return () => clearTimeout(timer);
        }
    }, [errorAlert]);

    const handleFileSelect = (file: File) => {
        if (file.size <= 20971520) { //20MB is max size
            setFile(file);
            setFileSizeError(false);
        } else {
            setFileSizeError(true);
        }
    };
    const handleRemoveFile = () => {
        setFile(null);
    };

    const handleButtonClick = () => {
        fileInputRef.current?.click();
    };

    const reverseTransaction = async () => {
            if (file) {
                setLoadingFile(true);
            try {
                const response = await reverseTransactionApi(trxId, file);
                console.log(response);
                setLoadingFile(false);
                navigate(ROUTES.REFUNDS_MANAGEMENT);
            } catch (error) {
                console.log(error);
                setErrorAlert(true);
                setLoadingFile(false);
            }
        }
    }


    return (
        <Box p={4}>
            <BreadcrumbsBox
                backLabel={t('commons.exitBtn')} items={[{ label: 'Gestione acquisti', path: ROUTES.BUY_MANAGEMENT }, { label: 'Storna transazione', path: ROUTES.REVERSE }]} active={true} onClickBackButton={() => navigate(ROUTES.BUY_MANAGEMENT)} />
            <TitleBox
                title={t('pages.reverse.title')}
                mtTitle={3}
                variantTitle="h4"
                subTitle={t('pages.reverse.subtitle')}
                variantSubTitle='body2'
            />

            <Box sx={{ backgroundColor: theme.palette.background.paper, borderRadius: '4px', minWidth: { lg: '1000px' } }} mt={4} p={3} className={styles.uploadFileContainer} >
                <Typography variant="h6" fontWeight={theme.typography.fontWeightBold}>{t('pages.reverse.creditNote')}</Typography>
                <Typography variant="body2" mt={4} mb={1}>{t('pages.reverse.creditNoteSubtitle')}</Typography>
                <Link href={import.meta.env.VITE_MANUAL_LINK} sx={{ fontWeight: theme.typography.fontWeightMedium, fontSize: '14px' }}>{t('pages.reverse.manualLink')}</Link>
                {
                    fileSizeError && (
                        <Box mt={2}>
                            <Alert severity="error">
                                {t('pages.reverse.fileSizeError')}
                            </Alert>
                        </Box>
                    )
                }
                <Box mt={1} mb={2}>
                    <SingleFileInput accept={['application/pdf', 'application/xml']} onFileSelected={handleFileSelect} onFileRemoved={handleRemoveFile} value={file} dropzoneLabel={t('pages.reverse.uploadFile')} dropzoneButton={t('pages.reverse.uploadFileButton')} rejectedLabel={t('pages.reverse.fileNotSupported')} loading={loadingFile} />
                </Box>
                <input
                    type="file"
                    accept='application/pdf, application/xml'
                    ref={fileInputRef}
                    style={{ display: 'none' }}
                    onChange={(e) => {
                        const selectedFile = e.target.files?.[0];
                        if (selectedFile) {
                            handleFileSelect(selectedFile);
                        }
                    }}
                />

                {
                    file && (
                        <Button
                            variant="naked"
                            startIcon={<FileUploadIcon />}
                            onClick={handleButtonClick}
                            sx={{ fontWeight: 'bold', fontSize: '14px' }}
                        >
                            {t('pages.reverse.replaceFile')}
                        </Button>
                    )
                }
            </Box>
            <Stack direction={{ xs: 'column', sm: 'row' }} p={{ xs: 2, sm: 0 }} spacing={2} mt={3} justifyContent="space-between">
                <Button variant="outlined" onClick={() => navigate(ROUTES.BUY_MANAGEMENT)}>Indietro</Button>
                <Button variant="contained" onClick={reverseTransaction}>Continua</Button>
            </Stack>
            {
                errorAlert && (
                    <AlertComponent
                        error={true}
                        message={t('pages.reverse.errorAlert')}
                    />
                )
            }
        </Box>
    );
};

export default Reverse;
