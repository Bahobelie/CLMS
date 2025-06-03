import { useEffect, useState } from 'react';

// material-ui
import Button from '@mui/material/Button';
import FormControl from '@mui/material/FormControl';
import FormHelperText from '@mui/material/FormHelperText';
import Grid from '@mui/material/Grid';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import InputAdornment from '@mui/material/InputAdornment';
import IconButton from '@mui/material/IconButton';
import InputLabel from '@mui/material/InputLabel';
import OutlinedInput from '@mui/material/OutlinedInput';
import Stack from '@mui/material/Stack';

// third party
import * as Yup from 'yup';
import { Formik } from 'formik';

// project import
import AnimateButton from 'components/@extended/AnimateButton';
import { strengthColor, strengthIndicator } from 'utils/password-strength';

// assets
import EyeOutlined from '@ant-design/icons/EyeOutlined';
import EyeInvisibleOutlined from '@ant-design/icons/EyeInvisibleOutlined';
import axios from 'axios';
import Swal from 'sweetalert2';
import { useNavigate } from 'react-router';

// ============================|| JWT - REGISTER ||============================ //

export default function AuthRegister() {
  const [showPassword, setShowPassword] = useState(false);
  const Navigate=useNavigate();
  const [roles, setRoles] = useState([]);


  const getAllRoles = async () => {
    try {
      const response = await axios.get(`${import.meta.env.VITE_APP_API_URL}/systemConstants/by-condition`, {
        params:{
          type: "Role"
        }
      });

      if (response.status === 200) {
        setRoles(response.data);
      }
    } catch (error) {
      console.error("Error fetching roles:", error);
    }
  };

  const handleClickShowPassword = () => {
    setShowPassword(!showPassword);
  };

  const handleMouseDownPassword = (event) => {
    event.preventDefault();
  };

  const changePassword = (value) => {
    const temp = strengthIndicator(value);
  };
  useEffect(  () => {
    const fetchData = async () => {
      changePassword(''); // Call synchronous function
      await getAllRoles(); // Await async function
    };
    fetchData();
  }, []);

  return (
    <>
      <Formik
        initialValues={{
          fullName: '',
          phoneNumber: '',
          email: '',
          password: '',
          role: '',
          submit: null
        }}
        validationSchema={Yup.object().shape({
          fullName: Yup.string().max(255).required('Full Name is required'),
          phoneNumber: Yup.string()
            .max(14)
            .min(10)
            .required('Phone Number is required'),
          email: Yup.string().email('Must be a valid email').max(255).required('Email is required'),
          password: Yup.string().max(255).required('Password is required'),
          role: Yup.string().required('Role is required')
        })}
        onSubmit={async (values, { setSubmitting, setErrors }) => {
          try {
            const apiUrl = import.meta.env.VITE_APP_API_URL; // Replace with your actual API URL
            const role=roles.find(r=>r.name===values.role)
            const code=await axios.get(`${apiUrl}/model/next-code`,{
              params:{
                model:'Admin',
                prefix: 'AD-'
              }
            })

            const response = await axios.post(
              `${apiUrl}/admins`,
              {
                code:code.data.code,
                name: values.fullName,
                phoneNumber: values.phoneNumber,
                email: values.email,
                password: values.password,
                role:role.id
              },
            );
            console.log(response.status);

            if (response.status === 201) {
              await Swal.fire({
                title: 'Account Created!',
                text: 'You have successfully registered.',
                icon: 'success',
                timer: 3000, // Auto-close after 3 seconds
                showConfirmButton: false
              });
              Navigate('/login')
              setSubmitting(false);
            }
          } catch (error) {
            console.error('Registration error', error);
            setErrors({ submit: error.response?.data?.message || 'Something went wrong' });
            setSubmitting(false);
          }
        }}
      >
        {({ errors, handleBlur, handleChange, handleSubmit, isSubmitting, touched, values }) => (
          <form noValidate onSubmit={handleSubmit}>
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Stack spacing={1}>
                  <InputLabel htmlFor="fullName-signup">Full Name*</InputLabel>
                  <OutlinedInput
                    id="fullName-signup"
                    type="text"
                    value={values.fullName}
                    name="fullName"
                    onBlur={handleBlur}
                    onChange={handleChange}
                    placeholder="John Doe"
                    fullWidth
                    error={Boolean(touched.fullName && errors.fullName)}
                  />
                </Stack>
                {touched.fullName && errors.fullName && (
                  <FormHelperText error id="helper-text-fullName-signup">
                    {errors.fullName}
                  </FormHelperText>
                )}
              </Grid>
              <Grid item xs={12} md={6}>
                <Stack spacing={1}>
                  <InputLabel htmlFor="phoneNumber-signup">Phone Number*</InputLabel>
                  <OutlinedInput
                    fullWidth
                    error={Boolean(touched.phoneNumber && errors.phoneNumber)}
                    id="phoneNumber-signup"
                    type="text"
                    value={values.phoneNumber}
                    name="phoneNumber"
                    onBlur={handleBlur}
                    onChange={handleChange}
                    placeholder="+2519"
                    inputProps={{}}
                  />
                </Stack>
                {touched.phoneNumber && errors.phoneNumber && (
                  <FormHelperText error id="helper-text-phoneNumber-signup">
                    {errors.phoneNumber}
                  </FormHelperText>
                )}
              </Grid>
              <Grid item xs={12}>
                <Stack spacing={1}>
                  <InputLabel htmlFor="email-signup">Email Address*</InputLabel>
                  <OutlinedInput
                    fullWidth
                    error={Boolean(touched.email && errors.email)}
                    id="email-signup"
                    type="email"
                    value={values.email}
                    name="email"
                    onBlur={handleBlur}
                    onChange={handleChange}
                    placeholder="demo@company.com"
                    inputProps={{}}
                  />
                </Stack>
                {touched.email && errors.email && (
                  <FormHelperText error id="helper-text-email-signup">
                    {errors.email}
                  </FormHelperText>
                )}
              </Grid>
              <Grid item xs={12}>
                <Stack spacing={1}>
                  <InputLabel htmlFor="password-signup">Password</InputLabel>
                  <OutlinedInput
                    fullWidth
                    error={Boolean(touched.password && errors.password)}
                    id="password-signup"
                    type={showPassword ? 'text' : 'password'}
                    value={values.password}
                    name="password"
                    onBlur={handleBlur}
                    onChange={(e) => {
                      handleChange(e);
                      changePassword(e.target.value);
                    }}
                    endAdornment={
                      <InputAdornment position="end">
                        <IconButton
                          aria-label="toggle password visibility"
                          onClick={handleClickShowPassword}
                          onMouseDown={handleMouseDownPassword}
                          edge="end"
                          color="secondary"
                        >
                          {showPassword ? <EyeOutlined /> : <EyeInvisibleOutlined />}
                        </IconButton>
                      </InputAdornment>
                    }
                    placeholder="******"
                    inputProps={{}}
                  />
                </Stack>
                {touched.password && errors.password && (
                  <FormHelperText error id="helper-text-password-signup">
                    {errors.password}
                  </FormHelperText>
                )}
              </Grid>
              {/* Role Selection Dropdown */}
              <Grid item xs={12}>
                <Stack spacing={1}>
                  <InputLabel htmlFor="role-signup">Role*</InputLabel>
                  <FormControl fullWidth error={Boolean(touched.role && errors.role)}>
                    <Select
                      id="role-signup"
                      name="role"
                      value={values.role}
                      onBlur={handleBlur}
                      onChange={handleChange}
                      displayEmpty
                    >
                      <MenuItem value="" disabled>
                        Select Role
                      </MenuItem>
                      {roles.map((role) => (
                        <MenuItem key={role.id} value={role.name}>
                          {role.name}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>

                  {touched.role && errors.role && (
                    <FormHelperText error id="helper-text-role-signup">
                      {errors.role}
                    </FormHelperText>
                  )}
                </Stack>
              </Grid>
              {errors.submit && (
                <Grid item xs={12}>
                  <FormHelperText error>{errors.submit}</FormHelperText>
                </Grid>
              )}
              <Grid item xs={12}>
                <AnimateButton>
                  <Button disableElevation disabled={isSubmitting} fullWidth size="large" type="submit" variant="contained" color="primary">
                    Create Account
                  </Button>
                </AnimateButton>
              </Grid>
            </Grid>
          </form>
        )}
      </Formik>
    </>
  );
}
