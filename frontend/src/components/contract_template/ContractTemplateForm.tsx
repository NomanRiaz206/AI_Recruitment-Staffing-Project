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
  InputAdornment
} from '@mui/material';
import { Edit, Title as TitleIcon, AutoFixHigh, Badge } from '@mui/icons-material';
import {  contractTemplates } from '../../services/api'; // You should define this API
import { useNavigate, useParams } from 'react-router-dom';
import Navbar from '../layout/Navbar';

type ContractTemplateFormProps = {
  mode: 'create' | 'edit';
};

const ContractTemplateForm: React.FC<ContractTemplateFormProps> = ({ mode }) => {
  const [name, setName] = useState('');
  const [contract_title, setContractTitle] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const navigate = useNavigate();
  const { id } = useParams();
  const isEditMode = Boolean(id);

  useEffect(() => {
    const fetchContract = async () => {
      try {
        const data = await contractTemplates.getById(Number(id));
        setName(data.name);
        setContractTitle(data.contract_title);
        setDescription(data.description);
      } catch (error) {
        console.error('Failed to fetch contract:', error);
      }
    };

    if (isEditMode) {
      fetchContract();
    }
  }, [id]);

  const handleGenerate = async () => {
    if (!contract_title) return;
    setLoading(true);
    try {
      const generated = await contractTemplates.generateDescription({contract_title});
      setDescription(generated || '');
    } catch (error) {
      console.error('Description generation failed', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      if (isEditMode) {
        await contractTemplates.update(Number(id), { name, contract_title, description });
        setSuccessMsg('Contract template updated successfully!');
      } else {
        await contractTemplates.create({ name, contract_title, description });
        setSuccessMsg('Contract template created successfully!');
      }

      setTimeout(() => navigate('/contractTemplate/manage'), 2000);
    } catch (error) {
      console.error('Submit failed:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <Navbar />
      <Box display="flex" justifyContent="center" mt={5}>
        <Card sx={{ width: '100%', maxWidth: 700, boxShadow: 4, borderRadius: 4 }}>
          <CardContent>
            <Typography variant="h4" gutterBottom fontWeight="bold">
              {isEditMode ? '✏️ Edit Contract Template' : '📄 Create Contract Template'}
            </Typography>

            <TextField
              label="Template Name"
              placeholder="e.g., Employment Agreement"
              fullWidth
              margin="normal"
              value={name}
              onChange={(e) => setName(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Badge />
                  </InputAdornment>
                ),
              }}
            />

            <TextField
              label="Contract Title"
              placeholder="e.g., Senior Developer Contract"
              fullWidth
              margin="normal"
              value={contract_title}
              onChange={(e) => setContractTitle(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <TitleIcon />
                  </InputAdornment>
                ),
              }}
            />

            <Button
              variant="outlined"
              color="secondary"
              startIcon={<AutoFixHigh />}
              onClick={handleGenerate}
              disabled={!contract_title || loading}
              sx={{ mb: 2 }}
            >
              {loading ? <CircularProgress size={24} /> : 'Generate Description'}
            </Button>

            <TextField
              label="Contract Description"
              placeholder="AI-generated description will appear here..."
              fullWidth
              margin="normal"
              multiline
              rows={10}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              InputLabelProps={{ shrink: true }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Edit />
                  </InputAdornment>
                ),
              }}
            />

            <Button
              variant="contained"
              color="primary"
              fullWidth
              onClick={handleSubmit}
              disabled={!name || !contract_title || !description || isSubmitting}
              sx={{ mt: 2, py: 1.5 }}
            >
              {isEditMode ? 'Update Template' : 'Save Template'}
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

export default ContractTemplateForm;
