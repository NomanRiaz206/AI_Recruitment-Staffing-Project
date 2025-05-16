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
  Avatar,
  CardHeader,
  LinearProgress,
} from '@mui/material';
import {
  Work,
  TrendingUp,
  Description,
  Search,
  ArrowForward,
  Person,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { jobs, applications, candidates } from '../../services/api';
import { RootState } from '../../store';

interface Job {
  id: number;
  title: string;
  description: string;
  location: string;
  salary_range: {
    min: number;
    max: number;
    currency: string;
  };
  employer: {
    company_name: string;
  };
}

interface Application {
  id: number;
  job_id: number;
  status: string;
  ai_match_score: number;
  job: {
    title: string;
    location: string;
  };
}

const CandidateDashboard = () => {
  const navigate = useNavigate();
  const { user } = useSelector((state: RootState) => state.auth);
  const [loading, setLoading] = useState(true);
  const [recommendedJobs, setRecommendedJobs] = useState<Job[]>([]);
  const [myApplications, setMyApplications] = useState<Application[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [profile, setProfile] = useState<any>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch all data in parallel
        const [jobsData, applicationsData, profileData] = await Promise.all([
          jobs.getAll(),
          applications.getCandidateApplications(),
          candidates.getMyProfile().catch(() => null)
        ]);

        setRecommendedJobs(jobsData);
        setMyApplications(applicationsData);
        setProfile(profileData);
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

  const profileCompleteness = profile ? calculateProfileCompleteness(profile) : 0;
  const averageMatchScore = myApplications.length > 0
    ? Math.round(myApplications.reduce((acc, app) => acc + app.ai_match_score, 0) / myApplications.length)
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
          startIcon={<Search />}
          onClick={() => navigate('/jobs')}
        >
          Find Jobs
        </Button>
      </Box>

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={4}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Avatar sx={{ bgcolor: 'primary.main', mr: 2 }}>
                  <Person />
                </Avatar>
                <Typography variant="h6">Profile</Typography>
              </Box>
              <Typography variant="h3" component="div" sx={{ mb: 1 }}>
                {profileCompleteness}%
              </Typography>
              <LinearProgress 
                variant="determinate" 
                value={profileCompleteness} 
                sx={{ mb: 1 }}
              />
              <Typography variant="body2" color="text.secondary">
                Profile completeness
              </Typography>
              {profileCompleteness < 100 && (
                <Button
                  size="small"
                  onClick={() => navigate('/profile')}
                  sx={{ mt: 1 }}
                >
                  Complete Profile
                </Button>
              )}
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={4}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Avatar sx={{ bgcolor: 'success.main', mr: 2 }}>
                  <Description />
                </Avatar>
                <Typography variant="h6">Applications</Typography>
              </Box>
              <Typography variant="h3" component="div" sx={{ mb: 1 }}>
                {myApplications.length}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Total job applications
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
                <Typography variant="h6">Match Score</Typography>
              </Box>
              <Typography variant="h3" component="div" sx={{ mb: 1 }}>
                {averageMatchScore}%
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Average AI match score
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Main Content */}
      <Grid container spacing={4}>
        {/* Recommended Jobs */}
        <Grid item xs={12} md={7}>
          <Card>
            <CardHeader
              title="Recommended Jobs"
              action={
                <Button
                  endIcon={<ArrowForward />}
                  onClick={() => navigate('/jobs')}
                >
                  View All
                </Button>
              }
            />
            <CardContent>
              {recommendedJobs.slice(0, 5).map((job) => (
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
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    {job.location}
                  </Typography>
                  <Typography variant="body2" sx={{ mb: 1 }}>
                    {job.salary_range.currency} {job.salary_range.min.toLocaleString()} - {job.salary_range.max.toLocaleString()}
                  </Typography>
                  <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
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

        {/* Recent Applications */}
        <Grid item xs={12} md={5}>
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
              {myApplications.slice(0, 5).map((application) => (
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
                      {application.job.title}
                    </Typography>
                    <Chip
                      label={application.status}
                      color={
                        application.status === 'accepted'
                          ? 'success'
                          : application.status === 'rejected'
                          ? 'error'
                          : 'default'
                      }
                      size="small"
                    />
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="body2" color="text.secondary">
                      {application.job.location}
                    </Typography>
                    <Chip
                      label={`${application.ai_match_score}% Match`}
                      size="small"
                      variant="outlined"
                      color={application.ai_match_score > 75 ? 'success' : 'default'}
                    />
                  </Box>
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
      </Grid>
    </Container>
  );
};

const calculateProfileCompleteness = (profile: any): number => {
  if (!profile) return 0;

  const sections = [
    !!profile.bio,
    Array.isArray(profile.skills) && profile.skills.length > 0,
    Array.isArray(profile.experience) && profile.experience.length > 0,
    Array.isArray(profile.education) && profile.education.length > 0
  ];

  const completedSections = sections.filter(Boolean).length;
  return Math.round((completedSections / sections.length) * 100);
};

export default CandidateDashboard; 