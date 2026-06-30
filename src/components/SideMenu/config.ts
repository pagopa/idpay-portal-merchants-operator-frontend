import PaymentsIcon from '@mui/icons-material/Payments';
import InventoryIcon from '@mui/icons-material/Inventory';
import ConfirmationNumberIcon from '@mui/icons-material/ConfirmationNumber';
import { SvgIconComponent } from '@mui/icons-material';
import ROUTES from '../../routes';

type ConfigProps = {
  key: string;
  title: string;
  route: string;
  icon: SvgIconComponent;
  dataTestId: string;
};

export const config: Array<ConfigProps> = [
  {
    key: 'purchaseManagement',
    title: 'commons.sideMenu.purchaseManagement',
    route: ROUTES.BUY_MANAGEMENT,
    icon: ConfirmationNumberIcon,
    dataTestId: 'initiativeList-click-test',
  },
  {
    key: 'refundManagement',
    title: 'commons.sideMenu.refundManagement',
    route: ROUTES.REFUNDS_MANAGEMENT,
    icon: PaymentsIcon,
    dataTestId: 'initiativeList-click-test',
  },
  {
    key: 'products',
    title: 'commons.sideMenu.products',
    route: ROUTES.PRODUCTS,
    icon: InventoryIcon,
    dataTestId: 'initiativeList-click-test',
  }
];
