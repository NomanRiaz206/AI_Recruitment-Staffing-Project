import React, { useEffect, useState } from 'react';
import { Box, Card, CardContent, Typography, Button, Stack } from '@mui/material';
import { useNavigate, useParams } from 'react-router-dom';
import { contractTemplates } from '../../services/api'; // Adjust path as needed
import Navbar from '../layout/Navbar';

const ContractTemplateDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [template, setTemplate] = useState<any>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchTemplate = async () => {
      try {
        const data = await contractTemplates.getById(Number(id));
        setTemplate(data);
      } catch (error) {
        console.error('Failed to fetch contract template', error);
      }
    };

    fetchTemplate();
  }, [id]);

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this contract template?')) return;
    try {
      await contractTemplates.delete(Number(id));
      alert('Contract template deleted successfully!');
      navigate('/contract-templates/manage');
    } catch (error) {
      console.error('Delete failed', error);
    }
  };

  if (!template) return <Typography>Loading...</Typography>;

  return (
    <>
      <Navbar />
      <Box display="flex" justifyContent="center" mt={5} px={2}>
        <Card sx={{ width: '100%', maxWidth: 900, boxShadow: 4, borderRadius: 4 }}>
          <CardContent>
            <Typography variant="h4" fontWeight="bold" gutterBottom>
              {template.title}
            </Typography>

            <Typography variant="body2" color="text.secondary" mb={2}>
              Created on: {new Date(template.created_date || '').toLocaleDateString()}
            </Typography>

            <Typography
              variant="body1"
              sx={{
                whiteSpace: 'pre-wrap',
                lineHeight: 1.8,
                fontSize: '1.1rem',
                color: '#333'
              }}
            >
              {template.content}
            </Typography>

            <Stack direction="row" spacing={2} justifyContent="flex-end" mt={4}>
              {/* Uncomment these if you implement edit/delete for templates */}
              {/* <Button
                variant="contained"
                onClick={() => navigate(`/contract-templates/${id}/edit`)}
                sx={{ backgroundColor: '#facc15', color: '#000', '&:hover': { backgroundColor: '#eab308' } }}
              >
                Edit
              </Button>

              <Button
                variant="contained"
                onClick={handleDelete}
                sx={{ backgroundColor: '#ef4444', color: '#fff', '&:hover': { backgroundColor: '#dc2626' } }}
              >
                Delete
              </Button> */}
            </Stack>
          </CardContent>
        </Card>
      </Box>
    </>
  );
};

export default ContractTemplateDetail;
