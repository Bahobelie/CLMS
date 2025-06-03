import GenericDataGrid from '../component-overview/GenericDataGrid';
import WorkIcon from '@mui/icons-material/Work';
import * as Yup from 'yup';
import { Box } from '@mui/material';
import { useEffect, useState } from 'react';
import axios from 'axios';

const Employee = ({params}) => {
  const apiUrl = import.meta.env.VITE_APP_API_URL;
  const [employmentTypes,setEmploymentType] = useState([]);

  useEffect(() => {
    const employmentType =async ()=>{
      const response = await axios.get(`${apiUrl}/systemConstants/by-condition`, {
        params: {
          type: 'Role'
        }
      });
      setEmploymentType(response.data)
    }
    employmentType();
  }, []);
  const employeeFormFields = [
    { name: 'firstname', label: 'First Name', type: 'text', required: true },
    { name: 'lastname', label: 'Last Name', type: 'text', required: true },
    {
      name: 'type',
      label: 'Employment Type',
      type: 'select',
      options: employmentTypes.map(type => ({
        value: type.id,
        label: type.name
      })),
      required: true
    },
    {
      name: 'status',
      label: 'Status',
      type: 'select',
      options: [
        { value: 'Available', label: 'Available' },
        { value: 'UnAvailable', label: 'UnAvailable' },
      ],
    },
    {
      name: 'specialization',
      label: 'Specialization',
      type: 'text',
      required: false,
    },
    { name: 'phonenumber', label: 'Phone Number', type: 'text',required: false },
    { name: 'email', label: 'Email', type: 'text' },
    {
      name: 'gender',
      label: 'Gender',
      type: 'select',
      options: [
        { value: 'Male', label: 'Male' },
        { value: 'Female', label: 'Female' }
      ],
    },
    {
      name: 'yearsofexperience',
      label: 'Years of Experience',
      type: 'number',
    },

    // Option 2: Day selection for availability (comment out one option)
    {
      name: 'availabilitydays',
      label: 'Available Days',
      type: 'select',
      options: [
        { value: 'Monday', label: 'Monday' },
        { value: 'Tuesday', label: 'Tuesday' },
        { value: 'Wednesday', label: 'Wednesday' },
        { value: 'Thursday', label: 'Thursday' },
        { value: 'Friday', label: 'Friday' },
        { value: 'Saturday', label: 'Saturday' },
        { value: 'Sunday', label: 'Sunday' },
      ],
      required: false, // Make optional if needed
      multiple: true, // Important for multi-select
      variant: 'outlined',
      fullWidth: true,
    },

  ];

  // Validation schema - updated with availability fields
  const employeeValidationSchema = Yup.object({
    firstname: Yup.string().required("First Name is required"),
    lastname: Yup.string().required("Last Name is required"),
    type:Yup.number().required("Employee Type is required"),
    specialization: Yup.string(),
    phonenumber: Yup.string(),
    email: Yup.string().email("Invalid email format"),
    gender: Yup.string(),
    yearsofexperience: Yup.number().min(0, "Experience cannot be negative"),
    status: Yup.string(),
    // For date range option
    availabilityFrom: Yup.date().nullable(),
    availabilitydays: Yup.array()
      .of(Yup.string())
  });


  // Initial form values - updated with availability fields
  const initialEmployeeValues = {
    firstname: '',
    lastname: '',
    type:null,
    specialization: '',
    phonenumber: '',
    email: '',
    gender: '',
    yearsofexperience: 0,
    status: 'Available',
    availabilityFrom: null,
    availabilitydays: [],
  };

  // Column configuration - updated to show availability
  const employeeColumns = [
    {
      field: 'code',
      headerName: 'Code',
      width: 100,
      flex: 1
    },
    {
      field: 'fullName',
      headerName: 'Full Name',
      width: 200,
      flex: 2
    },
    {
      field: 'type',
      headerName: "Employment Type",
      flex: 2
    },
    {
      field: 'specialization',
      headerName: 'Specialization',
      width: 180,
      flex: 1
    },
    {
      field: 'phonenumber',
      headerName: 'Phone Number',
      width: 150,
      flex: 2
    },
    {
      field: 'email',
      headerName: 'Email',
      width: 200,
      flex: 1
    },
    {
      field: 'gender',
      headerName: 'Gender',
      width: 100,
      flex: 1
    },
    {
      field: 'yearsofexperience',
      headerName: 'Experience (Years)',
      width: 150,
      flex: 1
    },
    {
      field: 'availabilitydays',
      headerName: 'AvailabilityDays',
      width: 250,
      flex: 2,
      renderCell: (params) => (
        <Box
          sx={{
            color: params.row.availabilitydays? 'primary.main' : 'error.main',
            fontWeight: 'medium'
          }}
        >
          {params.value}
        </Box>
      )
    },
    {
      field: 'status',
      headerName: 'Status',
      width: 130,
      flex: 1,
      renderCell: (params) => (
        <Box
          sx={{
            color: params.value === 'Available' ? 'success.main' : 'error.main',
            fontWeight: 'medium'
          }}
        >
          {params.value || 'Unknown'}
        </Box>
      )
    },
    {
      field: 'createdat',
      headerName: 'Created At',
      width: 180,
      flex: 2
    },
  ];

  const receptionValueGetters = {
    fullName: (employee) => `${employee.firstname || ''} ${employee.lastname || ''}`,
    type: (employee) => {
      const type = employmentTypes.find(t => t.id === employee.type);
      return type ? type.name : 'Unknown';
    }
  };

  return (
    <GenericDataGrid
      title='Employees'
      icon={<WorkIcon />}
      pathe='employees'
      apiEndpoint="employees"
      modelName="employee"
      prefix="EMP-"
      valueGetters={receptionValueGetters}
      detailPagePath={`/employee-details`}
      params={params} // Your reception type filter
      columns={employeeColumns}
      datapassed={employmentTypes}
      initialFormValues={initialEmployeeValues}
      validationSchema={employeeValidationSchema}
      formFields={employeeFormFields}
      searchFields={['firstname', 'lastname', 'code', 'email', 'phonenumber']}
    />
  );
};

export default Employee;