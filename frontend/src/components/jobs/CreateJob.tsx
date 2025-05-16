import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useFormik } from 'formik';
import * as yup from 'yup';
import { useSelector } from 'react-redux';
import {
  Container,
  Box,
  Typography,
  TextField,
  Button,
  Chip,
  Paper,
  Alert,
  CircularProgress,
  InputAdornment,
} from '@mui/material';
import { AutoAwesome } from '@mui/icons-material';
import { jobs } from '../../services/api';
import Navbar from '../layout/Navbar';
import { RootState } from '../../store';

const validationSchema = yup.object({
  title: yup.string().required('Job title is required'),
  description: yup.string(),
  location: yup.string().required('Location is required'),
  companyInfo: yup.string().required('Company information is required'),
  salaryMin: yup
    .number()
    .required('Minimum salary is required')
    .positive('Salary must be positive'),
  salaryMax: yup
    .number()
    .required('Maximum salary is required')
    .positive('Salary must be positive')
    .moreThan(yup.ref('salaryMin'), 'Maximum salary must be greater than minimum salary'),
});

const CreateJob = () => {
  const navigate = useNavigate();
  const { user } = useSelector((state: RootState) => state.auth);
  const [loading, setLoading] = useState(false);
  const [generatingDescription, setGeneratingDescription] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [requirements, setRequirements] = useState<string[]>([]);
  const [currentRequirement, setCurrentRequirement] = useState('');

  const formik = useFormik({
    initialValues: {
      title: '',
      description: '',
      location: '',
      companyInfo: '',
      salaryMin: '',
      salaryMax: '',
    },
    validationSchema,
    onSubmit: async (values) => {
      if (!user?.id) {
        setError('User not authenticated');
        return;
      }

      if (requirements.length === 0) {
        setError('Please add at least one requirement');
        return;
      }

      setLoading(true);
      setError(null);

      try {
        await jobs.create({
          employer_id: user.id,
          title: values.title,
          description: values.description,
          location: values.location,
          requirements,
          company_info: values.companyInfo,
          salary_range: {
            min: Number(values.salaryMin),
            max: Number(values.salaryMax),
            currency: 'USD',
          },
        });

        navigate('/dashboard');
      } catch (error: any) {
        console.error('Error creating job:', error);
        setError(error.response?.data?.detail || 'Failed to create job posting. Please try again.');
      } finally {
        setLoading(false);
      }
    },
  });

  const handleGenerateDescription = async () => {
    if (!formik.values.title || !formik.values.companyInfo || requirements.length === 0) {
      setError('Please fill in the job title, company information, and add at least one requirement before generating description');
      return;
    }

    setGeneratingDescription(true);
    setError(null);

    try {
      const response = await jobs.generateDescription({
        title: formik.values.title,
        requirements,
        company_info: formik.values.companyInfo,
      });

      formik.setFieldValue('description', response.description);
    } catch (error) {
      console.error('Error generating description:', error);
      setError('Failed to generate job description. Please try again or enter manually.');
    } finally {
      setGeneratingDescription(false);
    }
  };

  const handleAddRequirement = () => {
    if (currentRequirement.trim() && !requirements.includes(currentRequirement.trim())) {
      setRequirements([...requirements, currentRequirement.trim()]);
      setCurrentRequirement('');
    }
  };

  const handleRemoveRequirement = (requirement: string) => {
    setRequirements(requirements.filter((req) => req !== requirement));
  };

  return (
    <>
      <Navbar />
      <Container maxWidth="md" sx={{ mt: 4 }}>
        <Paper elevation={3} sx={{ p: 4 }}>
          <Typography variant="h4" gutterBottom>
            Create Job Posting
          </Typography>

          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          <Box component="form" onSubmit={formik.handleSubmit}>
            <TextField
              fullWidth
              id="title"
              name="title"
              label="Job Title"
              margin="normal"
              value={formik.values.title}
              onChange={formik.handleChange}
              error={formik.touched.title && Boolean(formik.errors.title)}
              helperText={formik.touched.title && formik.errors.title}
            />

            <TextField
              fullWidth
              id="companyInfo"
              name="companyInfo"
              label="Company Information"
              margin="normal"
              multiline
              rows={3}
              value={formik.values.companyInfo}
              onChange={formik.handleChange}
              error={formik.touched.companyInfo && Boolean(formik.errors.companyInfo)}
              helperText={formik.touched.companyInfo && formik.errors.companyInfo}
            />

            <Box sx={{ mb: 2 }}>
              <Typography variant="subtitle1" gutterBottom>
                Requirements
              </Typography>
              <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                <TextField
                  fullWidth
                  value={currentRequirement}
                  onChange={(e) => setCurrentRequirement(e.target.value)}
                  placeholder="Add a requirement"
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddRequirement();
                    }
                  }}
                />
                <Button
                  variant="contained"
                  onClick={handleAddRequirement}
                  disabled={!currentRequirement.trim()}
                >
                  Add
                </Button>
              </Box>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                {requirements.map((requirement, index) => (
                  <Chip
                    key={index}
                    label={requirement}
                    onDelete={() => handleRemoveRequirement(requirement)}
                  />
                ))}
              </Box>
            </Box>

            <Box sx={{ position: 'relative' }}>
              <TextField
                fullWidth
                id="description"
                name="description"
                label="Job Description"
                margin="normal"
                multiline
                rows={8}
                value={formik.values.description}
                onChange={formik.handleChange}
                error={formik.touched.description && Boolean(formik.errors.description)}
                helperText={formik.touched.description && formik.errors.description}
              />
              <Button
                variant="contained"
                color="secondary"
                onClick={handleGenerateDescription}
                disabled={generatingDescription}
                startIcon={<AutoAwesome />}
                sx={{ position: 'absolute', top: 16, right: 8 }}
              >
                {generatingDescription ? <CircularProgress size={24} /> : 'Generate with AI'}
              </Button>
            </Box>

            <TextField
              fullWidth
              id="location"
              name="location"
              label="Location"
              margin="normal"
              value={formik.values.location}
              onChange={formik.handleChange}
              error={formik.touched.location && Boolean(formik.errors.location)}
              helperText={formik.touched.location && formik.errors.location}
            />

            <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
              <TextField
                fullWidth
                id="salaryMin"
                name="salaryMin"
                label="Minimum Salary"
                type="number"
                margin="normal"
                InputProps={{
                  startAdornment: <InputAdornment position="start">$</InputAdornment>,
                }}
                value={formik.values.salaryMin}
                onChange={formik.handleChange}
                error={formik.touched.salaryMin && Boolean(formik.errors.salaryMin)}
                helperText={formik.touched.salaryMin && formik.errors.salaryMin}
              />

              <TextField
                fullWidth
                id="salaryMax"
                name="salaryMax"
                label="Maximum Salary"
                type="number"
                margin="normal"
                InputProps={{
                  startAdornment: <InputAdornment position="start">$</InputAdornment>,
                }}
                value={formik.values.salaryMax}
                onChange={formik.handleChange}
                error={formik.touched.salaryMax && Boolean(formik.errors.salaryMax)}
                helperText={formik.touched.salaryMax && formik.errors.salaryMax}
              />
            </Box>

            <Box sx={{ mt: 3, display: 'flex', gap: 2 }}>
              <Button
                type="submit"
                variant="contained"
                color="primary"
                disabled={loading}
                fullWidth
              >
                {loading ? <CircularProgress size={24} /> : 'Create Job Posting'}
              </Button>
            </Box>
          </Box>
        </Paper>
      </Container>
    </>
  );
};

export default CreateJob; 