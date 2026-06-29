import { List, Box, Divider, IconButton } from '@mui/material';
import { useNavigate, useLocation } from 'react-router-dom';
import ROUTES from '../../routes';
import SideNavItem from './SideNavItem';
import { Person } from '@mui/icons-material';
import MenuIcon from '@mui/icons-material/Menu';
import { theme } from '@pagopa/mui-italia';
import styles from './SideMenu.module.css';
import { useAppSelector } from '../../redux/hooks';
import { initiativesListSelector } from '../../redux/slices/initiativesSlice'
import { SideNavAccordion } from './SideNavAccordion';
import { useTranslation } from 'react-i18next';

/** The side menu of the application */
export default function SideMenu({
  isOpen = true,
  setIsOpen,
}: {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
}) {
  const { t } = useTranslation();
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
            title={t('sideMenu.initiatives')}
            handleClick={() => navigate(ROUTES.HOME, { replace: true })}
            isSelected={location.pathname === ROUTES.HOME}
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
              />
            ))}
          <Divider sx={{ margin: '1rem 0' }} orientation="horizontal" />
          <SideNavItem
            title={t('sideMenu.profile')}
            handleClick={() => navigate(ROUTES.PROFILE, { replace: true })}
            isSelected={location.pathname === ROUTES.PROFILE}
            icon={Person}
            level={0}
            data-testid="initiativeList-click-test"
            hideLabels={!isOpen}
          />
        </List>
      </Box>
      <Box className={!isOpen ? styles.sideMenuBurger : ''}>
        <Divider
          sx={{ margin: '1rem 0', justifySelf: 'flex-end', width: '100%' }}
          orientation="horizontal"
        />
        <IconButton
          sx={{ width: '3.813rem', aspectRatio: '1', marginBottom: '1rem' }}
          onClick={() => setIsOpen(!isOpen)}
        >
          <MenuIcon sx={{ color: theme.palette.text.primary }} />
        </IconButton>
      </Box>
    </Box>
  );
}
