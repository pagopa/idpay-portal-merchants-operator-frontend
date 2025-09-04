import { Box, Grid, Typography, Chip, Button } from '@mui/material';
import { theme } from '@pagopa/mui-italia';
import { useTranslation } from 'react-i18next';
import BreadcrumbsBox from '../../components/BreadcrumbsBox/BreadcrumbsBox';
import { TitleBox } from '@pagopa/selfcare-common-frontend/lib';
import { useNavigate } from 'react-router-dom';

const SummaryAcceptDiscount = () => {

    const { t } = useTranslation();
    const navigate = useNavigate();

    return (
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
            <Grid container spacing={2} sx={{ maxWidth: '920px' }}>
                <Grid size={{ xs: 12, md: 12, lg: 12 }}>
                    <Box sx={{ backgroundColor: theme.palette.background.paper }} py={3} px={3}>
                        <Grid container spacing={2}>
                            <Grid size={{ xs: 12, md: 12, lg: 12 }}>
                                <Typography variant="body1" fontWeight={theme.typography.fontWeightBold} sx={{ textTransform: 'uppercase' }}>{t('pages.acceptDiscount.beneficiaryData')}</Typography>
                            </Grid>
                            <Grid size={{ xs: 12, md: 12, lg: 12 }}>
                                <Typography variant="body2" sx={{ fontWeight: theme.typography.fontWeightRegular, color: theme.palette.text.secondary }}>{t('pages.acceptDiscount.fiscalCode')}</Typography>
                                <Typography variant="body1" sx={{ fontWeight: theme.typography.fontWeightMedium, textTransform: 'uppercase' }}>LNFN76458VBNRGIRFN</Typography>
                            </Grid>
                        </Grid>
                    </Box>
                </Grid>
                <Grid size={{ xs: 12, md: 12, lg: 12 }}>
                    <Box sx={{ backgroundColor: theme.palette.background.paper }} py={3} px={3}>
                        <Grid container spacing={2}>
                            <Grid size={{ xs: 12, md: 12, lg: 12 }}>
                                <Typography variant="body1" fontWeight={theme.typography.fontWeightBold} sx={{ textTransform: 'uppercase' }}>{t('pages.acceptDiscount.discountCodeSummary')}</Typography>
                            </Grid>
                            <Grid size={{ xs: 12, md: 12, lg: 12 }}>
                                <Typography variant="body2" sx={{ fontWeight: theme.typography.fontWeightRegular, color: theme.palette.text.secondary }}>{t('pages.acceptDiscount.product')}</Typography>
                                <Typography variant="body2" sx={{ fontWeight: theme.typography.fontWeightMedium }}>Asciugatrice bosch 34</Typography>
                            </Grid>
                            <Grid size={{ xs: 12, md: 12, lg: 12 }}>
                                <Typography variant="body2" sx={{ fontWeight: theme.typography.fontWeightRegular, color: theme.palette.text.secondary }}>{t('pages.acceptDiscount.discountCode')}</Typography>
                                <Typography variant="body2" sx={{ fontWeight: theme.typography.fontWeightMedium, textTransform: 'uppercase' }}>ASDASDASDASD</Typography>
                            </Grid>
                            <Grid size={{ xs: 12, md: 12, lg: 12 }}>
                                <Typography variant="body2" sx={{ fontWeight: theme.typography.fontWeightRegular, color: theme.palette.text.secondary }}>{t('pages.acceptDiscount.emissionDate')}</Typography>
                                <Typography variant="body2" sx={{ fontWeight: theme.typography.fontWeightMedium }}>27/07/2025</Typography>
                            </Grid>
                            <Grid size={{ xs: 12, md: 12, lg: 12 }}>
                                <Typography variant="body2" sx={{ fontWeight: theme.typography.fontWeightRegular, color: theme.palette.text.secondary }}>{t('pages.acceptDiscount.amountToDiscount')}</Typography>
                                <Typography variant="body2" sx={{ fontWeight: theme.typography.fontWeightMedium }}>200,00 €</Typography>
                            </Grid>
                            <Grid size={{ xs: 12, md: 12, lg: 12 }}>
                                <Typography variant="body2" sx={{ fontWeight: theme.typography.fontWeightRegular, color: theme.palette.text.secondary }}>{t('pages.acceptDiscount.discount')}</Typography>
                                <Typography variant="body2" sx={{ fontWeight: theme.typography.fontWeightMedium }}>100,00 €</Typography>
                            </Grid>
                            <Grid size={{ xs: 12, md: 12, lg: 12 }}>
                                <Typography variant="body2" sx={{ fontWeight: theme.typography.fontWeightRegular, color: theme.palette.text.secondary }}>{t('pages.acceptDiscount.totalAmount')}</Typography>
                                <Typography variant="body2" sx={{ fontWeight: theme.typography.fontWeightMedium }}>100,00 €</Typography>
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
                <Button variant="outlined" onClick={() => navigate('/')} >
                    {'Indietro'}
                </Button>
                <Button
                    variant="contained"
                    onClick={() => console.log('Avanti')}

                >
                    {t('pages.acceptDiscount.title')}
                </Button>
            </Box>

        </Box>
    );
};


export default SummaryAcceptDiscount;