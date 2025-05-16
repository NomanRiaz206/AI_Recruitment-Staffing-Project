import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import {
  Container,
  Paper,
  Typography,
  Box,
  Button,
  Grid,
  CircularProgress,
  Alert,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  ListItemText,
  Divider,
} from '@mui/material';
import {
  Work,
  LocationOn,
  Person,
  School,
  Business,
  Timeline,
  CheckCircle,
  Cancel,
  Pending,
  ArrowBack,
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
  job: {
    id: number;
    title: string;
    description: string;
    location: string;
    requirements: string[];
    employer_id: number;
  };
  candidate: {
    id: number;
    user_id: number;
    bio: string;
    skills: string[];
    experience: Array<{
      company: string;
      position: string;
      duration: string;
      description: string;
    }>;
    education: Array<{
      institution: string;
      degree: string;
      field: string;
      year: number;
    }>;
    user: {
      id: number;
      email: string;
      full_name: string;
    };
  };
}

const ApplicationDetails = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useSelector((state: RootState) => state.auth);
  
  const [application, setApplication] = useState<Application | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updating, setUpdating] = useState(false);
  const [showStatusDialog, setShowStatusDialog] = useState(false);
  const [generatingContract, setGeneratingContract] = useState(false);

  useEffect(() => {
    const fetchApplication = async () => {
      alert('Fetching application details...');
      try {
        if (!id) return;
        const data = await applications.getById(parseInt(id));
        setApplication(data);
      } catch (error: any) {
        console.error('Error fetching application:', error);
        setError(error?.response?.data?.detail || 'Failed to load application details.');
      } finally {
        setLoading(false);
      }
    };

    fetchApplication();
  }, [id]);

  const handleStatusChange = async (newStatus: string) => {
    if (!application) return;

    setUpdating(true);
    try {
      await applications.updateStatus(application.id, newStatus);
      setApplication({ ...application, status: newStatus });
      setShowStatusDialog(false);
    } catch (error) {
      console.error('Error updating status:', error);
      setError('Failed to update application status.');
    } finally {
      setUpdating(false);
    }
  };

  const handleGenerateContract = async () => {
    if (!application) return;

    setGeneratingContract(true);
    try {
      // const contract = await contracts.generate(application.id);
      // navigate(`/contracts/${contract.id}`);
    } catch (error) {
      console.error('Error generating contract:', error);
      setError('Failed to generate contract.');
    } finally {
      setGeneratingContract(false);
    }
  };

  if (loading) {
    return (
      <>
        <Navbar />
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
          <CircularProgress />
        </Box>
      </>
    );
  }

  if (!application) {
    return (
      <>
        <Navbar />
        <Container>
          <Alert severity="error">Application not found</Alert>
        </Container>
      </>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'accepted':
        return 'success';
      case 'rejected':
        return 'error';
      default:
        return 'default';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case 'accepted':
        return <CheckCircle />;
      case 'rejected':
        return <Cancel />;
      default:
        return <Pending />;
    }
  };

  return (
    <>
      <Navbar />
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Button
          variant="outlined"
          startIcon={<ArrowBack />}
          onClick={() => navigate('/dashboard')}
          sx={{ mb: 2 }}
        >
          Back to Dashboard
        </Button>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <Grid container spacing={4}>
          {/* Application Status */}
          <Grid item xs={12}>
            <Paper elevation={3} sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box>
                  <Typography variant="h5" gutterBottom>
                    Application #{application.id}
                  </Typography>
                  <Chip
                    icon={getStatusIcon(application.status)}
                    label={application.status}
                    color={getStatusColor(application.status) as any}
                    sx={{ mr: 2 }}
                  />
                  <Chip
                    label={`Match Score: ${application.ai_match_score}%`}
                    color="primary"
                  />
                </Box>
                {user?.isEmployer && application.status === 'pending' && (
                  <Box>
                    <Button
                      variant="contained"
                      color="success"
                      onClick={() => handleStatusChange('accepted')}
                      disabled={updating}
                      sx={{ mr: 1 }}
                    >
                      Accept
                    </Button>
                    <Button
                      variant="contained"
                      color="error"
                      onClick={() => handleStatusChange('rejected')}
                      disabled={updating}
                    >
                      Reject
                    </Button>
                  </Box>
                )}
                {user?.isEmployer && application.status === 'accepted' && (
                  <Button
                    variant="contained"
                    color="primary"
                    onClick={handleGenerateContract}
                    disabled={generatingContract}
                  >
                    {generatingContract ? 'Generating...' : 'Generate Contract'}
                  </Button>
                )}
              </Box>
            </Paper>
          </Grid>

          {/* Job Details */}
          <Grid item xs={12} md={6}>
            <Paper elevation={3} sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                Job Details
              </Typography>
              <List>
                <ListItem>
                  <ListItemText
                    primary={application.job.title}
                    secondary={
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <LocationOn fontSize="small" />
                        {application.job.location}
                      </Box>
                    }
                  />
                </ListItem>
                <Divider />
                <ListItem>
                  <ListItemText
                    primary="Requirements"
                    secondary={
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 1 }}>
                        {application.job.requirements.map((req, index) => (
                          <Chip
                            key={index}
                            label={req}
                            size="small"
                            icon={<Work fontSize="small" />}
                          />
                        ))}
                      </Box>
                    }
                  />
                </ListItem>
              </List>
            </Paper>
          </Grid>

          {/* Candidate Details */}
          <Grid item xs={12} md={6}>
            <Paper elevation={3} sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                Candidate Details
              </Typography>
              <List>
                <ListItem>
                  <ListItemText
                    primary={
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Person fontSize="small" />
                        {application.candidate.user.full_name}
                      </Box>
                    }
                    secondary={application.candidate.user.email}
                  />
                </ListItem>
                <Divider />
                <ListItem>
                  <ListItemText
                    primary="Skills"
                    secondary={
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 1 }}>
                        {application.candidate.skills.map((skill, index) => (
                          <Chip key={index} label={skill} size="small" />
                        ))}
                      </Box>
                    }
                  />
                </ListItem>
                <Divider />
                <ListItem>
                  <ListItemText
                    primary="Experience"
                    secondary={
                      <List dense>
                        {application.candidate.experience.map((exp, index) => (
                          <ListItem key={index}>
                            <ListItemText
                              primary={
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                  <Business fontSize="small" />
                                  {exp.position} at {exp.company}
                                </Box>
                              }
                              secondary={
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                  <Timeline fontSize="small" />
                                  {exp.duration}
                                </Box>
                              }
                            />
                          </ListItem>
                        ))}
                      </List>
                    }
                  />
                </ListItem>
                <Divider />
                <ListItem>
                  <ListItemText
                    primary="Education"
                    secondary={
                      <List dense>
                        {application.candidate.education.map((edu, index) => (
                          <ListItem key={index}>
                            <ListItemText
                              primary={
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                  <School fontSize="small" />
                                  {edu.degree} in {edu.field}
                                </Box>
                              }
                              secondary={`${edu.institution}, ${edu.year}`}
                            />
                          </ListItem>
                        ))}
                      </List>
                    }
                  />
                </ListItem>
              </List>
            </Paper>
          </Grid>
        </Grid>
      </Container>
    </>
  );
};

export default ApplicationDetails; 