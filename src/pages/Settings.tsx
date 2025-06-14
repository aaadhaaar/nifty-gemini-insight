
import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { ArrowLeft, Bell, Shield, Palette, Globe } from 'lucide-react';
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
              Manage your app preferences and account settings
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Notifications Section */}
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <Bell className="h-5 w-5 text-blue-400" />
                <h3 className="text-lg font-medium text-white">Notifications</h3>
              </div>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="market-alerts" className="text-slate-300">
                      Market Alerts
                    </Label>
                    <p className="text-sm text-slate-400">
                      Get notified about significant market movements
                    </p>
                  </div>
                  <Switch id="market-alerts" defaultChecked />
                </div>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="news-updates" className="text-slate-300">
                      News Updates
                    </Label>
                    <p className="text-sm text-slate-400">
                      Receive updates on breaking financial news
                    </p>
                  </div>
                  <Switch id="news-updates" defaultChecked />
                </div>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="analysis-reports" className="text-slate-300">
                      Analysis Reports
                    </Label>
                    <p className="text-sm text-slate-400">
                      Get weekly technical analysis summaries
                    </p>
                  </div>
                  <Switch id="analysis-reports" />
                </div>
              </div>
            </div>

            <Separator className="bg-slate-700" />

            {/* Privacy & Security Section */}
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <Shield className="h-5 w-5 text-green-400" />
                <h3 className="text-lg font-medium text-white">Privacy & Security</h3>
              </div>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="data-sharing" className="text-slate-300">
                      Anonymous Data Sharing
                    </Label>
                    <p className="text-sm text-slate-400">
                      Help improve our services with anonymous usage data
                    </p>
                  </div>
                  <Switch id="data-sharing" />
                </div>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="two-factor" className="text-slate-300">
                      Two-Factor Authentication
                    </Label>
                    <p className="text-sm text-slate-400">
                      Add an extra layer of security to your account
                    </p>
                  </div>
                  <Switch id="two-factor" />
                </div>
              </div>
            </div>

            <Separator className="bg-slate-700" />

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

            <Separator className="bg-slate-700" />

            {/* Language & Region Section */}
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <Globe className="h-5 w-5 text-orange-400" />
                <h3 className="text-lg font-medium text-white">Language & Region</h3>
              </div>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-slate-300">Language</Label>
                    <p className="text-sm text-slate-400">English (US)</p>
                  </div>
                  <Button variant="outline" size="sm" className="bg-slate-700/50 border-slate-600 text-white">
                    Change
                  </Button>
                </div>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-slate-300">Time Zone</Label>
                    <p className="text-sm text-slate-400">Auto-detect from browser</p>
                  </div>
                  <Button variant="outline" size="sm" className="bg-slate-700/50 border-slate-600 text-white">
                    Change
                  </Button>
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
