import { Box } from '@mui/material';
import { Footer } from '@pagopa/selfcare-common-frontend/lib';
import { useLocation } from 'react-router-dom';

import ROUTES from '../../routes';
type Props = {
  children?: React.ReactNode;
};
//components
import Header from '../Header/Header';
import SideMenu from '../SideMenu/SideMenu';

const Layout = ({ children }: Props) => {
  const location = useLocation();

  // const match = matchPath({ path: ROUTES.HOME, end: true }, location.pathname);
  const match = null;
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
        <Header
          withSecondHeader={false}
          onExit={()=>{}}
        />
      </Box>
      {match !== null ? (
        <Box gridArea="body" display="grid" gridTemplateColumns="minmax(300px, 2fr) 10fr">
          <Box gridColumn="auto" sx={{ backgroundColor: 'background.paper' }}>
            <SideMenu />
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
        <Footer onExit={() =>{}} loggedUser={false} />
      </Box>
    </Box>
  );
};
// export default withParties(Layout);
export default Layout;
