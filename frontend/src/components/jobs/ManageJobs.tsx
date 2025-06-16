
// import React, { useEffect, useState } from 'react';
// import { Box, Button, Card, Container, Grid, Typography } from '@mui/material';
// import { useNavigate } from 'react-router-dom';
// import { jobs } from '../../services/api';
// import Navbar from '../layout/Navbar';

// interface Job {
//   id: number;
//   title: string;
//   description: string;
//   requirements: string[]; // Ensure this is always an array
//   location: string;
//   salary_range: {
//     min: number;
//     max: number;
//     currency: string;
//   };
//   created_at: string;
//   is_active: boolean;
// }

// const ManageJobs: React.FC = () => {
//   const navigate = useNavigate();
//   const [jobList, setJobList] = useState<Job[]>([]);
 
//   // Get current employer ID
//   const storedUser = localStorage.getItem("user");
// const currentEmployerId = storedUser ? JSON.parse(storedUser)?.id : null;

// useEffect(() => {
//   const fetchJobs = async () => {
//     try {
//       console.log('User ID:', currentEmployerId);
//       const storedUser = localStorage.getItem("user");
//       const user = storedUser ? JSON.parse(storedUser) : null;

//       if (!user) return;

//       let res: any[] = [];

//       if (user.isAdmin) {
//           console.log("user role,", user.role);
//         console.log("Fetching all jobs (admin)");

//         res = await jobs.getAllJobs();
//         console.log('Admin jobs:', res);
//       } else if (user.isEmployer) {
//         console.log("Fetching employer jobs");
//         res = await jobs.getEmployerJobs(Number(user.id));
//       } else {
//         console.warn("Unsupported user role");
//         return;
//       }

//       console.log('Raw response:', res);

//       const normalized = res.map((job: any) => ({
//         ...job,
//         requirements: Array.isArray(job.requirements)
//           ? job.requirements
//           : typeof job.requirements === 'string'
//           ? JSON.parse(job.requirements)
//           : [],
//       }));

//       const sorted = normalized
//         .filter((job: Job) => job.created_at)
//         .sort(
//           (a: Job, b: Job) =>
//             new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
//         );

//       setJobList(sorted);
//     } catch (error) {
//       console.error('Failed to fetch jobs:', error);
//     }
//   };

//   fetchJobs();
// }, []);

//   const handleView = (id: number) => {
//     navigate(`/jobs/${id}`);
//   };

//   // const handleEdit = (id: number) => {
//   //   navigate(`/jobs/${id}/edit`);
//   // };
//   const handleEdit = (id: number) => {
//   const jobToEdit = jobList.find((job) => job.id === id);
//   if (jobToEdit && (jobToEdit.created_by === currentEmployerId || storedUser?.isAdmin)) {
//     navigate(`/jobs/${id}/edit`);
//   } else {
//     console.warn('You are not authorized to edit this job');
//   }
// };

//   // const handleDelete = async (id: number) => {
//   //   try {
//   //     await jobs.delete(id);
//   //     setJobList(jobList.filter((job) => job.id !== id));
//   //     console.log(`Job with ID ${id} deleted`);
//   //   } catch (error) {
//   //     console.error('Error deleting job:', error);
//   //   }
//   // };
//    const handleDelete = async (id: number) => {
//     try {
//       // Only allow delete if the user is the creator of the job or is an admin
//       const jobToDelete = jobList.find((job) => job.id === id);
//       if (jobToDelete && (jobToDelete.created_by === currentEmployerId || storedUser?.isAdmin)) {
//         await jobs.delete(id);
//         setJobList(jobList.filter((job) => job.id !== id));
//         console.log(`Job with ID ${id} deleted`);
//       } else {
//         console.warn('You are not authorized to delete this job');
//       }
//     } catch (error) {
//       console.error('Error deleting job:', error);
//     }
//   };

  

//   return (
//     <>
//     <Navbar/>
//     <Container maxWidth="lg" sx={{ py: 8 }}>
//       <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
//         <Typography variant="h4" component="h2">
//           Manage Jobs
//         </Typography>
//         <Button variant="contained" color="primary" onClick={() => navigate('/jobs/create')}>
//           + Post New Job
//         </Button>
//       </Box>

//       <Grid container spacing={3}>
//         {jobList.length > 0 ? (
//           jobList.map((job) => (
//             <Grid item xs={12} key={job.id}>
//               <Card
//                 sx={{
//                   display: 'flex',
//                   alignItems: 'center',
//                   borderRadius: 2,
//                   boxShadow: 4,
//                   p: 2,
//                   transition: 'transform 0.3s ease, box-shadow 0.3s ease',
//                   '&:hover': {
//                     transform: 'translateY(-3px)',
//                     boxShadow: 8,
//                   },
//                 }}
//               >
//                 <Box flexGrow={1}>
//                   <Typography variant="h6" fontWeight="bold" gutterBottom>
//                     {job.title}
//                   </Typography>
//                   <Typography
//                     variant="body2"
//                     color="text.secondary"
//                     sx={{
//                       display: '-webkit-box',
//                       WebkitLineClamp: 2,
//                       WebkitBoxOrient: 'vertical',
//                       overflow: 'hidden',
//                     }}
//                   >
//                     {job.description}
//                   </Typography>
//                   <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
//   <Typography variant="body2" color="text.secondary">
//     Posted on: {new Date(job.created_at).toLocaleDateString()}
//   </Typography>
//   <Button
//                          size="small"
//                          onClick={() => navigate(`/jobs/${job.id}/applications`)}
//                        >
//                          Applications: {jobApplicationsCount[job.id] || 0}
//                        </Button>
// </Box>

//                 </Box>
//                 <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, ml: 2 }}>
//                   <Button variant="outlined" size="small" onClick={() => handleView(job.id)}>
//                     View
//                   </Button>
//                   <Button
//                     variant="contained"
//                     size="small"
//                     sx={{
//                       backgroundColor: '#facc15',
//                       color: '#000',
//                       '&:hover': { backgroundColor: '#eab308' },
//                     }}
//                     onClick={() => handleEdit(job.id)}
//                   >
//                     Edit
//                   </Button>
//                   <Button
//                     variant="contained"
//                     size="small"
//                     sx={{
//                       backgroundColor: '#ef4444',
//                       color: '#fff',
//                       '&:hover': { backgroundColor: '#dc2626' },
//                     }}
//                     onClick={() => handleDelete(job.id)}
//                   >
//                     Delete
//                   </Button>
//                 </Box>
//               </Card>
//             </Grid>
//           ))
//         ) : (
//           <Typography variant="body1" align="center" sx={{ width: '100%', mt: 4 }}>
//             No jobs posted yet.
//           </Typography>
//         )}
//       </Grid>
//     </Container>
//     </>
//   );
// };

// export default ManageJobs;

import React, { useEffect, useState } from 'react';
import { Box, Button, Card, Container, Grid, Typography } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { jobs, applications } from '../../services/api'; // ← Import applications API
import Navbar from '../layout/Navbar';

interface Job {
  id: number;
  title: string;
  description: string;
  requirements: string[];
  location: string;
  salary_range: {
    min: number;
    max: number;
    currency: string;
  };
  created_at: string;
  is_active: boolean;
  created_by?: number; 
}

interface Application {
  id: number;
  job_id: number;
  
}

const ManageJobs: React.FC = () => {
  const navigate = useNavigate();
  const [jobList, setJobList] = useState<Job[]>([]);
  const [jobApplicationsCount, setJobApplicationsCount] = useState<{ [key: number]: number }>({});
  const [recentApplications, setRecentApplications] = useState<Application[]>([]);

  const storedUser = localStorage.getItem("user");
    const user = storedUser ? JSON.parse(storedUser) : null;
  const currentEmployerId = user?.id || null;
  const isAdmin = user?.id || false;

  // Function to fetch application counts
  const fetchApplicationCounts = async (jobsData: Job[]) => {
    const applicationsCount: { [key: number]: number } = {};
    let allApplications: Application[] = [];

    for (const job of jobsData) {
      const apps = await applications.getJobApplications(job.id);
      applicationsCount[job.id] = apps.length;
      allApplications = [...allApplications, ...apps];
    }

    setJobApplicationsCount(applicationsCount);
    setRecentApplications(allApplications);
  };

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        const storedUser = localStorage.getItem("user");
        const user = storedUser ? JSON.parse(storedUser) : null;

        if (!user) return;

        let res: any[] = [];

        if (user.isAdmin) {
          res = await jobs.getAllJobs();
        } else if (user.isEmployer) {
          res = await jobs.getEmployerJobs(Number(user.id));
        } else {
          return;
        }

        const normalized = res.map((job: any) => ({
          ...job,
          requirements: Array.isArray(job.requirements)
            ? job.requirements
            : typeof job.requirements === 'string'
            ? JSON.parse(job.requirements)
            : [],
        }));

        const sorted = normalized
          .filter((job: Job) => job.created_at)
          .sort(
            (a: Job, b: Job) =>
              new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
          );

        setJobList(sorted);
        fetchApplicationCounts(sorted); // ← Fetch application counts here
      } catch (error) {
        console.error('Failed to fetch jobs:', error);
      }
    };

    fetchJobs();
  }, []);

  const handleView = (id: number) => {
    navigate(`/jobs/${id}`);
  };

  const handleEdit = (id: number) => {
    const jobToEdit = jobList.find((job) => job.id === id);
    if (jobToEdit && (jobToEdit.created_by === currentEmployerId || isAdmin)) {
      navigate(`/jobs/${id}/edit`);
    } else {
      console.warn('You are not authorized to edit this job');
    }
  };

  const handleDelete = async (id: number) => {
    try {
      const jobToDelete = jobList.find((job) => job.id === id);
      if (jobToDelete && (jobToDelete.created_by === currentEmployerId || isAdmin)) {
        await jobs.delete(id);
        setJobList(jobList.filter((job) => job.id !== id));
        console.log(`Job with ID ${id} deleted`);
      } else {
        console.warn('You are not authorized to delete this job');
      }
    } catch (error) {
      console.error('Error deleting job:', error);
    }
  };

  return (
    <>
      <Navbar />
      <Container maxWidth="lg" sx={{ py: 8 }}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
          <Typography variant="h4" component="h2">
            Manage Jobs
          </Typography>
          <Button variant="contained" color="primary" onClick={() => navigate('/jobs/create')}>
            + Post New Job
          </Button>
        </Box>

        <Grid container spacing={3}>
          {jobList.length > 0 ? (
            jobList.map((job) => (
              <Grid item xs={12} key={job.id}>
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
                      {job.title}
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
                      {job.description}
                    </Typography>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Typography variant="body2" color="text.secondary">
                        Posted on: {new Date(job.created_at).toLocaleDateString()}
                      </Typography>
                    <Button
  size="small"
  onClick={() =>
    navigate(
      isAdmin
        ? `/adminjobs/${job.id}/applications`
        : `/jobs/${job.id}/applications`)
  }
>
  Applications: {jobApplicationsCount[job.id] || 0}
</Button>
                    </Box>
                  </Box>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, ml: 2 }}>
                    <Button variant="outlined" size="small" onClick={() => handleView(job.id)}>
                      View
                    </Button>
                    <Button
                      variant="contained"
                      size="small"
                      sx={{
                        backgroundColor: '#facc15',
                        color: '#000',
                        '&:hover': { backgroundColor: '#eab308' },
                      }}
                      onClick={() => handleEdit(job.id)}
                    >
                      Edit
                    </Button>
                    <Button
                      variant="contained"
                      size="small"
                      sx={{
                        backgroundColor: '#ef4444',
                        color: '#fff',
                        '&:hover': { backgroundColor: '#dc2626' },
                      }}
                      onClick={() => handleDelete(job.id)}
                    >
                      Delete
                    </Button>
                  </Box>
                </Card>
              </Grid>
            ))
          ) : (
            <Typography variant="body1" align="center" sx={{ width: '100%', mt: 4 }}>
              No jobs posted yet.
            </Typography>
          )}
        </Grid>
      </Container>
    </>
  );
};

export default ManageJobs;
