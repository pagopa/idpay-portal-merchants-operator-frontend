import { List, Box } from '@mui/material';
import { useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import ListAltIcon from '@mui/icons-material/ListAlt';
import ROUTES from '../../routes';
import SideNavItem from './SideNavItem';

/** The side menu of the application */
export default function SideMenu() {
  const { t } = useTranslation();
  const navigate = useNavigate();   
  const location = useLocation();

  return (
    <Box display="grid" mt={1}>
      <Box gridColumn="auto">
        <List data-testid="list-test">
          <SideNavItem
            title={t('pages.overview.overviewTitle')}
            handleClick={() => navigate(ROUTES.HOME, { replace: true })}
            isSelected={location.pathname === ROUTES.HOME}
            icon={ListAltIcon}
            level={0}
            data-testid="initiativeList-click-test"
          />
        </List>
      </Box>
    </Box>
  );
}
