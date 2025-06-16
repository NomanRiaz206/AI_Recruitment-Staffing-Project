import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { RootState } from './store';

// Home component
import Home from './components/home/Home';

// Auth components
import Login from './components/auth/Login';
import Register from './components/auth/Register';

// Dashboard
import Dashboard from './components/dashboard/Dashboard';

// Job components
import JobList from './components/jobs/JobList';
import JobDetails from './components/jobs/JobDetails';
import JobForm from './components/jobs/JobForm';
import ManageJobs from './components/jobs/ManageJobs';

// Blog components
import BlogDetail from './components/blog_posts/BlogDetail';
import BlogForm from './components/blog_posts/BlogForm';


// Application components
import ApplicationList from './components/applications/ApplicationList';
import ApplicationDetails from './components/applications/ApplicationDetails';

// Contract components
import ContractList from './components/contracts/ContractList';
import ContractDetails from './components/contracts/ContractDetails';

// Profile components
import CandidateProfile from './components/profile/CandidateProfile';
import ManageBlogs from './components/blog_posts/ManageBlogs';
import JobApplications from './components/jobs/JobApplications';
import CandidateProfilePage from './components/profile/CandidateProfilePage';
import AdminDashboard from './components/dashboard/AdminDashboard';
import ManageUsers from './components/users/ManageUsers';
import UserDetail from './components/users/UserDetail';
import ManageContractTemplates from './components/contract_template/ManageContractTemplate';
import ContractTemplateForm from './components/contract_template/ContractTemplateForm';
import ContractTemplateDetail from './components/contract_template/ContractTemplateDetail';




// Protected route component
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const isAuthenticated = useSelector((state: RootState) => state.auth.isAuthenticated);
  return isAuthenticated ? <>{children}</> : <Navigate to="/login" />;
};

// Employer route component
const EmployerRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, isAuthenticated } = useSelector((state: RootState) => state.auth);
  if (!isAuthenticated) return <Navigate to="/login" />;
  if (!user?.isEmployer) return <Navigate to="/dashboard" />;
 
  return <>{children}</>;
};

// Admin route component
const AdminRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, isAuthenticated } = useSelector((state: RootState) => state.auth);
  if (!isAuthenticated) return <Navigate to="/login" />;
   if (!user) return null;
  if (!user?.isAdmin) return <Navigate to="/dashboard" />; // Redirect to dashboard if not admin
  return <>{children}</>;
};

// Create theme
const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
  },
  typography: {
    fontFamily: [
      '-apple-system',
      'BlinkMacSystemFont',
      '"Segoe UI"',
      'Roboto',
      '"Helvetica Neue"',
      'Arial',
      'sans-serif',
    ].join(','),
  },
});

function App() {
  const isAuthenticated = useSelector((state: RootState) => state.auth.isAuthenticated);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        
        <Routes>
          {/* Public routes */}
          <Route path="/" element={<Home />} />
          <Route path="/login" element={
            isAuthenticated ? <Navigate to="/dashboard" /> : <Login />
          } />
          <Route path="/register" element={
            isAuthenticated ? <Navigate to="/dashboard" /> : <Register />
          } />

          {/* Dashboard route */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />

          {/* Job routes */}
          <Route
            path="/jobs"
            element={
              <ProtectedRoute>
                <JobList />
              </ProtectedRoute>
            }
          />
          <Route
            path="/jobs/:id"
            element={
              <ProtectedRoute>
                <JobDetails />
              </ProtectedRoute>
            }
          />
          <Route
  path="/jobs/:jobId/applications"
  element={
    <EmployerRoute>
      <JobApplications />
    </EmployerRoute>
  }
/>
          <Route
            path="/jobs/create"
            element={
              <EmployerRoute>
                <JobForm mode="create" />
              </EmployerRoute>
            }
          />
          <Route
            path="/jobs/:id/edit"
            element={
              <EmployerRoute>
                <JobForm mode="edit" />
              </EmployerRoute>
            }
          />
          <Route
            path="/jobs/manage"
            element={
              <EmployerRoute>
                <ManageJobs/>
              </EmployerRoute>
            }
          />

          {/* Application routes */}
          <Route
            path="/applications"
            element={
              <ProtectedRoute>
                <ApplicationList />
              </ProtectedRoute>
            }
          />
          <Route
            path="/applications/:id"
            element={
              <ProtectedRoute>
                <ApplicationDetails />
              </ProtectedRoute>
            }
          />

          {/* Profile routes */}
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <CandidateProfile />
              </ProtectedRoute>
            }
          />
            <Route
  path="/candidates/:id"
  element={
    <ProtectedRoute>
      <CandidateProfilePage />
    </ProtectedRoute>
  }
/>
          {/* Contract routes */}
          <Route
            path="/contracts"
            element={
              <ProtectedRoute>
                <ContractList />
              </ProtectedRoute>
            }
          />
          <Route
            path="/contracts/:id"
            element={
              <ProtectedRoute>
                <ContractDetails />
              </ProtectedRoute>
            }
          />
           {/* Admin routes */}
          <Route path="/admin" element={<AdminRoute><AdminDashboard /></AdminRoute>} />
          <Route path="/blogs/manage" element={<AdminRoute><ManageBlogs /></AdminRoute>} />
          <Route path="/blogs/create"element={<AdminRoute><BlogForm mode="create" /></AdminRoute>}/>
          <Route path="/blogs/:id/edit"element={<AdminRoute><BlogForm mode="edit" /></AdminRoute>}/>
          <Route path="/blogs/:id"element={<AdminRoute><BlogDetail /></AdminRoute>}/>
             {/* Job routes */}
          <Route path="/adminjobs"element={<ProtectedRoute><JobList /></ProtectedRoute>}/>
          <Route path="/adminjobs/:id"element={<ProtectedRoute><JobDetails /></ProtectedRoute>}/>
          <Route path="/adminjobs/:jobId/applications"element={<AdminRoute><JobApplications /></AdminRoute>}/>
          <Route path="/adminjobs/create" element={<AdminRoute><JobForm mode="create" /></AdminRoute>}/>
          <Route path="/adminjobs/:id/edit"element={<AdminRoute><JobForm mode="edit" /></AdminRoute>}/>
          <Route path="/adminjobs/manage"element={<AdminRoute><ManageJobs/></AdminRoute>}/>
            {/* {Users routes} */}
            <Route path="/admin/manageusers"element={<AdminRoute><ManageUsers/></AdminRoute>}/>
             <Route path="/admin/users/:id"element={<AdminRoute><UserDetail/></AdminRoute>}/>

             {/* {ContractTemplate rotes} */}
              <Route path="/contractTemplate/manage"element={<AdminRoute><ManageContractTemplates/></AdminRoute>}/>
              <Route path="/contractTemplate/create"element={<AdminRoute><ContractTemplateForm mode="create"/></AdminRoute>}/>
              <Route path="/contractTemplate/:id/edit"element={<AdminRoute><ContractTemplateForm mode="edit"/></AdminRoute>}/>
              <Route path="/contractTemplate/:id"element={<AdminRoute><ContractTemplateDetail/></AdminRoute>}/>
          <Route
            path="*"
            element={
              isAuthenticated ? <Navigate to="/dashboard" replace /> : <Navigate to="/" replace />
            }
          />
        </Routes>
      </Router>
    </ThemeProvider>
  );
}

export default App;
