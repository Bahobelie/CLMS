import React, { useState } from 'react';
import { IconButton, Menu, MenuItem } from '@mui/material';
import MoreHorizIcon from '@mui/icons-material/MoreHoriz';
import { useTheme } from '@mui/material/styles';
import ListItemIcon from '@mui/material/ListItemIcon';
import { Delete, Visibility } from '@mui/icons-material';

const ActionMenu = ({ rowId }) => {
  const [anchorEl, setAnchorEl] = useState(null); // State to control menu visibility
  const theme = useTheme();

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
    console.log('Edit patient with ID:', rowId);
    handleCloseMenu(); // Close the menu after action
  };

  // Handle Delete action
  const handleDelete = () => {
    console.log('Delete patient with ID:', rowId);
    handleCloseMenu(); // Close the menu after action
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
              color: theme.palette.primary[100]
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
