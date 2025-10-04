import { Box } from '@mui/material';
import { Footer } from '@pagopa/selfcare-common-frontend/lib';
import { useLocation, matchPath } from 'react-router-dom';

import ROUTES from '../../routes';
//components
import Header from '../Header/Header';
import SideMenu from '../SideMenu/SideMenu';
import { useState } from 'react';

type Props = {
  children?: React.ReactNode;
};

const Layout = ({ children }: Props) => {
  const location = useLocation();
  const [hideLabels, setHideLabels] = useState(false);

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
    <Box
      display="grid"
      gridTemplateColumns="1fr"
      gridTemplateRows="auto 1fr auto"
      gridTemplateAreas={`"header"
                          "body"
                          "footer"`}
      minHeight="100vh"
    >
      <Box gridArea="header">
        <Header />
      </Box>
      {isMatched ? (
        <Box gridArea="body" display="grid" gridTemplateColumns={"minmax(250px, 1fr) 10fr"}>
          <Box gridColumn="auto" sx={{ backgroundColor: 'background.paper', maxWidth:hideLabels?'140px':'auto', justifyContent:hideLabels?'center':'left' }}>
            <SideMenu hideLabels={hideLabels} setHideLabels={setHideLabels} />
          </Box>
          <Box
            gridColumn="auto"
            sx={{ backgroundColor: '#F5F5F5' }}
            display="grid"
            justifyContent="center"
            pb={16}
            pt={2}
            px={2}
            gridTemplateColumns="1fr"
          >
            {children}
          </Box>
        </Box>
      ) : (
        <Box
          gridArea="body"
          display="grid"
          gridTemplateColumns="repeat(12, 1fr)"
          justifyContent="center"
        >
          <Box
            display="grid"
            justifyContent="center"
            pb={16}
            pt={2}
            gridColumn="span 12"
            maxWidth={
              location.pathname !== ROUTES.PRIVACY_POLICY && location.pathname !== ROUTES.TOS
                ? 920
                : '100%'
            }
            justifySelf="center"
          >
            {children}
          </Box>
        </Box>
      )}
      <Box gridArea="footer">
        <Footer onExit={() =>{}} loggedUser={true} />
      </Box>
    </Box>
  );
};
// export default withParties(Layout);
export default Layout;
