import { Box, Grid, Typography } from '@mui/material';
import { theme } from '@pagopa/mui-italia';

const SummaryAcceptDiscount = () => {

    return (
        <Box sx={{ margin: '20px'}} >
            <Grid container spacing={2} sx={{maxWidth: '920px'}}>
                <Grid size={{ xs: 12, md: 12, lg: 12 }}>
                    <Box sx={{ backgroundColor: theme.palette.background.paper }} py={3} px={3}>
                        <Grid container spacing={2}>
                            <Grid size={{ xs: 12, md: 12, lg: 12 }}>
                                <Typography variant="h6" fontWeight={theme.typography.fontWeightBold}>DATI BENEFICIARIO</Typography>
                            </Grid>
                            <Grid size={{ xs: 12, md: 12, lg: 12 }}>
                                <Typography variant="body1">Codice fiscale</Typography>
                                <Typography variant="h6">LNFN76458VBNRGIRFN</Typography>
                            </Grid>
                        </Grid>
                    </Box>
                </Grid>
                <Grid size={{ xs: 12, md: 12, lg: 12 }}>
                    <Box sx={{ backgroundColor: theme.palette.background.paper }} py={3} px={3}>
                       <Grid container spacing={2}>
                        <Grid size={{ xs: 12, md: 12, lg: 12 }}>
                            <Typography variant="h6" fontWeight={theme.typography.fontWeightBold}>RIEPILOGO BUONO</Typography>
                        </Grid>
                        <Grid size={{ xs: 12, md: 12, lg: 12 }}>
                            <Typography variant="body1">Riepilogo Buono Sconto</Typography>
                        </Grid>
                       </Grid>
                    </Box>
                </Grid>
            </Grid>

        </Box>
    );
};


export default SummaryAcceptDiscount;