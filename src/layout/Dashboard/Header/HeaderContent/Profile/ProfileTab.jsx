import PropTypes from 'prop-types';
import { useState } from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router';
import Swal from 'sweetalert2';  // Import SweetAlert2

// MUI Components
import List from '@mui/material/List';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import Box from '@mui/material/Box';

// Icons
import LogoutOutlined from '@ant-design/icons/LogoutOutlined';
import LockOutlined from '@ant-design/icons/UserOutlined';

// Actions
import { LOGOUT } from '../../../../../contexts/auth-reducer/actions';
import axios from 'axios';

export default function ProfileTab() {
  const apiUrl = import.meta.env.VITE_APP_API_URL;

  const [selectedIndex, setSelectedIndex] = useState(0);
  const [openChangePassword, setOpenChangePassword] = useState(false);
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const adminId = JSON.parse(localStorage.getItem('user'));

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('token'); // Clear token on logout
    dispatch({ type: LOGOUT, payload: {} });
    navigate('/login');
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error when user types
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

    if (!passwordData.currentPassword.trim()) {
      newErrors.currentPassword = 'Current password is required';
    }

    if (!passwordData.newPassword.trim()) {
      newErrors.newPassword = 'New password is required';
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmitPasswordChange = async () => {
    if (!validateForm()) return;

    setIsSubmitting(true);
    setOpenChangePassword(false);
    try {
      const response = await axios.post(
        `${apiUrl}/admins/change-password`,
        {
          currentPassword: passwordData.currentPassword,
          newPassword: passwordData.newPassword,
          adminId: adminId.id
        },
        {
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );

      await Swal.fire({
        icon: 'success',
        title: 'Password changed successfully',
        timer: 3000,
        showConfirmButton: false
      });

      setOpenChangePassword(false);
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
    } catch (error) {
      console.log(error);
      const errorMessage = error.response?.data?.message ||
        error.message ||
        'Failed to change password';

      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: errorMessage,
        timer: 4000,
        showConfirmButton: true
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <List component="nav" sx={{ p: 0, '& .MuiListItemIcon-root': { minWidth: 32 } }}>
        <ListItemButton
          selected={selectedIndex === 1}
          onClick={() => setOpenChangePassword(true)}
        >
          <ListItemIcon>
            <LockOutlined />
          </ListItemIcon>
          <ListItemText primary="Change Password" />
        </ListItemButton>


        <ListItemButton selected={selectedIndex === 2} onClick={handleLogout}>
          <ListItemIcon>
            <LogoutOutlined />
          </ListItemIcon>
          <ListItemText primary="Logout" />
        </ListItemButton>
      </List>

      {/* Change Password Dialog */}
      <Dialog
        open={openChangePassword}
        onClose={() => !isSubmitting && setOpenChangePassword(false)}
        maxWidth="sm"
        fullWidth
        disableEscapeKeyDown={isSubmitting}
      >
        <DialogTitle>Change Password</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            margin="normal"
            label="Current Password"
            name="currentPassword"
            type="password"
            value={passwordData.currentPassword}
            onChange={handlePasswordChange}
            error={!!errors.currentPassword}
            helperText={errors.currentPassword}
            disabled={isSubmitting}
          />
          <TextField
            fullWidth
            margin="normal"
            label="New Password"
            name="newPassword"
            type="password"
            value={passwordData.newPassword}
            onChange={handlePasswordChange}
            error={!!errors.newPassword}
            disabled={isSubmitting}
          />
          <TextField
            fullWidth
            margin="normal"
            label="Confirm New Password"
            name="confirmPassword"
            type="password"
            value={passwordData.confirmPassword}
            onChange={handlePasswordChange}
            error={!!errors.confirmPassword}
            helperText={errors.confirmPassword}
            disabled={isSubmitting}
          />
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => setOpenChangePassword(false)}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmitPasswordChange}
            color="primary"
            variant="contained"
            disabled={isSubmitting}
            endIcon={isSubmitting ? <CircularProgress size={20} /> : null}
          >
            {isSubmitting ? (
              <Box component="span" sx={{ display: 'flex', alignItems: 'center' }}>
                Changing...
              </Box>
            ) : 'Change Password'}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}

ProfileTab.propTypes = {
  handleLogout: PropTypes.func
};
