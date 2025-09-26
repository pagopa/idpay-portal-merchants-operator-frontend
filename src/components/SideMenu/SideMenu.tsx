import { List, Box } from '@mui/material';
import { useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import ConfirmationNumberIcon from '@mui/icons-material/ConfirmationNumber';
import PaymentsIcon from '@mui/icons-material/Payments';
import InventoryIcon from '@mui/icons-material/Inventory';
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
            title={t('sideMenu.purchaseManagement')}
            handleClick={() => navigate(ROUTES.BUY_MANAGEMENT, { replace: true })}
            isSelected={location.pathname === ROUTES.BUY_MANAGEMENT}
            icon={ConfirmationNumberIcon}
            level={0}
            data-testid="initiativeList-click-test"
          />
          <SideNavItem
            title={t('sideMenu.refundManagement')}
            handleClick={() => navigate(ROUTES.REFUNDS_MANAGEMENT, { replace: true })}
            isSelected={location.pathname === ROUTES.REFUNDS_MANAGEMENT}
            icon={PaymentsIcon}
            level={0}
            data-testid="initiativeList-click-test"
          />
          <SideNavItem
            title={t('sideMenu.products')}
            handleClick={() => navigate(ROUTES.PRODUCTS, { replace: true })}
            isSelected={location.pathname === ROUTES.PRODUCTS}
            icon={InventoryIcon}
            level={0}
            data-testid="initiativeList-click-test"
          />
        </List>
      </Box>
    </Box>
  );
}
