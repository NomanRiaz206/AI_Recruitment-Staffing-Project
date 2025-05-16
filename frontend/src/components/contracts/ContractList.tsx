import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import {
  Container,
  Paper,
  Typography,
  Box,
  Grid,
  CircularProgress,
  Alert,
  Chip,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  TextField,
  Card,
  CardContent,
  CardActions,
  Button,
} from '@mui/material';
import {
  FilterList,
  Sort,
  Search,
  Description,
  CheckCircle,
  Send,
  Edit,
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
      };
    };
  };
}

const ContractList = () => {
  const navigate = useNavigate();
  const { user } = useSelector((state: RootState) => state.auth);
  
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortBy, setSortBy] = useState('date');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchContracts = async () => {
      try {
        // TODO: Implement fetch contracts list
        setLoading(false);
      } catch (error) {
        console.error('Error fetching contracts:', error);
        setError('Failed to load contracts.');
        setLoading(false);
      }
    };

    fetchContracts();
  }, [user]);

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

  const filteredContracts = contracts
    .filter(contract => {
      if (statusFilter !== 'all' && contract.status !== statusFilter) return false;
      
      const searchString = user?.isEmployer
        ? `${contract.application.candidate.user.full_name} ${contract.application.job.title}`
        : `${contract.application.job.employer.company_name} ${contract.application.job.title}`;
      
      return searchString.toLowerCase().includes(searchTerm.toLowerCase());
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'date':
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        case 'status':
          return a.status.localeCompare(b.status);
        default:
          return 0;
      }
    });

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
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <Typography variant="h4" gutterBottom>
          Contracts
        </Typography>

        {/* Filters and Search */}
        <Paper elevation={3} sx={{ p: 2, mb: 3 }}>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                size="small"
                label="Search"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                InputProps={{
                  startAdornment: <Search sx={{ color: 'action.active', mr: 1 }} />,
                }}
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <FormControl fullWidth size="small">
                <InputLabel id="status-filter-label">Status</InputLabel>
                <Select
                  labelId="status-filter-label"
                  value={statusFilter}
                  label="Status"
                  onChange={(e) => setStatusFilter(e.target.value)}
                  startAdornment={<FilterList sx={{ color: 'action.active', mr: 1 }} />}
                >
                  <MenuItem value="all">All Status</MenuItem>
                  <MenuItem value="draft">Draft</MenuItem>
                  <MenuItem value="sent">Sent</MenuItem>
                  <MenuItem value="signed">Signed</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={4}>
              <FormControl fullWidth size="small">
                <InputLabel id="sort-by-label">Sort By</InputLabel>
                <Select
                  labelId="sort-by-label"
                  value={sortBy}
                  label="Sort By"
                  onChange={(e) => setSortBy(e.target.value)}
                  startAdornment={<Sort sx={{ color: 'action.active', mr: 1 }} />}
                >
                  <MenuItem value="date">Date</MenuItem>
                  <MenuItem value="status">Status</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </Paper>

        {/* Contracts List */}
        <Grid container spacing={3}>
          {filteredContracts.map((contract) => (
            <Grid item xs={12} key={contract.id}>
              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <Box>
                      <Typography variant="h6" gutterBottom>
                        {contract.application.job.title}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" gutterBottom>
                        {user?.isEmployer ? (
                          <>Candidate: {contract.application.candidate.user.full_name}</>
                        ) : (
                          <>Company: {contract.application.job.employer.company_name}</>
                        )}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Created: {new Date(contract.created_at).toLocaleDateString()}
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 1 }}>
                      <Chip
                        icon={getStatusIcon(contract.status)}
                        label={contract.status}
                        color={getStatusColor(contract.status) as any}
                        size="small"
                      />
                    </Box>
                  </Box>
                </CardContent>
                <CardActions>
                  <Button
                    size="small"
                    startIcon={<Description />}
                    onClick={() => navigate(`/contracts/${contract.id}`)}
                  >
                    View Contract
                  </Button>
                </CardActions>
              </Card>
            </Grid>
          ))}
          
          {filteredContracts.length === 0 && (
            <Grid item xs={12}>
              <Paper sx={{ p: 3, textAlign: 'center' }}>
                <Typography variant="body1" color="text.secondary">
                  No contracts found
                </Typography>
              </Paper>
            </Grid>
          )}
        </Grid>
      </Container>
    </>
  );
};

export default ContractList; 