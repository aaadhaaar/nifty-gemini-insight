
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Mail } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface ForgotPasswordFormProps {
  email: string;
  setEmail: (email: string) => void;
  onBack: () => void;
}

const ForgotPasswordForm: React.FC<ForgotPasswordFormProps> = ({ email, setEmail, onBack }) => {
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [resetEmailSent, setResetEmailSent] = useState(false);

  const handleForgotPassword = async () => {
    if (!email) {
      setError('Please enter your email address first');
      return;
    }

    setLoading(true);
    setError('');

    try {
      console.log('Attempting password reset for email:', email);
      console.log('Reset redirect URL:', `${window.location.origin}/reset-password`);
      
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (error) {
        console.error('Password reset error:', error);
        setError(error.message);
      } else {
        console.log('Password reset email sent successfully');
        setResetEmailSent(true);
      }
    } catch (err) {
      console.error('Unexpected error during password reset:', err);
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (resetEmailSent) {
    return (
      <Card className="bg-slate-800/50 backdrop-blur-xl border-slate-700/50">
        <CardHeader className="text-center">
          <CardTitle className="text-white">Email Sent</CardTitle>
          <CardDescription className="text-slate-400">
            Check your inbox for password reset instructions
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Alert className="mb-4 bg-green-500/10 border-green-500/20">
            <AlertDescription className="text-green-400">
              Password reset email sent to {email}! Check your inbox and spam folder for instructions.
            </AlertDescription>
          </Alert>
          <Button
            onClick={onBack}
            variant="ghost"
            className="w-full text-slate-300 hover:text-white hover:bg-slate-700/50"
          >
            Back to Sign In
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-slate-800/50 backdrop-blur-xl border-slate-700/50">
      <CardHeader className="text-center">
        <CardTitle className="text-white">Reset Password</CardTitle>
        <CardDescription className="text-slate-400">
          Enter your email to receive a password reset link
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="reset-email" className="text-slate-300">Email</Label>
          <div className="relative">
            <Mail className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
            <Input
              id="reset-email"
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="pl-10 bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-400"
              onKeyPress={(e) => e.key === 'Enter' && handleForgotPassword()}
            />
          </div>
        </div>

        {error && (
          <Alert className="bg-red-500/10 border-red-500/20">
            <AlertDescription className="text-red-400">{error}</AlertDescription>
          </Alert>
        )}

        <div className="space-y-3">
          <Button
            onClick={handleForgotPassword}
            disabled={loading || !email}
            className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white"
          >
            {loading ? 'Sending...' : 'Send Reset Link'}
          </Button>

          <Button
            onClick={onBack}
            variant="ghost"
            className="w-full text-slate-300 hover:text-white hover:bg-slate-700/50"
          >
            Back to Sign In
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default ForgotPasswordForm;
