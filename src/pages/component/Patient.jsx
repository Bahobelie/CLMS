import GenericDataGrid from '../component-overview/GenericDataGrid';
import MedicationLiquidIcon from '@mui/icons-material/MedicationLiquid';
import ServiceModal from '../component-overview/ServiceModal';
import * as Yup from 'yup';

const Patient = () => {
  // Form configuration
  const patientFormFields = [
    { name: 'firstName', label: 'First Name', type: 'text', required: true },
    { name: 'middleName', label: 'Middle Name', type: 'text' },
    { name: 'lastName', label: 'Last Name', type: 'text', required: true },
    { name: 'gender', label: 'Gender', type: 'select', required: true, options: [
        { value: 'Male', label: 'Male' },
        { value: 'Female', label: 'Female' }
      ]
    },
    {
      name: 'dateOfBirth',
      label: 'Date of Birth',
      type: 'date',
      required: true
    },
    {name:'phoneNumber',label: 'Phone Number',type: 'text'},
    {
      name: 'bloodGroup',
      label: 'Blood Group',
      type: 'select',
      options: [
        { value: 'Unknown', label: 'Unknown' },
        { value: 'To Test', label: 'To Test' },
        { value: 'A+', label: 'A+' },
        { value: 'A-', label: 'A-' },
        { value: 'B+', label: 'B+' },
        { value: 'B-', label: 'B-' },
        { value: 'AB+', label: 'AB+' },
        { value: 'AB-', label: 'AB-' },
        { value: 'O+', label: 'O+' },
        { value: 'O-', label: 'O-' }
      ]
    },
    {name: 'bmiTest',label: 'BMI Test',type: 'select',options: [
        {value: 'None', label: 'None' },
        { value: 'Weight', label: 'Weight' },
        { value: 'Height', label: 'Height' },
        { value: 'Both Height and Weight', label: 'Both Height and Weight' },

      ]},
    {name:'bloodPressure',label: 'BloodPressure',type: 'select',options: [
        {value: 'No', label: 'No' },
        {value: 'Yes',label: 'Yes'}
      ] },
    {name: 'selectDistrict',label: 'Select District',type: 'select',options: [
        { value: 'Addis Ababa', label: 'Addis Ababa' },
        { value: 'Afar', label: 'Afar' },
        { value: 'Amhara', label: 'Amhara' },
        { value: 'Benishangul-Gumuz', label: 'Benishangul-Gumuz' },
        { value: 'Dire Dawa', label: 'Dire Dawa' },
        { value: 'Gambela', label: 'Gambela' },
        { value: 'Harari', label: 'Harari' },
        { value: 'Oromiya', label: 'Oromiya' },
        { value: 'Somali', label: 'Somali' },
        { value: 'SNNPR', label: 'SNNPR' },
        { value: 'Tigray', label: 'Tigray' }
      ]},
     {name: 'applicationFee',label: 'Application Fee',type: 'select',options: [
        {value: 'Active', label: 'Active'},
        {value: 'Inactive', label: 'Inactive'},
      ]},
    {name: 'remark',label: 'Remark'}
  ];

  const patientValidationSchema = Yup.object({
    firstName: Yup.string().required("First Name is required"),
    middleName: Yup.string(),
    lastName: Yup.string().required("Last Name is required"),
    gender: Yup.string().required("Gender is required"),
    dateOfBirth: Yup.date().required("Date of Birth is required"),
    bloodGroup: Yup.string(),
    bmiTest: Yup.string(),
    bloodPressure: Yup.string(),
    selectDistrict: Yup.string(),
    phoneNumber: Yup.string(),
    applicationFee: Yup.string(),
    Remark: Yup.string(),
  });

  const initialPatientValues = {
    firstName: '',
    middleName: '',
    lastName: '',
    gender: '',
    dateOfBirth: new Date(),
    bloodGroup: '',
    bm: '',
    bp: '',
    selectDistrict: '',
    phoneNumber: '',
    applicationFee: '',
    Remark: '',
  };

  // Column configuration
  const patientColumns = [
    { field: 'code', headerName: 'Code', width: 90, flex: 1 },
    {
      field: 'fullName',
      headerName: 'Full Name',
      width: 200,
      flex: 2,
    },
    { field: 'gender', headerName: 'Gender', width: 110, flex: 1 },
    { field: 'age', headerName: 'Age', type: 'number', width: 120, flex: 1 },
    { field: 'blood_group', headerName: 'Blood Group', width: 120, flex: 1 },
    { field: 'country', headerName: 'Country', width: 150, flex: 1 },
    { field: 'district_state', headerName: 'District', width: 150, flex: 1 },
    { field: 'phone_number', headerName: 'PhoneNumber', width: 150, flex: 1 },
    { field: 'createdAt', headerName: 'Admission Date', width: 180, flex: 2 },
    {field: 'application_fee', headerName: 'Application Fee', width: 150, flex: 1 },
  ];

  // Value getters for computed fields
  const patientValueGetters = {
    fullName: (patient) => `${patient.first_name || ''} ${patient.middle_name || ''} ${patient.last_name || ''}`,
    // ... other value getters
  };

  // Custom renderers for specific columns
  const patientCustomRenderers = {
    application_fee: (params) => (
      <span style={{ color: params.value === 'Expired' ? 'red' : 'green', fontWeight: 'bold' }}>
        {params.value !== 'N/A' ? `₦ ${params.value}` : 'N/A'}
      </span>
    ),
    // ... other custom renderers
  };



  return (
    <GenericDataGrid
      title="Patients"
      apiEndpoint="patients"
      modelName="Patient"
      prefix="PA-"
      detailPagePath="/patient-details"

      columns={patientColumns}
      valueGetters={patientValueGetters}
      customRenderers={patientCustomRenderers}

      initialFormValues={initialPatientValues}
      validationSchema={patientValidationSchema}
      formFields={patientFormFields}

      searchFields={['first_name', 'last_name', 'code']}
    />
  );
};

export default Patient;