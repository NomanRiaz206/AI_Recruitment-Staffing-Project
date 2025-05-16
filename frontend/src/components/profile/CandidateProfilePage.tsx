import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import {
  Box,
  Container,
  Typography,
  CircularProgress,
  Alert,
  Card,
  CardContent,
  Chip,
} from '@mui/material';
import { candidates } from '../../services/api';

interface Education {
  institution: string;
  degree: string;
  field: string;
  year: number;
}

interface Experience {
  company: string;
  position: string;
  duration: string;
  description: string;
}

interface CandidateProfile {
  id: number;
  user_id: number;
  bio: string;
  skills: string[];
  experience: Experience[];
  education: Education[];
}

const CandidateProfilePage = () => {
  const { id } = useParams(); // Get the candidate ID from the URL
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [candidateProfile, setCandidateProfile] = useState<CandidateProfile | null>(null);

  useEffect(() => {
    const fetchCandidateProfile = async () => {
      try {
        if (!id) return;

        const profile = await candidates.getMyProfile();
        setCandidateProfile(profile); // Assuming getMyProfile fetches the profile for the logged-in user
      } catch (err) {
        console.error(err);
        setError('Failed to load candidate profile.');
      } finally {
        setLoading(false);
      }
    };

    fetchCandidateProfile();
  }, [id]);

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

  if (!candidateProfile) {
    return (
      <Container sx={{ mt: 4 }}>
        <Alert severity="warning">No profile found for this candidate.</Alert>
      </Container>
    );
  }

  return (
    <Container sx={{ mt: 4 }}>
      <Typography variant="h4" gutterBottom>
        {candidateProfile.user_id ? `Profile of ${candidateProfile.user_id}` : 'Candidate Profile'}
      </Typography>

      <Card sx={{ mb: 2 }}>
        <CardContent>
          <Typography variant="h5" gutterBottom>
            Bio:
          </Typography>
          <Typography variant="body1">{candidateProfile.bio}</Typography>

          <Typography variant="h5" gutterBottom sx={{ mt: 2 }}>
            Skills:
          </Typography>
          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
            {candidateProfile.skills.map((skill, index) => (
              <Chip key={index} label={skill} color="primary" />
            ))}
          </Box>

          <Typography variant="h5" gutterBottom sx={{ mt: 2 }}>
            Experience:
          </Typography>
          {candidateProfile.experience.length === 0 ? (
            <Typography>No experience data available.</Typography>
          ) : (
            candidateProfile.experience.map((exp, index) => (
              <Box key={index} sx={{ mb: 2 }}>
                <Typography variant="h6">{exp.position} at {exp.company}</Typography>
                <Typography variant="body2" color="text.secondary">
                  {exp.duration}
                </Typography>
                <Typography variant="body2">{exp.description}</Typography>
              </Box>
            ))
          )}

          <Typography variant="h5" gutterBottom sx={{ mt: 2 }}>
            Education:
          </Typography>
          {candidateProfile.education.length === 0 ? (
            <Typography>No education data available.</Typography>
          ) : (
            candidateProfile.education.map((edu, index) => (
              <Box key={index} sx={{ mb: 2 }}>
                <Typography variant="h6">{edu.degree} in {edu.field}</Typography>
                <Typography variant="body2" color="text.secondary">
                  {edu.institution} - {edu.year}
                </Typography>
              </Box>
            ))
          )}
        </CardContent>
      </Card>
    </Container>
  );
};

export default CandidateProfilePage;
