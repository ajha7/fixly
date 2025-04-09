import React from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../../services/authService';
import { Button } from '../ui/button';

/**
 * AutoLogin component for development purposes.
 * Provides a quick way to bypass the normal authentication flow with fake user data.
 */
const AutoLogin: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = React.useState(false);

  const handleAutoLogin = async () => {
    try {
      setLoading(true);
      const response = await authService.autoLogin();
      
      // Navigate to home page after successful login
      navigate('/');
    } catch (error) {
      console.error('Auto-login failed:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mt-4">
      <Button 
        onClick={handleAutoLogin} 
        disabled={loading}
        variant="outline"
        className="w-full bg-amber-100 hover:bg-amber-200 text-amber-800 border-amber-300"
      >
        {loading ? 'Logging in...' : '🔑 Skip Login (Dev Mode)'}
      </Button>
    </div>
  );
};

export default AutoLogin;
