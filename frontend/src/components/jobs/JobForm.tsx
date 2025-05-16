import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  CircularProgress,
  Alert,
  InputAdornment,
  Chip,
} from '@mui/material';
import { AutoAwesome, Business, Edit, LocationOn, MonetizationOn, Title as TitleIcon } from '@mui/icons-material';
import { useNavigate, useParams } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { RootState } from '../../store';
import { jobs } from '../../services/api';
import Navbar from '../layout/Navbar';

type JobFormProps = {
  mode: 'create' | 'edit';
};

const JobForm: React.FC<JobFormProps> = ({ mode }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [companyInfo, setCompanyInfo] = useState('');
  const [location, setLocation] = useState('');
  const [salaryMin, setSalaryMin] = useState('');
  const [salaryMax, setSalaryMax] = useState('');
  const [requirements, setRequirements] = useState<string[]>([]);
  const [currentRequirement, setCurrentRequirement] = useState('');
  const [loading, setLoading] = useState(false);
  const [generatingDescription, setGeneratingDescription] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [error, setError] = useState<string | null>(null);

  const navigate = useNavigate();
  const { user } = useSelector((state: RootState) => state.auth);
  const { id } = useParams();
  const isEditMode = Boolean(id);

  // Fetch job data in edit mode
  useEffect(() => {
    const fetchJob = async () => {
      try {
        const data = await jobs.getById(Number(id));
        setTitle(data.title);
        setDescription(data.description);
        setCompanyInfo(data.company_info);
        setLocation(data.location);
        setRequirements(data.requirements || []);
        setSalaryMin(data.salary_range?.min?.toString() || '');
        setSalaryMax(data.salary_range?.max?.toString() || '');
      } catch (err) {
        console.error('Failed to fetch job:', err);
        setError('Failed to fetch job details.');
      }
    };

    if (isEditMode) {
      fetchJob();
    }
  }, [mode, id]);

  const handleAddRequirement = () => {
    const trimmed = currentRequirement.trim();
    if (trimmed && !requirements.includes(trimmed)) {
      setRequirements([...requirements, trimmed]);
      setCurrentRequirement('');
    }
  };

  const handleRemoveRequirement = (req: string) => {
    setRequirements(requirements.filter((r) => r !== req));
  };

  const handleGenerateDescription = async () => {
    if (!title || !companyInfo || requirements.length === 0) {
      setError('Fill in title, company info, and add at least one requirement before generating.');
      return;
    }

    setGeneratingDescription(true);
    try {
      const res = await jobs.generateDescription({ title, company_info: companyInfo, requirements });
      setDescription(res.description || '');
    } catch (err) {
      console.error('Generation failed:', err);
      setError('Failed to generate description.');
    } finally {
      setGeneratingDescription(false);
    }
  };

  const handleSubmit = async () => {
    if (!title || !location || !companyInfo || !salaryMin || !salaryMax || requirements.length === 0) {
      setError('Please fill all required fields and add at least one requirement.');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const jobData = {
        title,
        location,
        description,
        company_info: companyInfo,
        requirements,
        salary_range: {
          min: Number(salaryMin),
          max: Number(salaryMax),
          currency: 'USD',
        },
      };

      if (isEditMode) {
        await jobs.update(Number(id), jobData);
        setSuccessMsg('Job updated successfully!');
      } else {
        await jobs.create({ ...jobData, employer_id: user?.id });
        setSuccessMsg('Job created successfully!');
      }

      setTimeout(() => navigate('/jobs/manage'), 2000);
    } catch (err: any) {
      console.error('Submit failed:', err);
      setError(err?.response?.data?.detail || 'Job submission failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
    <Navbar/>
    <Box display="flex" justifyContent="center" mt={5}>
      <Card sx={{ width: '100%', maxWidth: 800, p: 3 }}>
        <CardContent>
          <Typography variant="h4" fontWeight="bold" gutterBottom>
            {isEditMode ? '✏️ Edit Job Posting' : '💼 Create New Job Posting'}
          </Typography>

          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          <TextField
            label="Job Title"
            fullWidth
            margin="normal"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            InputProps={{ startAdornment: <InputAdornment position="start"><TitleIcon /></InputAdornment> }}
          />

          <TextField
            label="Company Info"
            fullWidth
            margin="normal"
            multiline
            rows={3}
            value={companyInfo}
            onChange={(e) => setCompanyInfo(e.target.value)}
            InputProps={{ startAdornment: <InputAdornment position="start"><Business /></InputAdornment> }}
          />

          <TextField
            label="Location"
            fullWidth
            margin="normal"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            InputProps={{ startAdornment: <InputAdornment position="start"><LocationOn /></InputAdornment> }}
          />

          <Box mt={2}>
            <Typography variant="subtitle1" gutterBottom>Requirements</Typography>
            <Box display="flex" gap={2} mb={1}>
              <TextField
                placeholder="Add a requirement"
                value={currentRequirement}
                onChange={(e) => setCurrentRequirement(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddRequirement();
                  }
                }}
              />
              <Button onClick={handleAddRequirement} variant="outlined">Add</Button>
            </Box>
            <Box display="flex" flexWrap="wrap" gap={1}>
              {requirements.map((req) => (
                <Chip key={req} label={req} onDelete={() => handleRemoveRequirement(req)} />
              ))}
            </Box>
          </Box>

          <Button
            variant="outlined"
            color="secondary"
            startIcon={<AutoAwesome />}
            sx={{ mt: 2 }}
            onClick={handleGenerateDescription}
            disabled={generatingDescription}
          >
            {generatingDescription ? <CircularProgress size={24} /> : 'Generate Description'}
          </Button>

          <TextField
            label="Job Description"
            fullWidth
            margin="normal"
            multiline
            rows={8}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            InputProps={{ startAdornment: <InputAdornment position="start"><Edit /></InputAdornment> }}
          />

          <Box display="flex" gap={2}>
            <TextField
              label="Salary Min"
              fullWidth
              margin="normal"
              type="number"
              value={salaryMin}
              onChange={(e) => setSalaryMin(e.target.value)}
              InputProps={{ startAdornment: <InputAdornment position="start"><MonetizationOn /></InputAdornment> }}
            />
            <TextField
              label="Salary Max"
              fullWidth
              margin="normal"
              type="number"
              value={salaryMax}
              onChange={(e) => setSalaryMax(e.target.value)}
              InputProps={{ startAdornment: <InputAdornment position="start"><MonetizationOn /></InputAdornment> }}
            />
          </Box>

          <Button
            variant="contained"
            color="primary"
            fullWidth
            sx={{ mt: 3, py: 1.5 }}
            onClick={handleSubmit}
            disabled={loading}
          >
            {isEditMode ? 'Update Job' : 'Publish Job'}
          </Button>

          {successMsg && (
            <Alert severity="success" sx={{ mt: 3 }}>
              {successMsg}
            </Alert>
          )}
        </CardContent>
      </Card>
    </Box>
    </>
  );
};

export default JobForm;
