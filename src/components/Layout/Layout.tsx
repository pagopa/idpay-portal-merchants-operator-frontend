import { Box } from '@mui/material';
import { Footer } from '@pagopa/selfcare-common-frontend';
import { useLocation } from 'react-router-dom';
import { matchPath } from 'react-router-dom';
import ROUTES from '../../routes';
import SideMenu from "../SideMenu/SideMenu";

type Props = {
  children?: React.ReactNode;
};
//components
import Header from '../Header/Header';

// type Props = {
//   children?: React.ReactNode;
// };

const Layout = ({ children }: Props) => {
  const location = useLocation();

  const match = matchPath(location.pathname, {
    path: [ROUTES.HOME],
    exact: true,
    strict: false,
  });

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
        <Footer onExit={() =>{}} loggedUser={true} />
      </Box>
    </Box>
  );
};
// export default withParties(Layout);
export default Layout;
