import { Box } from '@mui/material';
import React from 'react';
import Header from '../Header/Header';
import { CustomFooter } from '../Footer/CustomFooter';

type Props = {
  children?: React.ReactNode;
};

const TOSLayout = ({ children }: Props) => (
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

    <Box gridArea="body" sx={{ minWidth: 0 }}>
      {children}
    </Box>

    <Box gridArea="footer">
      <CustomFooter />
    </Box>
  </Box>
);

export default TOSLayout;
