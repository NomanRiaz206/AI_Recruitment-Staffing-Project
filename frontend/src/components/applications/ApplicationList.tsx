 

import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import {
  Container,
  Paper,
  Typography,
  Box,
  Grid,
  CircularProgress,
  Alert,
  Chip,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  TextField,
  Card,
  CardContent,
  CardActions,
  Button,
} from '@mui/material';
import {
  FilterList,
  Sort,
  Search,
  CheckCircle,
  Cancel,
  Pending,
  LocationOn,
} from '@mui/icons-material';
import { applications } from '../../services/api';
import { RootState } from '../../store';
import Navbar from '../layout/Navbar';

interface Application {
  id: number;
  job_id: number;
  candidate_id: number;
  status: string;
  ai_match_score: number;
  created_at: string;
  job: {
    title: string;
    location: string;
    employer: {
      company_name: string;
    };
  };
  candidate: {
    user: {
      full_name: string;
    };
  };
}

const ApplicationList = () => {
  const navigate = useNavigate();
  const { user } = useSelector((state: RootState) => state.auth);

  const [applicationsList, setApplicationsList] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortBy, setSortBy] = useState('date');
  const [searchTerm, setSearchTerm] = useState('');

  

  const fetchApplications = async () => {
  alert('dddddddd');

    try {
      let responseData;
      console.log('Fetching applications for user:', user);
      if (!user?.isEmployer) {
        responseData = await applications.getCandidateApplications();
      } else {
        responseData = await applications.getEmployerApplications();
        console.log('Employer applications response:', responseData);
      }
      setApplicationsList(responseData);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching applications:', error);
      setError('Failed to load applications.');
      setLoading(false);
    }
  };
  

  useEffect(() => {
    fetchApplications();
  }, [user]);

  const filteredApplications = applicationsList
    .filter((app) => {
      if (statusFilter !== 'all' && app.status !== statusFilter) return false;

      const searchString = user?.isEmployer
        ? `${app.candidate.user.full_name} ${app.job.title}`
        : `${app.job.employer?.company_name || ''} ${app.job.title}`;

      return searchString.toLowerCase().includes(searchTerm.toLowerCase());
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'score':
          return b.ai_match_score - a.ai_match_score;
        case 'date':
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        default:
          return 0;
      }
    });

  if (loading) {
    return (
      <>
        <Navbar/>
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
          <CircularProgress />
        </Box>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <Paper elevation={3} sx={{ p: 2, mb: 3 }}>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                size="small"
                label="Search"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                InputProps={{
                  startAdornment: <Search sx={{ color: 'action.active', mr: 1 }} />,
                }}
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <FormControl fullWidth size="small">
                <InputLabel id="status-filter-label">Status</InputLabel>
                <Select
                  labelId="status-filter-label"
                  value={statusFilter}
                  label="Status"
                  onChange={(e) => setStatusFilter(e.target.value as string)}
                >
                  <MenuItem value="all">All Status</MenuItem>
                  <MenuItem value="pending">Pending</MenuItem>
                  <MenuItem value="accepted">Accepted</MenuItem>
                  <MenuItem value="rejected">Rejected</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={4}>
              <FormControl fullWidth size="small">
                <InputLabel id="sort-by-label">Sort By</InputLabel>
                <Select
                  labelId="sort-by-label"
                  value={sortBy}
                  label="Sort By"
                  onChange={(e) => setSortBy(e.target.value as string)}
                >
                  <MenuItem value="date">Date</MenuItem>
                  <MenuItem value="score">Match Score</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </Paper>

        <Grid container spacing={3}>
          {filteredApplications.map((application) => (
            <Grid item xs={12} key={application.id}>
              <Card>
                <CardContent>
                  <Box
                    sx={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'flex-start',
                    }}
                  >
                    <Box>
                      <Typography variant="h6" gutterBottom>
                        {application.job.title}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" gutterBottom>
  {user?.isEmployer
    ? `Applicant: ${application.candidate?.user?.full_name || 'N/A'}`
    : `Company: ${application.job?.employer?.company_name || 'N/A'}`}
</Typography>

                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                        <LocationOn fontSize="small" color="action" />
                        <Typography variant="body2" color="text.secondary">
                          {application.job.location}
                        </Typography>
                      </Box>
                    </Box>
                    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 1 }}>
                      <Chip
                        icon={
                          application.status.toLowerCase() === 'accepted' ? (
                            <CheckCircle />
                          ) : application.status.toLowerCase() === 'rejected' ? (
                            <Cancel />
                          ) : (
                            <Pending />
                          )
                        }
                        label={application.status}
                        color={
                          application.status.toLowerCase() === 'accepted'
                            ? 'success'
                            : application.status.toLowerCase() === 'rejected'
                            ? 'error'
                            : 'default'
                        }
                        size="small"
                      />
                      <Chip
                        label={`Match: ${application.ai_match_score}%`}
                        color="primary"
                        size="small"
                      />
                    </Box>
                  </Box>
                </CardContent>
                <CardActions>
                  <Button size="small" onClick={() => navigate(`/applications/${application.id}`)}>
                    View Details
                  </Button>
                </CardActions>
              </Card>
            </Grid>
          ))}

          {filteredApplications.length === 0 && (
            <Grid item xs={12}>
              <Paper sx={{ p: 3, textAlign: 'center' }}>
                <Typography variant="body1" color="text.secondary">
                  No applications found
                </Typography>
              </Paper>
            </Grid>
          )}
        </Grid>
      </Container>
    </>
  );
};

export default ApplicationList;


