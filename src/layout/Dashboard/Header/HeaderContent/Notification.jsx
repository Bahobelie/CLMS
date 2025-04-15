import { useEffect, useRef, useState } from 'react';

// material-ui imports (keep your existing imports)
import { useTheme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';
import Avatar from '@mui/material/Avatar';
import Badge from '@mui/material/Badge';
import ClickAwayListener from '@mui/material/ClickAwayListener';
import Divider from '@mui/material/Divider';
import IconButton from '@mui/material/IconButton';
import List from '@mui/material/List';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemAvatar from '@mui/material/ListItemAvatar';
import ListItemText from '@mui/material/ListItemText';
import ListItemSecondaryAction from '@mui/material/ListItemSecondaryAction';
import Paper from '@mui/material/Paper';
import Popper from '@mui/material/Popper';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';

// project imports (keep your existing imports)
import MainCard from 'components/MainCard';
import Transitions from 'components/@extended/Transitions';

// assets (keep your existing imports)
import BellOutlined from '@ant-design/icons/BellOutlined';
import CheckCircleOutlined from '@ant-design/icons/CheckCircleOutlined';
import GiftOutlined from '@ant-design/icons/GiftOutlined';
import MessageOutlined from '@ant-design/icons/MessageOutlined';
import SettingOutlined from '@ant-design/icons/SettingOutlined';

import { io } from 'socket.io-client';

const socket = io('http://localhost:4000'); // Replace with your backend URL

// sx styles (keep your existing styles)
const avatarSX = {
  width: 36,
  height: 36,
  fontSize: '1rem'
};

const actionSX = {
  mt: '6px',
  ml: 1,
  top: 'auto',
  right: 'auto',
  alignSelf: 'flex-start',
  transform: 'none'
};

// Notification type icons mapping
const notificationIcons = {
  patient: <GiftOutlined />,
  message: <MessageOutlined />,
  system: <SettingOutlined />,
  default: <BellOutlined />
};

// ==============================|| HEADER CONTENT - NOTIFICATION ||============================== //

export default function Notification() {
  const theme = useTheme();
  const matchesXs = useMediaQuery(theme.breakpoints.down('md'));
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const anchorRef = useRef(null);
  const [open, setOpen] = useState(false);

  const handleToggle = () => {
    setOpen((prevOpen) => !prevOpen);
    // Mark as read when opening
    if (!open && unreadCount > 0) {
      setUnreadCount(0);
    }
  };

  const handleClose = (event) => {
    if (anchorRef.current && anchorRef.current.contains(event.target)) {
      return;
    }
    setOpen(false);
  };

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();

    if (date.toDateString() === now.toDateString()) {
      return 'Today';
    }

    const yesterday = new Date(now);
    yesterday.setDate(yesterday.getDate() - 1);
    if (date.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    }

    return date.toLocaleDateString();
  };

  // In your Notification component
  useEffect(() => {
    socket.on('new_patient', (data) => {
      // Show immediate popup/toast
      alert(`New patient: ${data.name} (${data.code})`);

      // Or add to notifications list
      setNotifications(prev => [{
        id: Date.now(), // Temporary ID
        ...data,
        read: false
      }, ...prev]);
    });

    return () => socket.off('new_patient');
  }, []);
  const iconBackColorOpen = 'grey.100';

  return (
    <Box sx={{ flexShrink: 0, ml: 0.75 }}>
      <IconButton
        color="secondary"
        variant="light"
        sx={{ color: 'text.primary', bgcolor: open ? iconBackColorOpen : 'transparent' }}
        aria-label="open profile"
        ref={anchorRef}
        aria-controls={open ? 'profile-grow' : undefined}
        aria-haspopup="true"
        onClick={handleToggle}
      >
        <Badge badgeContent={unreadCount} color="primary">
          <BellOutlined />
        </Badge>
      </IconButton>
      <Popper
        placement={matchesXs ? 'bottom' : 'bottom-end'}
        open={open}
        anchorEl={anchorRef.current}
        role={undefined}
        transition
        disablePortal
        popperOptions={{ modifiers: [{ name: 'offset', options: { offset: [matchesXs ? -5 : 0, 9] } }] }}
      >
        {({ TransitionProps }) => (
          <Transitions type="grow" position={matchesXs ? 'top' : 'top-right'} in={open} {...TransitionProps}>
            <Paper sx={{ boxShadow: theme.customShadows.z1, width: '100%', minWidth: 285, maxWidth: { xs: 285, md: 420 } }}>
              <ClickAwayListener onClickAway={handleClose}>
                <MainCard
                  title="Notification"
                  elevation={0}
                  border={false}
                  content={false}
                  secondary={
                    <>
                      {unreadCount > 0 && (
                        <Tooltip title="Mark as all read">
                          <IconButton
                            color="success"
                            size="small"
                            onClick={() => setUnreadCount(0)}
                          >
                            <CheckCircleOutlined style={{ fontSize: '1.15rem' }} />
                          </IconButton>
                        </Tooltip>
                      )}
                    </>
                  }
                >
                  <List
                    component="nav"
                    sx={{
                      p: 0,
                      '& .MuiListItemButton-root': {
                        py: 0.5,
                        '&.Mui-selected': { bgcolor: 'grey.50', color: 'text.primary' },
                        '& .MuiAvatar-root': avatarSX,
                        '& .MuiListItemSecondaryAction-root': { ...actionSX, position: 'relative' }
                      }
                    }}
                  >
                    {notifications.length > 0 ? (
                      notifications.map((notification) => (
                        <div key={notification.id}>
                          <ListItemButton selected={!notification.read}>
                            <ListItemAvatar>
                              <Avatar sx={{
                                color: `${notification.type}.main`,
                                bgcolor: `${notification.type}.lighter`
                              }}>
                                {notificationIcons[notification.type] || notificationIcons.default}
                              </Avatar>
                            </ListItemAvatar>
                            <ListItemText
                              primary={
                                <Typography variant="h6">
                                  {notification.title}
                                </Typography>
                              }
                              secondary={
                                <>
                                  <Typography component="span" variant="body2">
                                    {notification.message}
                                  </Typography>
                                  <br />
                                  {formatDate(notification.timestamp)}
                                </>
                              }
                            />
                            <ListItemSecondaryAction>
                              <Typography variant="caption" noWrap>
                                {formatTime(notification.timestamp)}
                              </Typography>
                            </ListItemSecondaryAction>
                          </ListItemButton>
                          <Divider />
                        </div>
                      ))
                    ) : (
                      <ListItemButton>
                        <ListItemText
                          primary={
                            <Typography variant="body1" align="center">
                              No notifications
                            </Typography>
                          }
                        />
                      </ListItemButton>
                    )}
                    <ListItemButton sx={{ textAlign: 'center', py: `${12}px !important` }}>
                      <ListItemText
                        primary={
                          <Typography variant="h6" color="primary">
                            View All
                          </Typography>
                        }
                      />
                    </ListItemButton>
                  </List>
                </MainCard>
              </ClickAwayListener>
            </Paper>
          </Transitions>
        )}
      </Popper>
    </Box>
  );
}