// assets
import { AiOutlineHome, AiOutlineUsergroupAdd } from 'react-icons/ai';
import { LuUserPen } from 'react-icons/lu';
import { RiUserHeartLine, RiMedicineBottleLine } from 'react-icons/ri';
import { MdDateRange, MdPayment } from 'react-icons/md';
import { LiaFileInvoiceSolid } from 'react-icons/lia';
import { SiMockserviceworker } from 'react-icons/si';
import { IoSettingsOutline } from 'react-icons/io5';
import { UnorderedListOutlined } from '@ant-design/icons';
// icons
const icons = {
  AiOutlineHome,
  AiOutlineUsergroupAdd,
  LuUserPen,
  RiUserHeartLine,
  MdDateRange,
  MdPayment,
  LiaFileInvoiceSolid,
  SiMockserviceworker,
  RiMedicineBottleLine,
  IoSettingsOutline,
  UnorderedListOutlined
};

// ==============================|| MENU ITEMS - DASHBOARD ||============================== //

const dashboard = {
  id: 'group-dashboard',
  type: 'group',
  children: [
    {
      id: 'dashboard',
      title: 'Dashboard',
      type: 'item',
      url: '/dashboard/default',
      icon: icons.AiOutlineHome,
      breadcrumbs: false,
      roles: ['admin', 'doctor', 'receptionist', 'labTechnician', 'emergency', 'sonographer', 'injectionRoomStaff']
    },
    {
      id: 'patients',
      title: 'Patient',
      type: 'item',
      url: '/patients',
      icon: icons.AiOutlineUsergroupAdd,
      breadcrumbs: false,
      roles: ['admin', 'doctor', 'receptionist', 'labTechnician', 'emergency', 'sonographer', 'injectionRoomStaff']
    },
    {
      id: 'Laboratory',
      title: 'LabTest',
      type: 'item',
      url: '/receptions',
      icon: icons.LuUserPen,
      breadcrumbs: false,
      roles: ['admin', "labTechnician"]
    },
    {
      id: 'PatientHistory',
      title: 'PatientHistory',
      type: 'item',
      url: '/receptions',
      icon: icons.UnorderedListOutlined,
      breadcrumbs: false,
      roles: ['admin', "doctor"]
    },
    {
      id: 'Appointment',
      title: 'Appointment',
      type: 'item',
      url: '/Notfound',
      icon: icons.MdDateRange,
      breadcrumbs: false,
      roles: ['admin', "doctor", "receptionist"]
    },
    {
      id: 'Stuff',
      title: 'Stuff',
      type: 'item',
      url: '/Notfound',
      icon: icons.RiUserHeartLine,
      breadcrumbs: false,
      roles: ['admin', "doctor", "receptionist"]
    },
    {
      id: 'Billing & Payment',
      title: 'BillingAndPayment',
      type: 'item',
      url: '/doctor',
      icon: icons.RiUserHeartLine,
      breadcrumbs: false,
      roles: ['admin', 'receptionist']
    },
    {
      id: 'RadiologyAndImaging',
      title: 'Radiology & Imaging',
      type: 'item',
      url: '/appointment',
      icon: icons.MdDateRange,
      breadcrumbs: false,
      roles: ['admin', 'sonographer']
    }
  ]
};

export default dashboard;
