import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useFormik } from 'formik';
import * as yup from 'yup';
import {
  Container,
  Paper,
  Typography,
  Box,
  TextField,
  Button,
  Chip,
  Grid,
  CircularProgress,
  Alert,
  IconButton,
  Divider,
  Stack,
} from '@mui/material';
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  AutoAwesome,
  ArrowBack,
} from '@mui/icons-material';
import { candidates } from '../../services/api';
import { RootState } from '../../store';
import Navbar from '../layout/Navbar';
import { useNavigate } from 'react-router-dom';

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

interface FormValues {
  skills: string[];
  education: Education[];
  experience: Experience[];
  bio: string;
}

const validationSchema = yup.object({
  bio: yup.string().required('Bio is required'),
  skills: yup.array().of(yup.string()).min(1, 'At least one skill is required'),
  education: yup.array().of(
    yup.object({
      institution: yup.string().required('Institution is required'),
      degree: yup.string().required('Degree is required'),
      field: yup.string().required('Field of study is required'),
      year: yup.number().required('Year is required').min(1900).max(new Date().getFullYear()),
    })
  ),
  experience: yup.array().of(
    yup.object({
      company: yup.string().required('Company is required'),
      position: yup.string().required('Position is required'),
      duration: yup.string().required('Duration is required'),
      description: yup.string().required('Description is required'),
    })
  ),
});

const CandidateProfile = () => {
  const navigate = useNavigate();
  const { user } = useSelector((state: RootState) => state.auth);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [newSkill, setNewSkill] = useState('');
  const [isGeneratingBio, setIsGeneratingBio] = useState(false);

  const formik = useFormik({
    initialValues: {
      bio: '',
      skills: [] as string[],
      education: [{ institution: '', degree: '', field: '', year: new Date().getFullYear() }],
      experience: [{ company: '', position: '', duration: '', description: '' }],
    },
    validationSchema,
    onSubmit: async (values) => {
      try {
        setLoading(true);
        setError(null);
        setSuccessMessage(null);

        if (!user?.id) {
          setError('User not authenticated');
          return;
        }

        await candidates.createProfile({
          user_id: user.id,
          ...values,
        });
        setSuccessMessage('Profile updated successfully!');
      } catch (err: any) {
        setError(err?.response?.data?.detail || 'Failed to update profile. Please try again.');
      } finally {
        setLoading(false);
      }
    },
  });

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true);
        const profile = await candidates.getMyProfile();
        formik.setValues({
          bio: profile.bio || '',
          skills: profile.skills || [],
          education: profile.education?.length > 0 ? profile.education : [{ institution: '', degree: '', field: '', year: new Date().getFullYear() }],
          experience: profile.experience?.length > 0 ? profile.experience : [{ company: '', position: '', duration: '', description: '' }],
        });
      } catch (err: any) {
        // Ignore 404 error for new profiles
        if (err?.response?.status !== 404) {
          setError('Failed to load profile. Please try again.');
        }
      } finally {
        setLoading(false);
      }
    };

    if (user?.id) {
      fetchProfile();
    }
  }, [user?.id]);

  const handleAddSkill = () => {
    if (newSkill && !formik.values.skills.includes(newSkill)) {
      formik.setFieldValue('skills', [...formik.values.skills, newSkill]);
      setNewSkill('');
    }
  };

  const handleRemoveSkill = (skillToRemove: string) => {
    formik.setFieldValue(
      'skills',
      formik.values.skills.filter((skill) => skill !== skillToRemove)
    );
  };

  const handleAddEducation = () => {
    formik.setFieldValue('education', [
      ...formik.values.education,
      { institution: '', degree: '', field: '', year: new Date().getFullYear() },
    ]);
  };

  const handleAddExperience = () => {
    formik.setFieldValue('experience', [
      ...formik.values.experience,
      { company: '', position: '', duration: '', description: '' },
    ]);
  };

  const validateProfileForBio = () => {
    if (formik.values.skills.length === 0) {
      return "Please add at least one skill before generating a bio.";
    }
    if (formik.values.education.length === 0 || !formik.values.education[0].institution) {
      return "Please add your education details before generating a bio.";
    }
    if (formik.values.experience.length === 0 || !formik.values.experience[0].company) {
      return "Please add your work experience before generating a bio.";
    }
    return null;
  };

  const handleGenerateBio = async () => {
    try {
      const validationError = validateProfileForBio();
      if (validationError) {
        setError(validationError);
        return;
      }

      setIsGeneratingBio(true);
      setError(null);
      
      // No need to save the profile first, just generate bio with current form values
      const { bio } = await candidates.generateBio();
      formik.setFieldValue('bio', bio);
      setSuccessMessage('Bio generated successfully!');
    } catch (err: any) {
      setError(err?.response?.data?.detail || 'Failed to generate bio. Please try again.');
    } finally {
      setIsGeneratingBio(false);
    }
  };

  const getFieldError = (fieldName: string, index: number, subField: string): string => {
    const errors = formik.errors[fieldName as keyof FormValues] as any[];
    const touched = formik.touched[fieldName as keyof FormValues] as any[];
    
    if (errors && touched && errors[index] && touched[index]) {
      return errors[index][subField];
    }
    return '';
  };

  const hasFieldError = (fieldName: string, index: number, subField: string): boolean => {
    return Boolean(getFieldError(fieldName, index, subField));
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

  return (
    <>
      <Navbar />
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Paper elevation={3} sx={{ p: 4 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
            <Button
              variant="outlined"
              startIcon={<ArrowBack />}
              onClick={() => navigate('/dashboard')}
              sx={{ mr: 2 }}
            >
              Back to Dashboard
            </Button>
            <Typography variant="h4">
              Candidate Profile
            </Typography>
          </Box>

          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          {successMessage && (
            <Alert severity="success" sx={{ mb: 2 }}>
              {successMessage}
            </Alert>
          )}

          <Box component="form" onSubmit={formik.handleSubmit}>
            {/* Skills Section */}
            <Box sx={{ mb: 4 }}>
              <Typography variant="h6" gutterBottom>
                Skills
              </Typography>
              <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                <TextField
                  fullWidth
                  value={newSkill}
                  onChange={(e) => setNewSkill(e.target.value)}
                  placeholder="Add a skill"
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddSkill();
                    }
                  }}
                />
                <Button
                  variant="contained"
                  onClick={handleAddSkill}
                  disabled={!newSkill}
                >
                  Add
                </Button>
              </Box>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                {formik.values.skills.map((skill, index) => (
                  <Chip
                    key={index}
                    label={skill}
                    onDelete={() => handleRemoveSkill(skill)}
                  />
                ))}
              </Box>
              {formik.touched.skills && formik.errors.skills && (
                <Typography color="error" variant="caption">
                  {formik.errors.skills as string}
                </Typography>
              )}
            </Box>

            {/* Education Section */}
            <Box sx={{ mb: 4 }}>
              <Typography variant="h6" gutterBottom>
                Education
              </Typography>
              {formik.values.education.map((edu, index) => (
                <Box key={index} sx={{ mb: 2 }}>
                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        name={`education.${index}.institution`}
                        label="Institution"
                        value={edu.institution}
                        onChange={formik.handleChange}
                        error={hasFieldError('education', index, 'institution')}
                        helperText={getFieldError('education', index, 'institution')}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        name={`education.${index}.degree`}
                        label="Degree"
                        value={edu.degree}
                        onChange={formik.handleChange}
                        error={hasFieldError('education', index, 'degree')}
                        helperText={getFieldError('education', index, 'degree')}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        name={`education.${index}.field`}
                        label="Field of Study"
                        value={edu.field}
                        onChange={formik.handleChange}
                        error={hasFieldError('education', index, 'field')}
                        helperText={getFieldError('education', index, 'field')}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        type="number"
                        name={`education.${index}.year`}
                        label="Year"
                        value={edu.year}
                        onChange={formik.handleChange}
                        error={hasFieldError('education', index, 'year')}
                        helperText={getFieldError('education', index, 'year')}
                      />
                    </Grid>
                  </Grid>
                  <Divider sx={{ my: 2 }} />
                </Box>
              ))}
              <Button
                variant="outlined"
                startIcon={<AddIcon />}
                onClick={handleAddEducation}
              >
                Add Education
              </Button>
            </Box>

            {/* Experience Section */}
            <Box sx={{ mb: 4 }}>
              <Typography variant="h6" gutterBottom>
                Experience
              </Typography>
              {formik.values.experience.map((exp, index) => (
                <Box key={index} sx={{ mb: 2 }}>
                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        name={`experience.${index}.company`}
                        label="Company"
                        value={exp.company}
                        onChange={formik.handleChange}
                        error={hasFieldError('experience', index, 'company')}
                        helperText={getFieldError('experience', index, 'company')}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        name={`experience.${index}.position`}
                        label="Position"
                        value={exp.position}
                        onChange={formik.handleChange}
                        error={hasFieldError('experience', index, 'position')}
                        helperText={getFieldError('experience', index, 'position')}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        name={`experience.${index}.duration`}
                        label="Duration"
                        value={exp.duration}
                        onChange={formik.handleChange}
                        error={hasFieldError('experience', index, 'duration')}
                        helperText={getFieldError('experience', index, 'duration')}
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        multiline
                        rows={3}
                        name={`experience.${index}.description`}
                        label="Description"
                        value={exp.description}
                        onChange={formik.handleChange}
                        error={hasFieldError('experience', index, 'description')}
                        helperText={getFieldError('experience', index, 'description')}
                      />
                    </Grid>
                  </Grid>
                  <Divider sx={{ my: 2 }} />
                </Box>
              ))}
              <Button
                variant="outlined"
                startIcon={<AddIcon />}
                onClick={handleAddExperience}
              >
                Add Experience
              </Button>
            </Box>

            {/* Bio Section */}
            <Box sx={{ mb: 4 }}>
              <Typography variant="h6" gutterBottom>
                Professional Bio
              </Typography>
              <Box sx={{ position: 'relative' }}>
                <TextField
                  fullWidth
                  multiline
                  rows={6}
                  name="bio"
                  label="Bio"
                  value={formik.values.bio}
                  onChange={formik.handleChange}
                  error={formik.touched.bio && Boolean(formik.errors.bio)}
                  helperText={formik.touched.bio && formik.errors.bio}
                />
                <Button
                  variant="contained"
                  color="secondary"
                  onClick={handleGenerateBio}
                  disabled={isGeneratingBio || formik.values.skills.length === 0}
                  startIcon={isGeneratingBio ? <CircularProgress size={20} /> : <AutoAwesome />}
                  type="button"
                  sx={{ position: 'absolute', top: 8, right: 8 }}
                >
                  {isGeneratingBio ? 'Generating...' : 'Generate with AI'}
                </Button>
              </Box>
              <Typography variant="caption" color="textSecondary" sx={{ mt: 1, display: 'block' }}>
                Note: Make sure to fill in your skills, education, and experience before generating a bio.
              </Typography>
            </Box>

            <Button
              type="submit"
              variant="contained"
              color="primary"
              size="large"
              fullWidth
              disabled={loading}
            >
              {loading ? <CircularProgress size={24} /> : 'Save Profile'}
            </Button>
          </Box>
        </Paper>
      </Container>
    </>
  );
};

export default CandidateProfile; 