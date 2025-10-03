import { Box, Typography, Link, Stack, Button } from '@mui/material';
import BreadcrumbsBox from '../../components/BreadcrumbsBox/BreadcrumbsBox';
import { useTranslation } from 'react-i18next';
import { TitleBox } from '@pagopa/selfcare-common-frontend/lib';
import { useNavigate } from 'react-router-dom';
import ROUTES from '../../routes';
import { theme } from '@pagopa/mui-italia';
import { SingleFileInput } from '@pagopa/mui-italia';
import { useState } from 'react';
import styles from './reverse.module.css';

const Reverse = () => {
    const [file, setFile] = useState<File | null>(null);
    const { t } = useTranslation();
    const navigate = useNavigate();

    const handleSelect = (file: File) => {
        setFile(file);
    };
    return (
        <Box>
            <BreadcrumbsBox
                backLabel={t('commons.exitBtn')} items={['Gestione acquisti', 'Storna transazione']} active={true} onClickBackButton={() => navigate(ROUTES.BUY_MANAGEMENT)} />
            <TitleBox
                title={t('pages.reverse.title')}
                mtTitle={3}
                variantTitle="h4"
                subTitle={t('pages.reverse.subtitle')}
                variantSubTitle='body2'
            />

            <Box sx={{ backgroundColor: theme.palette.background.paper, borderRadius: '4px' }} mt={4} p={3} className={styles.uploadFileContainer}>
                <Typography variant="h6" fontWeight={theme.typography.fontWeightBold}>{t('pages.reverse.creditNote')}</Typography>
                <Typography variant="body2" mt={4} mb={1}>{t('pages.reverse.creditNoteSubtitle')}</Typography>
                <Link href="#" sx={{ fontWeight: theme.typography.fontWeightMedium, fontSize: '14px' }}>{t('pages.reverse.manualLink')}</Link>
                <Box mt={3}>
                    <SingleFileInput onFileSelected={handleSelect} onFileRemoved={() => { }} value={file} dropzoneLabel="Trascina qui il file <PDF> della fattura da caricare o " dropzoneButton="selezionalo dal tuo computer" rejectedLabel="File type not supported" />
                </Box>
            </Box>
            <Stack direction="row" spacing={2} mt={3} justifyContent="space-between">
                <Button variant="outlined" onClick={() => navigate(ROUTES.BUY_MANAGEMENT)}>Indietro</Button>
                <Button variant="contained">Continua</Button>
            </Stack>
        </Box>
    );
};

export default Reverse;
