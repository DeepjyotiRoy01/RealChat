import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChatApp as ChatAppComponent } from '@/components/ChatApp';

const ChatApp = () => {
  const navigate = useNavigate();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check if user is authenticated
    const user = localStorage.getItem('user');
    if (!user) {
      navigate('/login');
      return;
    }

    try {
      const userData = JSON.parse(user);
      if (!userData.id || !userData.name) {
        localStorage.removeItem('user');
        navigate('/login');
        return;
      }
      setIsAuthenticated(true);
    } catch (error) {
      localStorage.removeItem('user');
      navigate('/login');
    } finally {
      setIsLoading(false);
    }
  }, [navigate]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900 flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return <ChatAppComponent />;
};

export default ChatApp; 