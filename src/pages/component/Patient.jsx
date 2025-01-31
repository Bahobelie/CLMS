import { motion } from 'framer-motion';
import { DataGrid, GridToolbar } from '@mui/x-data-grid';
import ActionMenu from '../component-overview/ActionMenu'; // Ensure this is correctly implemented
import { useState } from 'react';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';

import Button from '@mui/material/Button';
import { useTheme } from '@mui/material/styles';

const Patient = () => {
  const  theme = useTheme();

  const [data, setData] = useState({
    columns: [
      { field: 'id', headerName: 'ID', width: 90 ,flex:1},
      { field: 'name', headerName: 'Name', width: 150,flex:1 },
      { field: 'age', headerName: 'Age', type: 'number', width: 110 ,flex:1},
      { field: 'disease', headerName: 'Disease', width: 180 ,flex:1},
      { field: 'admissionDate', headerName: 'Admission Date', width: 180,flex:1 },
      { field: 'status', headerName: 'Status', width: 150,flex:1 },
      {
        field: 'actions',
        headerName: 'Actions',
        width: 150,
        renderCell: (params) => <ActionMenu rowId={params.row.id} />
      }
    ],
    rows: [
      { id: 1, name: 'John Doe', age: 34, disease: 'Flu', admissionDate: '2024-01-15', status: 'Admitted' },
      { id: 2, name: 'Jane Smith', age: 29, disease: 'Cold', admissionDate: '2024-01-10', status: 'Discharged' },
      { id: 3, name: 'Robert Brown', age: 58, disease: 'Pneumonia', admissionDate: '2024-01-12', status: 'Admitted' },
      { id: 4, name: 'Emily Clark', age: 43, disease: 'COVID-19', admissionDate: '2024-01-08', status: 'Admitted' },
      { id: 5, name: 'Michael Lewis', age: 65, disease: 'Heart Attack', admissionDate: '2024-01-14', status: 'Admitted' },
      { id: 6, name: 'Sarah Taylor', age: 35, disease: 'Migraine', admissionDate: '2024-01-16', status: 'Discharged' },
      { id: 7, name: 'William Scott', age: 60, disease: 'Chronic Kidney Disease', admissionDate: '2024-01-09', status: 'Admitted' },
      { id: 8, name: 'Olivia Martinez', age: 25, disease: 'Asthma', admissionDate: '2024-01-13', status: 'Discharged' },
      { id: 9, name: 'David Wilson', age: 40, disease: 'Diabetes', admissionDate: '2024-01-11', status: 'Admitted' },
      { id: 10, name: 'Sophia Anderson', age: 32, disease: 'Hypertension', admissionDate: '2024-01-07', status: 'Discharged' }
    ]
  });

  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      style={{
        height: '85%',
        width: '100%',
        background: '#fff',
        padding: '10px',
        borderRadius: '8px',
        boxShadow: '0 4px 10px rgba(0, 0, 0, 0.1)',
        marginTop: '90px',
        display: 'flex',
        flexDirection: 'column'
      }}
    >
      <DataGrid
        rows={data.rows}
        columns={data.columns}
        pageSize={5} // Adjust the page size as needed
        checkboxSelection // This adds the checkbox to each row
        disableRowSelectionOnClick
        localeText={{
          toolbarDensity: 'Size',
          toolbarDensityLabel: 'Size',
          toolbarDensityCompact: 'Small',
          toolbarDensityStandard: 'Medium',
          toolbarDensityComfortable: 'Large'
        }}
        slots={{
          toolbar: () => (
            <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
              <Button   style={{ margin: '10px',color:'#fff',backgroundColor:theme.palette.primary[100] }}>
                New <AddCircleOutlineIcon sx={{marginLeft:'3px'}}/>
              </Button>
              <div style={{ marginTop: 'auto', display: 'flex', justifyContent: 'flex-end', marginBottom: '18px' }}>
                <GridToolbar />
              </div>
            </div>
          )
        }}
        sx={{
          height: '100%',
          width: '100%',
          boxSizing: 'border-box',
          margin:'13px',
          '& .MuiDataGrid-columnHeader, .MuiDataGrid-cell': {
            fontWeight: '800' // Medium weight for text
          },
          '&.MuiDataGrid':{
          marginLeft:'100px'
          },

          '& .MuiDataGrid-columnHeaderCheckbox': {
            display: 'block' // Ensure the checkbox is visible
          }
        }}
      />
    </motion.div>
  );
};

export default Patient;
