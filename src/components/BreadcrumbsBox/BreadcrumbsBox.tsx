import { Box, Breadcrumbs, Typography } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { ButtonNaked } from '@pagopa/mui-italia';
import { useNavigate } from 'react-router-dom';

interface Props {
  backLabel: string;
  items: Array<string | undefined>;
  active: boolean;
  onClickBackButton?: () => void;
  backButtonPath?: string;
}

const BreadcrumbsBox = ({ backLabel, items, active, onClickBackButton, backButtonPath }: Props) => {
  const navigate = useNavigate();

  const handleBackButton = () => {
    if(onClickBackButton) {
      onClickBackButton();
      return;
    }
    if(backButtonPath) {
      navigate(backButtonPath);
    } else {
      navigate(-1);
    }
  }
  return (
    <Box sx={{ display: 'grid', gridColumn: 'span 12' }}>
      <Breadcrumbs aria-label="breadcrumb">
        <ButtonNaked
          component="button"
          onClick={() => active && handleBackButton()}
          startIcon={<ArrowBackIcon />}
          sx={{ color: 'primary.main', fontSize: '1rem', marginBottom: '3px' }}
          weight="default"
          data-testid="back-btn-test"
        >
          {backLabel}
        </ButtonNaked>
        {items.map((label, index) => (
          <Typography color="text.primary" variant="body2" key={index}  >
            {label}
          </Typography>
        ))}
      </Breadcrumbs>
    </Box>
  );
};

export default BreadcrumbsBox;
