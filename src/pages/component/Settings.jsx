// TabsExample.jsx
import React, { useState } from 'react';
import { Tabs, Tab, Box, Paper } from '@mui/material';
import RolePermissionManagement from './RolePermissionManagement';
import LabTest from './LabTest';
import { useTheme } from '@mui/material/styles';
import CompanyLogo from './CompanyLogo';


const TabsExample = () => {
  const theme=useTheme();

  const [activeTab, setActiveTab] = useState(0);
  const handleChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 0:
        return <RolePermissionManagement />;
      // case 1:
      //   return <LabTest />;
      case 1:
        return <CompanyLogo />;
      default:
        return null;
    }
  };

  return (
    <Paper elevation={3} sx={{ width: '100%', borderRadius: 2 }}>
      <Tabs
        value={activeTab}
        onChange={handleChange}
        variant="fullWidth"
        textColor="primary"
        TabIndicatorProps={{
          sx: { backgroundColor: theme.palette.primary[100] } // custom indicator
        }}
        sx={{
          borderBottom: 1,
          borderColor: 'divider',
          '& .MuiTab-root': {
            color: theme.palette.primary[100] // custom text color
          },
          '& .Mui-selected': {
            color: theme.palette.primary.main, // selected tab color
          }
        }}
      >

      <Tab label="Role&Permission" />
        {/*<Tab label="LabTests" />*/}
        <Tab label="ClinicInfo" />
      </Tabs>
      <Box>
        {renderTabContent()}
      </Box>
    </Paper>
  );
};

export default TabsExample;
