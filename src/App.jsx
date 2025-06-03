import { RouterProvider } from 'react-router-dom';

// project import
import router from 'routes';
import ThemeCustomization from 'themes';
import store from './store/store';

import ScrollTop from 'components/ScrollTop';
import { CssBaseline } from '@mui/material';
import { Provider } from 'react-redux';

// ==============================|| APP - THEME, ROUTER, LOCAL ||============================== //

export default function App() {
  return (
    <ThemeCustomization>
      <Provider store={store}>
        <ScrollTop>
          <CssBaseline />
          <RouterProvider router={router} />
        </ScrollTop>
      </Provider>
    </ThemeCustomization>
  );
}
