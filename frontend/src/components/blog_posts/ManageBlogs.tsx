
import React, { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Card,
  CardMedia,
  CardContent,
  Typography,
  Button,
  Container,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { blogs } from '../../services/api'; // Import your blogs service (if you have one)
import Navbar from '../layout/Navbar';

interface Blog {
  id: string;
  title: string;
  content: string;
  created_date: string;
  image_url?: string;
  published_date: string;
}

const ManageBlogs: React.FC = () => {
  const navigate = useNavigate();
  const [blogList, setBlogList] = useState<Blog[]>([]);

  // Fetch blogs on component mount
  useEffect(() => {
    const fetchBlogs = async () => {
      try {
        const res = await blogs.getAll(); // Adjust if you have a different API service
        console.log('Fetched blogs:', res);
        
        const sorted = res
          .filter((blog: Blog) => blog.created_date) // Only include blogs with a date
          .sort((a: Blog, b: Blog) => new Date(b.created_date).getTime() - new Date(a.created_date).getTime());
        
        setBlogList(sorted); // Set the blog list state
      } catch (error) {
        console.error('Failed to fetch blogs:', error);
      }
    };

    fetchBlogs();
  }, []); // Empty dependency array so it runs on mount

  // Handle the click event for the "View" button
  const handleView = (id: string) => {
    navigate(`/blogs/${id}`); // Navigate to the individual blog post
  };

  // Handle the click event for the "Edit" button
  const handleEdit = (id: string) => {
    navigate(`/blogs/${id}/edit`); // Navigate to the edit page
  };

  // Handle the click event for the "Delete" button
  const handleDelete = async (id: string) => {
    try {
      await blogs.delete(Number (id)); // Call delete API or service
      setBlogList(blogList.filter(blog => blog.id !== id)); // Remove blog from list after successful delete
      console.log(`Blog with ID ${id} deleted`);
    } catch (error) {
      console.error('Error deleting blog:', error);
    }
  };

  return (
    <>
    <Navbar/>
    <Container maxWidth="lg" sx={{ py: 8 }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
        <Typography variant="h4" component="h2">
          Manage Blog Posts
        </Typography>
        <Button variant="contained" color="primary" onClick={() => navigate('/blogs/create')}>
          + Create New Blog
        </Button>
      </Box>

      <Grid container spacing={3}>
  {blogList.length > 0 ? (
    blogList.map((blog) => (
      <Grid item xs={12} key={blog.id}>
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
          {blog.image_url && (
            <CardMedia
              component="img"
              image={blog.image_url}
              alt={blog.title}
              sx={{
                width: 180,
                height: 120,
                borderRadius: 2,
                objectFit: 'cover',
                mr: 2,
              }}
            />
          )}
          <Box flexGrow={1}>
            <Typography variant="h6" fontWeight="bold" gutterBottom>
              {blog.title}
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
              {blog.content}
            </Typography>
            <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
              Published on {new Date(blog.created_date).toLocaleDateString()}
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, ml: 2 }}>
            <Button variant="outlined" size="small" onClick={() => handleView(blog.id)}>
              View
            </Button>
            <Button variant="contained" size="small" 
            sx={{ backgroundColor: '#facc15', color: '#000', '&:hover': { backgroundColor: '#eab308' } }} onClick={() => handleEdit(blog.id)}>
              Edit
            </Button>
            <Button variant="contained" size="small"
             sx={{ backgroundColor: '#ef4444', color: '#fff', '&:hover': { backgroundColor: '#dc2626' } }} onClick={() => handleDelete(blog.id)}>
              Delete
            </Button>
          </Box>
        </Card>
      </Grid>
    ))
  ) : (
    <Typography variant="body1" align="center" sx={{ width: '100%', mt: 4 }}>
      No blog posts found.
    </Typography>
  )}
</Grid>

    </Container>
    </>
  );
};

export default ManageBlogs;
