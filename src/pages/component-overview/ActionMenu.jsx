import React, { useState } from 'react';
import { IconButton, Menu, MenuItem } from '@mui/material';
import MoreHorizIcon from '@mui/icons-material/MoreHoriz';
import { useTheme } from '@mui/material/styles';
import ListItemIcon from '@mui/material/ListItemIcon';
import { Delete, Visibility, Edit } from '@mui/icons-material';
import { useNavigate } from 'react-router';
import Swal from 'sweetalert2';
import axios from 'axios';
import { useLocation } from 'react-router-dom';

const ActionMenu = ({
                      rowId,
                      code,
                      onRefetch,
                      detailPagePath,
                      pathe,
                      onEdit, // New prop for edit functionality
                      editPagePath // Optional separate path for edit
                    }) => {
  const [anchorEl, setAnchorEl] = useState(null);
  const theme = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const apiUrl = import.meta.env.VITE_APP_API_URL;

  const handleOpenMenu = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleCloseMenu = () => {
    setAnchorEl(null);
  };

  const handleView = () => {
    navigate(`${detailPagePath}/${code}`);
    handleCloseMenu();
  };

  // New edit handler
  const handleEdit = async () => {
    handleCloseMenu();
    // Check permissions
    const hasPermission = await checkPermission("delete");
    if (!hasPermission) return;


    if (onEdit) {
      // If onEdit callback is provided, use that
      onEdit(rowId);
    } else if (editPagePath) {
      // If separate edit path is provided
      navigate(`${editPagePath}/${code}`);
    } else {
      // Default to detail page if no edit-specific path
      navigate(`${detailPagePath}/${code}/edit`);
    }
    handleCloseMenu();
  };

  const handleDelete = async () => {
    const pathSegments = location.pathname.split('/').filter(Boolean);
    const lastSegment = pathSegments[pathSegments.length - 1];

    try {
      handleCloseMenu();
      // Check permissions
      const hasPermission = await checkPermission("delete");
      if (!hasPermission) return;

      const result = await Swal.fire({
        title: "Are you sure?",
        text: "You won't be able to revert this!",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#3085d6",
        cancelButtonColor: "#d33",
        confirmButtonText: "Yes, delete it!"
      });

      if (result.isConfirmed) {
        const deleteResponse = await axios.delete(`${apiUrl}/${pathe}/${rowId}`);

        if (deleteResponse.status === 200) {
          await Swal.fire({
            title: "Deleted!",
            text: "Your file has been deleted.",
            icon: "success"
          });
          onRefetch();
        } else {
          await Swal.fire({
            title: "Error",
            text: "There was an issue deleting your file.",
            icon: "error"
          });
        }
      }
    } catch (error) {
      console.error("Delete error:", error);
      await Swal.fire({
        title: "Error",
        text: error.response?.data?.message || error.message,
        icon: "error"
      });
    }
  };

  const checkPermission = async (action) => {
    const pathSegments = location.pathname.split('/').filter(Boolean);
    const lastSegment = pathSegments[pathSegments.length - 1];
    const role = localStorage.getItem('userRole')?.toLowerCase();

    try {
      const response = await axios.get(`${apiUrl}/permission/by-condition`, {
        params: { role }
      });

      const hasPermission = response.data.some(
        (permission) => permission.menu.toLowerCase() === `${lastSegment}-management`
      );

      if (!hasPermission) {
        await Swal.fire({
          title: "Unauthorized!",
          text: `You don't have permission to ${action} this.`,
          icon: "error"
        });
      }

      return hasPermission;
    } catch (error) {
      console.error("Permission check error:", error);
      handleCloseMenu();
      await Swal.fire({
        title: "Error",
        text: error.response?.data?.message || error.message,
        icon: "error"
      });
      return false;
    }
  };
  return (
    <div>
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

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleCloseMenu}
        PaperProps={{
          style: {
            boxShadow: '0 4px 10px rgba(0, 0, 0, 0.2)',
            borderRadius: '8px'
          }
        }}
      >
        <MenuItem
          sx={{
            ':hover': {
              color: theme.palette.primary[100],
              backgroundColor: 'white'
            }
          }}
          onClick={handleView}
        >
          <ListItemIcon sx={{ color: theme.palette.primary[100] }}>
            <Visibility />
          </ListItemIcon>
          View
        </MenuItem>

        {/* New Edit Menu Item */}
        <MenuItem
          sx={{
            ':hover': {
              color: theme.palette.primary[100],
              backgroundColor: 'white'
            }
          }}
          onClick={handleEdit}
        >
          <ListItemIcon sx={{ color: theme.palette.warning.main }}>
            <Edit />
          </ListItemIcon>
          Edit
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
          <ListItemIcon sx={{ color: theme.palette.error.main }}>
            <Delete />
          </ListItemIcon>
          Delete
        </MenuItem>
      </Menu>
    </div>
  );
};

export default ActionMenu;