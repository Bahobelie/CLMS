import { RouterProvider } from 'react-router-dom';

// project import
import router from 'routes';
import ThemeCustomization from 'themes';

import ScrollTop from 'components/ScrollTop';
import { CssBaseline } from '@mui/material';

// ==============================|| APP - THEME, ROUTER, LOCAL ||============================== //

export default function App() {
  return (
    <ThemeCustomization>
      <ScrollTop>
        <CssBaseline />
        <RouterProvider router={router} />
      </ScrollTop>
    </ThemeCustomization>
  );
}
