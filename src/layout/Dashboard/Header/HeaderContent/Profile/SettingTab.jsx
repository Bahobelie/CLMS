import { useState } from 'react';

// material-ui
import List from '@mui/material/List';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';

// assets
import { LockOutlined, QuestionCircleOutlined, UserOutlined, UnorderedListOutlined } from '@ant-design/icons';
import { useSelector } from 'react-redux';

// ==============================|| HEADER PROFILE - SETTING TAB ||============================== //

export default function SettingTab() {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const handleListItemClick = (event, index) => {
    setSelectedIndex(index);
  };
  // Get user from Redux state if userRole is null
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  return (
    <>
    {user?.role==="doctor" &&
        <List component="nav" sx={{ p: 0, '& .MuiListItemIcon-root': { minWidth: 32 } }}>
          <ListItemButton selected={selectedIndex === 0} onClick={(event) => handleListItemClick(event, 0)}>
            <ListItemIcon>
              <QuestionCircleOutlined />
            </ListItemIcon>
            <ListItemText
              primary={
                <a
                  href="https://t.me/Lamesgnc"
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ textDecoration: "none", color: "inherit", cursor: "pointer" }}
                >
                  Support
                </a>
              }
            />

          </ListItemButton>

          <ListItemButton selected={selectedIndex === 1} onClick={(event) => handleListItemClick(event, 1)}>
            <ListItemIcon>
              <UserOutlined />
            </ListItemIcon>
            <ListItemText primary="Account Settings" />
          </ListItemButton>
          <ListItemButton selected={selectedIndex === 2} onClick={(event) => handleListItemClick(event, 2)}>
            <ListItemIcon>
              <LockOutlined />
            </ListItemIcon>
            <ListItemText primary="LabTests" />
          </ListItemButton>

          <ListItemButton selected={selectedIndex === 4} onClick={(event) => handleListItemClick(event, 4)}>
            <ListItemIcon>
              <UnorderedListOutlined />
            </ListItemIcon>
            <ListItemText primary="History" />
          </ListItemButton>
        </List>
}
</>
  );
}
