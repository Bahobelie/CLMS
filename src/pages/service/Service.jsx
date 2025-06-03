import GenericDataGrid from '../component-overview/GenericDataGrid';
import WorkIcon from '@mui/icons-material/Work';
import * as Yup from 'yup';
import { Box, TextField, InputAdornment } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import axios from 'axios';
import { useEffect, useState } from 'react';

const Service = () => {
  const apiUrl = import.meta.env.VITE_APP_API_URL;
  const [typeOptions, setTypeOptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [parent, setParent] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredData, setFilteredData] = useState([]);

  useEffect(() => {
    const fetchTypeOptions = async () => {
      try {
        const response = await axios.get(`${apiUrl}/systemConstants/by-condition`, {
          params: { type: 'Service' }
        });

        const parent = await axios.get(`${apiUrl}/systemConstants/by-condition`, {
          params: { type: 'LabTest' }
        });

        // Transform API response to { value, label } format
        const options = response.data.map(item => ({
          key: item.id,
          value: item.name,
          label: item.name
        }));

        const parents = parent.data.map(item => ({
          value: item.index,
          label: item.name
        }));

        setParent(parents);
        setTypeOptions(options);
      } catch (error) {
        console.error('Error fetching type options:', error);
        setTypeOptions([]);
      } finally {
        setLoading(false);
      }
    };

    fetchTypeOptions();
  }, []);



  const serviceFormFields = [
    { name: 'name', label: 'Service Name', type: 'text', required: true },
    { name: 'description', label: 'Description', type: 'text' },
    { name: 'remark', label: 'Remark', type: 'text' },
    { name: 'amount', label: 'Amount', type: 'text' },
    { name: 'referencerange', label: 'ReferenceRange', type: 'text' },
    {
      name: 'status',
      label: 'Status',
      type: 'select',
      options: [
        { value: 'true', label: 'Active' },
        { value: 'false', label: 'Inactive' },
      ],
    },
    {
      name: 'type',
      label: 'Type',
      type: 'select',
      options: typeOptions,
      loading: loading
    },
    {
      name: 'parentId',
      label: 'Parent',
      type: 'select',
      options: parent,
      loading: loading
    },
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
    type: '',
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
          {params.value === 'true' ? 'Active' : 'Inactive'}
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
        datapassed={parent}
        columns={serviceColumns}
        initialFormValues={initialServiceValues}
        validationSchema={serviceValidationSchema}
        formFields={serviceFormFields}
        searchFields={['name', 'code', 'type']}
        externalSearchQuery={searchQuery} // Pass the search query to GenericDataGrid
      />
  );
};

export default Service;