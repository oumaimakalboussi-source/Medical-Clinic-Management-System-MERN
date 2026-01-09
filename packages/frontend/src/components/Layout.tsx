import React, { useState } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import {
  AppBar,
  Toolbar,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Avatar,
  Box,
  Container,
  Button,
  IconButton,
  Menu,
  MenuItem,
  CssBaseline,
} from '@mui/material';
import {
  Menu as MenuIcon,
  Dashboard as DashboardIcon,
  People as PeopleIcon,
  Person as PersonIcon,
  EventNote as EventNoteIcon,
  Description as DescriptionIcon,
  Medication,
  Logout as LogoutIcon,
  ExpandMore as ExpandMoreIcon,
} from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';
import logo from '@/assets/medical-logo.png';

/**
 * Layout Component
 * Main app layout with AppBar, Sidebar navigation, and role-based menu items
 */

const DRAWER_WIDTH = 280;

export const Layout: React.FC = () => {
  const navigate = useNavigate();
  const { user, logout, hasRole } = useAuth();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const menuItems = [
    {
      label: 'Dashboard',
      icon: <DashboardIcon />,
      path: '/dashboard',
      roles: ['admin', 'doctor', 'secretary'],
    },
    {
      label: 'Patients',
      icon: <PeopleIcon />,
      path: '/patients',
      roles: ['admin', 'doctor', 'secretary'],
    },
    {
      label: 'Appointments',
      icon: <EventNoteIcon />,
      path: '/appointments',
      roles: ['admin', 'doctor', 'patient', 'secretary'],
    },
    {
      label: 'Consultations',
      icon: <DescriptionIcon />,
      path: '/consultations',
      roles: ['admin', 'doctor'],
    },
    {
      label: 'Prescriptions',
      icon: <Medication />,
      path: '/prescriptions',
      roles: ['admin', 'doctor'],
    },
    {
      label: 'Users',
      icon: <PersonIcon />,
      path: '/users',
      roles: ['admin'],
    },
  ];

  const visibleMenuItems = menuItems.filter((item) => hasRole(item.roles));

  const drawerContent = (
    <List sx={{ pt: 2 }}>
      {visibleMenuItems.map((item) => (
        <ListItem key={item.path} disablePadding>
          <ListItemButton
            onClick={() => {
              navigate(item.path);
              setDrawerOpen(false);
            }}
          >
            <ListItemIcon>{item.icon}</ListItemIcon>
            <ListItemText primary={item.label} />
          </ListItemButton>
        </ListItem>
      ))}
    </List>
  );

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      <CssBaseline />

      {/* AppBar */}
      <AppBar position="fixed" sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}>
        <Toolbar>
          <IconButton
            color="inherit"
            edge="start"
            onClick={() => setDrawerOpen(!drawerOpen)}
            sx={{ mr: 2, display: { sm: 'none' } }}
          >
            <MenuIcon />
          </IconButton>

          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              cursor: 'pointer',
              flex: 1,
            }}
            onClick={() => navigate(hasRole('patient') ? '/appointments' : '/dashboard')}
          >
            <img
              src={logo}
              alt="Medical Logo"
              style={{ width: '40px', height: '40px', marginRight: '12px', objectFit: 'contain' }}
            />
            <Box
              sx={{
                fontSize: '1.1rem',
                fontWeight: 'bold',
                display: { xs: 'none', sm: 'block' },
              }}
            >
              Clinic Management
            </Box>
          </Box>

          {/* User Menu */}
          {user && (
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Avatar sx={{ width: 40, height: 40, mr: 2, bgcolor: 'primary.main' }}>
                {user.prenom[0]}
                {user.nom[0]}
              </Avatar>
              <Button
                color="inherit"
                onClick={handleMenuOpen}
                endIcon={<ExpandMoreIcon />}
                sx={{ textTransform: 'none' }}
              >
                <Box sx={{ display: { xs: 'none', sm: 'block' } }}>
                  {user.prenom} {user.nom}
                </Box>
              </Button>
              <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={handleMenuClose}
              >
                <MenuItem onClick={() => { navigate('/profile'); handleMenuClose(); }}>
                  Profile
                </MenuItem>
                <MenuItem onClick={handleLogout}>
                  <LogoutIcon sx={{ mr: 1 }} /> Logout
                </MenuItem>
              </Menu>
            </Box>
          )}
        </Toolbar>
      </AppBar>

      {/* Drawer */}
      <Box
        component="nav"
        sx={{
          width: { sm: DRAWER_WIDTH },
          flexShrink: { sm: 0 },
        }}
      >
        <Drawer
          variant="temporary"
          open={drawerOpen}
          onClose={() => setDrawerOpen(false)}
          ModalProps={{ keepMounted: true }}
          sx={{
            display: { xs: 'block', sm: 'none' },
            '& .MuiDrawer-paper': { boxSizing: 'border-box', width: DRAWER_WIDTH },
          }}
        >
          {drawerContent}
        </Drawer>

        <Drawer
          variant="permanent"
          sx={{
            display: { xs: 'none', sm: 'block' },
            '& .MuiDrawer-paper': {
              boxSizing: 'border-box',
              width: DRAWER_WIDTH,
              mt: 8,
            },
          }}
          open
        >
          {drawerContent}
        </Drawer>
      </Box>

      {/* Main Content */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          mt: 8,
          width: '100%',
          backgroundColor: '#f5f5f5',
        }}
      >
        <Container maxWidth="lg">
          <Outlet />
        </Container>
      </Box>
    </Box>
  );
};
