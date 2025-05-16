import React, { useEffect, useState } from 'react';
import {
  Box,
  Container,
  Typography,
  CircularProgress,
  Alert,
  Card,
  CardContent,
  Button,
  Chip,
} from '@mui/material';
import { useParams, useNavigate } from 'react-router-dom';
import { applications, jobs } from '../../services/api';
import Navbar from '../layout/Navbar';

interface Application {
  id: number;
  status: string;
  ai_match_score: number;
  candidate: {
    id: number;
    user: {
      full_name: string;
      email: string;
    };
  };
}

const JobApplications = () => {
  const { jobId } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [applicationsList, setApplicationsList] = useState<Application[]>([]);
  const [jobTitle, setJobTitle] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (!jobId) return;

        const jobData = await jobs.getById(Number(jobId));
        setJobTitle(jobData.title);
  
        const apps = await applications.getJobApplications(Number(jobId));
        setApplicationsList(apps);
      } catch (err) {
        console.error(err);
        setError('Failed to load job applications.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [jobId]);

  if (loading) {
    return (
      
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Container sx={{ mt: 4 }}>
        <Alert severity="error">{error}</Alert>
      </Container>
    );
  }

  return (
    <>
      <Navbar/>
    <Container sx={{ mt: 4 }}>
      <Typography variant="h4" gutterBottom>
        Applications For  {jobTitle}
      </Typography>

      {applicationsList.length === 0 ? (
        <Alert severity="info">No applications found for this job.</Alert>
      ) : (
        applicationsList.map((application) => (
          <Card key={application.id} sx={{ mb: 2 }}>
            <CardContent>
              <Typography variant="h6">{application.candidate.user.full_name}</Typography>
              <Typography variant="body2" color="text.secondary">
                Email: {application.candidate.user.email}
              </Typography>

              <Box sx={{ mt: 1, display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                <Chip label={`Match Score: ${application.ai_match_score}%`} color="info" />
                <Chip label={`Status: ${application.status}`} color="primary" />
              </Box>
            </CardContent>
             <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
    <Button
      size="small"
      variant="outlined"
      onClick={() => navigate(`/applications/${application.id}`)}
    >
      View Application Details
    </Button>
  </Box>
          </Card>
        ))
      )}
    </Container>
    </>
  );
};

export default JobApplications;
