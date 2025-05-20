
import React, { useEffect, useState } from 'react';
import {
  Box,
  Button,
  Container,
  Grid,
  Typography,
  Card,
  CardMedia,
  CardContent,
  useTheme,
} from '@mui/material';
import {
  Work,
  Business,
  TrendingUp,
  Psychology,
  Speed,
  Security,
} from '@mui/icons-material';
// import PlaceholderImage from '/placeholder-blog.png';
import { useNavigate } from 'react-router-dom';
import { blogs } from '../../services/api'; 
import {jobs} from '../../services/api'

interface Blog {
  id: string;
  title: string;
  content: string;
  created_date: string;
  image_url?: string;
  published_date: string; 
}

interface Job {
  id: string;
  title: string;
  company_name: string;
  location: string;
  description?: string;
  created_at?: string;
}

const Home = () => {
  const theme = useTheme();
  const navigate = useNavigate();

  const [blogList, setBlogList] = useState<Blog[]>([]);
   const [jobList, setJobList] = useState<Job[]>([]);

  const features = [
    {
      icon: <Psychology sx={{ fontSize: 40 }} />,
      title: 'AI-Powered Matching',
      description: 'Smart algorithm matches candidates with the perfect job opportunities.',
    },
    {
      icon: <Speed sx={{ fontSize: 40 }} />,
      title: 'Quick Application',
      description: 'Streamlined process for applying to multiple positions effortlessly.',
    },
    {
      icon: <Security sx={{ fontSize: 40 }} />,
      title: 'Secure Platform',
      description: 'Advanced security measures to protect your data and privacy.',
    },
  ];

  useEffect(() => {
    const fetchBlogs = async () => {
      try {
        const res = await blogs.getAll(); 
        console.log('Fetched blogs:', res); 
        console.log(blogs);
        const sorted = res
          .filter((blog: Blog) => blog.created_date) // Only include blogs with a date
          .sort((a: Blog, b: Blog) => new Date(b.created_date).getTime() - new Date(a.created_date).getTime());
        setBlogList(sorted);
      } catch (error) {
        console.error('Failed to fetch blogs:', error);
      }
    };

       const fetchJobs = async () => {
      try {
        const res = await jobs.getAllJobs();
        console.log('fetched jobs', res)
        const sortedJobs = res.sort(
          (a: Job, b: Job) =>
            new Date(b.created_at || '').getTime() - new Date(a.created_at || '').getTime()
        );
        setJobList(sortedJobs);
      } catch (error) {
        console.error('Failed to fetch jobs:', error);
      }
    };

    

    fetchBlogs();
    fetchJobs();
  }, []);
  
  useEffect(() => {
    console.log('Blog List:', blogList);
  }, [blogList]);
  return (
    <Box>
      {/* Hero Section */}
      <Box
        sx={{
          bgcolor: 'primary.main',
          color: 'white',
          py: 8,
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <Container maxWidth="lg">
          <Grid container spacing={4} alignItems="center">
            <Grid item xs={12} md={6}>
              <Typography variant="h2" component="h1" gutterBottom>
                AI-Powered Recruitment Platform
              </Typography>
              <Typography variant="h5" paragraph>
                Find your dream job or perfect candidate using advanced AI matching technology.
              </Typography>
              <Box sx={{ mt: 4, display: 'flex', gap: 2 }}>
                <Button
                  variant="contained"
                  size="large"
                  color="secondary"
                  onClick={() => navigate('/register')}
                  startIcon={<Work />}
                >
                  Get Started
                </Button>
                <Button
                  variant="outlined"
                  size="large"
                  sx={{ color: 'white', borderColor: 'white' }}
                  onClick={() => navigate('/login')}
                >
                  Sign In
                </Button>
              </Box>
            </Grid>
            <Grid item xs={12} md={6}>
              <Box
                component="img"
                src="/recruitment-hero.svg"
                alt="Recruitment"
                sx={{
                  width: '100%',
                  maxWidth: 500,
                  height: 'auto',
                  display: 'block',
                  margin: 'auto',
                }}
              />
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* Features Section */}
      <Container maxWidth="lg" sx={{ py: 8 }}>
        <Typography variant="h3" component="h2" align="center" gutterBottom>
          Why Choose Us?
        </Typography>
        <Grid container spacing={4} sx={{ mt: 4 }}>
          {features.map((feature, index) => (
            <Grid item xs={12} md={4} key={index}>
              <Card
                sx={{
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  textAlign: 'center',
                  p: 2,
                }}
              >
                <Box sx={{ color: 'primary.main', mb: 2 }}>
                  {feature.icon}
                </Box>
                <CardContent>
                  <Typography variant="h5" component="h3" gutterBottom>
                    {feature.title}
                  </Typography>
                  <Typography variant="body1" color="text.secondary">
                    {feature.description}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Container>

      {/* Call to Action Section */}
      <Box sx={{ bgcolor: 'grey.100', py: 8 }}>
        <Container maxWidth="lg">
          <Grid container spacing={4} alignItems="center">
            <Grid item xs={12} md={6}>
              <Typography variant="h4" component="h2" gutterBottom>
                For Employers
              </Typography>
              <Typography variant="body1" paragraph>
                Find the perfect candidates using our AI-powered matching system. Post jobs, review applications, and manage your recruitment process efficiently.
              </Typography>
              <Button
                variant="contained"
                size="large"
                startIcon={<Business />}
                onClick={() => navigate('/register')}
              >
                Post a Job
              </Button>
            </Grid>
            <Grid item xs={12} md={6}>
              <Typography variant="h4" component="h2" gutterBottom>
                For Job Seekers
              </Typography>
              <Typography variant="body1" paragraph>
                Discover opportunities that match your skills and experience. Apply with confidence using our smart application system.
              </Typography>
              <Button
                variant="contained"
                size="large"
                startIcon={<TrendingUp />}
                onClick={() => navigate('/register')}
              >
                Find Jobs
              </Button>
            </Grid>
          </Grid>
        </Container>
      </Box>

    {/* Jobs Section */}
      <Container maxWidth="lg" sx={{ py: 8 }}>
        <Typography variant="h3" component="h2" align="center" gutterBottom>
          Latest Job Openings
        </Typography>
        <Grid container spacing={4} mt={4}>
          {jobList.length > 0 ? (
            jobList.map((job) => (
              <Grid item xs={12} sm={6} md={4} key={job.id}>
                <Card
                  sx={{
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    borderRadius: 1,
                    boxShadow: 4,
                    transition: 'transform 0.3s ease, box-shadow 0.3s ease',
                    '&:hover': {
                      transform: 'translateY(-5px)',
                      boxShadow: 10,
                    },
                  }}
                >
                  <CardContent>
                    <Typography variant="h6" fontWeight="bold" gutterBottom noWrap>
                      {job.title}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {job.company_name} - {job.location}
                    </Typography>
                    {job.description && (
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{
                          display: '-webkit-box',
                          WebkitLineClamp: 3,
                          WebkitBoxOrient: 'vertical',
                          overflow: 'hidden',
                          minHeight: '60px',
                          mt: 1,
                        }}
                      >
                        {job.description}
                      </Typography>
                    )}
                    <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                      Posted on {new Date(job.created_at || '').toLocaleDateString()}
                    </Typography>
                    <Button
                      size="small"
                      variant="outlined"
                      sx={{ mt: 2 }}
                      onClick={() => navigate(`/jobs/${job.id}`)}
                    >
                      View Details →
                    </Button>
                  </CardContent>
                </Card>
              </Grid>
            ))
          ) : (
            <Typography variant="body1" align="center" sx={{ width: '100%', mt: 4 }}>
              No job openings available yet.
            </Typography>
          )}
        </Grid>
      </Container>

      {/* Blog Section */}
    <Container maxWidth="lg" sx={{ py: 8 }}>
  <Typography variant="h3" component="h2" align="center" gutterBottom>
    Latest Blogs
  </Typography>
  <Grid container spacing={4} mt={4}>
    {blogList.length > 0 ? (
      blogList.map((blog) => (
        <Grid item xs={12} sm={6} md={4} key={blog.id}>
          <Card
            sx={{
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              borderRadius: 1,
              boxShadow: 5,
              transition: 'transform 0.3s ease, box-shadow 0.3s ease',
              '&:hover': {
                transform: 'translateY(-5px)',
                boxShadow: 10,
              },
            }}
          >
            {blog.image_url && (
              <CardMedia
                component="img"
                height="180"
                image={blog.image_url}
                alt={blog.title}
                sx={{ objectFit: 'cover' }}
              />
            )}
            <CardContent sx={{ flexGrow: 1 }}>
              <Typography variant="h6" fontWeight="bold" gutterBottom noWrap>
                {blog.title}
              </Typography>
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{
                  display: '-webkit-box',
                  WebkitLineClamp: 3,
                  WebkitBoxOrient: 'vertical',
                  overflow: 'hidden',
                  minHeight: '60px',

                }}
              >
                {blog.content}
              </Typography>
              <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                Published on {new Date(blog.created_date).toLocaleDateString()}
              </Typography>
              <Button
                size="small"
                variant="outlined"
                sx={{ mt: 2 }}
                onClick={() => navigate(`/blogs/${blog.id}`)}
              >
                Read More →
              </Button>
            </CardContent>
          </Card>
        </Grid>
      ))
    ) : (
      <Typography variant="body1" align="center" sx={{ width: '100%', mt: 4 }}>
        No blogs available yet.
      </Typography>
    )}
  </Grid>
</Container>

      {/* Footer */}
      <Box sx={{ bgcolor: 'grey.900', color: 'white', py: 4 }}>
        <Container maxWidth="lg">
          <Typography variant="body2" align="center">
            © {new Date().getFullYear()} AI Recruitment Platform. All rights reserved.
          </Typography>
        </Container>
      </Box>
    </Box>
  );
};

export default Home;
