import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import {
  Container,
  Paper,
  Typography,
  Box,
  Chip,
  Button,
  Grid,
  CircularProgress,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import {
  LocationOn,
  Work,
  AttachMoney,
  Check,
  Close,
  ArrowBack,
} from '@mui/icons-material';
import { jobs, applications } from '../../services/api';
import { RootState } from '../../store';
import Navbar from '../layout/Navbar';

interface Job {
  id: number;
  title: string;
  description: string;
  location: string;
  requirements: string[];
  salary_range: {
    min: number;
    max: number;
    currency: string;
  };
  employer_id: number;
}

interface MatchResult {
  score: number;
  analysis: string;
}

const JobDetails = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useSelector((state: RootState) => state.auth);
  
  const [job, setJob] = useState<Job | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [applying, setApplying] = useState(false);
  const [matchResult, setMatchResult] = useState<MatchResult | null>(null);
  const [showMatchDialog, setShowMatchDialog] = useState(false);

  useEffect(() => {
    const fetchJobDetails = async () => {
      try {
        const data = await jobs.getById(Number(id));
        setJob(data);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching job details:', error);
        setError('Failed to load job details. Please try again later.');
        setLoading(false);
      }
    };

    fetchJobDetails();
  }, [id]);

  const handleApply = async () => {
    if (!job) return;

    setApplying(true);
    try {
      const application = await applications.create(job.id);
      setMatchResult({
        score: application.ai_match_score,
        analysis: 'Based on your profile and the job requirements, here is your match score.',
      });
      setShowMatchDialog(true);
    } catch (error) {
      console.error('Error applying for job:', error);
      setError('Failed to submit application. Please try again.');
    } finally {
      setApplying(false);
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

  if (!job) {
    return (
      <>
        <Navbar />
        <Container>
          <Alert severity="error">Job not found</Alert>
        </Container>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <Container maxWidth="lg" sx={{ mt: 4 }}>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <Paper elevation={3} sx={{ p: 4 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 4 }}>
            <Box>
              {/* Add Back to Dashboard button for employers */}
              {user?.isEmployer || user?.isAdmin && (
                <Button
                  variant="outlined"
                  onClick={() => navigate('/dashboard')}
                  sx={{ mb: 2 }}
                  startIcon={<ArrowBack />}
                >
                  Back to Dashboard
                </Button>
              )}
              <Typography variant="h4" gutterBottom>
                {job.title}
              </Typography>
              <Typography
                color="textSecondary"
                sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}
              >
                <LocationOn />
                {job.location}
              </Typography>
              <Typography
                sx={{ display: 'flex', alignItems: 'center', gap: 1 }}
              >
                <AttachMoney />
                {job.salary_range.currency} {job.salary_range.min.toLocaleString()} -{' '}
                {job.salary_range.max.toLocaleString()} per year
              </Typography>
            </Box>
            {!user?.isEmployer && !user?.isAdmin &&  (
              <Button
                variant="contained"
                color="primary"
                size="large"
                onClick={handleApply}
                disabled={applying}
              >
                {applying ? <CircularProgress size={24} /> : 'Apply Now'}
              </Button>
            )}
          </Box>

          <Grid container spacing={4}>
            <Grid item xs={12} md={user?.isEmployer ? 12 : 8}>
              <Typography variant="h6" gutterBottom>
                Job Description
              </Typography>
              <Typography variant="body1" sx={{ whiteSpace: 'pre-line', mb: 4 }}>
                {job.description}
              </Typography>

              <Typography variant="h6" gutterBottom>
                Requirements
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                {job.requirements.map((requirement, index) => (
                  <Chip
                    key={index}
                    label={requirement}
                    icon={<Work />}
                  />
                ))}
              </Box>
            </Grid>

            {/* Quick Apply section - Only show for candidates */}
            {!user?.isEmployer && !user?.isAdmin && (
              <Grid item xs={12} md={4}>
                <Paper elevation={2} sx={{ p: 3 }}>
                  <Typography variant="h6" gutterBottom>
                    Quick Apply
                  </Typography>
                  <Typography variant="body2" color="textSecondary" paragraph>
                    Our AI-powered system will match your profile with this job's requirements
                    to provide you with a compatibility score.
                  </Typography>
                  <Button
                    variant="contained"
                    color="primary"
                    fullWidth
                    onClick={handleApply}
                    disabled={applying}
                  >
                    {applying ? <CircularProgress size={24} /> : 'Apply Now'}
                  </Button>
                </Paper>
              </Grid>
            )}
          </Grid>
        </Paper>

        {/* Match Result Dialog */}
        <Dialog
          open={showMatchDialog}
          onClose={() => setShowMatchDialog(false)}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle>Application Match Score</DialogTitle>
          <DialogContent>
            <Box sx={{ textAlign: 'center', py: 2 }}>
              <Typography variant="h3" color="primary" gutterBottom>
                {matchResult?.score}%
              </Typography>
              <Typography variant="body1">
                {matchResult?.analysis}
              </Typography>
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setShowMatchDialog(false)}>Close</Button>
            <Button
              variant="contained"
              color="primary"
              onClick={() => {
                setShowMatchDialog(false);
                navigate('/applications');
              }}
            >
              View Application
            </Button>
          </DialogActions>
        </Dialog>
      </Container>
    </>
  );
};

export default JobDetails; 