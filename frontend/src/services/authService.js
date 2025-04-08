import axios from 'axios';

// API base URL
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3000';

// Create axios instance with base URL
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor to include auth token in requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('auth_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Authentication service
export const authService = {
  // Register a new user
  async register(userData) {
    const response = await api.post('/api/auth/register', userData);
    return response.data;
  },
  
  // Get social auth URL
  async getSocialAuthUrl(provider, redirectUri, state) {
    const response = await api.post('/api/auth/social-auth-url', null, {
      params: { provider, redirect_uri: redirectUri, state },
    });
    return response.data;
  },
  
  // Complete social login with code
  async completeSocialLogin(provider, token, redirectUrl) {
    const response = await api.post('/api/auth/social-login', {
      provider,
      token,
      redirect_url: redirectUrl,
    });
    return response.data;
  },
  
  // Request magic link
  async requestMagicLink(email, redirectUrl) {
    const response = await api.post('/api/auth/magic-link', {
      email,
      redirect_url: redirectUrl,
    });
    return response.data;
  },
  
  // Verify magic link
  async verifyMagicLink(token) {
    const response = await api.post('/api/auth/verify-magic-link', {
      token,
    });
    return response.data;
  },
  
  // Get current user profile
  async getCurrentUser() {
    const response = await api.get('/api/auth/me');
    return response.data;
  },
  
  // Check if user is authenticated
  isAuthenticated() {
    return !!localStorage.getItem('auth_token');
  },
  
  // Get user data
  getUserData() {
    const userData = localStorage.getItem('user_data');
    return userData ? JSON.parse(userData) : null;
  },
  
  // Logout
  logout() {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user_data');
  },
};

export default authService;
