import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { UserRole } from '../../contexts/AuthContext';
import Layout from '../Layout';
import RoleSelector from './RoleSelector';
import SignInForm from './SignInForm';
import { ArrowLeft, Star } from 'lucide-react';
import { Button } from '../ui/button';

const SignInPage: React.FC = () => {
  // Get role from URL params if present (for /signin/:role)
  const { role } = useParams<{ role?: UserRole }>();
  const [selectedRole, setSelectedRole] = useState<UserRole | null>(role ?? null);

  // Keep selectedRole in sync with URL param
  useEffect(() => {
    setSelectedRole(role ?? null);
  }, [role]);

  const [isLoaded, setIsLoaded] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const navigate = useNavigate();

  // Mouse tracking for interactive background
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  // Load animation trigger
  useEffect(() => {
    setIsLoaded(true);
  }, []);

  const handleBackToRoles = () => {
    // If on /signin/:role, go back to /signin (no role)
    navigate('/signin');
  };

  const handleGoToSignUp = () => {
    navigate('/signup');
  };

  const handleBackToHome = () => {
    navigate('/');
  };

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-br from-blue-50/50 via-white to-purple-50/50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800 transition-all duration-700 ease-in-out relative overflow-hidden">
        {/* Back to Home Button */}
        <Button
          variant="ghost"
          onClick={handleBackToHome}
          className="absolute top-4 left-4 flex items-center space-x-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-all duration-300 transform hover:scale-105 group hover:bg-gray-100 dark:hover:bg-gray-800"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform duration-300" />
          <span>Back to Home</span>
        </Button>

        {/* Animated Background Elements */}
        <div className="fixed inset-0 pointer-events-none">
          <div 
            className="absolute w-96 h-96 bg-gradient-to-r from-blue-500/10 to-purple-500/10 dark:from-blue-400/5 dark:to-purple-400/5 rounded-full blur-3xl transition-all duration-1000 ease-out"
            style={{
              transform: `translate(${mousePosition.x * 0.02}px, ${mousePosition.y * 0.02}px)`,
              left: '10%',
              top: '20%'
            }}
          />
          <div 
            className="absolute w-64 h-64 bg-gradient-to-r from-green-500/10 to-blue-500/10 dark:from-green-400/5 dark:to-blue-400/5 rounded-full blur-3xl transition-all duration-1000 ease-out"
            style={{
              transform: `translate(${mousePosition.x * -0.015}px, ${mousePosition.y * -0.015}px)`,
              right: '10%',
              bottom: '20%'
            }}
          />
        </div>

        <div className="flex items-center justify-center p-4 pt-20 lg:pt-24">
          <div className="w-full max-w-6xl relative">
            
            {/* Header with animations */}
            <div className={`text-center mb-8 lg:mb-12 transition-all duration-700 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
              <div className="inline-flex items-center space-x-2 bg-blue-100/80 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 px-4 py-2.5 rounded-full text-sm font-medium transform hover:scale-105 transition-all duration-500 backdrop-blur-sm border border-blue-200/50 dark:border-blue-800/50 mb-6">
                <Star className="w-4 h-4 animate-pulse" />
                <span>Secure access to your learning journey</span>
              </div>
              
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-light text-gray-900 dark:text-white mb-4 leading-tight">
                Welcome back to{' '}
                <span className="block font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-green-600 bg-clip-text text-transparent">
                  Kidolio
                </span>
              </h1>
              <p className="text-lg lg:text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
                {selectedRole ? 'Sign in to your account' : 'Choose your role to continue your learning journey'}
              </p>
            </div>

            {/* Content with staggered animations */}
            <div className="flex flex-col items-center space-y-8">
              {!selectedRole ? (
                <div className={`w-full max-w-4xl transition-all duration-700 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
                  <RoleSelector
                    selectedRole={selectedRole}
                    onRoleSelect={role => navigate(`/signin/${role}`)}
                    variant="signin"
                  />
                  
                  {/* Enhanced Sign Up Section */}
                  <div className="text-center mt-8">
                    <div className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-xl rounded-2xl p-6 border border-gray-200/50 dark:border-gray-700/50 shadow-lg transform hover:scale-[1.02] transition-all duration-500">
                      <p className="text-gray-600 dark:text-gray-400 mb-4 text-lg">
                        Don't have an account yet?
                      </p>
                      <Button 
                        onClick={handleGoToSignUp}
                        className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-3 rounded-xl hover:shadow-2xl hover:shadow-blue-500/25 transition-all duration-500 transform hover:scale-105 hover:from-blue-500 hover:to-purple-500 relative overflow-hidden group font-medium"
                      >
                        <span className="relative z-10">Create Account</span>
                        <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-500 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                      </Button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className={`w-full max-w-lg transition-all duration-700 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
                  {/* Enhanced Back Button */}
                  <Button
                    variant="ghost"
                    onClick={handleBackToRoles}
                    className="mb-6 flex items-center space-x-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-all duration-300 transform hover:scale-105 group hover:bg-gray-100 dark:hover:bg-gray-800"
                  >
                    <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform duration-300" />
                    <span>Back to roles</span>
                  </Button>
                  
                  {/* Form Container with enhanced styling */}
                  <div className="transform hover:scale-[1.02] transition-all duration-500">
                    <SignInForm role={selectedRole} />
                  </div>
                </div>
              )}
            </div>

            {/* Decorative Elements - only show when no role selected */}
            {!selectedRole && (
              <>
                <div className="absolute -top-6 -right-6 w-32 h-32 bg-gradient-to-br from-blue-400/30 to-purple-500/30 rounded-full blur-2xl animate-pulse"></div>
                <div className="absolute -bottom-6 -left-6 w-24 h-24 bg-gradient-to-br from-green-400/30 to-blue-500/30 rounded-full blur-2xl animate-pulse" style={{ animationDelay: '1s' }}></div>
              </>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default SignInPage;