import * as Yup from 'yup';
import GenericDataGrid from '../component-overview/GenericDataGrid';
import { Chip } from '@mui/material';
import { CheckCircle as GoodIcon, Error as ExpiredIcon, Warning as WarningIcon } from '@mui/icons-material';
import React from 'react';

const Medicine = () => {
  const medicineFormFields = [
    { name: 'name', label: 'Medicine Name', type: 'text', required: true },
    { name: 'category', label: 'Category', type: 'text' },
    { name: 'notes', label: 'Note', type: 'text' },
    { name: 'batchnumber', label: 'Batch Number', type: 'text' }, // changed
    { name: 'start_date', label: 'Start Date', type: 'date',required: false },
    { name: 'quantity', label: 'Quantity', type: 'number' },
    { name: 'unitprice', label: 'Unit Price', type: 'number' }, // changed
    { name: 'remark', label: 'Remark', type: 'text' },
    { name: 'expiry_date', label: 'Expiry Date', type: 'date',required: true },


  ];

  const medicineValidationSchema = Yup.object({
    name: Yup.string().required('Medicine name is required'),
    category: Yup.string(),
    manufacturer: Yup.string(),
    batchNumber: Yup.string(), // changed
    expiry_date: Yup.date().required(),
    start_date: Yup.date().nullable(),
    quantity: Yup.number().min(0, 'Quantity must be at least 0'),
    unitprice: Yup.number().min(0, 'Price must be at least 0'), // changed
    remark: Yup.string(),
  });

  const initialMedicineValues = {
    name: '',
    category: '',
    manufacturer: '',
    batchNumber: '', // changed
    expiry_date: new Date().toISOString().split('T')[0],
    start_date:new Date().toISOString().split('T')[0],
    quantity: 0,
    unitprice: 0, // changed
    remark: ''
  };

  const medicineColumns = [
    { field: 'code', headerName: 'Code', width: 100, flex: 1 },
    { field: 'name', headerName: 'Name', width: 200, flex: 2 },
    { field: 'category', headerName: 'Category', width: 150, flex: 1 },
    { field: 'notes', headerName: 'Note', width: 150, flex: 1 },
    { field: 'batchnumber', headerName: 'Batch No.', width: 120, flex: 1 },

    { field: 'status', headerName: 'Status', width: 120, flex: 3,renderCell: (params) => getStatusChip(params.row)},
    {
      field: 'expiry_date',
      headerName: 'Expiry Date',
      width: 150,
      flex: 2,
    },
    { field: 'quantity', headerName: 'Quantity', width: 100, type: 'number', flex: 1 },
    { field: 'unitprice', headerName: 'Unit Price (₦)', width: 130, type: 'number', flex: 1 },
    { field: 'remark', headerName: 'Remark', width: 200, flex: 2 }
  ];

  const medicineValueGetters = {
    // Add any computed field logic here if needed
  };

  const medicineCustomRenderers = {
    unit_price: (params) => (
      <span style={{ fontWeight: 'bold' }}>₦ {params.value}</span>
    )
  };

  const getStatusChip = (item) => {
    if (!item) return null;

    const expiryDate = new Date(item.expiry_date);
    const today = new Date();
    const tenDaysFromNow = new Date(today.getTime() + 10 * 24 * 60 * 60 * 1000);

    if (expiryDate < today) {
      return (
        <Chip
          icon={<ExpiredIcon />}
          label="EXPIRED"
          color="error"
          sx={{ ml: 1, fontWeight: 'bold' }}
        />
      );
    } else if (expiryDate <= tenDaysFromNow) {
      return (
        <Chip
          icon={<WarningIcon />}
          label="EXPIRING SOON"
          color="warning"
          sx={{
            ml: 1,
            fontWeight: 'bold',
            animation: 'pulse 1.5s infinite',
            '@keyframes pulse': {
              '0%': { opacity: 1 },
              '50%': { opacity: 0.5 },
              '100%': { opacity: 1 }
            }
          }}
        />
      );
    } else {
      return (
        <Chip
          icon={<GoodIcon />}
          label="GOOD"
          color="success"
          sx={{ ml: 1, fontWeight: 'bold' }}
        />
      );
    }
  };
  return (
    <GenericDataGrid
      title="Medicines"
      apiEndpoint="medicines"
      modelName="Medicine"
      prefix="MD-"
      detailPagePath="/medicine-details"
      pathe="medicines"
      columns={medicineColumns}
      valueGetters={medicineValueGetters}
      customRenderers={medicineCustomRenderers}
      initialFormValues={initialMedicineValues}
      validationSchema={medicineValidationSchema}
      formFields={medicineFormFields}
      searchFields={['name', 'batch_number', 'manufacturer']}
    />
  );
};

export default Medicine;