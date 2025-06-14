
import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { ArrowLeft, Palette } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Settings = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-4">
      <div className="max-w-2xl mx-auto">
        <div className="mb-6">
          <Button
            variant="ghost"
            onClick={() => navigate('/')}
            className="text-slate-300 hover:text-white hover:bg-slate-700/50"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Dashboard
          </Button>
        </div>

        <Card className="bg-slate-800/50 backdrop-blur-xl border-slate-700/50">
          <CardHeader>
            <CardTitle className="text-white text-2xl">Settings</CardTitle>
            <CardDescription className="text-slate-400">
              Manage your app preferences
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Appearance Section */}
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <Palette className="h-5 w-5 text-purple-400" />
                <h3 className="text-lg font-medium text-white">Appearance</h3>
              </div>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="dark-mode" className="text-slate-300">
                      Dark Mode
                    </Label>
                    <p className="text-sm text-slate-400">
                      Use dark theme (currently enabled)
                    </p>
                  </div>
                  <Switch id="dark-mode" defaultChecked disabled />
                </div>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="compact-view" className="text-slate-300">
                      Compact View
                    </Label>
                    <p className="text-sm text-slate-400">
                      Show more information in less space
                    </p>
                  </div>
                  <Switch id="compact-view" />
                </div>
              </div>
            </div>

            <div className="pt-4">
              <p className="text-sm text-slate-400 text-center">
                Settings are automatically saved
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Settings;
