import GenericDataGrid from '../component-overview/GenericDataGrid';
import MedicationLiquidIcon from '@mui/icons-material/MedicationLiquid';
import ServiceModal from '../component-overview/ServiceModal';
import * as Yup from 'yup';

const Patient = () => {
  // Form configuration
  const patientFormFields = [
    { name: 'first_name', label: 'First Name', type: 'text', required: true },
    { name: 'middle_name', label: 'Middle Name', type: 'text' },
    { name: 'last_name', label: 'Last Name', type: 'text', required: true },
    { name: 'gender', label: 'Gender', type: 'select', required: true, options: [
        { value: 'Male', label: 'Male' },
        { value: 'Female', label: 'Female' }
      ]
    },
    {name: 'age',label: 'Age',type:'text'},
    {name:'phone_number',label: 'Phone Number',type: 'text'},
    {
      name: 'blood_group',
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
    {name: 'bmi',label: 'BMI Test',type: 'select',options: [
        {value: 'No', label: 'No' },
        { value: 'Weight', label: 'Weight' },
        { value: 'Height', label: 'Height' },
        { value: 'Both Height and Weight', label: 'Both Height and Weight' },

      ]},
    {name:'bp',label: 'BloodPressure',type: 'select',options: [
        {value: 'No', label: 'No' },
        {value: 'Yes',label: 'Yes'}
      ] },
    {name: 'district_state',label: 'Select District',type: 'select',options: [
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
    { name: 'kebele', label: 'Kebele', type: 'text' ,required: false},
    { name: 'woreda', label: 'Woreda', type: 'text',required: false },
    { name: 'sub_city', label: 'Sub City', type: 'text',required: false },
    // { name: 'city', label: 'City', type: 'text',required: false },
    { name: 'identification_number', label: 'Identification Number', type: 'text',required: false },

     {name: 'application_fee',label: 'PatientCard Status',type: 'select',options: [
        {value: 'Active', label: 'Active'},
        {value: 'Expired', label: 'Expired'},
      ]},
    {name: 'application_fee_amount',label: 'Application Fee',type:'text'},
    {name: 'referencecode',label: 'ReferenceCode',type:'text'},
    {name: 'remark',label: 'Remark'}
  ];

  const patientValidationSchema = Yup.object({
    first_name: Yup.string().required("First Name is required"),
    middle_name: Yup.string(),
    last_name: Yup.string().required("Last Name is required"),
    gender: Yup.string().required("Gender is required"),
    date_of_birth: Yup.date().required("Date of Birth is required"),
    blood_group: Yup.string(),
    bmi: Yup.string(),
    bp: Yup.string(),
    district_state: Yup.string(),
    phone_number: Yup.string(),
    application_fee: Yup.string(),
    application_fee_amount:Yup.number(),
    referencecode:Yup.string(),
    kebele: Yup.string().nullable(),
    woreda: Yup.string().nullable(),
    sub_city: Yup.string().nullable(),
    identification_number: Yup.string().nullable(),
    remark: Yup.string(),
  });

  const initialPatientValues = {
    first_name: '',
    middle_name: '',
    last_name: '',
    gender: '',
    age:'0',
    date_of_birth: new Date(),
    blood_group: 'Unknown',
    bm: 'No',
    bmi:'No',
    bp: 'No',
    district_state: 'Addis Ababa',
    phone_number: '',
    application_fee: 'Active',
    application_fee_amount:'0',
    referencecode:'',
    kebele:'',
    woreda:'',
    city:'',
    sub_city:'',
    identification_number:'',
    remark: '',
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
    { field: 'createdAt', headerName: 'Admission Date', width: 180, flex: 2, },
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
      pathe={'patients'}
      columns={patientColumns}
      valueGetters={patientValueGetters}
      customRenderers={patientCustomRenderers}

      initialFormValues={initialPatientValues}
      validationSchema={patientValidationSchema}
      formFields={patientFormFields}

      searchFields={['first_name', 'last_name', 'code','phone_number']}
    />
  );
};

export default Patient;