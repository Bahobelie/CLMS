import { lazy } from 'react';

// project import
import Loadable from 'components/Loadable';
import Dashboard from 'layout/Dashboard';
import ProtectedRoute from './ProtectedRoute';

const Patient = Loadable(lazy(() => import('pages/component/Patient')));
const DashboardDefault = Loadable(lazy(() => import('pages/dashboard/index')));
const NotFound=Loadable(lazy(()=>import('./../pages/component/NotFoundView')));
const PatientDetail=Loadable(lazy(()=>import('../pages/component/PatientDetail')));
const Employee=Loadable(lazy(()=>import('../pages/employee/Reception')));
const EmployeeDeatils=Loadable(lazy(()=>import('../pages/employee/ReceptionDetail')));

const Doctor = Loadable(lazy(() => import('../pages/employee/Doctor')));
const DoctorDetails = Loadable(lazy(() => import('../pages/employee/DoctorDetail')));

const Injection = Loadable(lazy(() => import('../pages/employee/Injection')));
const InjectionDetails = Loadable(lazy(() => import('../pages/employee/InjectionDetail')));

const Sonographer = Loadable(lazy(() => import('../pages/employee/SenioGrapher'))); // Consider renaming the file to 'Sonographer'
const SonographerDetails = Loadable(lazy(() => import('../pages/employee/SenioGrapherDetail')));

const Emergency = Loadable(lazy(() => import('../pages/employee/EmergencyStaff')));
const EmergencyDetails = Loadable(lazy(() => import('../pages/employee/EmergencyStaffDetail')));

const Laboratory = Loadable(lazy(() => import('../pages/employee/Labratory'))); // Typo? Should it be 'Laboratory'?
const LaboratoryDetails = Loadable(lazy(() => import('../pages/employee/LabratoryDetail'))); // Match the filename



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
      path: 'Patient-details/:code',
      element: <PatientDetail />
    },
    {
      path: 'employee-details/:code',
      element: <EmployeeDeatils />
    },
    {
      path: 'doctor-details/:code',
      element: <DoctorDetails />
    },
    {
      path: 'injection-details/:code',
      element: <InjectionDetails />
    },
    {
      path: 'sonographer-details/:code', // Assuming you meant "Sonographer"
      element: <SonographerDetails />
    },
    {
      path: 'emergency-details/:code',
      element: <EmergencyDetails />
    },
    {
      path: 'laboratory-details/:code',
      element: <LaboratoryDetails />
    },
    {
      path:'*',
      element: <NotFound />
    },
    {
      path: 'receptions',
      element:<Employee/>
    },
    {
      path: 'doctors',
      element:<Doctor/>
    },
    {
      path: 'injectionStaff',
      element:<Injection/>
    },
    {
      path: 'senogapher',
      element:<Senogapher/>
    },
    {
      path: 'emergencyStaff',
      element:<Emergency/>
    },
    {
      path: 'laboratoryStaff',
      element:<Labratory/>
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
