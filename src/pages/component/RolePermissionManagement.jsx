import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Snackbar,
  Alert,
  IconButton,
  Tooltip,
  TextField,
  Chip,
  Stack,
  Paper,
  Grid,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Checkbox,
  FormControlLabel,
} from '@mui/material';
import {
  Add,
  Edit,
  Delete,
  FilterAlt,
  Clear,
} from '@mui/icons-material';
import { DataGrid } from '@mui/x-data-grid';
import axios from 'axios';
import { useTheme } from '@mui/material/styles';
import Swal from 'sweetalert2';

const RolePermissionManagement = () => {
  const theme = useTheme();
  const apiUrl = import.meta.env.VITE_APP_API_URL;

  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [currentPermission, setCurrentPermission] = useState({
    menus: [],
    role: '',
    code: '',
  });
  const [dialogType, setDialogType] = useState('add');
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success',
  });
  const [paginationModel, setPaginationModel] = useState({
    page: 0,
    pageSize: 10,
  });
  const [rowCount, setRowCount] = useState(0);
  const [selectedRoles, setSelectedRoles] = useState([]);
  const [filterMenu, setFilterMenu] = useState('');

  const roles = ['admin', 'receptionist', 'doctor', 'sonographer', 'injectionRoomStaff', 'labTechnician', 'Emergency'];
  const menus = [
    'dashboard', 'patients', 'Employee', 'Report', 'Services', 'Medicine',
    'medical_records', 'health_info', 'lab_tests', 'appointments', 'payments',
    'images', 'patient_info', 'prescriptions', 'employees-management',
    'patients-management', 'services-management', 'medicines-management',
  ];

  // Group menus into columns for grid layout (3 columns)
  const menuColumns = [];
  const itemsPerColumn = Math.ceil(menus.length / 3);
  for (let i = 0; i < 3; i++) {
    menuColumns.push(menus.slice(i * itemsPerColumn, (i + 1) * itemsPerColumn));
  }

  // Check if all menus are selected
  const allMenusSelected = currentPermission.menus.length === menus.length;

  // Handle select all/deselect all
  const handleSelectAllMenus = () => {
    setCurrentPermission(prev => ({
      ...prev,
      menus: allMenusSelected ? [] : [...menus]
    }));
  };

  const columns = [
    {
      field: 'code',
      headerName: 'Code',
      width: 150,
      flex: 2
    },
    {
      field: 'menu',
      headerName: 'Menus',
      width: 250,
      flex: 2,

    },
    { field: 'role', headerName: 'Role', width: 150, flex: 2 },
    {
      field: 'actions',
      headerName: 'Actions',
      width: 150,
      sortable: false,
      filterable: false,
      renderCell: (params) => (
        <Box>
          <Tooltip title="Edit">
            <IconButton onClick={() => handleEditPermission(params.row)}>
              <Edit sx={{ color: theme.palette.primary[100] }} />
            </IconButton>
          </Tooltip>
          <Tooltip title="Delete">
            <IconButton onClick={() => handleDeletePermission(params.row.id)}>
              <Delete sx={{ color: theme.palette.error.main }} />
            </IconButton>
          </Tooltip>
        </Box>
      ),
    },
  ];

  const fetchPermissions = async () => {
    try {
      setLoading(true);
      const params = {
        ...(selectedRoles.length > 0 && { role: selectedRoles.join(',') }),
        ...(filterMenu && { menu: filterMenu })
      };

      const response = await axios.get(`${apiUrl}/permission/by-condition`, { params });
      setRows(response.data.data || response.data);
      setRowCount(response.data.totalCount || response.data.length);

      console.log('row',rows)
      setLoading(false);
    } catch (error) {
      console.error('Error fetching permissions:', error);
      setLoading(false);
      showSnackbar('Failed to fetch permissions', 'error');
    }
  };

  useEffect(() => {
    fetchPermissions();
  }, [paginationModel, selectedRoles, filterMenu]);

  const showSnackbar = (message, severity) => {
    setSnackbar({
      open: true,
      message,
      severity
    });
  };

  const handleCloseSnackbar = () => {
    setSnackbar(prev => ({ ...prev, open: false }));
  };

  const handleAddPermission = async () => {
    const code = await axios.get(`${apiUrl}/model/next-code`, {
      params: {
        model: 'rolePermission',
        prefix: "ROP-"
      }
    });

    setCurrentPermission({
      menus: [],
      role: '',
      code: code.data.code
    });
    setDialogType('add');
    setOpenDialog(true);
  };

  const handleEditPermission = async (permission) => {
    if (permission.code === null) {
      const testCode = await axios.get(`${apiUrl}/model/next-code`, {
        params: {
          model: 'rolePermission',
          prefix: "ROP-"
        }
      });
      permission.code = testCode.data.code;
    }

    // Convert single menu to array if needed for backward compatibility
    const menus = permission.menu ? [permission.menu] : (permission.menus || []);

    setCurrentPermission({
      ...permission,
      menus
    });
    setDialogType('edit');
    setOpenDialog(true);
  };

  const handleDialogClose = () => {
    setOpenDialog(false);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setCurrentPermission(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleMenuToggle = (menu) => {
    setCurrentPermission(prev => ({
      ...prev,
      menus: prev.menus.includes(menu)
        ? prev.menus.filter(m => m !== menu)
        : [...prev.menus, menu]
    }));
  };

  const handleSavePermission = async () => {
    const permissions = currentPermission.menus.map((menu,index) => ({
      code: currentPermission.code + index,
      role: currentPermission.role,
      menu
    }));

    try {
      if (dialogType === 'add') {
        await axios.post(`${apiUrl}/permission/bulk`, permissions);
        setOpenDialog(false)
        await Swal.fire({
          title: "Success",
          text: "Permission created successfully!",
          icon: "success"
        });
      } else {
        await axios.put(`${apiUrl}/permission/${permissions.id}`, permissions);
        setOpenDialog(false);
        await Swal.fire({
          title: "Success",
          text: "Permission updated successfully!",
          icon: "success"
        });
      }
      fetchPermissions();
      setOpenDialog(false);
    } catch (error) {
      console.error('Error saving permission:', error);
      await Swal.fire({
        title: "Error",
        text: "Error saving permission",
        icon: "error"
      });
      showSnackbar(`Failed to ${dialogType === 'add' ? 'add' : 'update'} permission`, 'error');
    }
  };

  const handleDeletePermission = async (id) => {
    try {
      const result = await Swal.fire({
        title: "Are you sure you want to delete this permission?",
        showCancelButton: true,
        confirmButtonText: "Yes, delete it",
        icon: "warning"
      });

      if (result.isConfirmed) {
        await axios.delete(`${apiUrl}/permission/${id}`);
        await Swal.fire("Deleted!", "Permission has been deleted.", "success");
        fetchPermissions();
      }
    } catch (error) {
      console.error("Error deleting permission:", error);
    }
  };

  const handleRoleToggle = (role) => {
    setSelectedRoles(prev =>
      prev.includes(role)
        ? prev.filter(r => r !== role)
        : [...prev, role]
    );
    setPaginationModel({ ...paginationModel, page: 0 });
  };

  const handleClearFilters = () => {
    setSelectedRoles([]);
    setFilterMenu('');
    setPaginationModel({ ...paginationModel, page: 0 });
  };

  return (
    <Box sx={{ p: 3, height: '100%' }}>
      <Typography variant="h4" sx={{ color: theme.palette.primary[100] }} gutterBottom>
        Role Permission Management
      </Typography>

      {/* Filter Section */}
      <Paper elevation={2} sx={{ p: 2, mb: 3 }}>
        <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', color: theme.palette.primary[100] }}>
          <FilterAlt sx={{ mr: 1, color: theme.palette.primary[100] }} /> Filters
        </Typography>

        <Box sx={{ mb: 2 }}>
          <Typography variant="subtitle1" sx={{ color: theme.palette.primary[100] }}>Filter by Role:</Typography>
          <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap', gap: 1, mt: 1 }}>
            {roles.map(role => (
              <Chip
                key={role}
                label={role}
                clickable
                sx={{
                  backgroundColor: selectedRoles.includes(role)
                    ? theme.palette.primary[100]
                    : theme.palette.background.paper,
                  color: selectedRoles.includes(role)
                    ? theme.palette.getContrastText(theme.palette.primary[100])
                    : theme.palette.text.primary,
                  border: `1px solid ${theme.palette.primary[100]}`
                }}
                onClick={() => handleRoleToggle(role)}
              />
            ))}
          </Stack>
        </Box>

        <Box sx={{ mb: 2 }}>
          <FormControl fullWidth>
            <InputLabel sx={{ color: theme.palette.primary[100] }}>Filter by Menu</InputLabel>
            <Select
              value={filterMenu}
              onChange={(e) => {
                setFilterMenu(e.target.value);
                setPaginationModel({ ...paginationModel, page: 0 });
              }}
              label="Filter by Menu"
              sx={{
                color: theme.palette.primary[100],
                '.MuiOutlinedInput-notchedOutline': {
                  borderColor: theme.palette.primary[100],
                },
                '&:hover .MuiOutlinedInput-notchedOutline': {
                  borderColor: theme.palette.primary[100],
                },
                '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                  borderColor: theme.palette.primary[100],
                },
              }}
            >
              <MenuItem value="">All Menus</MenuItem>
              {menus.map(menu => (
                <MenuItem
                  key={menu}
                  value={menu}
                  sx={{ color: theme.palette.primary[100] }}
                >
                  {menu}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>

        <Button
          variant="outlined"
          startIcon={<Clear sx={{ color: theme.palette.primary[100] }} />}
          onClick={handleClearFilters}
          disabled={!selectedRoles.length && !filterMenu}
          sx={{
            color: theme.palette.primary[100],
            borderColor: theme.palette.primary[100],
            '&:hover': {
              borderColor: theme.palette.primary[100],
            },
          }}
        >
          Clear Filters
        </Button>
      </Paper>

      {/* Action Buttons */}
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={handleAddPermission}
          sx={{
            backgroundColor: theme.palette.primary[100],
            '&:hover': {
              backgroundColor: theme.palette.primary[100],
              opacity: 0.9,
            },
          }}
        >
          Add Permission
        </Button>
      </Box>

      {/* DataGrid */}
      <Box sx={{ height: 600, width: '100%' }}>
        <DataGrid
          rows={rows}
          columns={columns}
          loading={loading}
          rowCount={rowCount}
          pageSizeOptions={[5, 10, 25]}
          paginationModel={paginationModel}
          paginationMode="server"
          onPaginationModelChange={setPaginationModel}
          disableRowSelectionOnClick
          sx={{
            '& .MuiDataGrid-columnHeaders': {
              backgroundColor: theme.palette.primary[100],
              color: theme.palette.getContrastText(theme.palette.primary[100]),
            },
          }}
        />
      </Box>

      {/* Add/Edit Permission Dialog */}
      <Dialog open={openDialog} onClose={handleDialogClose} maxWidth="md" fullWidth>
        <DialogTitle sx={{ color: theme.palette.primary[100] }}>
          {dialogType === 'add' ? 'Add New Permission' : 'Edit Permission'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            {/* Menu Selection as Checkbox Grid with Select All */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 'bold', color: theme.palette.primary[100] }}>
                Select Menus (Multiple Selection):
              </Typography>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={allMenusSelected}
                    indeterminate={currentPermission.menus.length > 0 && !allMenusSelected}
                    onChange={handleSelectAllMenus}
                    sx={{
                      '&.Mui-checked': {
                        color: theme.palette.primary[100],
                      },
                    }}
                  />
                }
                label="Select All"
                sx={{ mr: 0}}
              />
            </Box>

            <Grid container spacing={2} sx={{ maxHeight: 400, overflow: 'auto', p: 1 }}>
              {menuColumns.map((column, colIndex) => (
                <Grid item xs={4} key={colIndex}>
                  <List dense>
                    {column.map((menu) => (
                      <ListItem key={menu} disablePadding>
                        <ListItemButton onClick={() => handleMenuToggle(menu)} dense>
                          <Checkbox
                            edge="start"
                            checked={currentPermission.menus.includes(menu)}
                            tabIndex={-1}
                            disableRipple
                            sx={{
                              color: theme.palette.primary[100],
                              '&.Mui-checked': {
                                color: theme.palette.primary[100],
                              },
                            }}
                          />
                          <ListItemText
                            primary={menu}
                          />
                        </ListItemButton>
                      </ListItem>
                    ))}
                  </List>
                </Grid>
              ))}
            </Grid>

            {/* Role Selection (Dropdown) */}
            <FormControl fullWidth sx={{ mt: 3, mb: 3 }}>
              <InputLabel sx={{ color: theme.palette.primary[100] }}>Role *</InputLabel>
              <Select
                name="role"
                value={currentPermission.role}
                onChange={handleInputChange}
                label="Role *"
                required
                sx={{
                  '.MuiOutlinedInput-notchedOutline': {
                    borderColor: theme.palette.primary[100],
                  },
                  '&:hover .MuiOutlinedInput-notchedOutline': {
                    borderColor: theme.palette.primary[100],
                  },
                  '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                    borderColor: theme.palette.primary[100],
                  },
                }}
              >
                {roles.map((role) => (
                  <MenuItem
                    key={role}
                    value={role}
                  >
                    {role}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            {/* Code Field */}
            <TextField
              fullWidth
              label="Code (optional)"
              name="code"
              value={currentPermission.code || ''}
              onChange={handleInputChange}
              sx={{
                '& .MuiInputLabel-root': {
                  color: theme.palette.primary[100],
                },
                '& .MuiOutlinedInput-root': {
                  color: theme.palette.primary[100],

                  '&:hover fieldset': {
                    borderColor: theme.palette.primary[100],
                  },
                  '&.Mui-focused fieldset': {
                    borderColor: theme.palette.primary[100],
                  },
                },
              }}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={handleDialogClose}
            sx={{ color: theme.palette.primary[100] }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSavePermission}
            variant="contained"
            disabled={!currentPermission.menus.length || !currentPermission.role}
            sx={{
              backgroundColor: theme.palette.primary[100],
              '&:hover': {
                backgroundColor: theme.palette.primary[100],
                opacity: 0.9,
              },
            }}
          >
            {dialogType === 'add' ? 'Add' : 'Save'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default RolePermissionManagement;