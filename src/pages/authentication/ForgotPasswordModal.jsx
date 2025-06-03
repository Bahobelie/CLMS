import React, { useState } from 'react';
import {
  Button,
  TextField,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Typography,
  Box,
} from '@mui/material';

const ForgotPasswordModal = ({ open, onClose, onSubmit }) => {
  const [username, setUsername] = useState('');
  const [error, setError] = useState('');

  const handleUsernameChange = (event) => {
    setUsername(event.target.value);
  };

  const handleResetPassword = () => {
    if (!username) {
      setError('Please enter your username.');
      return;
    }
    onSubmit(username); // Call the function passed to handle the submission with the username
    setError('');
    setUsername('');
    onClose(); // Close the modal after submission
  };

  return (
    <Dialog open={open} onClose={onClose} aria-labelledby="form-dialog-title">
      <DialogTitle id="form-dialog-title">Forgot Password?</DialogTitle>
      <DialogContent>
        <Typography variant="body1" color="textSecondary" sx={{ mb: 2 }}>
          Enter the username associated with your account.
        </Typography>
        <TextField
          autoFocus
          margin="dense"
          id="username"
          label="Username"
          type="text"
          fullWidth
          value={username}
          onChange={handleUsernameChange}
          error={!!error}
          helperText={error}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="primary">
          Cancel
        </Button>
        <Button onClick={handleResetPassword} color="primary">
          Reset Password
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ForgotPasswordModal;