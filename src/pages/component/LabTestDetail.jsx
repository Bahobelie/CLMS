import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Button,
  CircularProgress,
  Grid,
  MenuItem, Snackbar,
  TextField,
  Typography
} from '@mui/material';
import axios from 'axios';
import * as Yup from 'yup';
import { useFormik } from 'formik';
import { useTheme } from '@mui/material/styles';
import { ArrowBack as BackIcon } from '@mui/icons-material';
import Swal from 'sweetalert2';

const validationSchema = Yup.object({
  name: Yup.string().required("Test Name is required"),
  description: Yup.string(),
  remark: Yup.string(),
  amount: Yup.number().nullable(),
  referencerange: Yup.string(),
  index: Yup.number().nullable(),
  isActive: Yup.boolean(),
  parentId: Yup.string().nullable()
});

const LabTestDetail = () => {
  const apiUrl=import.meta.env.VITE_APP_API_URL;
  const theme=useTheme();

  const { code } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [parentOptions, setParentOptions] = useState([]);
  const [tests,setTest]=useState(null);

  const formik = useFormik({
    initialValues: {
      code:'',
      name: '',
      description: '',
      remark: '',
      amount: 0,
      parentId: null,
      referencerange: '',
      index: null,
      isActive: true
    },
    validationSchema,
    onSubmit: async (values) => {
      try {
        await axios.put(`${apiUrl}/systemconstants/${tests.id}`, {
          ...values,
          type: 'LabTest'
        });
        await Swal.fire({
          title: 'Updated!',
          text: 'Lab Test updated successfully.',
          icon: 'success',
          confirmButtonText: 'OK',
          timer: 2000,
          timerProgressBar: true,
          showConfirmButton: false
        });

        navigate(-1);
      } catch (err) {
        console.error('Update failed:', err);
        await Swal.fire({
          title: 'Error!',
          text: 'Something went wrong while updating.',
          icon: 'error',
          confirmButtonText: 'OK'
        });
      }
    }
  });

  useEffect(() => {
    const loadData = async () => {
      try {
        const [testRes, parentRes] = await Promise.all([
          axios.get(`${apiUrl}/systemconstants/by-condition`,{
            params:{
              code:code,
              type:'LabTest'
            }
          }),
          axios.get(`${apiUrl}/systemconstants/by-condition?type=LabTest`)
        ]);
        setTest(testRes.data[0]),


        formik.setValues({
          code:testRes.data[0].code || '',
          name: testRes.data[0].name || '',
          description: testRes.data[0].description || '',
          remark: testRes.data[0].remark || '',
          amount: testRes.data[0].amount || 0,
          parentId: testRes.data[0].parentId || null,
          referencerange: testRes.data[0].referencerange || '',
          isActive: testRes.data[0].isActive
        });

        setParentOptions(parentRes.data.map(item => ({
          value: item.id,
          label: item.name
        })));

      } catch (err) {
        console.error('Failed to fetch details:', err);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [code]);

  if (loading) {
    return <Box display="flex" justifyContent="center" mt={5}><CircularProgress /></Box>;
  }

  return (
    <Box p={4}>
      <Button
        variant="outlined"
        startIcon={<BackIcon />}
        onClick={() => navigate(-1)}
        sx={{ mb: 6 }}
      >
        Go Back
      </Button>
      <form onSubmit={formik.handleSubmit}>
        <Grid container spacing={2}>
          {[
            { name: 'code', label: 'Test code' },
            { name: 'name', label: 'Test Name' },
            { name: 'description', label: 'Description' },
            { name: 'remark', label: 'Remark' },
            { name: 'amount', label: 'Amount', type: 'number' },
            { name: 'referencerange', label: 'Reference Range' },
            { name: 'index', label: 'Index', type: 'number' }
          ].map(({ name, label, type }) => (
            <Grid item xs={12} md={6} key={name}>
              <TextField
                fullWidth
                name={name}
                label={label}
                type={type || 'text'}
                value={formik.values[name]}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched[name] && Boolean(formik.errors[name])}
                helperText={formik.touched[name] && formik.errors[name]}
              />
            </Grid>
          ))}
          <Grid item xs={12} md={6}>
            <TextField
              select
              fullWidth
              name="parentId"
              label="Parent"
              value={formik.values.parentId || ''}
              onChange={formik.handleChange}
            >
              <MenuItem value="">None</MenuItem>
              {parentOptions.map(option => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </TextField>
          </Grid>

          <Grid item xs={12} md={6}>
            <TextField
              select
              fullWidth
              name="isActive"
              label="Is Active"
              value={formik.values.isActive}
              onChange={formik.handleChange}
            >
              <MenuItem value={true}>Active</MenuItem>
              <MenuItem value={false}>Inactive</MenuItem>
            </TextField>
          </Grid>

          <Grid item xs={12}>
            <Button variant="contained" sx={{backgroundColor:theme.palette.primary[100],'&:hover':{
                backgroundColor:theme.palette.primary[100]
              }}} type="submit">
              Save Changes
            </Button>
          </Grid>
        </Grid>
      </form>
    </Box>
  );
};

export default LabTestDetail;
