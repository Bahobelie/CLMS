import { useEffect } from 'react';
import { Outlet } from 'react-router-dom';

// material-ui
import { useTheme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';
import Toolbar from '@mui/material/Toolbar';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';

// project import
import Drawer from './Drawer';
import Header from './Header';
import navigation from 'menu-items';
import Loader from 'components/Loader';
import Breadcrumbs from 'components/@extended/Breadcrumbs';

import { handlerDrawerOpen, useGetMenuMaster } from 'api/menu';

// ==============================|| MAIN LAYOUT - DASHBOARD ||============================== //

export default function DashboardLayout() {
  const theme = useTheme();
  const { menuMasterLoading } = useGetMenuMaster();
  const downXL = useMediaQuery(theme.breakpoints.down('xl'));

  useEffect(() => {
    handlerDrawerOpen(!downXL);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [downXL]);

  if (menuMasterLoading) return <Loader />;

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Box sx={{ display: 'flex', flex: 1 }}>
        <Header />
        <Drawer />

        {/* Main Content Area */}
        <Box
          component="main"
          sx={{
            width: 'calc(100% - 260px)',
            flexGrow: 1,
            p: { xs: 2, sm: 3 },
            display: 'flex',
            flexDirection: 'column'
          }}
        >
          <Toolbar />
          <Breadcrumbs navigation={navigation} title />
          <Box sx={{ flex: 1 }}>
            <Outlet />
          </Box>
        </Box>
      </Box>

      {/* Global Footer */}
      <Box
        component="footer"
        sx={{
          py: 2,
          px: 3,
          backgroundColor: theme.palette.primary[100],
          borderTop: `1px solid ${theme.palette.divider}`,
          textAlign: 'center',
          mt: 'auto', // Pushes footer to bottom
          [theme.breakpoints.down('lg')]: {
            ml: { sm: 0, md: 0 } // Adjust for responsive drawer
          }
        }}
        className="no-print"
      >
        <Typography variant="h5" color="text.primary">
          © {new Date().getFullYear()} Powered by Twist IT Solution. All rights reserved.
        </Typography>

      </Box>
    </Box>
  );
}