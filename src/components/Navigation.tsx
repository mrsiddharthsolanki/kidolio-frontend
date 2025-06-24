import React, { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { 
  NavigationMenu, 
  NavigationMenuContent, 
  NavigationMenuItem, 
  NavigationMenuList, 
  NavigationMenuTrigger 
} from '@/components/ui/navigation-menu';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  Home, 
  User, 
  LogOut, 
  Book, 
  Search, 
  BarChart3, 
  Menu,
  Users 
} from 'lucide-react';
import { ThemeToggle } from '@/components/ui/theme-toggle';

interface NavigationProps {
  onTabChange?: (tab: string) => void;
  activeTab?: string; // Add activeTab prop to know current tab
}

const Navigation: React.FC<NavigationProps> = ({ onTabChange, activeTab }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileNavVisible, setMobileNavVisible] = useState(true);
  const [prevScrollPos, setPrevScrollPos] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      // Only apply on mobile screens (md = 768px)
      if (window.innerWidth >= 768) return;
      const currentScrollPos = window.scrollY;
      const isScrollingUp = prevScrollPos > currentScrollPos;
      const isAtTop = currentScrollPos < 10;
      setMobileNavVisible(isScrollingUp || isAtTop);
      setPrevScrollPos(currentScrollPos);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [prevScrollPos]);

  const handleNavigation = (path: string, state?: Record<string, unknown>) => {
    navigate(path, state ? { state } : undefined);
  };

  // Check if we're on the official dashboard route
  const isOfficialDashboard = location.pathname === '/official-dashboard' || location.pathname === '/dashboard';
  const isParentDashboard = location.pathname === '/parent-dashboard';
  const isChildDashboard = location.pathname === '/child-dashboard';

  // Helper function to determine if a navigation item is active
  const isActiveNavItem = (itemType: string, path?: string) => {
    // For profile pages, check exact path match
    if (path) {
      return location.pathname === path;
    }

    // For dashboard tabs, check both path and active tab (from URL query param)
    const urlTab = new URLSearchParams(location.search).get('tab');
    switch (itemType) {
      case 'parent-dashboard':
        return isParentDashboard && (urlTab === 'dashboard' || !urlTab);
      case 'parent-profile':
        return isParentDashboard && urlTab === 'profile';
      case 'child-dashboard':
        return isChildDashboard && (urlTab === 'profile' || urlTab === 'dashboard' || !urlTab);
      case 'child-library':
        return isChildDashboard && urlTab === 'library';
      case 'official-dashboard':
        return isOfficialDashboard && (urlTab === 'dashboard' || !urlTab);
      case 'official-search':
        return isOfficialDashboard && urlTab === 'search';
      case 'official-stats':
        return isOfficialDashboard && urlTab === 'stats';
      case 'official-profile':
        return location.pathname === '/officer-profile';
      case 'child-documents':
        return isChildDashboard && urlTab === 'documents';
      default:
        return false;
    }
  };

  // Helper function to get button classes with active state
  const getButtonClasses = (isActive: boolean) => {
    return `flex items-center gap-2 relative transition-all duration-200 px-3 py-2 rounded-lg
      ${isActive 
        ? 'text-blue-600 dark:text-blue-400 bg-blue-100/80 dark:bg-blue-900/40 font-bold shadow-sm' 
        : 'hover:text-blue-600 dark:hover:text-blue-400'}
    `;
  };

  // Helper function to render active indicator
  const renderActiveIndicator = (isActive: boolean) => {
    if (!isActive) return null;
    return (
      <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-8 h-1 bg-blue-600 dark:bg-blue-400 rounded-full transition-all duration-200"></div>
    );
  };

  // Handle official navigation - use tab change if on dashboard, otherwise navigate
  const handleOfficialNavigation = (tab: string, fallbackPath: string) => {
    // Always go to /official-dashboard with tab param, even from profile
    navigate('/official-dashboard?tab=' + tab, { replace: true });
    if (onTabChange) onTabChange(tab);
  };

  // Get role-specific profile path
  const getProfilePath = () => {
    switch (user?.role) {
      case 'parent':
        return '/parent-dashboard';
      case 'child':
        return '/child-profile';
      case 'official':
        return '/officer-profile';
      default:
        return '/profile'; // fallback
    }
  };
  
  const renderParentNav = () => (
    <>
      <Button 
        variant="ghost" 
        onClick={() => handleNavigation('/parent-dashboard', { activeTab: 'dashboard' })}
        className={getButtonClasses(isActiveNavItem('parent-dashboard'))}
      >
        <Home className="w-4 h-4" />
        <span className="hidden md:inline">Dashboard</span>
        {renderActiveIndicator(isActiveNavItem('parent-dashboard'))}
      </Button>
      <Button 
        variant="ghost" 
        onClick={() => handleNavigation('/parent-dashboard', { activeTab: 'profile' })}
        className={getButtonClasses(isActiveNavItem('parent-profile'))}
      >
        <User className="w-4 h-4" />
        <span className="hidden md:inline">Profile</span>
        {renderActiveIndicator(isActiveNavItem('parent-profile'))}
      </Button>
    </>
  );

  const renderChildNav = () => (
    <>
      {/* Add Documents button for child */}
      <Button 
        variant="ghost" 
        onClick={() => navigate('/child-dashboard?tab=documents', { replace: true })}
        className={getButtonClasses(isActiveNavItem('child-documents'))}
      >
        <Book className="w-4 h-4" />
        <span className="hidden md:inline">Documents</span>
        {renderActiveIndicator(isActiveNavItem('child-documents'))}
      </Button>
      <Button 
        variant="ghost" 
        onClick={() => navigate('/child-dashboard?tab=library', { replace: true })}
        className={getButtonClasses(isActiveNavItem('child-library'))}
      >
        <Book className="w-4 h-4" />
        <span className="hidden md:inline">Library</span>
        {renderActiveIndicator(isActiveNavItem('child-library'))}
      </Button>
      <Button 
        variant="ghost" 
        onClick={() => navigate('/child-dashboard?tab=profile', { replace: true })}
        className={getButtonClasses(isActiveNavItem('child-dashboard'))}
      >
        <User className="w-4 h-4" />
        <span className="hidden md:inline">Profile</span>
        {renderActiveIndicator(isActiveNavItem('child-dashboard'))}
      </Button>
    </>
  );

  const renderOfficialNav = () => (
    <>
      <Button 
        variant="ghost" 
        onClick={() => handleOfficialNavigation('dashboard', '/official-dashboard')}
        className={getButtonClasses(isActiveNavItem('official-dashboard'))}
      >
        <Home className="w-4 h-4" />
        <span className="hidden md:inline">Dashboard</span>
        {renderActiveIndicator(isActiveNavItem('official-dashboard'))}
      </Button>
      <Button 
        variant="ghost" 
        onClick={() => handleOfficialNavigation('search', '/official-dashboard')}
        className={getButtonClasses(isActiveNavItem('official-search'))}
      >
        <Search className="w-4 h-4" />
        <span className="hidden md:inline">Search</span>
        {renderActiveIndicator(isActiveNavItem('official-search'))}
      </Button>
      <Button 
        variant="ghost" 
        onClick={() => handleOfficialNavigation('stats', '/official-dashboard')}
        className={getButtonClasses(isActiveNavItem('official-stats'))}
      >
        <BarChart3 className="w-4 h-4" />
        <span className="hidden md:inline">Stats</span>
        {renderActiveIndicator(isActiveNavItem('official-stats'))}
      </Button>
      <Button 
        variant="ghost" 
        onClick={() => handleNavigation(getProfilePath())}
        className={getButtonClasses(isActiveNavItem('official-profile'))}
      >
        <User className="w-4 h-4" />
        <span className="hidden md:inline">Profile</span>
        {renderActiveIndicator(isActiveNavItem('official-profile'))}
      </Button>
    </>
  );

  const renderRoleNav = () => {
    switch (user?.role) {
      case 'parent':
        return renderParentNav();
      case 'child':
        return renderChildNav();
      case 'official':
        return renderOfficialNav();
      default:
        return null;
    }
  };

  if (!user) return null;

  return (
    <nav className={[
      "bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-b border-gray-200 dark:border-gray-700 px-4 py-3 sticky top-0 z-50",
      // Hide on mobile when scrolling up
      'transition-transform duration-300',
      mobileNavVisible ? '' : 'md:translate-y-0 -translate-y-full',
      'md:translate-y-0' // Always visible on desktop
    ].join(' ')}>
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        {/* Logo */}
        <button 
          onClick={() => handleNavigation('/')}
          className="flex items-center transition-transform duration-200 hover:scale-105"
        >
          <img 
            src="./logo.png"
            alt="Kidolio logo"
            className="h-10 w-auto dark:hidden cursor-pointer" 
          />
          <img 
            src="./logo.png"
            alt="Kidolio logo"
            className="h-10 w-auto hidden dark:block cursor-pointer" 
          />
        </button>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center gap-4">
          {renderRoleNav()}
          <ThemeToggle inNavbar={true} />
          <Button 
            variant="outline" 
            onClick={logout}
            className="hover:bg-red-50 hover:text-red-600 ml-4"
          >
            <LogOut className="w-4 h-4 mr-2" />
            Logout
          </Button>
        </div>

        {/* Mobile Navigation */}
        <div className="md:hidden">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="icon">
                <Menu className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              {/* Theme toggle for mobile menu */}
              <div className="px-2 py-2 flex items-center justify-between">
                
                <ThemeToggle inNavbar={true} />
              </div>
              <div className="border-b border-gray-200 dark:border-gray-700 my-1" />
              {user.role === 'parent' && (
                <>
                  <DropdownMenuItem 
                    onClick={() => handleNavigation('/parent-dashboard')}
                    className={isActiveNavItem('parent-dashboard') ? 'bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400' : ''}
                  >
                    <Home className="w-4 h-4 mr-2" />
                    Dashboard
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    onClick={() => handleNavigation('/parent-dashboard', { activeTab: 'profile' })}
                    className={isActiveNavItem('parent-profile') ? 'bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400' : ''}
                  >
                    <User className="w-4 h-4 mr-2" />
                    Profile
                  </DropdownMenuItem>
                </>
              )}
              {user.role === 'child' && (
                <>
                  <DropdownMenuItem 
                    onClick={() => handleNavigation('/child-dashboard')}
                    className={isActiveNavItem('child-dashboard') ? 'bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400' : ''}
                  >
                    <Home className="w-4 h-4 mr-2" />
                    Dashboard
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    onClick={() => handleNavigation('/child-dashboard', { activeTab: 'library' })}
                    className={isActiveNavItem('child-library') ? 'bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400' : ''}
                  >
                    <Book className="w-4 h-4 mr-2" />
                    Library
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    onClick={() => handleNavigation('/child-dashboard', { activeTab: 'profile' })}
                    className={isActiveNavItem('child-dashboard') ? 'bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400' : ''}
                  >
                    <User className="w-4 h-4 mr-2" />
                    Profile
                  </DropdownMenuItem>
                </>
              )}
              {user.role === 'official' && (
                <>
                  <DropdownMenuItem 
                    onClick={() => handleOfficialNavigation('dashboard', '/official-dashboard')}
                    className={isActiveNavItem('official-dashboard') ? 'bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400' : ''}
                  >
                    <Home className="w-4 h-4 mr-2" />
                    Dashboard
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    onClick={() => handleOfficialNavigation('search', '/official-dashboard')}
                    className={isActiveNavItem('official-search') ? 'bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400' : ''}
                  >
                    <Search className="w-4 h-4 mr-2" />
                    Search
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    onClick={() => handleOfficialNavigation('stats', '/official-dashboard')}
                    className={isActiveNavItem('official-stats') ? 'bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400' : ''}
                  >
                    <BarChart3 className="w-4 h-4 mr-2" />
                    Stats
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    onClick={() => handleNavigation('/officer-profile')}
                    className={isActiveNavItem('official-profile') ? 'bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400' : ''}
                  >
                    <User className="w-4 h-4 mr-2" />
                    Profile
                  </DropdownMenuItem>
                </>
              )}
              <DropdownMenuItem onClick={logout} className="text-red-600">
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;