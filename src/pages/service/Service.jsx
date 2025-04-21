import GenericDataGrid from '../component-overview/GenericDataGrid';
import WorkIcon from '@mui/icons-material/Work';
import * as Yup from 'yup';
import { Box } from '@mui/material';

const Service = () => {
  const serviceFormFields = [
    { name: 'name', label: 'Service Name', type: 'text', required: true },
    { name: 'description', label: 'Description', type: 'text' },
    { name: 'remark', label: 'Remark', type: 'text' },
    { name: 'amount', label: 'Amount', type: 'number' },
    {
      name: 'status',
      label: 'Status',
      type: 'select',
      options: [
        { value: 'Active', label: 'Active' },
        { value: 'Inactive', label: 'Inactive' },
      ],
    }
  ];

  const serviceValidationSchema = Yup.object({
    name: Yup.string().required("Service Name is required"),
    description: Yup.string(),
    remark: Yup.string(),
    amount: Yup.number().nullable(),
    status: Yup.string(),
  });

  const initialServiceValues = {
    name: '',
    type: 'Service',
    description: '',
    remark: '',
    amount: null,
    status: '',
  };

  const serviceColumns = [
    {
      field: 'code',
      headerName: 'Code',
      width: 120,
      flex: 1,
    },
    {
      field: 'name',
      headerName: 'Name',
      width: 180,
      flex: 2,
    },
    {
      field: 'type',
      headerName: 'Type',
      width: 140,
      flex: 1,
    },
    {
      field: 'description',
      headerName: 'Description',
      width: 200,
      flex: 2,
    },
    {
      field: 'remark',
      headerName: 'Remark',
      width: 160,
      flex: 1,
    },
    {
      field: 'amount',
      headerName: 'Amount',
      width: 120,
      flex: 1,
    },
    {
      field: 'status',
      headerName: 'Status',
      width: 120,
      flex: 1,
      renderCell: (params) => (
        <Box
          sx={{
            color: params.value === 'true' ? 'success.main' : 'error.main',
            fontWeight: 'medium'
          }}
        >
          {params.value==='true'?'Active':'Inactive'}
        </Box>
      )
    },
    {
      field: 'createdAt',
      headerName: 'Created At',
      width: 180,
      flex: 2,
    },
  ];

  return (
    <GenericDataGrid
      title='Services'
      icon={<WorkIcon />}
      pathe='systemConstants'
      apiEndpoint="systemConstants"
      modelName="SystemConstant"
      prefix="SYC-"
      detailPagePath={`/service-details`}
      params={{type:'Service'}}
      columns={serviceColumns}
      initialFormValues={initialServiceValues}
      validationSchema={serviceValidationSchema}
      formFields={serviceFormFields}
      searchFields={['name', 'code', 'type']}
    />
  );
};

export default Service;
