// assets
import { AiOutlineHome, AiOutlineUsergroupAdd } from 'react-icons/ai';
import { LuUsers } from "react-icons/lu";
import {RiMedicineBottleLine } from 'react-icons/ri';
import { MdDateRange } from 'react-icons/md';
import { LiaFileInvoiceSolid } from 'react-icons/lia';
import { SiMockserviceworker } from 'react-icons/si';
import { IoSettingsOutline } from 'react-icons/io5';
import { UnorderedListOutlined } from '@ant-design/icons';
import { RiGroupLine } from "react-icons/ri";
import { TbUserHeart } from "react-icons/tb";
import { MdOutlinePayments } from "react-icons/md";
import { RiServiceLine } from "react-icons/ri";


// icons
const icons = {
  AiOutlineHome,
  AiOutlineUsergroupAdd,
  LuUsers,
  RiGroupLine,
  MdDateRange,
  LiaFileInvoiceSolid,
  SiMockserviceworker,
  RiMedicineBottleLine,
  IoSettingsOutline,
  UnorderedListOutlined,
  TbUserHeart,
  MdOutlinePayments,
  RiServiceLine
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
      icon: icons.LuUsers,
      breadcrumbs: false,
      roles: ['admin', 'doctor', 'receptionist', 'labTechnician', 'emergency', 'sonographer', 'injectionRoomStaff']
    },
    {
      id: 'Employee',
      title: 'Employee',
      type: 'item',
      url: '/employees',
      icon: icons.RiGroupLine,
      breadcrumbs: false,
      roles: ['admin', "doctor", "receptionist"]
    },
    {
      id: 'Services',
      title: 'Services',
      type: 'item',
      url: '/services',
      icon: icons.RiServiceLine,
      breadcrumbs: false,
      roles: ['admin', "doctor", "receptionist"]
    },
    {
      id: 'Medicine',
      title: 'Medicine',
      type: 'item',
      url: '/medicine',
      icon: icons.RiMedicineBottleLine,
      breadcrumbs: false,
      roles: ['admin', "doctor", "receptionist"]
    },
    {
      id: 'Setting',
      title: 'Settings',
      type: 'item',
      url: '/settings',
      icon: icons.IoSettingsOutline,
      breadcrumbs: false,
      roles: ['admin', "doctor", "receptionist"]
    },
    {
      id: 'Report',
      title: 'Report',
      type: 'item',
      url: '/reports',
      icon: icons.UnorderedListOutlined,
      breadcrumbs: false,
      roles: ['admin', "doctor", "receptionist"]
    },

  ]
};

export default dashboard;
