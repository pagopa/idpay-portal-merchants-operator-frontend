import { Box, Link, Typography } from '@mui/material';
import Header from '../../components/Header/Header';
import { CustomFooter } from '../../components/Footer/CustomFooter';
import { useScopedTranslation } from '../../hooks/useScopedTranslation';
import { TOSAgreement } from '@pagopa/mui-italia';
import { BASE_ROUTE } from '../../utils/constants';

interface TOSAcceptanceProps {
    acceptTOS: () => void;
    tosRoute: string;
    privacyRoute: string;
    firstAcceptance: boolean | undefined;
}

const TOSAcceptance = ({ acceptTOS, tosRoute, privacyRoute, firstAcceptance }: TOSAcceptanceProps) => {
    const { t } = useScopedTranslation();

    const description = firstAcceptance ? (
        <Typography color="text.secondary">
            {t('commons.pages.tos.termsDescription')}{' '}
            <Link underline="hover" href={BASE_ROUTE + tosRoute} target="_blank">
                {t('commons.pages.tos.linkTos')}
            </Link>{' '}
            {t('commons.pages.tos.termsDescription2')}
            <Link underline="hover" href={BASE_ROUTE + privacyRoute} target="_blank">
                {t('commons.pages.tos.linkPrivacy')}
            </Link>
        </Typography>
    ) : (
        <Typography color="text.secondary">
            {t('commons.pages.tos.termsDescriptionChanged')}{' '}
            <Link underline="hover" href={BASE_ROUTE + tosRoute} target="_blank">
                {t('commons.pages.tos.linkTos')}
            </Link>{' '}
            {t('commons.pages.tos.and')}{' '}
            <Link underline="hover" href={BASE_ROUTE + privacyRoute} target="_blank">
                {t('commons.pages.tos.linkPrivacy')}
            </Link>
        </Typography>
    );
    return (
        <Box
            display="grid"
            gridTemplateColumns="1fr"
            gridTemplateRows="auto 1fr auto"
            gridTemplateAreas={`"header"
                        "body"
                        "footer"`}
            minHeight="100vh"
        >
            <Box gridArea="header">
                <Header />
            </Box>
            <Box gridArea="body">
                <Box height="100%" width="100%" px={2} sx={{ backgroundColor: '#FAFAFA' }}>
                    <TOSAgreement
                        sx={{ textAlign: 'center' }}
                        productName={t('commons.pages.tos.title')}
                        description={description}
                        onConfirm={() => acceptTOS()}
                    >
                        {null}
                    </TOSAgreement>
                </Box>
            </Box>
            <Box gridArea="footer">
                <CustomFooter />
            </Box>
        </Box>
    );
};

export default TOSAcceptance;