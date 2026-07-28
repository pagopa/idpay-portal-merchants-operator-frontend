import { Box, Grid, Link } from '@mui/material';
import { useScopedTranslation } from '../../hooks/useScopedTranslation';
import ROUTES from '../../routes';

interface OneTrustContentWrapperProps {
  idSelector: string;
}

const OneTrustContentWrapper = ({
  idSelector,
}: OneTrustContentWrapperProps) => {
  const { t } = useScopedTranslation();

  return (
    <>
      <Grid sx={{ px: 3, py: 3 }}>
        <div className="ot-privacy-notice-language-dropdown-container"></div>
        <div id={idSelector} className="otnotice"></div>
      </Grid>
      <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(12, 1fr)' }}>
        <Grid
          sx={{ display: 'grid', gridColumn: 'span 2', mt: 5, justifyContent: 'center' }}
        ></Grid>
        <Grid sx={{ display: 'grid', gridColumn: 'span 10', mt: 5, justifyContent: 'center' }}>
          <Link underline="hover" href={ROUTES.HOME}>
            {t('pages.tos.backHome')}
          </Link>
        </Grid>
      </Box>
    </>
  );
};

export default OneTrustContentWrapper;
