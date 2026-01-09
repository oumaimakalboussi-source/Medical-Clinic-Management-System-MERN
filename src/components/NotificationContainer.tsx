import React from 'react';
import { Alert, Box, Snackbar } from '@mui/material';
import { useNotification } from '../context/NotificationContext';

/**
 * Notification Container Component
 * Displays all notifications (toasts) from the NotificationContext
 */

export const NotificationContainer: React.FC = () => {
  const { notifications, removeNotification } = useNotification();

  return (
    <Box sx={{ position: 'fixed', top: 20, right: 20, zIndex: 9999 }}>
      {notifications.map((notification) => (
        <Snackbar
          key={notification.id}
          open={true}
          autoHideDuration={notification.duration}
          onClose={() => removeNotification(notification.id)}
          sx={{ mb: 2 }}
        >
          <Alert
            onClose={() => removeNotification(notification.id)}
            severity={notification.type === 'success' ? 'success' : 
                     notification.type === 'error' ? 'error' :
                     notification.type === 'warning' ? 'warning' : 'info'}
            sx={{ width: '100%', minWidth: 300 }}
          >
            {notification.message}
          </Alert>
        </Snackbar>
      ))}
    </Box>
  );
};
