// assets
import { AiOutlineHome, AiOutlineUsergroupAdd } from 'react-icons/ai';
import { LuUserPen } from 'react-icons/lu';
import { RiUserHeartLine, RiMedicineBottleLine } from 'react-icons/ri';
import { MdDateRange, MdPayment } from 'react-icons/md';
import { LiaFileInvoiceSolid } from 'react-icons/lia';
import { SiMockserviceworker } from 'react-icons/si';
import { IoSettingsOutline } from 'react-icons/io5';

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
  IoSettingsOutline
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
      breadcrumbs: false
    },
    {
      id: 'patients',
      title: 'Patients',
      type: 'item',
      url: '/patients',
      icon: icons.AiOutlineUsergroupAdd, // Use TeamOutlined for Patients
      breadcrumbs: false
    },
    {
      id: 'receptions',
      title: 'Receptions',
      type: 'item',
      url: '/receptions',
      icon: icons.LuUserPen,
      breadcrumbs: false
    },
    {
      id: 'doctor',
      title: 'Doctor',
      type: 'item',
      url: '/doctor',
      icon: icons.RiUserHeartLine,
      breadcrumbs: false
    },
    {
      id: 'appointment',
      title: 'Appointment',
      type: 'item',
      url: '/appointment',
      icon: icons.MdDateRange,
      breadcrumbs: false
    },
    {
      id: 'payment',
      title: 'Payment',
      type: 'item',
      url: '/payment',
      icon: icons.MdPayment,
      breadcrumbs: false
    },
    {
      id: 'invoice',
      title: 'Invoice',
      type: 'item',
      url: '/invoice',
      icon: icons.LiaFileInvoiceSolid,
      breadcrumbs: false
    },
    {
      id: 'service',
      title: 'Service',
      type: 'item',
      url: '/service',
      icon: icons.SiMockserviceworker,
      breadcrumbs: false
    },
    {
      id: 'medicine',
      title: 'Medicine',
      type: 'item',
      url: '/medicine',
      icon: icons.RiMedicineBottleLine,
      breadcrumbs: false
    },
    {
      id: 'setting',
      title: 'Setting',
      type: 'item',
      url: '/setting',
      icon: icons.IoSettingsOutline,
      breadcrumbs: false
    }
  ]
};

export default dashboard;
