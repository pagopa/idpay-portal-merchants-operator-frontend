import { List, Box, Divider } from '@mui/material';
import { useNavigate, useLocation } from 'react-router-dom';
import ROUTES from '../../routes';
import SideNavItem from './SideNavItem';
import { Person } from '@mui/icons-material';
import MenuIcon from '@mui/icons-material/Menu';
import { useAppSelector } from '../../redux/hooks';
import { initiativesListSelector } from '../../redux/slices/initiativesSlice'
import { SideNavAccordion } from './SideNavAccordion';
import { useScopedTranslation } from '../../hooks/useScopedTranslation';

/** The side menu of the application */
export default function SideMenu({
  isOpen = true,
}: {
  isOpen: boolean;
}) {
  const { t } = useScopedTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const initiativesList = useAppSelector(initiativesListSelector)

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        justifyContent: 'space-between',
        backgroundColor: 'background.paper',
        minWidth: isOpen ? '300px' : 'fit-content',
      }}
      pt={1}
    >
      <Box gridColumn="auto">
        <List data-testid="first-list-test">
          <SideNavItem
            title={t('commons.sideMenu.initiatives')}
            handleClick={() => navigate(ROUTES.INITIATIVES_LIST, { replace: true })}
            isSelected={location.pathname === ROUTES.INITIATIVES_LIST}
            icon={MenuIcon}
            level={0}
            data-testid="initiativeList-click-test"
            hideLabels={!isOpen}
          />
          {initiativesList &&
            initiativesList.map((item) => (
              <SideNavAccordion
                key={item?.initiativeId}
                item={item}
                isOpen={isOpen}
                defaultOpen={!(initiativesList.length - 1)}
              />
            ))}
          <Divider sx={{ margin: '1rem 0' }} orientation="horizontal" />
          <SideNavItem
            title={t('commons.sideMenu.profile')}
            handleClick={() => navigate(ROUTES.PROFILE, { replace: true })}
            isSelected={location.pathname === ROUTES.PROFILE}
            icon={Person}
            level={0}
            data-testid="initiativeList-click-test"
            hideLabels={!isOpen}
          />
        </List>
      </Box>
    </Box>
  );
}
