import { Box, Typography, Link, Stack, Button, Alert } from '@mui/material';
import BreadcrumbsBox from '../BreadcrumbsBox/BreadcrumbsBox'; 
import { useTranslation } from 'react-i18next';
import { TitleBox } from '@pagopa/selfcare-common-frontend/lib';
import { useNavigate, useParams } from 'react-router-dom';
import ROUTES from '../../routes';
import { theme } from '@pagopa/mui-italia';
import { SingleFileInput } from '@pagopa/mui-italia';
import { useState, useRef, useEffect } from 'react';
import FileUploadIcon from '@mui/icons-material/FileUpload';
import AlertComponent from '../Alert/AlertComponent';


interface FileUploadActionProps {
    titleKey: string;   
    subtitleKey: string;    
    i18nBlockKey: string;   
    apiCall: (trxId: string, file: File) => Promise<any>;   
    successStateKey: string; 
    breadcrumbsLabelKey: string; 
    manualLink: string; 
    styleClass: string; 
}

const MAX_FILE_SIZE_BYTES = 20 * 1024 * 1024; 
const VALID_MIME_TYPES = ['application/pdf', 'application/xml', 'text/xml'];

const FileUploadAction: React.FC<FileUploadActionProps> = ({
    titleKey,
    subtitleKey,
    i18nBlockKey,
    apiCall,
    successStateKey,
    breadcrumbsLabelKey,
    manualLink,
    styleClass
}) => {
    const [file, setFile] = useState<File | null>(null);
    const [fileSizeError, setFileSizeError] = useState<boolean>(false);
    const [fileTypeError, setFileTypeError] = useState<boolean>(false);
    const [loadingFile, setLoadingFile] = useState<boolean>(false);
    const [errorAlert, setErrorAlert] = useState<boolean>(false);
    const { t } = useTranslation();
    const navigate = useNavigate();
    const fileInputRef = useRef<HTMLInputElement>(null);
    const { trxId } = useParams<{ trxId: string }>();

    useEffect(() => {
        if (errorAlert) {
            const timer = setTimeout(() => {
                setErrorAlert(false);
            }, 5000);
            return () => clearTimeout(timer);
        }
    }, [errorAlert]);

    const handleFileSelect = (selectedFile: File) => {
        if(!VALID_MIME_TYPES.includes(selectedFile.type)){
            setFileTypeError(true);
            setFile(null);
            return;
        };
        if (selectedFile.size <= MAX_FILE_SIZE_BYTES) {
            setFile(selectedFile);
            setFileSizeError(false);
            setFileTypeError(false);
        } else {
            setFileSizeError(true);
            setFileTypeError(false);
        }
    };

    const handleRemoveFile = () => {
        setFile(null);
        if (fileInputRef.current) {
             fileInputRef.current.value = ''; 
        }
    };

    const handleButtonClick = () => {
        fileInputRef.current?.click();
    };

    const handleAction = async () => {
        if (file && trxId) {
            setLoadingFile(true);
            try {
                await apiCall(trxId, file);
                setLoadingFile(false);
                navigate(ROUTES.BUY_MANAGEMENT, {
                    state: {
                        [successStateKey]: true 
                    }
                });
            } catch (error) {
                console.error('API Error:', error);
                setErrorAlert(true);
                setLoadingFile(false);
            }
        }
    }

    return (
        <Box p={4}>
            <BreadcrumbsBox
                backLabel={t('commons.exitBtn')}
                items={[{ label: t('routes.buyManagement'), path: ROUTES.BUY_MANAGEMENT }, { label: breadcrumbsLabelKey, path: ROUTES.REVERSE }]}
                active={true}
                onClickBackButton={() => navigate(ROUTES.BUY_MANAGEMENT)}
            />
            <TitleBox
                title={t(titleKey)}
                mtTitle={3}
                variantTitle="h4"
                subTitle={t(subtitleKey)}
                variantSubTitle='body2'
            />

            <Box sx={{ backgroundColor: theme.palette.background.paper, borderRadius: '4px', minWidth: { lg: '1000px' } }} mt={4} p={3} className={styleClass} >
                <Typography variant="h6" fontWeight={theme.typography.fontWeightBold}>{t(`${i18nBlockKey}.creditNote`)}</Typography>
                <Typography variant="body2" mt={4} mb={1} sx={{marginTop: '32px !important'}}>{t(`${i18nBlockKey}.creditNoteSubtitle`)}</Typography>
                <Link onClick={() => window.open(manualLink || '', '_blank')} sx={{ fontWeight: theme.typography.fontWeightMedium, fontSize: '14px' }}>{t(`${i18nBlockKey}.manualLink`)}</Link>
                {
                    fileSizeError && (
                        <Box mt={2}>
                            <Alert data-testid='alert' severity="error">
                                {t(`commons.fileSizeError`)}
                            </Alert>
                        </Box>
                    )
                }
                {
                    fileTypeError && (
                        <Box data-testid='alert' mt={2}>
                            <Alert  severity="error">
                                {t(`${i18nBlockKey}.fileNotSupported`)}
                            </Alert>
                        </Box>
                    )
                }
                <Box mt={1} mb={2}>
                    <SingleFileInput
                        onFileSelected={handleFileSelect}
                        onFileRemoved={handleRemoveFile}
                        value={file}
                        dropzoneLabel={t(`${i18nBlockKey}.uploadFile`)}
                        dropzoneButton={t(`${i18nBlockKey}.uploadFileButton`)}
                        rejectedLabel={t(`${i18nBlockKey}.fileNotSupported`)}
                        loading={loadingFile}
                    />
                </Box>
                
                <input
                    type="file"
                    accept='application/pdf, application/xml'
                    ref={fileInputRef}
                    style={{ display: 'none' }}
                    data-testid="upload-input-test"
                    onChange={(e) => {
                        const selectedFile = e.target.files?.[0];
                        if (selectedFile) {
                            handleFileSelect(selectedFile);
                        }
                        e.target.value = ''; 
                    }}
                />

                {
                    file && (
                        <Button
                            data-testid='file-btn-test'
                            variant="naked"
                            startIcon={<FileUploadIcon />}
                            onClick={handleButtonClick}
                            sx={{ fontWeight: 'bold', fontSize: '14px' }}
                        >
                            {t(`${i18nBlockKey}.replaceFile`)}
                        </Button>
                    )
                }
            </Box>
            <Stack direction={{ xs: 'column', sm: 'row' }} p={{ xs: 2, sm: 0 }} spacing={2} mt={3} justifyContent="space-between">
                <Button data-testid='back-btn-test' variant="outlined" onClick={() => navigate(ROUTES.BUY_MANAGEMENT)}>{t('commons.backBtn')}</Button>
                <Button data-testid='continue-btn-test' variant="contained" onClick={handleAction} >{t('commons.continueBtn')}</Button>
            </Stack>
            {
                errorAlert && (
                    <AlertComponent
                        data-testid='alert-component'
                        error={true}
                        message={t('pages.reverse.errorAlert')} 
                    />
                )
            }
        </Box>
    );
};

export default FileUploadAction;