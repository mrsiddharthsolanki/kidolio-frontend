
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { User, FileText, Key, Eye, EyeOff, UserCheck, UserX, Copy } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface Child {
  id: string;
  name: string;
  dob: string;
  gender: string;
  photo?: string;
  hasLogin: boolean;
  userId?: string;
  password?: string;
  bloodGroup: string;
  disability: string;
  isActive?: boolean;
}

interface ChildCardProps {
  child: Child;
  onGenerateLogin: (childId: string) => void;
  onViewRecords: (childId: string) => void;
  onToggleStatus?: (childId: string, isActive: boolean) => void;
}

const ChildCard: React.FC<ChildCardProps> = ({ child, onGenerateLogin, onViewRecords, onToggleStatus }) => {
  const [showCredentials, setShowCredentials] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const generateRandomPassword = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let password = '';
    for (let i = 0; i < 8; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return password;
  };

  const handleGenerateLogin = () => {
    if (!child.hasLogin) {
      onGenerateLogin(child.id);
    }
  };

  const handleToggleStatus = () => {
    if (onToggleStatus) {
      onToggleStatus(child.id, !child.isActive);
      toast({
        title: child.isActive ? "Account Deactivated" : "Account Activated",
        description: `${child.name}'s account has been ${child.isActive ? 'deactivated' : 'activated'}`
      });
    }
  };

  const copyToClipboard = (text: string, type: string) => {
    navigator.clipboard.writeText(text).then(() => {
      toast({
        title: "Copied!",
        description: `${type} copied to clipboard`
      });
    });
  };

  const age = new Date().getFullYear() - new Date(child.dob).getFullYear();

  return (
    <Card className="shadow-lg border-0 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm hover:shadow-xl transition-all">
      <CardHeader className="text-center pb-3">
        <div className="relative mx-auto mb-3">
          {child.photo ? (
            <img
              src={child.photo}
              alt={child.name}
              className="w-20 h-20 rounded-full object-cover border-4 border-white shadow-lg mx-auto"
            />
          ) : (
            <div className="w-20 h-20 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center mx-auto border-4 border-white shadow-lg">
              <User className="w-8 h-8 text-white" />
            </div>
          )}
          <div className="absolute -top-1 -right-1">
            {child.isActive !== false ? (
              <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                <UserCheck className="w-3 h-3 text-white" />
              </div>
            ) : (
              <div className="w-6 h-6 bg-red-500 rounded-full flex items-center justify-center">
                <UserX className="w-3 h-3 text-white" />
              </div>
            )}
          </div>
        </div>
        <CardTitle className="text-lg font-bold">{child.name}</CardTitle>
        <div className="space-y-1">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Age: {age} • {child.gender}
          </p>
          <p className="text-xs text-gray-500">
            Blood Group: {child.bloodGroup}
          </p>
          <div className="flex justify-center">
            <Badge variant={child.hasLogin ? "default" : "secondary"}>
              {child.hasLogin ? "Login Active" : "No Login"}
            </Badge>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-3">
        {/* Login Status and Actions */}
        <div className="space-y-2">
          {child.hasLogin ? (
            <div className="space-y-2">
              <Dialog open={showCredentials} onOpenChange={setShowCredentials}>
                <DialogTrigger asChild>
                  <Button variant="outline" className="w-full" size="sm">
                    <Key className="w-4 h-4 mr-2" />
                    Show Login Details
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-md">
                  <DialogHeader>
                    <DialogTitle>Login Credentials for {child.name}</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg space-y-3">
                      <div>
                        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Username/ID:</label>
                        <div className="flex items-center gap-2 mt-1">
                          <code className="flex-1 p-2 bg-white dark:bg-gray-800 rounded border text-sm">
                            {child.userId || `${child.name.toLowerCase().replace(' ', '_')}_${child.id}`}
                          </code>
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => copyToClipboard(child.userId || `${child.name.toLowerCase().replace(' ', '_')}_${child.id}`, 'Username')}
                          >
                            <Copy className="w-3 h-3" />
                          </Button>
                        </div>
                      </div>
                      
                      <div>
                        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Password:</label>
                        <div className="flex items-center gap-2 mt-1">
                          <code className="flex-1 p-2 bg-white dark:bg-gray-800 rounded border text-sm">
                            {showPassword ? (child.password || generateRandomPassword()) : '••••••••'}
                          </code>
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => setShowPassword(!showPassword)}
                          >
                            {showPassword ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                          </Button>
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => copyToClipboard(child.password || generateRandomPassword(), 'Password')}
                          >
                            <Copy className="w-3 h-3" />
                          </Button>
                        </div>
                      </div>
                    </div>
                    
                    <div className="p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                      <p className="text-sm text-yellow-800 dark:text-yellow-200">
                        <strong>Important:</strong> Share these credentials securely with your child. 
                        Make sure they keep this information private.
                      </p>
                    </div>
                    
                    <div className="flex gap-2">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => {
                          const credentials = `Username: ${child.userId || `${child.name.toLowerCase().replace(' ', '_')}_${child.id}`}\nPassword: ${child.password || generateRandomPassword()}`;
                          copyToClipboard(credentials, 'Login credentials');
                        }}
                        className="flex-1"
                      >
                        Copy Both
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => setShowCredentials(false)}>
                        Close
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
              
              {/* Account Status Toggle */}
              <Button
                variant={child.isActive !== false ? "destructive" : "default"}
                size="sm"
                className="w-full"
                onClick={handleToggleStatus}
              >
                {child.isActive !== false ? (
                  <>
                    <UserX className="w-4 h-4 mr-2" />
                    Deactivate Account
                  </>
                ) : (
                  <>
                    <UserCheck className="w-4 h-4 mr-2" />
                    Activate Account
                  </>
                )}
              </Button>
            </div>
          ) : (
            <Button onClick={handleGenerateLogin} className="w-full bg-green-600 hover:bg-green-700" size="sm">
              <Key className="w-4 h-4 mr-2" />
              Generate Login
            </Button>
          )}
        </div>

        {/* View Records Button */}
        <Button 
          variant="outline" 
          onClick={() => onViewRecords(child.id)} 
          className="w-full"
          size="sm"
        >
          <FileText className="w-4 h-4 mr-2" />
          View Records
        </Button>

        {/* Account Status Indicator */}
        <div className="pt-2 border-t">
          <div className="flex items-center justify-between text-xs">
            <span className="text-gray-600 dark:text-gray-400">Account Status:</span>
            <Badge variant={child.isActive !== false ? "default" : "destructive"} className="text-xs">
              {child.isActive !== false ? "Active" : "Deactivated"}
            </Badge>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ChildCard;
