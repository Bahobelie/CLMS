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
      id: 'Receptions',
      title: 'Receptions',
      type: 'item',
      url: '/receptions',
      icon: icons.RiGroupLine,
      breadcrumbs: false,
      roles: ['admin', "doctor", "receptionist"]
    },
    {
      id: 'Doctors',
      title: 'Doctors',
      type: 'item',
      url: '/doctors',
      icon: icons.TbUserHeart,
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
      id: 'Laboratory',
      title: 'LabTest',
      type: 'item',
      url: '/laboratory',
      icon: icons.LuUsers,
      breadcrumbs: false,
      roles: ['admin', "labTechnician"]
    },
    {
      id: 'PatientHistory',
      title: 'PatientHistory',
      type: 'item',
      url: '/patienthistory',
      icon: icons.UnorderedListOutlined,
      breadcrumbs: false,
      roles: ['admin', "doctor"]
    },
    {
      id: 'Appointment',
      title: 'Appointment',
      type: 'item',
      url: '/appointments',
      icon: icons.MdDateRange,
      breadcrumbs: false,
      roles: ['admin', "doctor", "receptionist"]
    },
    {
      id: 'Payment',
      title: 'Payment',
      type: 'item',
      url: '/payment',
      icon: icons.MdOutlinePayments,
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
