
import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import Layout from '@/components/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Users, Baby, Shield, LogOut } from 'lucide-react';

const Dashboard: React.FC = () => {
  const { user, logout } = useAuth();

  const roleConfig = {
    parent: { icon: Users, title: 'Parent Dashboard', color: 'from-blue-500 to-blue-600' },
    child: { icon: Baby, title: 'Child Dashboard', color: 'from-green-500 to-green-600' },
    official: { icon: Shield, title: 'Official Dashboard', color: 'from-purple-500 to-purple-600' }
  };

  const config = roleConfig[user?.role || 'parent'];
  const Icon = config.icon;

  return (
    <Layout>
      <div className="min-h-screen p-4">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                Welcome, {user?.name}!
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                {config.title}
              </p>
            </div>
            <Button variant="outline" onClick={logout} className="hover:bg-red-50 hover:text-red-600">
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </Button>
          </div>

          {/* Dashboard Content */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card className="shadow-lg border-0 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
              <CardHeader className="text-center">
                <div className={`w-12 h-12 mx-auto mb-2 rounded-full bg-gradient-to-r ${config.color} flex items-center justify-center`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
                <CardTitle>Account Status</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <p className="text-green-600 dark:text-green-400 font-medium">Active</p>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                  Your account is verified and ready to use.
                </p>
              </CardContent>
            </Card>

            <Card className="shadow-lg border-0 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {user?.role === 'parent' && (
                    <>
                      <Button variant="ghost" className="w-full justify-start">
                        Add Child Account
                      </Button>
                      <Button variant="ghost" className="w-full justify-start">
                        View Children
                      </Button>
                    </>
                  )}
                  {user?.role === 'child' && (
                    <>
                      <Button variant="ghost" className="w-full justify-start">
                        Learning Center
                      </Button>
                      <Button variant="ghost" className="w-full justify-start">
                        My Progress
                      </Button>
                    </>
                  )}
                  {user?.role === 'official' && (
                    <>
                      <Button variant="ghost" className="w-full justify-start">
                        Manage Records
                      </Button>
                      <Button variant="ghost" className="w-full justify-start">
                        Generate Reports
                      </Button>
                    </>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-lg border-0 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle>Profile Info</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm">
                  <div>
                    <span className="font-medium">Email:</span>
                    <p className="text-gray-600 dark:text-gray-400">{user?.email}</p>
                  </div>
                  <div>
                    <span className="font-medium">Role:</span>
                    <p className="text-gray-600 dark:text-gray-400 capitalize">{user?.role}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </Layout>
  );
};
export default Dashboard;