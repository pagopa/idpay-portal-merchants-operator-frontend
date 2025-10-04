import { Box, Typography, Link, Stack, Button, Alert } from '@mui/material';
import BreadcrumbsBox from '../../components/BreadcrumbsBox/BreadcrumbsBox';
import { useTranslation } from 'react-i18next';
import { TitleBox } from '@pagopa/selfcare-common-frontend/lib';
import { useNavigate } from 'react-router-dom';
import ROUTES from '../../routes';
import { theme } from '@pagopa/mui-italia';
import { SingleFileInput } from '@pagopa/mui-italia';
import { useState, useRef } from 'react';
import style from './style.module.css'
import FileUploadIcon from '@mui/icons-material/FileUpload';

const Refund = () => {
    const [file, setFile] = useState<File | null>(null);
    const [fileSizeError, setFileSizeError] = useState<boolean>(false);
    const { t } = useTranslation();
    const navigate = useNavigate();
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleRemove = () => setFile(null)

    const handleButtonClick = () => {
        fileInputRef.current?.click();
    };

    const handleFileSelect = (file: File) => {
        if (file.size <= 20971520) { //20MB is max size
            setFile(file);
            setFileSizeError(false);
        } else {
            setFileSizeError(true);
        }
    };

    return (
        <Box>
            <BreadcrumbsBox
                backLabel={t('commons.exitBtn')} items={[{ label: 'Gestione acquisti', path: ROUTES.BUY_MANAGEMENT }, { label: 'Richiedi rimborso', path: ROUTES.REFUND }]} active={true} onClickBackButton={() => navigate(ROUTES.BUY_MANAGEMENT)} />
            <TitleBox
                title={t('pages.refund.title')}
                mtTitle={3}
                variantTitle="h4"
                subTitle={t('pages.refund.subtitle')}
                variantSubTitle='body2'
            />

            <Box sx={{ backgroundColor: theme.palette.background.paper, borderRadius: '4px' }} mt={4} p={2} className={style.uploadFileContainer} minWidth={{ lg: '1000px' }}>
                <Typography variant="h6" fontWeight={theme.typography.fontWeightBold}>{t('pages.refund.uploadInvoice')}</Typography>
                <Typography variant="body2" mt={4} mb={1}>{t('pages.refund.uploadInvoiceDescription')}</Typography>
                <Link href="#" sx={{ fontWeight: theme.typography.fontWeightMedium, fontSize: '14px' }}>{t('pages.refund.manualLink')}</Link>
                {
                    fileSizeError && (
                        <Box mt={2}>
                            <Alert severity="error">
                                {t('pages.reverse.fileSizeError')}
                            </Alert>
                        </Box>
                    )
                }
                <Box mb={2} mt={1}>
                    <SingleFileInput accept={['application/pdf', 'application/xml']} onFileSelected={handleFileSelect} onFileRemoved={handleRemove} value={file} dropzoneLabel={t('pages.refund.uploadFile')} dropzoneButton={t('pages.refund.uploadFileButton')} rejectedLabel={t('pages.refund.fileNotSupported')} />
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
                            {t('pages.refund.replaceFile')}
                        </Button>
                    )
                }
            </Box>
            <Stack direction={{ xs: 'column', sm: 'row' }} p={{ xs: 2, sm: 0 }} spacing={2} mt={3} justifyContent="space-between">
                <Button variant="outlined" onClick={() => navigate(ROUTES.BUY_MANAGEMENT)}>Indietro</Button>
                <Button variant="contained">Continua</Button>
            </Stack>
        </Box>
    );
};

export default Refund;
