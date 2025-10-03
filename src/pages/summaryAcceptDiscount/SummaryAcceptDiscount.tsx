import { Box, Grid, Typography, Chip, Button, CircularProgress, Backdrop, Alert, Stack } from '@mui/material';
import { theme } from '@pagopa/mui-italia';
import { useTranslation } from 'react-i18next';
import BreadcrumbsBox from '../../components/BreadcrumbsBox/BreadcrumbsBox';
import { TitleBox } from '@pagopa/selfcare-common-frontend/lib';
import { useNavigate } from 'react-router-dom';
import { authPaymentBarCode } from '../../services/merchantService';
import ROUTES from '../../routes';
import { useEffect, useState } from 'react';
import { MISSING_DATA_PLACEHOLDER } from '../../utils/constants';
import AlertComponent from '../../components/Alert/AlertComponent';
import { utilsStore } from '../../store/utilsStore';
import VerifiedIcon from '@mui/icons-material/Verified';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';

const SummaryAcceptDiscount = () => {

    const [summaryDataObj, setSummaryDataObj] = useState<any>(null);
    const [errorAlert, setErrorAlert] = useState(false);
    const [authorizeIsLoading, setAuthorizeIsLoading] = useState(false);
    const { t } = useTranslation();
    const navigate = useNavigate();
    const setTransactionAuthorized = utilsStore((state) => state.setTransactionAuthorized);

    useEffect(() => {
        const discountCoupon = sessionStorage.getItem('discountCoupon');
        if (discountCoupon) {
            const formData = JSON.parse(discountCoupon);
            setSummaryDataObj(formData);
        }
    }, []);

    useEffect(() => {
        if (errorAlert) {
            const timer = setTimeout(() => {
                setErrorAlert(false);
            }, 5000);
            return () => clearTimeout(timer);
        }
    }, [errorAlert]);


    const handleAuthorizeDiscount = async () => {
        setAuthorizeIsLoading(true);
        try {
            await authPaymentBarCode({
                trxCode: summaryDataObj?.trxCode, amountCents: summaryDataObj?.originalAmountCents, additionalProperties: {
                    productGtin: summaryDataObj?.productGtin,
                }
            });
            sessionStorage.removeItem('discountCoupon');
            setAuthorizeIsLoading(false);
            setTransactionAuthorized(true);
            navigate(ROUTES.BUY_MANAGEMENT);
        } catch (error) {
            setErrorAlert(true);
            console.log(error);
            setAuthorizeIsLoading(false);
        }
    };

    return (
        <>
            <Backdrop
                sx={(theme) => ({ color: '#fff', zIndex: theme.zIndex.drawer + 1 })}
                open={authorizeIsLoading}
                onClick={() => setAuthorizeIsLoading(false)}
            >
                <CircularProgress color="inherit" />
            </Backdrop>
            <Box sx={{ margin: '20px' }} >
                <Box mt={2} mb={4}>
                    <BreadcrumbsBox
                        active={true}
                        backLabel={t('commons.exitBtn')} items={[
                            t('pages.acceptDiscount.title'),
                            t('pages.acceptDiscount.summary'),
                        ]} />
                    <TitleBox
                        title={t('pages.acceptDiscount.summary')}
                        mtTitle={2}
                        variantTitle="h4"
                        subTitle={t('pages.acceptDiscount.reviewTransactionInfo')}
                        variantSubTitle='body2'
                    />
                </Box>
                {
                    summaryDataObj?.extendedAuthorization === true && (
                        <Alert
                            icon={<WarningAmberIcon />}
                            severity="warning"
                            sx={{
                                backgroundColor: 'white',
                                '& .MuiAlert-icon': {
                                    color: '#FFCB46',
                                },
                            }}
                        >
                            <Typography variant="body2" sx={{ fontWeight: theme.typography.fontWeightRegular, color: theme.palette.text.secondary }}>
                            &lt;{t('pages.summaryAcceptDiscount.alert')}&gt;
                            </Typography>
                        </Alert>
                    )
                }
                <Grid container spacing={2} sx={{ maxWidth: '920px' }} mt={2}>
                    <Grid size={{ xs: 12, md: 12, lg: 12 }}>
                        <Box sx={{ backgroundColor: theme.palette.background.paper, borderRadius: '4px' }} py={3} px={3}>
                            <Grid container spacing={2}>
                                <Grid size={{ xs: 12, md: 12, lg: 12 }} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                    <Typography variant="body1" fontWeight={theme.typography.fontWeightBold} sx={{ textTransform: 'uppercase' }}>{t('pages.acceptDiscount.beneficiaryData')}</Typography>
                                    {
                                        summaryDataObj?.extendedAuthorization === false && (
                                            <Chip label="Identità verificata tramite IO" size='small' icon={<VerifiedIcon sx={{ color: "#0073E6 !important" }}/>}/>
                                        )
                                    }
                                </Grid>
                                <Grid size={{ xs: 12, md: 12, lg: 12 }}>
                                    <Typography variant="body2" sx={{ fontWeight: theme.typography.fontWeightRegular, color: theme.palette.text.secondary }}>{t('pages.acceptDiscount.fiscalCode')}</Typography>
                                    <Stack direction="row" spacing={1}>
                                        <Typography variant="body1" sx={{ fontWeight: theme.typography.fontWeightMedium, textTransform: 'uppercase' }}>{summaryDataObj?.userId}</Typography>
                                        {
                                            summaryDataObj?.extendedAuthorization === false   && (
                                                <VerifiedIcon sx={{ color: "#0073E6 !important" }} fontSize='small'/>
                                            )
                                        }
                                    </Stack>
                                </Grid>
                            </Grid>
                        </Box>
                    </Grid>
                    <Grid size={{ xs: 12, md: 12, lg: 12 }}>
                        <Box sx={{ backgroundColor: theme.palette.background.paper, borderRadius: '4px' }} py={3} px={3}>
                            <Grid container spacing={2}>
                                <Grid size={{ xs: 12, md: 12, lg: 12 }}>
                                    <Typography variant="body1" fontWeight={theme.typography.fontWeightBold} sx={{ textTransform: 'uppercase' }}>{t('pages.acceptDiscount.discountCodeSummary')}</Typography>
                                </Grid>
                                <Grid size={{ xs: 12, md: 12, lg: 12 }}>
                                    <Typography variant="body2" sx={{ fontWeight: theme.typography.fontWeightRegular, color: theme.palette.text.secondary }}>{t('pages.acceptDiscount.product')}</Typography>
                                    <Typography variant="body2" sx={{ fontWeight: theme.typography.fontWeightMedium }}>{summaryDataObj?.productName ?? MISSING_DATA_PLACEHOLDER}</Typography>
                                </Grid>
                                <Grid size={{ xs: 12, md: 12, lg: 12 }}>
                                    <Typography variant="body2" sx={{ fontWeight: theme.typography.fontWeightRegular, color: theme.palette.text.secondary }}>{t('pages.acceptDiscount.discountCode')}</Typography>
                                    <Typography variant="body2" sx={{ fontWeight: theme.typography.fontWeightMedium, textTransform: 'uppercase' }}>{summaryDataObj?.trxCode ?? MISSING_DATA_PLACEHOLDER}</Typography>
                                </Grid>
                                <Grid size={{ xs: 12, md: 12, lg: 12 }}>
                                    <Typography variant="body2" sx={{ fontWeight: theme.typography.fontWeightRegular, color: theme.palette.text.secondary }}>{t('pages.acceptDiscount.emissionDate')}</Typography>
                                    <Typography variant="body2" sx={{ fontWeight: theme.typography.fontWeightMedium }}>{summaryDataObj ? new Date(summaryDataObj?.trxDate).toLocaleDateString('it-IT') : MISSING_DATA_PLACEHOLDER}</Typography>
                                </Grid>
                                <Grid size={{ xs: 12, md: 12, lg: 12 }}>
                                    <Typography variant="body2" sx={{ fontWeight: theme.typography.fontWeightRegular, color: theme.palette.text.secondary }}>{t('pages.acceptDiscount.amountToDiscount')}</Typography>
                                    <Typography variant="body2" sx={{ fontWeight: theme.typography.fontWeightMedium }}>{summaryDataObj?.originalAmountCents || summaryDataObj?.originalAmountCents === 0 ? (Number(summaryDataObj?.originalAmountCents) / 100).toLocaleString('it-IT', {
                                        minimumFractionDigits: 2,
                                        maximumFractionDigits: 2
                                    }) + ' €' : MISSING_DATA_PLACEHOLDER}</Typography>
                                </Grid>
                                <Grid size={{ xs: 12, md: 12, lg: 12 }}>
                                    <Typography variant="body2" sx={{ fontWeight: theme.typography.fontWeightRegular, color: theme.palette.text.secondary }}>{t('pages.acceptDiscount.discount')}</Typography>
                                    <Typography variant="body2" sx={{ fontWeight: theme.typography.fontWeightMedium }}>{summaryDataObj?.rewardCents || summaryDataObj?.rewardCents === 0 ? (Number(summaryDataObj?.rewardCents) / 100).toLocaleString('it-IT', {
                                        minimumFractionDigits: 2,
                                        maximumFractionDigits: 2
                                    }) + ' €' : MISSING_DATA_PLACEHOLDER}</Typography>
                                </Grid>
                                <Grid size={{ xs: 12, md: 12, lg: 12 }}>
                                    <Typography variant="body2" sx={{ fontWeight: theme.typography.fontWeightRegular, color: theme.palette.text.secondary }}>{t('pages.acceptDiscount.totalAmount')}</Typography>
                                    <Typography variant="body2" sx={{ fontWeight: theme.typography.fontWeightMedium }}>{(summaryDataObj?.residualAmountCents || summaryDataObj?.residualAmountCents === 0) ? (Number(summaryDataObj?.residualAmountCents) / 100).toLocaleString('it-IT', {
                                        minimumFractionDigits: 2,
                                        maximumFractionDigits: 2
                                    }) + ' €' : MISSING_DATA_PLACEHOLDER}</Typography>
                                </Grid>
                                <Grid size={{ xs: 12, md: 12, lg: 12 }}>
                                    <Typography variant="body2" sx={{ fontWeight: theme.typography.fontWeightRegular, color: theme.palette.text.secondary }}>{t('pages.acceptDiscount.status')}</Typography>
                                    <Chip label={t('pages.acceptDiscount.toBeAuthorized')} sx={{ marginTop: '10px' }} />
                                </Grid>
                            </Grid>
                        </Box>
                    </Grid>
                </Grid>
                <Box
                    display={'flex'}
                    justifyContent={'space-between'}
                    gap={2}
                    mt={4}
                >
                    <Button variant="outlined" onClick={() => navigate(ROUTES.ACCEPT_DISCOUNT)} >
                        {'Indietro'}
                    </Button>
                    <Button
                        variant="contained"
                        onClick={handleAuthorizeDiscount}

                    >
                        {t('pages.acceptDiscount.title')}
                    </Button>
                </Box>
                {
                    errorAlert && <AlertComponent error={true} message={t('pages.acceptDiscount.errorAlert')} />
                }

            </Box>
        </>
    );
};


export default SummaryAcceptDiscount;