
import React, { useState } from 'react';
import {
  AppBar,
  Box,
  Toolbar,
  Typography,
  Button,
  IconButton,
  useTheme,
  Menu,
  MenuItem,
  Divider,
  Badge,
} from '@mui/material';
import { useNavigate, useLocation } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../../store';
import { logout } from '../../store/slices/authSlice';
import {
  Work,
  Person,
  Dashboard,
  BusinessCenter,
  Description,
  NotificationsOutlined,
  AccountCircle,
  PostAdd,
} from '@mui/icons-material';

const Navbar = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const { user } = useSelector((state: RootState) => state.auth);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const handleMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  if (!user) return null;

  return (
    <AppBar position="static">
      <Toolbar>
        <IconButton
          color="inherit"
          onClick={() => navigate('/dashboard')}
          sx={{ mr: 2 }}
        >
          <Dashboard />
        </IconButton>

        <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
          AI Recruitment
        </Typography>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          {user.isAdmin ? (
            // Admin Navigation
            <>
              <Button
                color="inherit"
                startIcon={<BusinessCenter />}
                onClick={() => navigate('/adminjobs/manage')}
                sx={{
                  backgroundColor: isActive('/adminjobs/manage') ? 'rgba(255, 255, 255, 0.1)' : 'transparent',
                }}
              >
                Manage Jobs
              </Button>
              <Button
                color="inherit"
                startIcon={<PostAdd />}
                onClick={() => navigate('/blogs/manage')}
                sx={{
                  backgroundColor: isActive('/blogs/manage') ? 'rgba(255, 255, 255, 0.1)' : 'transparent',
                }}
              >
                Manage Blogs
              </Button>
              <Button
                color="inherit"
                startIcon={<Description />}
                onClick={() => navigate('/contracttemplate/manage')}
                sx={{
                  backgroundColor: isActive('/contracttemplate/manage') ? 'rgba(255, 255, 255, 0.1)' : 'transparent',
                }}
              >
                Manage Contracts
              </Button>
              <Button
                color="inherit"
                startIcon={<Person />}
                onClick={() => navigate('/admin/manageusers')}
                sx={{
                  backgroundColor: isActive('/admin/manageusers') ? 'rgba(255, 255, 255, 0.1)' : 'transparent',
                }}
              >
                Manage Users
              </Button>
            </>
          ) : user.isEmployer ? (
            // Employer Navigation
            <>
              <Button
                color="inherit"
                startIcon={<Work />}
                onClick={() => navigate('/jobs/manage')}
                sx={{
                  backgroundColor: isActive('/jobs/manage') ? 'rgba(255, 255, 255, 0.1)' : 'transparent',
                }}
              >
                Manage Jobs
              </Button>
              <Button
                color="inherit"
                startIcon={<BusinessCenter />}
                onClick={() => navigate('/jobs/create')}
                sx={{
                  backgroundColor: isActive('/jobs/create') ? 'rgba(255, 255, 255, 0.1)' : 'transparent',
                }}
              >
                Post Job
              </Button>
              {/* <Button
                color="inherit"
                startIcon={<PostAdd />}
                onClick={() => navigate('/blogs/manage')}
                sx={{
                  backgroundColor: isActive('/blogs/manage') ? 'rgba(255, 255, 255, 0.1)' : 'transparent',
                }}
              >
                Blog Posts
              </Button> */}
              {/* <Button
                color="inherit"
                startIcon={<Description />}
                onClick={() => navigate('/applications')}
                sx={{
                  backgroundColor: isActive('/applications') ? 'rgba(255, 255, 255, 0.1)' : 'transparent',
                }}
              >
                Applications
              </Button> */}
            </>
          ) : (
            // Candidate Navigation
            <>
              <Button
                color="inherit"
                startIcon={<Work />}
                onClick={() => navigate('/jobs')}
                sx={{
                  backgroundColor: isActive('/jobs') ? 'rgba(255, 255, 255, 0.1)' : 'transparent',
                }}
              >
                Find Jobs
              </Button>
              <Button
                color="inherit"
                startIcon={<Description />}
                onClick={() => navigate('/applications')}
                sx={{
                  backgroundColor: isActive('/applications') ? 'rgba(255, 255, 255, 0.1)' : 'transparent',
                }}
              >
                My Applications
              </Button>
              <Button
                color="inherit"
                startIcon={<Person />}
                onClick={() => navigate('/candidates/:id')}
                sx={{
                  backgroundColor: isActive('/candidates/:id') ? 'rgba(255, 255, 255, 0.1)' : 'transparent',
                }}
              >
                My Profile
              </Button>
            </>
          )}

          <IconButton color="inherit">
            <Badge badgeContent={3} color="error">
              <NotificationsOutlined />
            </Badge>
          </IconButton>

          <IconButton color="inherit" onClick={handleMenu}>
            <AccountCircle />
          </IconButton>
          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={handleClose}
            anchorOrigin={{
              vertical: 'bottom',
              horizontal: 'right',
            }}
            transformOrigin={{
              vertical: 'top',
              horizontal: 'right',
            }}
          >
            <MenuItem onClick={() => { handleClose(); navigate('/dashboard'); }}>
              Dashboard
            </MenuItem>
            <MenuItem onClick={() => { handleClose(); navigate('/profile'); }}>
              My Profile
            </MenuItem>
            <MenuItem onClick={() => { handleClose(); navigate('/'); }}>
              Home
            </MenuItem>
            <Divider />
            <MenuItem onClick={handleLogout}>Logout</MenuItem>
          </Menu>
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Navbar;


