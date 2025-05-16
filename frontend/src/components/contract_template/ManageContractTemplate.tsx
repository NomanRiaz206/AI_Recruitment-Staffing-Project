import React, { useEffect, useState } from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Button,
  Container,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { contractTemplates } from '../../services/api'; // Adjust this to your API service
import Navbar from '../layout/Navbar';

interface ContractTemplate {
  id: string;
  name: string;
  contract_title: string;
  description: string;
  created_at: string;
}

const ManageContractTemplates: React.FC = () => {
  const navigate = useNavigate();
  const [templateList, setTemplateList] = useState<ContractTemplate[]>([]);

  useEffect(() => {
    const fetchTemplates = async () => {
      try {
        const res: ContractTemplate[] = await contractTemplates.getAll();
        const sorted = res
          .filter((template) => template.created_at)
          .sort(
            (a, b) =>
              new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
          );
        setTemplateList(sorted);
      } catch (error) {
        console.error('Failed to fetch contract templates:', error);
      }
    };
    fetchTemplates();
  }, []);

  const handleView = (id: string) => {
    navigate(`/contractTemplate/${id}`);
  };

  const handleEdit = (id: string) => {
    navigate(`/contractTemplate/${id}/edit`);
  };

  const handleDelete = async (id: string) => {
    try {
      await contractTemplates.delete(Number(id));
      setTemplateList((prev) => prev.filter((template) => template.id !== id));
    } catch (error) {
      console.error('Error deleting contract template:', error);
    }
  };

  return (
    <>
      <Navbar />
      <Container maxWidth="lg" sx={{ py: 8 }}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
          <Typography variant="h4" component="h2">
            Manage Contract Templates
          </Typography>
          <Button variant="contained" color="primary" onClick={() => navigate('/contractTemplate/create')}>
            + Create New Template
          </Button>
        </Box>

        <Grid container spacing={3}>
          {templateList.length > 0 ? (
            templateList.map((template) => (
              <Grid item xs={12} key={template.id}>
                <Card
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    borderRadius: 2,
                    boxShadow: 4,
                    p: 2,
                    transition: 'transform 0.3s ease, box-shadow 0.3s ease',
                    '&:hover': {
                      transform: 'translateY(-3px)',
                      boxShadow: 8,
                    },
                  }}
                >
                  <Box flexGrow={1}>
                    <Typography variant="h6" fontWeight="bold" gutterBottom>
                      {template.contract_title}
                    </Typography>
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden',
                      }}
                    >
                      {template.description}
                    </Typography>
                    <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                      Created on {new Date(template.created_at).toLocaleDateString()}
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, ml: 2 }}>
                    <Button variant="outlined" size="small" onClick={() => handleView(template.id)}>
                      View
                    </Button>
                    <Button
                      variant="contained"
                      size="small"
                      sx={{ backgroundColor: '#facc15', color: '#000', '&:hover': { backgroundColor: '#eab308' } }}
                      onClick={() => handleEdit(template.id)}
                    >
                      Edit
                    </Button>
                    <Button
                      variant="contained"
                      size="small"
                      sx={{ backgroundColor: '#ef4444', color: '#fff', '&:hover': { backgroundColor: '#dc2626' } }}
                      onClick={() => handleDelete(template.id)}
                    >
                      Delete
                    </Button>
                  </Box>
                </Card>
              </Grid>
            ))
          ) : (
            <Typography variant="body1" align="center" sx={{ width: '100%', mt: 4 }}>
              No contract templates found.
            </Typography>
          )}
        </Grid>
      </Container>
    </>
  );
};

export default ManageContractTemplates;
