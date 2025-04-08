import axios, { AxiosInstance, AxiosRequestConfig } from 'axios';

// API base URL
const API_URL = import.meta.env.VITE_API_URL;

// Create axios instance with base URL
const api: AxiosInstance = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor to include auth token in requests
api.interceptors.request.use(
  (config: AxiosRequestConfig) => {
    const token = localStorage.getItem('auth_token');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Define user interface
interface User {
  id: string;
  name?: string;
  email: string;
  profile_picture?: string;
  [key: string]: any;
}

// Authentication service
export const authService = {
  // Register a new user
  async register(userData: { email: string; name?: string; password?: string }): Promise<any> {
    const response = await api.post('/api/auth/register', userData);
    return response.data;
  },
  
  // Get social auth URL
  async getSocialAuthUrl(provider: string, redirectUri: string, state: string): Promise<any> {
    console.log(`Getting social auth URL for ${provider} with redirect URI: ${redirectUri}`);
    try {
      const response = await api.post('/api/auth/social-auth-url', null, {
        params: { provider, redirect_uri: redirectUri, state },
      });
      console.log('Social auth URL response:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error getting social auth URL:', error);
      throw error;
    }
  },
  
  // Complete social login with code
  async completeSocialLogin(provider: string, token: string, redirectUrl: string): Promise<any> {
    console.log(`Completing social login for ${provider} with token: ${token.substring(0, 10)}...`);
    try {
      const response = await api.post('/api/auth/social-login', {
        provider,
        token,
        redirect_url: redirectUrl,
      });
      
      console.log('Social login response:', response.data);
      
      if (response.data.access_token) {
        localStorage.setItem('auth_token', response.data.access_token);
        localStorage.setItem('user_data', JSON.stringify(response.data.user));
      } else if (response.data.token) {
        // Handle legacy response format
        localStorage.setItem('auth_token', response.data.token);
        localStorage.setItem('user_data', JSON.stringify(response.data.user));
      }
      
      return response.data;
    } catch (error) {
      console.error('Error completing social login:', error);
      throw error;
    }
  },
  
  // Send magic link
  async sendMagicLink(email: string, redirectUrl: string): Promise<any> {
    const response = await api.post('/api/auth/magic-link', {
      email,
      redirect_url: redirectUrl,
    });
    return response.data;
  },
  
  // Verify magic link
  async verifyMagicLink(token: string): Promise<any> {
    const response = await api.post('/api/auth/verify-magic-link', { token });
    
    if (response.data.token) {
      localStorage.setItem('auth_token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
    }
    
    return response.data;
  },
  
  // Get current user profile
  async getCurrentUser(): Promise<User> {
    const response = await api.get('/api/users/me');
    return response.data;
  },
  
  // Check if user is authenticated
  isAuthenticated(): boolean {
    return !!localStorage.getItem('auth_token');
  },
  
  // Get user data
  getUserData(): User | null {
    const userData = localStorage.getItem('user');
    return userData ? JSON.parse(userData) : null;
  },
  
  // Logout
  logout(): void {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user');
    // Redirect to home page or login page if needed
  }
};

export default authService;
