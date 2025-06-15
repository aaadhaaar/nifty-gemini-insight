
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { TrendingUp } from 'lucide-react';
import AuthForm from '@/components/auth/AuthForm';
import ForgotPasswordForm from '@/components/auth/ForgotPasswordForm';

const Auth = () => {
  const [email, setEmail] = useState('');
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  // Enhanced redirect logic for authenticated users
  useEffect(() => {
    // Only redirect if auth is not loading and user exists
    if (!authLoading && user) {
      console.log('User authenticated, redirecting to main dashboard');
      navigate('/', { replace: true });
    }
  }, [user, authLoading, navigate]);

  if (authLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-300">Checking authentication...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center space-x-3 mb-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center">
              <TrendingUp className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">The Undercurrent</h1>
              <p className="text-sm text-slate-400">AI Market Analysis</p>
            </div>
          </div>
        </div>

        {showForgotPassword ? (
          <ForgotPasswordForm
            email={email}
            setEmail={setEmail}
            onBack={() => setShowForgotPassword(false)}
          />
        ) : (
          <AuthForm onForgotPassword={() => setShowForgotPassword(true)} />
        )}
      </div>
    </div>
  );
};

export default Auth;
