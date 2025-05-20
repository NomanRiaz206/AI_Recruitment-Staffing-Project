
import axios from 'axios';
import { title } from 'process';

const API_URL = 'http://localhost:8000/api/v1';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests if it exists
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Helper function to format error messages
const formatErrorMessage = (error: any): string => {
  if (typeof error === 'string') return error;
  if (Array.isArray(error)) {
    return error.map(err => {
      if (err.loc && err.loc[1] === 'username') {
        return 'Email is required';
      }
      return err.msg || err.message;
    }).join(', ');
  }
  if (error.msg || error.message) return error.msg || error.message;
  return 'An unexpected error occurred';
};

export const auth = {
  login: async (email: string, password: string) => {
    try {
      // Create URLSearchParams for proper form encoding
      const formData = new URLSearchParams();
      formData.append('username', email);
      formData.append('password', password);

      const response = await api.post('/auth/login', formData.toString(), {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      });

      if (response.data.access_token) {
        localStorage.setItem('token', response.data.access_token);
      }
      // Transform snake_case to camelCase
      const user = {
        id: response.data.user.id,
        email: response.data.user.email,
        fullName: response.data.user.full_name,
        isEmployer: response.data.user.is_employer,
        isAdmin: response.data.user.is_admin,
        isActive: response.data.user.is_active
      };
       console.log('Login response:', user);
      return {
        access_token: response.data.access_token,
        token_type: response.data.token_type,
        user
      };
      
    } catch (error: any) {
      console.error('Login error details:', error.response?.data);
      if (error.response?.data?.detail) {
        throw new Error(formatErrorMessage(error.response.data.detail));
      }
      throw error;
    }
  },

  register: async (data: {
    email: string;
    password: string;
    fullName: string;
    isEmployer: boolean;
  }) => {
    try {
      const response = await api.post('/auth/register', {
        email: data.email,
        password: data.password,
        full_name: data.fullName,
        is_employer: data.isEmployer
      });
      return response.data;
    } catch (error: any) {
      if (error.response?.data?.detail) {
        throw new Error(formatErrorMessage(error.response.data.detail));
      }
      throw error;
    }
  },

  logout: () => {
    localStorage.removeItem('token');
  },
};

export interface Education {
  institution: string;
  degree: string;
  field: string;
  year: number;
}

export interface Experience {
  company: string;
  position: string;
  duration: string;
  description: string;
}

export interface CandidateProfile {
  id: number;
  user_id: number;
  bio: string;
  skills: string[];
  experience: Experience[];
  education: Education[];
}

export interface CreateCandidateProfile {
  user_id: number;
  bio: string;
  skills: string[];
  experience: Experience[];
  education: Education[];
}

export const candidates = {
  // createProfile: async (data: CreateCandidateProfile): Promise<CandidateProfile> => {
  //   const response = await api.post('/candidates/', data);
  //   return response.data;
  // },
  createProfile: async (data: CreateCandidateProfile): Promise<CandidateProfile | null> => {
    // Retrieve user information from localStorage (or state)
    const user = JSON.parse(localStorage.getItem('user') || '{}'); 
    // Check if the user is an admin or employer
    if (user.isAdmin || user.isEmployer) {
      console.log('Access denied: Admins and employers cannot create candidate profiles.');
      return null; 
    }
    try {
      const response = await api.post('/candidates/', data);
      return response.data;
    } catch (error) {
      console.error('Error creating profile:', error);
      throw error;
    }
  },



  getMyProfile: async (): Promise<CandidateProfile> => {
    const response = await api.get('/candidates/me');
    return response.data;
  },

  generateBio: async (): Promise<{ bio: string }> => {
    const response = await api.post('/candidates/generate-bio');
    return response.data;
  },

  getMatches: async (candidateId: number, jobId: number) => {
    const response = await api.get(`/candidates/${candidateId}/match/${jobId}`);
    return response.data;
  },
};

export const jobs = {
  create: async (data: any) => {
    const response = await api.post('/jobs', data);
    return response.data;
  },

  generateDescription: async (data: {
    title: string;
    requirements: string[];
    company_info: string;
  }) => {
    const response = await api.post('/jobs/generate-description', data);
    return response.data;
  },

  getAll: async () => {
    const response = await api.get('/jobs');
    return response.data;
  },

  getById: async (id: number) => {
    const response = await api.get(`/jobs/${id}`);
    return response.data;
  },

  getEmployerJobs: async (employerId: number) => {
    const response = await api.get(`/jobs/employer/${employerId}`);
    return response.data;
  },
   getAllJobs: async () => {
    const response = await api.get("/jobs/all");
    return response.data;
  },

  update: async (id: number, data: any) => {
    const response = await api.put(`/jobs/update/${id}`, data);
    return response.data;
  },

  delete: async (id: number) => {
    const response = await api.delete(`/jobs/${id}`);
    return response.data;
  },
};



export const applications = {
  create: async (jobId: number) => {
    const response = await api.post('/applications', { job_id: jobId });
    return response.data;
  },

  fetchApplications: async () => {
    const response = await api.get('/applications');
    return response.data;
  },
  getById: async (id: number) => {
    const response = await api.get(`/applications/${id}`);
    return response.data;
  },

  getCandidateApplications: async () => {
    const response = await api.get('/applications/candidate');
    return response.data;
  },
  getEmployerApplications: async () => {
    const response = await api.get(`/applications/employer`);
    return response.data;
  },
  getJobApplications: async (jobId: number) => {
    const response = await api.get(`/applications/employer/${jobId}`);
    return response.data;
  },
  
  updateStatus: async (applicationId: number, status: string) => {
    const response = await api.post(`/applications/${applicationId}/status`, {status: status });
    return response.data;
  },

  getAllApplications: async () => {
    const response = await api.get('/applications/all');
    console.log('All applications:', response.data);
    return response.data;
  },

  list: async () => {
    const response = await api.get('/applications');
    return response.data;
  },
};



// export const contracts = {
//   generate: async (applicationId: number) => {
//     const response = await api.post(`/contracts/generate/${applicationId}`);
//     return response.data;
//   },

//   getById: async (contractId: number) => {
//     const response = await api.get(`/contracts/${contractId}`);
//     return response.data;
//   },

//   updateStatus: async (contractId: number, status: string) => {
//     const response = await api.put(`/contracts/${contractId}/status`, { status });
//     return response.data;
//   },
// }; 

// export const contracts = {
//   generate: async (applicationId: number) => {
//     const response = await api.post(`/contracts/generate/${applicationId}`);
//     return response.data;
//   },

//   getById: async (contractId: number) => {
//     const response = await api.get(`/contracts/${contractId}`);
//     return response.data;
//   },

//   updateStatus: async (contractId: number, status: string) => {
//     const response = await api.put(`/contracts/${contractId}/status`, { status });
//     return response.data;
//   },

//   // NEW: Employer approves the contract
//   approve: async (contractId: number) => {
//     const response = await api.put(`/contracts/${contractId}/approve`);
//     return response.data;
//   },

//   // NEW: Candidate signs the contract
//   sign: async (contractId: number) => {
//     const response = await api.put(`/contracts/${contractId}/sign`);
//     return response.data;
//   },
// };


export const blogs = {
  create: async (data: {
    title: string;
    content: string;
    image_url?: string;
    published_date?: string;
  }) => {
    
    const response = await api.post('/blog/create', data);
    return response.data;
  },

  getAll: async () => {
    const response = await api.get('/blog/');
    return response.data;
  },

  getById: async (id: number) => {
    const response = await api.get(`/blog/${id}`);
    return response.data;
  },

  delete: async (id: number) => {
    const token = localStorage.getItem("token");
    const response = await api.delete(`/blog/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  },

  update: async (
    id: number,
    data: {
      title: string;
      content: string;
      image_url?: string;
    }
  ) => {
    const token = localStorage.getItem("token");
    const response = await api.put(`/blog/update/${id}`, data, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  },

  generateContent: async (title: string) => {
    const token = localStorage.getItem("token");
    try {
      const response = await api.post(
        `/blog/generate?title=${encodeURIComponent(title)}`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
  
      console.log("Generated Content:", response.data); // response.data is full blog string
      return response.data; // this is the blog string
    } catch (error) {
      console.error("API error during generateContent:", error);
      return ''; // return empty string on error
    }
  }
};

export const users = {
  // Fetch all users
  getAll: async () => {
    const response = await api.get('/users');  // Adjust the endpoint if necessary
    return response.data;
  },

  // Fetch a user by ID
  getById: async (userId: number) => {
    const response = await api.get(`/users/${userId}`);
    return response.data;
  },
  
  // Additional user-related API functions can be added here
};

export const contractTemplates = {
  create: async (data: {
    name: string;
    contract_title: string;
    description: string;
  }) => {
    const response = await api.post('/contractTemplate/create', data);
    console.log('Contract Template Created:', response.data);
    return response.data;
  },

  getAll: async () => {
    const response = await api.get('/contractTemplate/');
    return response.data;
  },

  getById: async (id: number) => {
    const response = await api.get(`/contractTemplate/${id}`);
    return response.data;
  },

  update: async (
    id: number,
    data: {
      name: string;
      contract_title: string;
      description: string;
    }
  ) => {
    const token = localStorage.getItem('token');
    const response = await api.put(`/contractTemplate/update/${id}`, data, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  },

  delete: async (id: number) => {
    const token = localStorage.getItem('token');
    const response = await api.delete(`/contractTemplate/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  },

  generateDescription: async ({ contract_title }: { contract_title: string }) => {
    const token = localStorage.getItem('token');
    try {
      const response = await api.post(
        '/contractTemplate/generate_description',
        { contract_title },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      console.log("Generated Description:", response.data.description);
      return response.data.description;
    } catch (error) {
      console.error('Error generating description:', error);
      throw new Error('Failed to generate description');
    }
  },
};

