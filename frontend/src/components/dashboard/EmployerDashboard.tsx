


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
import { jobs, applications } from '../../services/api';
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

const EmployerDashboard = () => {
  const navigate = useNavigate();
  const { user } = useSelector((state: RootState) => state.auth);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [myJobs, setMyJobs] = useState<Job[]>([]);
  const [recentApplications, setRecentApplications] = useState<Application[]>([]);
  const [jobApplicationsCount, setJobApplicationsCount] = useState<{ [key: number]: number }>({});

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (!user?.id) {
          setError('User information not found');
          setLoading(false);
          return;
        }

        const jobsData = await jobs.getEmployerJobs(user.id);
        setMyJobs(jobsData);

        const applicationsCount: { [key: number]: number } = {};
        let allApplications: Application[] = [];

        for (const job of jobsData) {
          const apps = await applications.getJobApplications(job.id);
          applicationsCount[job.id] = apps.length;
          allApplications = [...allApplications, ...apps];
        }
        setJobApplicationsCount(applicationsCount);
        setRecentApplications(allApplications);

        setLoading(false);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        setError('Failed to load dashboard data. Please try again later.');
        setLoading(false);
      }
    };

    fetchData();
  }, [user]);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  const activeJobs = myJobs.filter(job => job.is_active).length;
  const totalApplications = recentApplications.length;
  const averageMatchScore = recentApplications.length > 0
    ? Math.round(recentApplications.reduce((acc, app) => acc + app.ai_match_score, 0) / recentApplications.length)
    : 0;

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
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => navigate('/jobs/create')}
        >
          Post New Job
        </Button>
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
                <Typography variant="h6">Active Jobs</Typography>
              </Box>
              <Typography variant="h3" component="div" sx={{ mb: 1 }}>
                {activeJobs}
              </Typography>
              <LinearProgress 
                variant="determinate" 
                value={(activeJobs / Math.max(myJobs.length, 1)) * 100} 
                sx={{ mb: 1 }}
              />
              <Typography variant="body2" color="text.secondary">
                {myJobs.length} total jobs posted
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
                <Typography variant="h6">Applications</Typography>
              </Box>
              <Typography variant="h3" component="div" sx={{ mb: 1 }}>
                {totalApplications}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Across all active jobs
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
                <Typography variant="h6">Average Match</Typography>
              </Box>
              <Typography variant="h3" component="div" sx={{ mb: 1 }}>
                {averageMatchScore}%
              </Typography>
              <Typography variant="body2" color="text.secondary">
                AI match score average
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Recent Applications */}
      <Grid container spacing={4}>
        <Grid item xs={12} md={7}>
          <Card>
            <CardHeader
              title="Recent Applications"
              action={
                <Button
                  endIcon={<ArrowForward />}
                  onClick={() => navigate('/applications')}
                >
                  View All
                </Button>
              }
            />
            <CardContent>
              {recentApplications.slice(0, 5).map((application) => (
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
        </Grid>

        {/* Active Jobs */}
        <Grid item xs={12} md={5}>
          <Card>
            <CardHeader
              title="Active Job Postings"
              action={
                <Button
                  endIcon={<ArrowForward />}
                  onClick={() => navigate('/jobs/manage')}
                >
                  Manage Jobs
                </Button>
              }
            />
            <CardContent>
              {myJobs.filter(job => job.is_active).slice(0, 5).map((job) => (
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
                  <Box sx={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', mt: 2, gap: 1 , cursor: 'pointer'}}>
                      <Button
                        size="small"
                        onClick={() => navigate(`/jobs/${job.id}/applications`)}
                      >
                        Applications: {jobApplicationsCount[job.id] || 0}
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
    </Container>
  );
};

export default EmployerDashboard;
