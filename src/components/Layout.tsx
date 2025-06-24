import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import Navigation from './Navigation';

interface LayoutProps {
  children: React.ReactNode;
  showNavigation?: boolean;
  activeTab?: string;
  onTabChange?: (tab: string) => void;
}

const Layout: React.FC<LayoutProps> = ({ 
  children, 
  showNavigation = true,
  activeTab,
  onTabChange
}) => {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 transition-colors duration-300">
      {showNavigation && user && (
        <Navigation 
          activeTab={activeTab} 
          onTabChange={onTabChange} 
        />
      )}
      {children}
    </div>
  );
};

export default Layout;