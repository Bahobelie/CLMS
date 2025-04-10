import { lazy } from 'react';

// project import
import Loadable from 'components/Loadable';
import Dashboard from 'layout/Dashboard';
import ProtectedRoute from './ProtectedRoute';

const Patient = Loadable(lazy(() => import('pages/component/Patient')));
const DashboardDefault = Loadable(lazy(() => import('pages/dashboard/index')));
const NotFound=Loadable(lazy(()=>import('./../pages/component/NotFoundView')));
const PatientDetail=Loadable(lazy(()=>import('../pages/component/PatientDetail')));

// ==============================|| MAIN ROUTING ||============================== //

const MainRoutes = {
  path: '/',
  element: (
    <ProtectedRoute>
      <Dashboard />
    </ProtectedRoute>
  ),
  children: [
    {
      path: '/',
      element: <DashboardDefault />
    },
    {
      path: 'patients',
      element: <Patient />
    },
    {
      path: 'Notfound',
      element: <NotFound />
    },
    {
      path: 'Patient-details/:id',
      element: <PatientDetail />
    },
    {
      path:'*',
      element: <NotFound />
    },
    {
      path: 'dashboard',
      children: [
        {
          path: 'default',
          element: <DashboardDefault />
        }
      ]
    }
  ]
};

export default MainRoutes;
