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
import { Edit, Title as TitleIcon, AutoFixHigh, Image } from '@mui/icons-material';
import { blogs } from '../../services/api'; // adjust path
import { useNavigate, useParams } from 'react-router-dom';
import Navbar from '../layout/Navbar';

type BlogFormProps = {
    mode: 'create' | 'edit';
  };
const BlogForm: React.FC<BlogFormProps> = ({mode}) => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [image_url, setImageUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const navigate = useNavigate();
  const { id } = useParams(); // If present, this is Edit Mode
  const isEditMode = Boolean(id);

  // Fetch existing blog data in edit mode
  useEffect(() => {
    const fetchBlog = async () => {
      try {
        const data = await blogs.getById(Number(id));
        setTitle(data.title);
        setContent(data.content);
        setImageUrl(data.image_url);
      } catch (error) {
        console.error("Failed to fetch blog:", error);
      }
    };

    if (isEditMode) {
      fetchBlog();
    }
  }, [mode, id]);

  const handleGenerate = async () => {
    if (!title) return;
    setLoading(true);
    try {
      const generatedContent = await blogs.generateContent(title);
      setContent(generatedContent || '');
    } catch (error) {
      console.error('Content generation failed', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      if (isEditMode) {
        await blogs.update(Number(id), { title, content, image_url });
        setSuccessMsg('Blog post updated successfully!');
      } else {
        await blogs.create({ title, content, image_url});
        setSuccessMsg('Blog post created successfully!');
      }

      setTimeout(() => navigate('/blogs/manage'), 2000); // Redirect to home
    } catch (error) {
      console.error('Blog submit failed:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
    <Navbar/>
    <Box display="flex" justifyContent="center" mt={5}>
      <Card sx={{ width: '100%', maxWidth: 700, boxShadow: 4, borderRadius: 4 }}>
        <CardContent>
          <Typography variant="h4" gutterBottom fontWeight="bold">
            {isEditMode ? '✏️ Edit Blog Post' : '📝 Create a New Blog Post'}
          </Typography>

          <TextField
            label="Blog Title"
            placeholder="Enter your blog title..."
            fullWidth
            margin="normal"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <TitleIcon />
                </InputAdornment>
              ),
            }}
          />

          <TextField
            label="Image URL"
            placeholder="Paste an image URL here..."
            fullWidth
            margin="normal"
            value={image_url}
            onChange={(e) => setImageUrl(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Image />
                </InputAdornment>
              ),
            }}
          />

          <Button
            variant="outlined"
            color="secondary"
            startIcon={<AutoFixHigh />}
            onClick={handleGenerate}
            disabled={!title || loading}
            sx={{ mb: 2 }}
          >
            {loading ? <CircularProgress size={24} /> : 'Generate Content'}
          </Button>

          <TextField
            label="Blog Content"
            placeholder="AI-generated content will appear here..."
            fullWidth
            margin="normal"
            multiline
            rows={10}
            value={content}
            onChange={(e) => setContent(e.target.value)}
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
            disabled={!title || !content || isSubmitting}
            sx={{ mt: 2, py: 1.5 }}
          >
            {isEditMode ? 'Update Blog Post' : 'Publish Blog Post'}
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

export default BlogForm;
