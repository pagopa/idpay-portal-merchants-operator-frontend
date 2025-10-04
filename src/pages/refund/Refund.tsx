import { Box, Typography, Link, Stack, Button } from '@mui/material';
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
    const { t } = useTranslation();
    const navigate = useNavigate();
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleRemove = () => setFile(null)

    const handleRefund = () => file && navigate(ROUTES.REFUNDS_MANAGEMENT)
    const handleNavigateBack = () => navigate(ROUTES.BUY_MANAGEMENT)

    const handleButtonClick = () => {
        fileInputRef.current?.click();
    };

    const handleFileSelect = (file: File) => {
        setFile(file);
    };

    return (
        <Box>
            <BreadcrumbsBox
                backLabel={t('commons.exitBtn')} items={['Gestione acquisti', 'Richiedi rimborso']} active={true} onClickBackButton={() => navigate(ROUTES.BUY_MANAGEMENT)} />
            <TitleBox
                title={t('pages.refund.title')}
                mtTitle={3}
                variantTitle="h4"
                subTitle={t('pages.refund.subtitle')}
                variantSubTitle='body2'
            />

            <Box sx={{ backgroundColor: theme.palette.background.paper, borderRadius: '4px' }} mt={4} p={2} className={style.uploadFileContainer} >
                <Typography variant="h6" fontWeight={theme.typography.fontWeightBold}>Carica la fattura</Typography>
                <Typography variant="body2" mt={4} mb={1}>Carica il file della fattura elettronica relativa a questo acquisto. Assicurati che il documento sia in formato .xml o .pdf e conforme agli standard della fatturazione elettronica</Typography>
                <Link href="#" sx={{ fontWeight: theme.typography.fontWeightMedium, fontSize: '14px' }}>Dubbi? Vai sul manuale</Link>
                <Box mb={2}>
                    <SingleFileInput accept={['application/pdf', 'application/xml']} onFileSelected={handleFileSelect} onFileRemoved={handleRemove} value={file} dropzoneLabel="Trascina qui il file <PDF> della fattura da caricare o " dropzoneButton="selezionalo dal tuo computer" rejectedLabel="File type not supported" />
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
            <Stack direction="row" spacing={2} mt={3} justifyContent="space-between">
                <Button onClick={handleNavigateBack} variant="outlined">Indietro</Button>
                <Button onClick={handleRefund} variant="contained">Continua</Button>
            </Stack>
        </Box>
    );
};

export default Refund;
