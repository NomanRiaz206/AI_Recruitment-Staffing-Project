import React, { useEffect, useState } from 'react';
import { Box, Button, Card, Container, Grid, Typography } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { users } from '../../services/api'; // Your user API
import Navbar from '../layout/Navbar';

interface User {
  id: number;
  full_name: string;
  email: string;
  role: string;
  is_active: boolean;
  is_admin: boolean;
  is_employer: boolean;
  // Add more fields as needed
}

const ManageUsers: React.FC = () => {
  const navigate = useNavigate();
  const [userList, setUserList] = useState<User[]>([]);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await users.getAll(); 
        console.log('Fetched users:', res);// Adjust to your actual API call
        setUserList(res);
        
      } catch (error) {
        console.error('Failed to fetch users:', error);
      }
    };

    fetchUsers();
  }, []);

  const handleView = (id: number) => {
    navigate(`/admin/users/${id}`);
  };

//   const handleDeactivate = async (id: number) => {
//     try {
//       await users.deactivateUser(id); // Your backend should support this
//       setUserList((prev) =>
//         prev.map((user) =>
//           user.id === id ? { ...user, isActive: false } : user
//         )
//       );
//     } catch (error) {
//       console.error('Failed to deactivate user:', error);
//     }
//   };

//   const handleDelete = async (id: number) => {
//     try {
//       await users.deleteUser(id); // Your backend should support this
//       setUserList((prev) => prev.filter((user) => user.id !== id));
//     } catch (error) {
//       console.error('Failed to delete user:', error);
//     }
//   };

  return (
    <>
      <Navbar />
      <Container maxWidth="lg" sx={{ py: 8 }}>
        <Typography variant="h4" gutterBottom>
          Manage Users
        </Typography>
        <Grid container spacing={3}>
          {userList.length > 0 ? (
            userList.map((user) => (
              <Grid item xs={12} key={user.id}>
                <Card sx={{ p: 2, borderRadius: 2, boxShadow: 4 }}>
                  <Box display="flex" justifyContent="space-between" alignItems="center">
                    <Box>
                      <Typography variant="h6">{user.full_name}</Typography>
                      <Typography color="textSecondary">{user.email}</Typography>
                      <Typography color="textSecondary">Role: {(user.is_admin? 'Admin': user.is_employer? 'Employer': 'Candidate')}</Typography>
                      <Typography color={user.is_active ? 'green' : 'red'}>
                        Status: {user.is_active ? 'Active' : 'Inactive'}
                      </Typography>
                    </Box>
                    <Box display="flex" flexDirection="column" gap={1}>
                      <Button variant="outlined" onClick={() => handleView(user.id)}>
                        View
                      </Button>
                      <Button
                        variant="contained"
                        color="warning"
                        // onClick={() => handleDeactivate(user.id)}
                      >
                        Deactivate
                      </Button>
                      <Button
                        variant="contained"
                        color="error"
                        // onClick={() => handleDelete(user.id)}
                      >
                        Delete
                      </Button>
                    </Box>
                  </Box>
                </Card>
              </Grid>
            ))
          ) : (
            <Typography>No users found.</Typography>
          )}
        </Grid>
      </Container>
    </>
  );
};

export default ManageUsers;
