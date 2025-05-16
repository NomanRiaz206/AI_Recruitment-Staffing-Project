import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Button,
  Card,
  Container,
  Typography,
  CircularProgress,
  Divider,
} from '@mui/material';
import { users } from '../../services/api'; 
import Navbar from '../layout/Navbar';

interface User {
  id: number;
  full_name: string;
  email: string;
  is_employer: boolean;
  is_active: boolean;
  is_admin: boolean;
}

const UserDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const allUsers = await users.getAll();
        const foundUser = allUsers.find((u: User) => u.id === Number(id));
        setUser(foundUser || null);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching user:', error);
        setLoading(false);
      }
    };

    fetchUser();
  }, [id]);

  if (loading) {
    return (
      <Box mt={10} textAlign="center">
        <CircularProgress />
        <Typography mt={2}>Loading user details...</Typography>
      </Box>
    );
  }

  if (!user) {
    return (
      <Box mt={10} textAlign="center">
        <Typography color="error">User not found.</Typography>
      </Box>
    );
  }

  return (
    <>
      <Navbar />
      <Container maxWidth="sm" sx={{ py: 8 }}>
        <Card sx={{ p: 4, borderRadius: 3, boxShadow: 6 }}>
          <Typography variant="h4" gutterBottom>User Details</Typography>
          <Divider sx={{ mb: 2 }} />
          <Typography variant="h6">Name:</Typography>
          <Typography mb={2}>{user.full_name}</Typography>

          <Typography variant="h6">Email:</Typography>
          <Typography mb={2}>{user.email}</Typography>

          <Typography variant="h6">Role:</Typography>
          <Typography mb={2}>
            {user.is_admin ? 'Admin' : user.is_employer ? 'Employer' : 'Candidate'}
          </Typography>

          <Typography variant="h6">Status:</Typography>
          <Typography
            mb={3}
            color={user.is_active ? 'green' : 'red'}
          >
            {user.is_active ? 'Active' : 'Inactive'}
          </Typography>

          <Box display="flex" justifyContent="space-between">
            <Button variant="outlined" onClick={() => navigate(-1)}>
              Back
            </Button>
            <Button
              variant="contained"
              color={user.is_active ? 'warning' : 'success'}
            >
              {user.is_active ? 'Deactivate' : 'Activate'}
            </Button>
          </Box>
        </Card>
      </Container>
    </>
  );
};

export default UserDetail;
