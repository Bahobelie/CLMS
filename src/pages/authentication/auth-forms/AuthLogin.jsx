import PropTypes from 'prop-types';
import React, { useState } from 'react';

// material-ui
import Button from '@mui/material/Button';
import Checkbox from '@mui/material/Checkbox';
import FormControlLabel from '@mui/material/FormControlLabel';
import FormHelperText from '@mui/material/FormHelperText';
import Grid from '@mui/material/Grid';
import InputAdornment from '@mui/material/InputAdornment';
import IconButton from '@mui/material/IconButton';
import InputLabel from '@mui/material/InputLabel';
import OutlinedInput from '@mui/material/OutlinedInput';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { useNavigate } from 'react-router';

// third party
import * as Yup from 'yup';
import { Formik } from 'formik';

// project import
import AnimateButton from 'components/@extended/AnimateButton';

// assets
import EyeOutlined from '@ant-design/icons/EyeOutlined';
import EyeInvisibleOutlined from '@ant-design/icons/EyeInvisibleOutlined';

// axios import
import axios from 'axios';
import { LOGIN } from '../../../contexts/auth-reducer/actions';
import { useDispatch } from 'react-redux';

// ============================|| JWT - LOGIN ||============================ //

export default function AuthLogin({ isDemo = false }) {
  const [checked, setChecked] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const apiUrl = import.meta.env.VITE_APP_API_URL; // API URL
  const dispatch = useDispatch();

  // Initialize navigate hook
  const navigate = useNavigate();

  const handleClickShowPassword = () => {
    setShowPassword(!showPassword);
  };

  const handleRemember=()=>{
    setChecked(!checked);
    localStorage.setItem('userRole', response.data.data.user.role);
    localStorage.setItem('user', JSON.stringify(user));

  }
  const handleMouseDownPassword = (event) => {
    event.preventDefault();
  };


  const handleLogin = async (values, { setSubmitting }) => {
    try {

      const response = await axios.post(`${apiUrl}/admins/login`, {
        name: values.UserName,
        password: values.password,
      });
      // Handle successful response (e.g., store token, redirect, etc.)
      console.log('Login successful:', response.data);

      // Store user role in localStorage
      localStorage.setItem('userRole', response.data.data.user.role);
      const user=response.data.data.user;
      localStorage.setItem('user', JSON.stringify(user));


      // Dispatch the LOGIN action
      dispatch({
        type: LOGIN,
        payload: { user: response.data.data.user }
      });

      // Redirect to home page ("/") after successful login
      navigate('/');
    } catch (error) {
      // Handle error (e.g., display error message)
      setErrorMessage('Login failed. Please check your credentials and try again.');
      console.error('Login error:', error);
    }
    setSubmitting(false);
  };

  return (
    <>
      <Formik
        initialValues={{
          UserName: '',
          password: '',
          submit: null
        }}
        validationSchema={Yup.object().shape({
          UserName: Yup.string().required('UserName is required'),
          password: Yup.string().max(255).required('Password is required')
        })}
        onSubmit={handleLogin}
      >
        {({ errors, handleBlur, handleChange, handleSubmit, isSubmitting, touched, values }) => (
          <form noValidate onSubmit={handleSubmit}>
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <Stack spacing={1}>
                  <InputLabel htmlFor="email-login">User Name</InputLabel>
                  <OutlinedInput
                    id="email-login"
                    type="email"
                    value={values.UserName}
                    name="UserName"
                    onBlur={handleBlur}
                    onChange={handleChange}
                    placeholder="Enter UserName"
                    fullWidth
                    error={Boolean(touched.UserName && errors.UserName)}
                  />
                </Stack>
                {touched.UserName && errors.UserName && (
                  <FormHelperText error id="standard-weight-helper-text-email-login">
                    {errors.UserName}
                  </FormHelperText>
                )}
              </Grid>
              <Grid item xs={12}>
                <Stack spacing={1}>
                  <InputLabel htmlFor="password-login">Password</InputLabel>
                  <OutlinedInput
                    fullWidth
                    error={Boolean(touched.password && errors.password)}
                    id="password-login"
                    type={showPassword ? 'text' : 'password'}
                    value={values.password}
                    name="password"
                    onBlur={handleBlur}
                    onChange={handleChange}
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
                    placeholder="Enter password"
                  />
                </Stack>
                {touched.password && errors.password && (
                  <FormHelperText error id="standard-weight-helper-text-password-login">
                    {errors.password}
                  </FormHelperText>
                )}
              </Grid>

              <Grid item xs={12} sx={{ mt: -1 }}>
                <Stack direction="row" justifyContent="space-between" alignItems="center" spacing={2}>
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={checked}
                        onChange={handleRemember}
                        name="checked"
                        color="primary"
                        size="small"
                      />
                    }
                    label={<Typography variant="h6">Keep me signed in</Typography>}
                  />
                </Stack>
              </Grid>
              {errorMessage && (
                <Grid item xs={12}>
                  <FormHelperText error>{errorMessage}</FormHelperText>
                </Grid>
              )}
              {errors.submit && (
                <Grid item xs={12}>
                  <FormHelperText error>{errors.submit}</FormHelperText>
                </Grid>
              )}
              <Grid item xs={12}>
                <AnimateButton>
                  <Button disableElevation disabled={isSubmitting} fullWidth size="large" type="submit" variant="contained" color="primary">
                    Login
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

AuthLogin.propTypes = { isDemo: PropTypes.bool };
