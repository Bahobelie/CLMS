import { useEffect, useRef, useState } from 'react';
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
import MainCard from 'components/MainCard';
import Transitions from 'components/@extended/Transitions';
import BellOutlined from '@ant-design/icons/BellOutlined';
import CheckCircleOutlined from '@ant-design/icons/CheckCircleOutlined';
import GiftOutlined from '@ant-design/icons/GiftOutlined';
import MessageOutlined from '@ant-design/icons/MessageOutlined';
import SettingOutlined from '@ant-design/icons/SettingOutlined';
import { io } from 'socket.io-client';

// Socket.IO connection
const socket = io(import.meta.env.VITE_APP_IMAGE_PATH, {
  reconnection: true,
  reconnectionAttempts: 5,
  reconnectionDelay: 1000,
});

// Notification icons mapping
const notificationIcons = {
  patient: <GiftOutlined />,
  message: <MessageOutlined />,
  system: <SettingOutlined />,
  appointment: <BellOutlined />,
  default: <BellOutlined />
};

export default function Notification() {
  const theme = useTheme();
  const matchesXs = useMediaQuery(theme.breakpoints.down('md'));
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const anchorRef = useRef(null);
  const [open, setOpen] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState('disconnected');
  const userRole = localStorage.getItem('userRole')?.toLowerCase() || 'doctor';

  // Handle notification panel toggle
  const handleToggle = () => {
    if (!open && unreadCount > 0) {
      markAllAsRead();
    }
    setOpen((prevOpen) => !prevOpen);
  };

  const handleClose = (event) => {
    if (anchorRef.current?.contains(event.target)) return;
    setOpen(false);
  };

  // Mark notifications as read
  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    setUnreadCount(0);
  };

  // Format time display
  const formatTime = (dateString) => {
    return new Date(dateString).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  // Format date display
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffDays = Math.floor((now - date) / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    return date.toLocaleDateString();
  };

  // Handle notification click
  const handleNotificationClick = (id) => {
    setNotifications(prev =>
      prev.map(n =>
        n.id === id ? { ...n, read: true } : n
      )
    );
    setUnreadCount(prev => Math.max(0, prev - 1)); // Ensures count never goes below 0
  };

  // Socket.IO connection management
  useEffect(() => {
    const handleConnect = () => {
      setConnectionStatus('connected');
      socket.emit('register-role', userRole);
    };

    const handleDisconnect = () => {
      setConnectionStatus('disconnected');
    };

    socket.on('connect', handleConnect);
    socket.on('disconnect', handleDisconnect);

    // Register role when connected
    if (socket.connected) {
      handleConnect();
    }

    return () => {
      socket.off('connect', handleConnect);
      socket.off('disconnect', handleDisconnect);
    };
  }, [userRole]);

  // Notification event listener
  useEffect(() => {
    if (!socket.connected) return;

    const notificationHandler = (data) => {
      const newNotification = {
        id: data.id || Date.now(),
        type: data.type || 'patient',
        title: data.title,
        message: data.message,
        timestamp: data.timestamp || new Date().toISOString(),
        read: false,
        metadata: data.metadata || {}
      };

      setNotifications(prev => [newNotification, ...prev.slice(0, 49)]);
      setUnreadCount(prev => prev + 1);
    };

    socket.on(`${userRole}_notification`, notificationHandler);
    socket.on('global_notification', notificationHandler);

    return () => {
      socket.off(`${userRole}_notification`, notificationHandler);
      socket.off('global_notification', notificationHandler);
    };
  }, [userRole]);

  return (
    <Box sx={{ flexShrink: 0, ml: 0.75 }}>
      <Tooltip title={`Notifications (${connectionStatus})`}>
        <IconButton
          color="secondary"
          sx={{
            color: 'text.primary',
            bgcolor: open ? 'grey.100' : 'transparent',
            position: 'relative'
          }}
          ref={anchorRef}
          onClick={handleToggle}
        >
          <Badge badgeContent={unreadCount} color="error" max={9}>
            <BellOutlined />
          </Badge>
          {connectionStatus !== 'connected' && (
            <Box sx={{
              position: 'absolute',
              bottom: 4,
              right: 4,
              width: 8,
              height: 8,
              bgcolor: connectionStatus === 'connected' ? 'success.main' : 'error.main',
              borderRadius: '50%',
              border: `1px solid ${theme.palette.background.paper}`
            }} />
          )}
        </IconButton>
      </Tooltip>

      <Popper
        placement={matchesXs ? 'bottom' : 'bottom-end'}
        open={open}
        anchorEl={anchorRef.current}
        transition
        disablePortal
        sx={{ zIndex: theme.zIndex.tooltip }}
      >
        {({ TransitionProps }) => (
          <Transitions type="grow" position={matchesXs ? 'top' : 'top-right'} in={open} {...TransitionProps}>
            <Paper sx={{
              boxShadow: theme.customShadows.z1,
              width: '100%',
              minWidth: 320,
              maxWidth: { xs: 320, sm: 450 },
              maxHeight: '70vh',
              overflow: 'auto'
            }}>
              <ClickAwayListener onClickAway={handleClose}>
                <MainCard
                  title={`Notifications (${notifications.length})`}
                  elevation={0}
                  border={false}
                  content={false}
                  secondary={
                    unreadCount > 0 && (
                      <Tooltip title="Mark all as read">
                        <IconButton
                          color="success"
                          size="small"
                          onClick={markAllAsRead}
                        >
                          <CheckCircleOutlined style={{ fontSize: '1.15rem' }} />
                        </IconButton>
                      </Tooltip>
                    )
                  }
                >
                  <List sx={{ p: 0 }}>
                    {notifications.length > 0 ? (
                      notifications.map((notification) => (
                        <div key={notification.id}>
                          <ListItemButton
                            onClick={() => handleNotificationClick(notification.id)}
                            selected={!notification.read}
                            sx={{
                              '&:hover': { bgcolor: 'action.hover' },
                              '&.Mui-selected': { bgcolor: 'action.selected' }
                            }}
                          >
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
                                <Typography variant="subtitle1" noWrap>
                                  {notification.title}
                                </Typography>
                              }
                              secondary={
                                <>
                                  <Typography
                                    variant="body2"
                                    color="text.secondary"
                                    sx={{
                                      display: '-webkit-box',
                                      WebkitLineClamp: 2,
                                      WebkitBoxOrient: 'vertical',
                                      overflow: 'hidden'
                                    }}
                                  >
                                    {notification.message}
                                  </Typography>
                                  <Box sx={{display:'flex',justifyContent:'space-between'}}>
                                    <Typography
                                      variant="caption"
                                      color="text.secondary"
                                      sx={{ display: 'block', mt: 0.5 }}
                                    >
                                      {formatDate(notification.timestamp)}
                                    </Typography>
                                    <Typography variant="caption" color="text.secondary">
                                      {formatTime(notification.timestamp)}
                                    </Typography>
                                  </Box>
                                </>
                              }
                            />

                          </ListItemButton>
                          <Divider />
                        </div>
                      ))
                    ) : (
                      <Box sx={{ p: 3, textAlign: 'center' }}>
                        <Typography variant="body1" color="text.secondary">
                          No notifications yet
                        </Typography>
                      </Box>
                    )}
                    {notifications.length > 0 && (
                      <ListItemButton
                        sx={{
                          justifyContent: 'center',
                          bgcolor: 'primary.lighter',
                          '&:hover': { bgcolor: 'primary.light' }
                        }}
                      >
                        <Typography variant="subtitle2" color="primary">
                          View All Notifications
                        </Typography>
                      </ListItemButton>
                    )}
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