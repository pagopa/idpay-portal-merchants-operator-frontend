import { Box, Breadcrumbs, Typography } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { ButtonNaked } from '@pagopa/mui-italia';
import { useNavigate } from 'react-router-dom';
import styles from './breadcrumsBox.module.css';

interface Props {
  backLabel: string;
  items: Array<{label: string, path: string}>;
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
        {items.map((obj, index) => (
          <Typography color={`text.${index === items.length - 1 ? 'disabled' : 'primary'}`} variant="body2" key={index} className={styles.breadcrumbItemCustom} onClick={() => index !== items.length - 1 && obj.path && navigate(obj.path)}>
            {obj.label}
          </Typography>
        ))}
      </Breadcrumbs>
    </Box>
  );
};

export default BreadcrumbsBox;
