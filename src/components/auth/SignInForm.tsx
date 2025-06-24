import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth, UserRole } from '../../contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { useToast } from '../../hooks/use-toast';
import { Eye, EyeOff, Users, Baby, Shield } from 'lucide-react';
import { login as loginApi } from '../../lib/authApi';
import { childLogin } from '../../lib/childAuthApi';

interface SignInFormProps {
  role: UserRole;
}

const SignInForm: React.FC<SignInFormProps> = ({ role }) => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  const { login } = useAuth();
  
  
  const { toast } = useToast();
  const navigate = useNavigate();
  

  const roleConfig = {
    parent: { icon: Users, title: 'Parent Sign In', color: 'from-blue-500 to-blue-600' },
    child: { icon: Baby, title: 'Child Sign In', color: 'from-green-500 to-green-600' },
    official: { icon: Shield, title: 'Official Sign In', color: 'from-purple-500 to-purple-600' }
  };

  const config = roleConfig[role];
  const Icon = config.icon;

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      let data;
      if (role === 'child') {
        // Child login uses userId and password
        data = await childLogin(formData.email, formData.password);
        if (!data || !data.child || !data.token) {
          throw new Error('Invalid credentials.');
        }
        login({
          id: data.child.id,
          name: data.child.name,
          email: data.child.userId,
          role: 'child',
          verified: true, // Children are always considered verified
        }, data.token);
      } else {
        // Parent/Official login uses email and password
        data = await loginApi(formData.email, formData.password, role);
        if (!data || !data.user || !data.token) {
          throw new Error('Invalid credentials.');
        }
        login({
          id: data.user.id,
          name: data.user.name,
          email: data.user.email,
          role: data.user.role,
          verified: data.user.verified ?? true, // Default to true if not present
        }, data.token);
      }
      toast({
        title: 'Welcome back!',
        description: `Successfully signed in as ${role}.`,
      });
      navigate('/dashboard');
    } catch (error: unknown) {
      let errMsg = 'Please check your credentials and try again.';
      if (
        error &&
        typeof error === 'object' &&
        'response' in error &&
        error.response &&
        typeof error.response === 'object' &&
        'data' in error.response &&
        error.response.data &&
        typeof error.response.data === 'object' &&
        'message' in error.response.data
      ) {
        errMsg = error.response.data.message as string;
      } else if (error instanceof Error) {
        errMsg = error.message;
      }
      toast({
        title: 'Sign in failed',
        description: errMsg,
        variant: 'destructive',
      });
      // Stay on the same page, do not navigate
      return;
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full shadow-2xl border-0 bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl rounded-2xl transform hover:scale-105 transition-all duration-500">
      <CardHeader className="text-center pb-6">
        <div className={`w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-r ${config.color} flex items-center justify-center shadow-lg transform group-hover:scale-110 transition-all duration-500`}>
          <Icon className="w-8 h-8 text-white" />
        </div>
        <CardTitle className="text-2xl font-bold text-gray-900 dark:text-white">
          {config.title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="email" className="text-gray-700 dark:text-gray-300 font-medium">
              {role === 'child' ? 'User ID' : 'Email Address'}
            </Label>
            <Input
              id="email"
              name="email"
              type={role === 'child' ? 'text' : 'email'}
              placeholder={role === 'child' ? 'Enter your User ID' : 'Enter your email'}
              value={formData.email}
              onChange={handleInputChange}
              required
              className="transition-all duration-300 focus:ring-4 focus:ring-blue-500/20"
            />
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {role === 'child' ? 'Ask your parent for your User ID.' : 'We will never share your email with anyone.'}
            </p>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="password" className="text-gray-700 dark:text-gray-300 font-medium">
              Password
            </Label>
            <div className="relative">
              <Input
                id="password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                placeholder="Enter your password"
                value={formData.password}
                onChange={handleInputChange}
                required
                className="pr-12 transition-all duration-300 focus:ring-4 focus:ring-blue-500/20"
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4 text-gray-400" />
                ) : (
                  <Eye className="h-4 w-4 text-gray-400" />
                )}
              </Button>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Must be at least 8 characters long.
            </p>
          </div>
          
          <Button
            type="submit"
            className={`w-full bg-gradient-to-r ${config.color} hover:shadow-xl hover:shadow-blue-500/25 transition-all duration-500 transform hover:scale-105 text-white font-semibold py-3 rounded-xl relative overflow-hidden group`}
            disabled={isLoading}
          >
            {isLoading ? (
              <div className="flex items-center justify-center space-x-2">
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                <span>Signing in...</span>
              </div>
            ) : (
              <>
                <span className="relative z-10">Sign In</span>
                <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-purple-500 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              </>
            )}
          </Button>
          
          
        </form>
      </CardContent>
    </Card>
  );
};

export default SignInForm;