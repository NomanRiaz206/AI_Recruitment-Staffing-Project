
import React from 'react';
import { Box, Card, CardContent, Typography, Button, CardMedia, Stack } from '@mui/material';
import { useNavigate, useParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { blogs } from '../../services/api'; 
import Navbar from '../layout/Navbar';

const BlogDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [blog, setBlog] = useState<any>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchBlog = async () => {
      try {
        const blogData = await blogs.getById(Number(id));
        setBlog(blogData);
      } catch (error) {
        console.error('Failed to fetch blog', error);
      }
    };

    fetchBlog();
  }, [id]);

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this blog?')) return;
    try {
      await blogs.delete(Number(id));
        alert('Blog deleted successfully!');
      navigate('/blogs/manage');
    } catch (error) {
      console.error('Delete failed', error);
    }
  };

  if (!blog) return <Typography>Loading...</Typography>;

  return (
    <>
    <Navbar/>
    <Box display="flex" justifyContent="center" mt={5} px={2}>
      <Card sx={{ width: '100%', maxWidth: 900, boxShadow: 4, borderRadius: 4 }}>
        <CardContent>
          <Typography variant="h4" fontWeight="bold" gutterBottom>
            {blog.title}
          </Typography>

          {blog.image_url && (
            <CardMedia
              component="img"
              height="400"
              image={blog.image_url}
              alt="Blog image"
              sx={{ borderRadius: 2, mb: 3 }}
            />
          )}

          <Typography variant="body2" color="text.secondary" mb={2}>
            Published on: {new Date(blog.published_date || '').toLocaleDateString()}
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
            {blog.content}
          </Typography>

          <Stack direction="row" spacing={2} justifyContent="flex-end" mt={4}>
            {/* <Button
              variant="contained"
              onClick={() => navigate(`/blogs/${id}/edit`)}
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

export default BlogDetail;






