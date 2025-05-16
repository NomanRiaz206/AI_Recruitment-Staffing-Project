import React, { useEffect, useState } from 'react';
import {
  Box,
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  Button,
  Chip,
  CircularProgress,
  Alert,
  LinearProgress,
  CardHeader,
  Avatar,
} from '@mui/material';
import {
  Add as AddIcon,
  TrendingUp,
  People,
  Work,
  ArrowForward,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { jobs, users,  blogs } from '../../services/api';  // Assuming you have these APIs to fetch all jobs, apps, users, blogs
import { RootState } from '../../store';

interface Job {
  id: number;
  title: string;
  description: string;
  requirements: string[];
  location: string;
  is_active: boolean;
}

interface Application {
  id: number;
  candidate_id: number;
  status: string;
  ai_match_score: number;
  candidate: {
    user: {
      full_name: string;
    };
  };
  job: {
    title: string;
  };
}

interface User {
  id: number;
  full_name: string;
  email: string;
  role: string; 
  isActive: boolean;
  isEmployer: boolean;
  isAdmin: boolean;
}

interface Blog {
  id: number;
  title: string;
  content: string;
}

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { user } = useSelector((state: RootState) => state.auth);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [allJobs, setAllJobs] = useState<Job[]>([]);
  const [allBlogs, setAllBlogs] = useState<Blog[]>([]);
  const [allUsers, setAllUsers] = useState<User[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const jobsData = await jobs.getAll(); 
        const blogsData = await blogs.getAll();  // Fetch all blogs in the system
        const usersData = await users.getAll();  // Fetch all users in the system

        setAllJobs(jobsData);
        setAllUsers(usersData);
        setAllBlogs(blogsData);
        
        
        setLoading(false);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        setError('Failed to load dashboard data. Please try again later.');
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  const totalJobs = allJobs.length;
  const totalBlogs = allBlogs.length;
  const totalUsers = allUsers.length;

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {/* Welcome Section */}
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h4">
          Welcome back, {user?.fullName}
        </Typography>
           <Box sx={{ display: 'flex', gap: 2 }}>
    <Button
      variant="contained"
      startIcon={<AddIcon />}
      onClick={() => navigate('/adminjobs/create')}
    >
      Post New Job
    </Button>
    
    <Button
      variant="contained"
      startIcon={<AddIcon />}
      onClick={() => navigate('/blogs/create')}
    >
      Post New Blog
    </Button>
  </Box>
      </Box>

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={4}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Avatar sx={{ bgcolor: 'primary.main', mr: 2 }}>
                  <Work />
                </Avatar>
                <Typography variant="h6">Total Jobs</Typography>
              </Box>
              <Typography variant="h3" component="div" sx={{ mb: 1 }}>
                {totalJobs}
              </Typography>
              <LinearProgress 
                variant="determinate" 
                value={(totalJobs / Math.max(allJobs.length, 1)) * 100} 
                sx={{ mb: 1 }}
              />
              <Typography variant="body2" color="text.secondary">
                {totalJobs} total jobs posted
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={4}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Avatar sx={{ bgcolor: 'success.main', mr: 2 }}>
                  <People />
                </Avatar>
                <Typography variant="h6">Users</Typography>
              </Box>
              <Typography variant="h3" component="div" sx={{ mb: 1 }}>
                {totalUsers}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                All Active Users
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={4}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Avatar sx={{ bgcolor: 'info.main', mr: 2 }}>
                  <TrendingUp />
                </Avatar>
                <Typography variant="h6">Total Blogs</Typography>
              </Box>
              <Typography variant="h3" component="div" sx={{ mb: 1 }}>
                {totalBlogs}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Blog posts in the system
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Recent Applications */}
      {/* <Grid container spacing={4}>
        <Grid item xs={12} md={7}>
          <Card>
            <CardHeader
              title="All Applications"
              action={
                <Button
                  endIcon={<ArrowForward />}
                  onClick={() => navigate('/applications')}
                >
                  View All
                </Button>
              }
            /> */}
            {/* <CardContent>
              {allApplications.slice(0, 5).map((application) => (
                <Box
                  key={application.id}
                  sx={{
                    p: 2,
                    mb: 2,
                    border: 1,
                    borderColor: 'divider',
                    borderRadius: 1,
                    '&:last-child': { mb: 0 },
                  }}
                >
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                    <Typography variant="subtitle1">
                      {application.candidate.user.full_name}
                    </Typography>
                    <Chip
                      label={`${application.ai_match_score}% Match`}
                      color={application.ai_match_score > 75 ? 'success' : 'default'}
                      size="small"
                    />
                  </Box>
                  <Typography variant="body2" color="text.secondary">
                    Applied for: {application.job.title}
                  </Typography>
                  <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 1 }}>
                    <Button
                      size="small"
                      onClick={() => navigate(`/applications/${application.id}`)}
                    >
                      View Details
                    </Button>
                  </Box>
                </Box>
              ))}
            </CardContent>
          </Card>
        </Grid> */}

        {/* Active Jobs */}
        {/* <Grid item xs={12} md={5}>
          <Card>
            <CardHeader
              title="All Jobs"
              action={
                <Button
                  endIcon={<ArrowForward />}
                  onClick={() => navigate('/jobs/manage')}
                >
                  Manage Jobs
                </Button>
              } */}
            
            {/* <CardContent>
              {allJobs.slice(0, 5).map((job) => (
                <Box
                  key={job.id}
                  sx={{
                    p: 2,
                    mb: 2,
                    border: 1,
                    borderColor: 'divider',
                    borderRadius: 1,
                    '&:last-child': { mb: 0 },
                  }}
                >
                  <Typography variant="subtitle1">{job.title}</Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                    {job.location}
                  </Typography>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mb: 1 }}>
                    {job.requirements.slice(0, 3).map((req, index) => (
                      <Chip
                        key={index}
                        label={req}
                        size="small"
                        variant="outlined"
                      />
                    ))}
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', mt: 2, gap: 1 }}>
                    <Button
                      size="small"
                      onClick={() => navigate(`/jobs/${job.id}/applications`)}
                    >
                      View Applications
                    </Button>
                    <Button
                      size="small"
                      onClick={() => navigate(`/jobs/${job.id}`)}
                    >
                      View Details
                    </Button>
                  </Box>
                </Box>
              ))}
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Users */}
      <Grid container spacing={4}>
        <Grid item xs={12}>
          <Card>
            <CardHeader
              title="All Users"
              action={
                <Button
                  endIcon={<ArrowForward />}
                  onClick={() => navigate('/admin/manageusers')}
                >
                  Manage Users
                </Button>
              }
            />
            <CardContent>
              {allUsers.slice(0, 5).map((user) => (
                <Box
                  key={user.id}
                  sx={{
                    p: 2,
                    mb: 2,
                    border: 1,
                    borderColor: 'divider',
                    borderRadius: 1,
                    '&:last-child': { mb: 0 },
                  }}
                >
                  <Typography variant="subtitle1">{user.full_name}</Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                    Email: {user.email}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Role: {user.isEmployer? 'Employer': 'Candidate'}
                  </Typography>
                </Box>
              ))}
            </CardContent>
          </Card>
        </Grid>
      </Grid> 
    </Container>
  );
};

export default AdminDashboard;
