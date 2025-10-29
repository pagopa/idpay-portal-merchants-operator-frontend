// import { useState } from 'react';
// import routes from '../../routes';
// import { ENV } from '../../utils/env';
// import { useOneTrustNotice } from '../../hooks/useOneTrustNotice';
// import OneTrustContentWrapper from '../components/OneTrustContentWrapper';
import { Box, Button, Grid, Paper } from '@mui/material';
import { useTranslation } from 'react-i18next';
import DOMPurify from 'dompurify';
import tosHTML from './tosHTML.json';
import BreadcrumbsBox from '../../components/BreadcrumbsBox/BreadcrumbsBox';
import { TitleBox } from '@pagopa/selfcare-common-frontend/lib';
import { useNavigate } from 'react-router-dom';

const TOS = () => {
  const { t } = useTranslation();
    const navigate = useNavigate()
  return (
    <>
      <Box sx={{ width: '100%' }}>
        <Box>
          <Box mt={2} sx={{ display: 'grid', gridColumn: 'span 8' }}>
            <BreadcrumbsBox backLabel={t('commons.backBtn')} items={[]} active />
            <TitleBox
              title={t('pages.tosStatic.title')}
              mbTitle={2}
              mtTitle={2}
              variantTitle="h4"
            />
          </Box>
        </Box>

        <Paper elevation={1} square={true} sx={{ mt: 2 }}>
          <Box px={4} pt={2} pb={4}>
            <Grid container>
              <Grid size={{xs: 12}}>
                <div
                  className="content"
                  dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(tosHTML.html) }}
                />
              </Grid>
            </Grid>
          </Box>
        </Paper>

        <Box sx={{ mt: 4, display: 'flex', justifyContent: 'space-between' }}>
          <Button
            data-testid="back-stores-button"
            variant="outlined"
            onClick={() => navigate(-1)}
          >
            {t('commons.backBtn')}
          </Button>
        </Box>
      </Box>
    </>
  );
};
export default TOS;
