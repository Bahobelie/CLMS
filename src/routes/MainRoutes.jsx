import { lazy } from 'react';

// project import
import Loadable from 'components/Loadable';
import Dashboard from 'layout/Dashboard';
import ProtectedRoute from './ProtectedRoute';
import { Navigate } from 'react-router-dom';


const Patient = Loadable(lazy(() => import('pages/component/Patient')));
const DashboardDefault = Loadable(lazy(() => import('pages/dashboard/index')));
const NotFound=Loadable(lazy(()=>import('./../pages/component/NotFoundView')));
const PatientDetail=Loadable(lazy(()=>import('../pages/component/PatientDetail')));
const Employee=Loadable(lazy(()=>import('../pages/employee/Employee')));
const EmployeeDetails=Loadable(lazy(()=>import('../pages/employee/EmployeeDatail')));
const Service=Loadable(lazy(() => import('../pages/service/Service')));
const ServiceDetails=Loadable(lazy(() => import('../pages/service/ServiceDetail')));
const SettingsGrid=Loadable(lazy(() => import('../pages/component/Settings')));
const LabTestDetail=Loadable(lazy(() => import('../pages/component/LabTestDetail')));
const LabTestReport=Loadable(lazy(() => import('../pages/report/LabTestReport')));
const Medicines=Loadable(lazy(()=>import('../pages/component/Medicine')));
const MedicineDetails=Loadable(lazy(()=>import('../pages/component/MedicineDetails')));

// ==============================|| MAIN ROUTING ||============================== //

const MainRoutes = {
  path: '/',
  element: (
    <ProtectedRoute>
      <Dashboard />
    </ProtectedRoute>
  ),
  children: [
    // {
    //   path: '/',
    //   element: <Navigate to="/dashboard/default" replace />, // Redirect to the default dashboard
    // },
    {
      path: '/dashboard',
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
      path: 'services',
      element:<Service/>
    },
    {
      path: 'Patient-details/:code',
      element: <PatientDetail />
    },
    {
      path: 'employees',
      element: <Employee />
    },
    {
      path: 'labtest-details/:code',
      element: <LabTestDetail/>
    },
    {
      path: 'employee-details/:code',
      element: <EmployeeDetails />
    },
    {
      path: 'service-details/:code',
      element: <ServiceDetails/>
    },
    {
      path: 'settings',
      element: <SettingsGrid/>
    },
    {
      path: 'medicines',
      element: <Medicines/>
    },
    {
     path: 'medicine-details/:code',
      element: <MedicineDetails/>
    },
    {
      path: 'reports',
      element: <LabTestReport/>
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
