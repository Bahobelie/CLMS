import React, { useState } from 'react';
import { IconButton, Menu, MenuItem } from '@mui/material';
import MoreHorizIcon from '@mui/icons-material/MoreHoriz';
import { useTheme } from '@mui/material/styles';
import ListItemIcon from '@mui/material/ListItemIcon';
import { Delete, Visibility } from '@mui/icons-material';
import { useNavigate } from 'react-router';
import PatientDetail from '../component/PatientDetail';
import Swal from 'sweetalert2';
import axios from 'axios';

const ActionMenu = ({ rowId,code,onRefetch,detailPagePath,pathe }) => {
  const [anchorEl, setAnchorEl] = useState(null); // State to control menu visibility
  const theme = useTheme();
  const Navigate=useNavigate();


  const apiUrl = import.meta.env.VITE_APP_API_URL;

  // Open the menu when the button is clicked
  const handleOpenMenu = (event) => {
    setAnchorEl(event.currentTarget);
  };

  // Close the menu
  const handleCloseMenu = () => {
    setAnchorEl(null);
  };

  // Handle Edit action
  const handleEdit = () => {
    Navigate(`${detailPagePath}/${code}`)
    handleCloseMenu(); // Close the menu after action
  };

  // Handle Delete action
  const handleDelete = async () => {
    let userRole = localStorage.getItem('userRole'); // Assuming the role is stored as 'userRole'

    if (userRole === 'Receptionist' || userRole === 'Doctor') {
      handleCloseMenu()
      // Show confirmation alert
      const result = await Swal.fire({
        title: "Are you sure?",
        text: "You won't be able to revert this!",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#3085d6",
        cancelButtonColor: "#d33",
        confirmButtonText: "Yes, delete it!"
      });

      // If the user confirms the deletion
      if (result.isConfirmed) {
        try {
          // Send the delete request
          const response = await axios.delete(`${apiUrl}/${pathe}/${rowId}`);

          if (response.status === 200) {
            await Swal.fire({
              title: "Deleted!",
              text: "Your file has been deleted.",
              icon: "success"
            });
            if (onRefetch && typeof onRefetch === 'function') {
              onRefetch();
            }
          } else {
            // Handle error if the response status is not 200
            await Swal.fire({
              title: "Error",
              text: "There was an issue deleting your file. Please try again.",
              icon: "error"
            });
          }
        } catch (error) {
          // Catch any network or server errors
          console.log(error)
          await Swal.fire({
            title: "Error",
            text: error,
            icon: "error"
          });
        }
      }
    } else {
      // Show a message if the user doesn't have permission
      await Swal.fire({
        title: "Unauthorized!",
        text: "You don't have permission to delete this.",
        icon: "error"
      });
    }
  };

  return (
    <div>
      {/* IconButton to open the menu */}
      <IconButton
        onClick={handleOpenMenu}
        sx={{
          border: '0.2px solid gray',
          width: '54px',
          borderColor: theme.palette.divider
        }}
      >
        <MoreHorizIcon />
      </IconButton>

      {/* Menu to show options */}
      <Menu
        anchorEl={anchorEl} // The element the menu is anchored to
        open={Boolean(anchorEl)} // Menu visibility
        onClose={handleCloseMenu} // Close the menu
        PaperProps={{
          style: {
            boxShadow: '0 4px 10px rgba(0, 0, 0, 0.2)',
            borderRadius: '8px'
          }
        }}
      >
        {/* Menu Items for Edit and Delete */}
        <MenuItem
          sx={{
            ':hover': {
              color: theme.palette.primary[100],
              backgroundColor: 'white'
            }
          }}
          onClick={handleEdit}
        >
          <ListItemIcon
            sx={{
              color: theme.palette.primary[100]
            }}
          >
            <Visibility />
          </ListItemIcon>
          View
        </MenuItem>
        <MenuItem
          sx={{
            ':hover': {
              color: theme.palette.primary[100],
              backgroundColor: 'white'
            }
          }}
          onClick={handleDelete}
        >
          <ListItemIcon
            sx={{
              color: theme.palette.error.main,
            }}
          >
            <Delete />
          </ListItemIcon>
          Delete
        </MenuItem>
      </Menu>
    </div>
  );
};

export default ActionMenu;
