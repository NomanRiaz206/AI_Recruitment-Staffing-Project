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
  DialogContentText,
  DialogActions,
  Divider,
} from '@mui/material';
import {
  Description,
  CheckCircle,
  Send,
  Edit,
  Download,
} from '@mui/icons-material';
// import { contracts } from '../../services/api';
import { RootState } from '../../store';
import Navbar from '../layout/Navbar';

interface Contract {
  id: number;
  application_id: number;
  content: string;
  status: string;
  created_at: string;
  application: {
    job: {
      title: string;
      employer: {
        company_name: string;
      };
    };
    candidate: {
      user: {
        full_name: string;
        email: string;
      };
    };
  };
}

const ContractDetails = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useSelector((state: RootState) => state.auth);
  
  const [contract, setContract] = useState<Contract | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updating, setUpdating] = useState(false);
  const [showSignDialog, setShowSignDialog] = useState(false);

  useEffect(() => {
    const fetchContract = async () => {
      try {
        // const data = await contracts.getById(Number(id));
        // setContract(data);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching contract:', error);
        setError('Failed to load contract details.');
        setLoading(false);
      }
    };

    fetchContract();
  }, [id]);

  const handleStatusChange = async (newStatus: string) => {
    if (!contract) return;

    setUpdating(true);
    try {
      // await contracts.updateStatus(contract.id, newStatus);
      // setContract({ ...contract, status: newStatus });
      // setShowSignDialog(false);
    } catch (error) {
      console.error('Error updating contract status:', error);
      setError('Failed to update contract status.');
    } finally {
      setUpdating(false);
    }
  };

  const handleDownload = () => {
    if (!contract) return;

    // Create a blob from the contract content
    const blob = new Blob([contract.content], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `contract_${contract.id}.txt`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'signed':
        return 'success';
      case 'sent':
        return 'primary';
      default:
        return 'default';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case 'signed':
        return <CheckCircle />;
      case 'sent':
        return <Send />;
      default:
        return <Edit />;
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

  if (!contract) {
    return (
      <>
        <Navbar />
        <Container>
          <Alert severity="error">Contract not found</Alert>
        </Container>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {/* Contract Header */}
        <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
            <Box>
              <Typography variant="h4" gutterBottom>
                Employment Contract
              </Typography>
              <Typography variant="subtitle1" gutterBottom>
                {contract.application.job.title}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Company: {contract.application.job.employer.company_name}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Candidate: {contract.application.candidate.user.full_name}
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 1 }}>
              <Chip
                icon={getStatusIcon(contract.status)}
                label={contract.status}
                color={getStatusColor(contract.status) as any}
              />
              <Typography variant="body2" color="text.secondary">
                Created: {new Date(contract.created_at).toLocaleDateString()}
              </Typography>
            </Box>
          </Box>

          <Box sx={{ display: 'flex', gap: 2 }}>
            <Button
              variant="outlined"
              startIcon={<Download />}
              onClick={handleDownload}
            >
              Download
            </Button>
            {user?.isEmployer && contract.status === 'draft' && (
              <Button
                variant="contained"
                color="primary"
                startIcon={<Send />}
                onClick={() => handleStatusChange('sent')}
                disabled={updating}
              >
                Send to Candidate
              </Button>
            )}
            {!user?.isEmployer && contract.status === 'sent' && (
              <Button
                variant="contained"
                color="primary"
                startIcon={<CheckCircle />}
                onClick={() => setShowSignDialog(true)}
                disabled={updating}
              >
                Sign Contract
              </Button>
            )}
          </Box>
        </Paper>

        {/* Contract Content */}
        <Paper elevation={3} sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>
            Contract Details
          </Typography>
          <Box
            sx={{
              mt: 2,
              p: 2,
              backgroundColor: 'grey.50',
              borderRadius: 1,
              whiteSpace: 'pre-wrap',
              fontFamily: 'monospace',
            }}
          >
            {contract.content}
          </Box>
        </Paper>

        {/* Sign Contract Dialog */}
        <Dialog
          open={showSignDialog}
          onClose={() => setShowSignDialog(false)}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle>Sign Contract</DialogTitle>
          <DialogContent>
            <DialogContentText>
              By signing this contract, you agree to all terms and conditions stated above.
              This action cannot be undone. Do you want to proceed?
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setShowSignDialog(false)}>Cancel</Button>
            <Button
              onClick={() => handleStatusChange('signed')}
              variant="contained"
              color="primary"
              disabled={updating}
            >
              {updating ? 'Signing...' : 'Sign Contract'}
            </Button>
          </DialogActions>
        </Dialog>
      </Container>
    </>
  );
};

export default ContractDetails; 