import { Box, Grid, Paper } from '@mui/material';
import DOMPurify from 'dompurify';
import { TitleBox } from '@pagopa/selfcare-common-frontend/lib';
import { HeaderAccount } from '@pagopa/mui-italia';
import { CustomFooter } from '../Footer/CustomFooter';

export const PrivacyAndTosLayout = ({ text, title }: { text: Record<string, string>, title: string }) => {

  return (

    <>
      <HeaderAccount rootLink={{
        href: "https://www.pagopa.it/it/",
        label: "PagoPA S.p.A.",
        ariaLabel: "PagoPA S.p.A.",
        title: "PagoPA S.p.A.",
      }} enableLogin={false} onAssistanceClick={() => window.open(import.meta.env.VITE_ASSISTANCE || '', '_blank')} />
      <Box sx={{ width: '100%', padding: '20px' }}>

        <Box>
          <Box mt={2} sx={{ display: 'grid', gridColumn: 'span 8' }}>
            <TitleBox
              title={title}
              mbTitle={2}
              mtTitle={2}
              variantTitle="h4"
            />
          </Box>
        </Box>

        <Paper elevation={1} square={true} sx={{ mt: 2 }}>
          <Box px={4} pt={2} pb={4}>
            <Grid container>
              <Grid size={{ xs: 12 }}>
                <div
                  className="content"
                  dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(text.html) }}
                />
              </Grid>
            </Grid>
          </Box>
        </Paper>
        

      </Box>
      <CustomFooter />
    </>
  );
};
