import { List, Box, Divider } from '@mui/material';
import { useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import ROUTES from '../../routes';
import SideNavItem from './SideNavItem';
import PaymentsIcon from '@mui/icons-material/Payments';
import PersonIcon from '@mui/icons-material/Person';
import InventoryIcon from '@mui/icons-material/Inventory';
import ConfirmationNumberIcon from '@mui/icons-material/ConfirmationNumber';

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
            title={t('pages.buyManagement.title')}
            handleClick={() => navigate(ROUTES.BUY_MANAGEMENT, { replace: true })}
            isSelected={location.pathname === ROUTES.HOME|| location.pathname === ROUTES.BUY_MANAGEMENT}
            icon={ConfirmationNumberIcon}
            level={0}
            data-testid="initiativeList-click-test"
          />
           <SideNavItem
            title={t('pages.refundManagement.title')}
            handleClick={() => navigate(ROUTES.REFUNDS_MANAGEMENT, { replace: true })}
            isSelected={location.pathname === ROUTES.REFUNDS_MANAGEMENT}
            icon={PaymentsIcon}
            level={0}
            data-testid="initiativeList-click-test"
          />
           <SideNavItem
            title={t('pages.products.title')}
            handleClick={() => navigate(ROUTES.PRODUCTS, { replace: true })}
            isSelected={location.pathname === ROUTES.PRODUCTS}
            icon={InventoryIcon}
            level={0}
            data-testid="initiativeList-click-test"
          />
          <Divider />
          <SideNavItem
            title={t('pages.profile.title')}
            handleClick={() => navigate(ROUTES.PROFILE, { replace: true })}
            isSelected={location.pathname === ROUTES.PROFILE}
            icon={PersonIcon}
            level={0}
            data-testid="initiativeList-click-test"
          />
        </List>
      </Box>
    </Box>
  );
}
