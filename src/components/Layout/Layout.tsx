import { Box, Grid } from '@mui/material';

import { useLocation, matchPath } from 'react-router-dom';

import ROUTES from '../../routes';
type Props = {
  children?: React.ReactNode;
};
//components
import Header from '../Header/Header';
import SideMenu from '../SideMenu/SideMenu';
import { useState } from 'react';
import {CustomFooter} from "../Footer/CustomFooter.tsx";


const Layout = ({ children }: Props) => {
  const [isOpen, setIsOpen] = useState(true)
  const location = useLocation();

  const match = (paths) => {
    for (const path of paths) {
      if (matchPath({ path }, location.pathname)) {
        return true;
      }
    }
    return false;
  };

  const isMatched = match([
    ROUTES.HOME,
    ROUTES.PROFILE,
    ROUTES.BUY_MANAGEMENT,
    ROUTES.PRODUCTS,
    ROUTES.REFUNDS_MANAGEMENT
  ]);

  return (
    <Box display="flex" flexDirection="column" width="100%" minHeight="100vh">
      <Box width="100%">
        <Header />
      </Box>
      {isMatched ? (
        <Grid container flexDirection="row" flexWrap="nowrap" flexGrow="1">
          <Box width={isOpen ? '300px' : 'min-content'}>
            <SideMenu isOpen={isOpen} setIsOpen={setIsOpen} />
          </Box>
          <Grid
            container
            width="100%"
            sx={{ backgroundColor: '#F5F5F5', '&>div': {width: '100%'}, '& > div': {display: 'flex', flexDirection: 'column', height: '100%'}}}
            pb={16}
            pt={2}
            px={2}
          >
            {children}
          </Grid>
        </Grid>
      ) : (
        <Box
          width="100%"
          display="grid"
          gridTemplateColumns="repeat(12, 1fr)"
          justifyContent="center"
        >
          <Box
            display="grid"
            pb={16}
            pt={2}
            gridColumn="span 12"
          >
            {children}
          </Box>
        </Box>
      )}
      <Box width="100%">
        <CustomFooter />
      </Box>
    </Box>
  );
};
// export default withParties(Layout);
export default Layout;
