import { List, Box, Divider, Button } from "@mui/material";
import { useNavigate, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import ConfirmationNumberIcon from "@mui/icons-material/ConfirmationNumber";
import PaymentsIcon from "@mui/icons-material/Payments";
import InventoryIcon from "@mui/icons-material/Inventory";
import ROUTES from "../../routes";
import SideNavItem from "./SideNavItem";
import { Person } from "@mui/icons-material";
import DehazeIcon from '@mui/icons-material/Dehaze';
import { Dispatch } from "react";

type Props = {
  hideLabels?: boolean;
  setHideLabels?: Dispatch<boolean>;
};

/** The side menu of the application */
export default function SideMenu({ hideLabels, setHideLabels }:Props) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  

  return (
    <Box sx={{ display: "flex", flexDirection: "column", height: "100%", justifyContent: "space-between" }} pt={1}>
      <Box gridColumn="auto">
        <List data-testid="first-list-test">
          <SideNavItem
            title={t("sideMenu.purchaseManagement")}
            handleClick={() =>
              navigate(ROUTES.BUY_MANAGEMENT, { replace: true })
            }
            isSelected={location.pathname === ROUTES.BUY_MANAGEMENT}
            icon={ConfirmationNumberIcon}
            data-testid="initiativeList-click-test"
            hideLabels={hideLabels}
          />
          <SideNavItem
            title={t("sideMenu.refundManagement")}
            handleClick={() =>
              navigate(ROUTES.REFUNDS_MANAGEMENT, { replace: true })
            }
            isSelected={location.pathname === ROUTES.REFUNDS_MANAGEMENT}
            icon={PaymentsIcon}
            data-testid="initiativeList-click-test"
            hideLabels={hideLabels}
          />
          <SideNavItem
            title={t("sideMenu.products")}
            handleClick={() => navigate(ROUTES.PRODUCTS, { replace: true })}
            isSelected={location.pathname === ROUTES.PRODUCTS}
            icon={InventoryIcon}
            data-testid="initiativeList-click-test"
            hideLabels={hideLabels}
          />
          <Divider sx={{ margin: "1rem 0" }} orientation="horizontal" />
          <SideNavItem
            title={t("sideMenu.profile")}
            handleClick={() => navigate(ROUTES.PROFILE, { replace: true })}
            isSelected={location.pathname === ROUTES.PROFILE}
            icon={Person}
            data-testid="initiativeList-click-test"
            hideLabels={hideLabels}
          />
        </List>
      </Box>
      <Box>
        <Divider sx={{ marginTop: '80px' }} />
        <Button
          fullWidth
          sx={{
            height: '59px',
            display: 'flex',
            justifyContent: hideLabels ? 'center' : 'left',
            my: 3,
            color: 'text.primary',
          }}
          onClick={() => setHideLabels(!hideLabels)}
        >
          <DehazeIcon sx={{ marginRight: 2 }} />
        </Button>
      </Box>
    </Box>
  );
}
