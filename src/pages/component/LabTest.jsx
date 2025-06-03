import GenericDataGrid from '../component-overview/GenericDataGrid';
import ScienceIcon from '@mui/icons-material/Science';
import * as Yup from 'yup';
import { Box } from '@mui/material';
import { useEffect, useState } from 'react';
import axios from 'axios';

const LabTest = () => {
  const [parentOptions, setParentOptions] = useState([]);
  const apiUrl=import.meta.env.VITE_APP_API_URL;

  useEffect(() => {
    const fetchParentOptions = async () => {
      try {
        const response = await axios.get(`${apiUrl}/systemconstants/by-condition`,{
          params: {
            type:'LabTest'
          }
        });
        const formattedOptions = response.data.map(item => ({
          value: item.id, // or item._id depending on your API
          label: item.name
        }));
        setParentOptions(formattedOptions);
      } catch (error) {
        console.error('Failed to load parent options:', error);
      }
    };

    fetchParentOptions();
  }, []);

  const labTestFormFields = [
    { name: 'name', label: 'Test Name', type: 'text', required: true },
    { name: 'description', label: 'Description', type: 'text' },
    { name: 'remark', label: 'Remark', type: 'text' },
    { name: 'amount', label: 'Amount', type: 'text' },
    { name: 'parentId', label: 'parentId', type: 'select',options:parentOptions },
    { name: 'referencerange', label: 'Reference Range', type: 'text' },
    { name: 'index', label: 'Index', type: 'number' },
    {
      name: 'isActive',
      label: 'Is Active',
      type: 'select',
      options: [
        { value: true, label: 'Active' },
        { value: false, label: 'Inactive' },
      ]
    }
  ];

  const labTestValidationSchema = Yup.object({
    name: Yup.string().required("Test Name is required"),
    description: Yup.string(),
    remark: Yup.string(),
    amount: Yup.number().nullable(),
    referencerange: Yup.string(),
    index: Yup.number().nullable(),
    isActive: Yup.boolean()
  });

  const initialLabTestValues = {
    name: '',
    type: 'LabTest',
    description: '',
    remark: '',
    amount: 0,
    parentId:null,
    referencerange: '',
    index: null,
    isActive: true
  };

  const labTestColumns = [
    { field: 'code', headerName: 'Code', width: 130, flex: 1 },
    { field: 'name', headerName: 'Name', width: 180, flex: 2 },
    { field: 'type', headerName: 'Type', width: 140, flex: 1 },
    { field: 'description', headerName: 'Description', width: 200, flex: 2 },
    { field: 'remark', headerName: 'Remark', width: 180, flex: 1 },
    { field: 'amount', headerName: 'Amount', width: 120, flex: 1 },
    { field: 'referencerange', headerName: 'Ref Range', width: 180, flex: 1 },
    { field: 'index', headerName: 'Index', width: 100, flex: 1 },
    {
      field: 'isActive',
      headerName: 'Status',
      width: 120,
      flex: 1,
      renderCell: (params) => (
        <Box sx={{ color: params.value ? 'success.main' : 'error.main', fontWeight: 'medium' }}>
          {params.value ? 'Active' : 'Inactive'}
        </Box>
      )
    },
    { field: 'createdAt', headerName: 'Created At', width: 180, flex: 2 },
  ];

  return (
    <GenericDataGrid
      title='Lab Tests'
      icon={<ScienceIcon />}
      pathe='systemConstants'
      apiEndpoint="systemConstants"
      modelName="SystemConstant"
      prefix="SYC-"
      detailPagePath={`/labtest-details`}
      params={{ type: 'LabTest' }}
      columns={labTestColumns}
      initialFormValues={initialLabTestValues}
      validationSchema={labTestValidationSchema}
      formFields={labTestFormFields}
      searchFields={['name', 'code', 'type']}
    />
  );
};

export default LabTest;
