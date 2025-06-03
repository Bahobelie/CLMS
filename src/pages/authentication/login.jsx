import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Grid, Stack, Typography, Button } from '@mui/material';
import AuthWrapper from './AuthWrapper';
import AuthLogin from './auth-forms/AuthLogin';
import ForgotPasswordModal from './ForgotPasswordModal';
import axios from 'axios';
import Swal from 'sweetalert2'; // Import SweetAlert

const Login = () => {
  const apiUrl = import.meta.env.VITE_APP_API_URL;

  const [isForgotPasswordOpen, setIsForgotPasswordOpen] = useState(false);

  const handleForgotPasswordOpen = () => {
    setIsForgotPasswordOpen(true);
  };

  const handleForgotPasswordClose = () => {
    setIsForgotPasswordOpen(false);
  };

  const handleForgotPasswordSubmit = async (username) => {
    console.log('Submitting username for password reset:', username);
    try {
      const response = await axios.post(`${apiUrl}/admins/reset-password`, {
        username: username,
      });

      if (response.status === 200) {
        Swal.fire({
          title: 'Success',
          text: 'Password reset try to login.',
          icon: 'success',
          confirmButtonText: 'OK',
        });
      } else {
        await Swal.fire({
          title: 'Error',
          text: 'Failed to send reset instructions. Please check your username.',
          icon: 'error',
          confirmButtonText: 'OK',
        });
      }
    } catch (error) {
      Swal.fire({
        title: 'Error',
        text: 'An unexpected error occurred. Please try again later.',
        icon: 'error',
        confirmButtonText: 'OK',
      });
      console.error('An error occurred:', error);
    } finally {
      setIsForgotPasswordOpen(false); // Close modal
    }
  };

  return (
    <AuthWrapper>
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Stack direction="row" justifyContent="space-between" alignItems="baseline" sx={{ mb: { xs: -0.5, sm: 0.5 } }}>
            <Typography variant="h3">Login</Typography>
            <Typography component={Link} to="/register" variant="body1" sx={{ textDecoration: 'none' }} color="primary">
              Don&apos;t have an account?
            </Typography>
          </Stack>
        </Grid>
        <Grid item xs={12}>
          <AuthLogin />
        </Grid>
        <Grid item xs={12} sx={{ mt: 1 }}>
          <Button onClick={handleForgotPasswordOpen} color="primary" size="small">
            Forgot password?
          </Button>
        </Grid>
      </Grid>

      {/* Render the ForgotPasswordModal */}
      <ForgotPasswordModal
        open={isForgotPasswordOpen}
        onClose={handleForgotPasswordClose}
        onSubmit={handleForgotPasswordSubmit}
      />
    </AuthWrapper>
  );
};

export default Login;
