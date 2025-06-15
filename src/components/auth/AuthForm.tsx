
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Mail, Lock, User } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import GoogleIcon from './GoogleIcon';

interface AuthFormProps {
  onForgotPassword: () => void;
}

const AuthForm: React.FC<AuthFormProps> = ({ onForgotPassword }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('signin');
  
  const { signIn, signUp, signInWithGoogle } = useAuth();

  const handleSubmit = async (type: 'signin' | 'signup') => {
    if (!email || !password) {
      setError('Please fill in all required fields');
      return;
    }

    if (type === 'signup' && !fullName) {
      setError('Please enter your full name');
      return;
    }

    setLoading(true);
    setError('');

    try {
      let result;
      if (type === 'signin') {
        result = await signIn(email, password);
      } else {
        result = await signUp(email, password, fullName);
      }

      if (result.error) {
        if (result.error.message.includes('Invalid login credentials')) {
          setError('Invalid email or password');
        } else if (result.error.message.includes('User already registered')) {
          setError('An account with this email already exists. Please sign in instead.');
        } else {
          setError(result.error.message);
        }
      } else if (type === 'signup') {
        setError('');
        alert('Please check your email for a confirmation link to complete your registration.');
      }
    } catch (err) {
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setLoading(true);
    setError('');
    
    const { error } = await signInWithGoogle();
    if (error) {
      setError(error.message);
      setLoading(false);
    }
  };

  return (
    <Card className="bg-slate-800/50 backdrop-blur-xl border-slate-700/50">
      <CardHeader className="text-center">
        <CardTitle className="text-white">Welcome</CardTitle>
        <CardDescription className="text-slate-400">
          Sign in to access your market analysis dashboard
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2 bg-slate-700/30 p-1">
            <TabsTrigger 
              value="signin" 
              className="text-slate-300 data-[state=active]:text-slate-900 data-[state=active]:bg-white data-[state=active]:font-medium"
            >
              Sign In
            </TabsTrigger>
            <TabsTrigger 
              value="signup" 
              className="text-slate-300 data-[state=active]:text-slate-900 data-[state=active]:bg-white data-[state=active]:font-medium"
            >
              Sign Up
            </TabsTrigger>
          </TabsList>

          <TabsContent value="signin" className="space-y-4 mt-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="signin-email" className="text-slate-300">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                  <Input
                    id="signin-email"
                    type="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10 bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-400"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="signin-password" className="text-slate-300">Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                  <Input
                    id="signin-password"
                    type="password"
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-10 bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-400"
                  />
                </div>
              </div>

              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={onForgotPassword}
                  className="text-sm text-blue-400 hover:text-blue-300 transition-colors"
                >
                  Forgot password?
                </button>
              </div>

              {error && (
                <Alert className="bg-red-500/10 border-red-500/20">
                  <AlertDescription className="text-red-400">{error}</AlertDescription>
                </Alert>
              )}

              <Button
                onClick={() => handleSubmit('signin')}
                disabled={loading}
                className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white border-0"
              >
                {loading ? 'Signing in...' : 'Sign In'}
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="signup" className="space-y-4 mt-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="signup-name" className="text-slate-300">Full Name</Label>
                <div className="relative">
                  <User className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                  <Input
                    id="signup-name"
                    type="text"
                    placeholder="Enter your full name"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="pl-10 bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-400"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="signup-email" className="text-slate-300">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                  <Input
                    id="signup-email"
                    type="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10 bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-400"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="signup-password" className="text-slate-300">Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                  <Input
                    id="signup-password"
                    type="password"
                    placeholder="Create a password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-10 bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-400"
                  />
                </div>
              </div>

              {error && (
                <Alert className="bg-red-500/10 border-red-500/20">
                  <AlertDescription className="text-red-400">{error}</AlertDescription>
                </Alert>
              )}

              <Button
                onClick={() => handleSubmit('signup')}
                disabled={loading}
                className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
              >
                {loading ? 'Creating account...' : 'Create Account'}
              </Button>
            </div>
          </TabsContent>
        </Tabs>

        <div className="mt-6">
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-slate-600" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-slate-800 px-2 text-slate-400">Or continue with</span>
            </div>
          </div>

          <Button
            onClick={handleGoogleSignIn}
            disabled={loading}
            variant="outline"
            className="w-full mt-4 bg-slate-700/50 border-slate-600 text-white hover:bg-slate-600/50"
          >
            <GoogleIcon className="mr-2" />
            Google
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default AuthForm;
