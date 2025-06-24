import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import ErrorBoundary from "@/components/ErrorBoundary";
import RouteGuard from "@/components/RouteGuard";
import Navigation from "./components/Navigation";
import Privacy from './pages/Privacy';
import Terms from './pages/Terms';
import { Suspense, lazy } from 'react';

// Lazy loaded components
const SplashScreen = lazy(() => import("./pages/SplashScreen"));
const Index = lazy(() => import("./pages/Index"));
const Dashboard = lazy(() => import("./pages/Dashboard"));
const ChildDashboard = lazy(() => import("./pages/ChildDashboard"));
const ParentDashboard = lazy(() => import("./pages/ParentDashboard"));
const OfficialDashboard = lazy(() => import("./pages/OfficialDashboard"));
const SignInPage = lazy(() => import("./components/auth/SignInPage"));
const SignUpPage = lazy(() => import("./components/auth/SignUpPage"));
const NotFound = lazy(() => import("./pages/NotFound"));
const ParentProfile = lazy(() => import("./components/parent/ParentProfile"));
const ChildProfileTab = lazy(() => import("./components/child/ChildProfileTab"));
const VerifyingAccount = lazy(() => import('./pages/VerifyingAccount'));
const ProfileView = lazy(() => import("./components/official/ProfileView"));
const AddChildForm = lazy(() => import("./components/child/AddChildForm"));
const OfficerProfile = lazy(() => import("./components/official/OfiicerProfile"));
const About = lazy(() => import("./pages/About"));
const ComingSoon = lazy(() => import('./pages/ComingSoon'));
const Support = lazy(() => import("./pages/Support"));


const queryClient = new QueryClient();


const LoadingSpinner = ({ message = "Loading..." }: { message?: string }) => (
  <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-purple-50 dark:from-gray-900 dark:to-gray-800">
    <div className="text-center space-y-4">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
      <p className="text-gray-600 dark:text-gray-400 animate-pulse">{message}</p>
    </div>
  </div>
);

// Protected route for authenticated users only
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, isLoading } = useAuth();
  
  if (isLoading) {
    return <LoadingSpinner message="Loading your dashboard..." />;
  }
  // Block unverified official users
  if (user && user.role === 'official' && user.verified === false) {
    return <Navigate to="/verifying-account" replace />;
  }
  return user ? <>{children}</> : <Navigate to="/signin" replace />;
};

// Auth-only routes (signin/signup) - redirect if already authenticated
const AuthOnlyRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, isLoading } = useAuth();
  
  if (isLoading) {
    return <LoadingSpinner />;
  }
  
  // If user is authenticated, redirect to their dashboard
  if (user) {
    // Redirect based on user role
    switch (user.role) {
      case 'child':
        return <Navigate to="/child-dashboard" replace />;
      case 'parent':
        return <Navigate to="/parent-dashboard" replace />;
      case 'official':
        return <Navigate to="/official-dashboard" replace />;
      default:
        return <Navigate to="/dashboard" replace />;
    }
  }
  
  return <>{children}</>;
};


// Role-based dashboard component
const RoleBasedDashboard = () => {
  const { user, isLoading } = useAuth();
  
  if (isLoading) {
    return <LoadingSpinner message="Loading your dashboard..." />;
  }
  // If no user is authenticated, show the main dashboard with sign-in/sign-up options
  if (!user) {
    return <Dashboard />;
  }
  // Block unverified official users
  if (user.role === 'official' && user.verified === false) {
    return <Navigate to="/verifying-account" replace />;
  }
  // Route to role-specific dashboards for authenticated users
  switch (user.role) {
    case 'parent':
      return <Navigate to="/parent-dashboard" replace />;
    case 'child':
      return <Navigate to="/child-dashboard" replace />;
    case 'official':
      return <Navigate to="/official-dashboard" replace />;
    default:
      return <Dashboard />;
  }
};

const AppRoutes = () => {
  return (
    <Suspense fallback={null}>
      <Routes>
        {/* Splash route as homepage */}
        <Route path="/" element={<SplashScreen />} />
        {/* Main site route */}
        <Route path="/home" element={<Index />} />
        
        {/* Dashboard route - accessible to everyone, shows different content based on auth status */}
        <Route path="/dashboard" element={<RoleBasedDashboard />} />
        
        {/* Role-specific dashboard routes - protected */}
        <Route 
          path="/child-dashboard" 
          element={
            <ProtectedRoute>
              <Suspense fallback={<LoadingSpinner message="Loading child dashboard..." />}>
                <ChildDashboard />
              </Suspense>
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/parent-dashboard" 
          element={
            <ProtectedRoute>
              <Suspense fallback={null}>
                <ParentDashboard />
              </Suspense>
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/official-dashboard" 
          element={
            <ProtectedRoute>
              <Suspense fallback={<LoadingSpinner message="Loading official dashboard..." />}>
                <OfficialDashboard />
              </Suspense>
            </ProtectedRoute>
          } 
        />
        
        {/* Auth routes - only accessible when not authenticated */}
        <Route 
          path="/signin" 
          element={
            <AuthOnlyRoute>
              <Suspense fallback={<LoadingSpinner message="Loading sign in..." />}>
                <SignInPage />
              </Suspense>
            </AuthOnlyRoute>
          } 
        />
        <Route 
          path="/signup" 
          element={
            <AuthOnlyRoute>
              <Suspense fallback={<LoadingSpinner message="Loading sign up..." />}>
                <SignUpPage />
              </Suspense>
            </AuthOnlyRoute>
          } 
        />
        {/* Add support for /signin/:role to prevent 404 on child/parent sign in */}
        <Route 
          path="/signin/:role" 
          element={
            <AuthOnlyRoute>
              <Suspense fallback={<LoadingSpinner message="Loading sign in..." />}>
                <SignInPage />
              </Suspense>
            </AuthOnlyRoute>
          } 
        />
        {/* Add a redirect for /login to /signin for backward compatibility */}
        <Route path="/login" element={<Navigate to="/signin" replace />} />
        
        {/* Protected routes - only for authenticated users */}
        <Route 
          path="/parent-profile" 
          element={
            <ProtectedRoute>
              <Suspense fallback={<LoadingSpinner message="Loading profile..." />}>
                <ParentProfile />
              </Suspense>
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/child-profile" 
          element={
            <ProtectedRoute>
              <Suspense fallback={<LoadingSpinner message="Loading profile..." />}>
                <ChildProfileTab />
              </Suspense>
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/officer-profile" 
          element={
            <ProtectedRoute>
              <Suspense fallback={<LoadingSpinner message="Loading profile..." />}>
                <OfficerProfile />
              </Suspense>
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/verifying-account" 
          element={
            <Suspense fallback={<LoadingSpinner message="Loading verification..." />}>
              <VerifyingAccount />
            </Suspense>
          } 
        />
        <Route 
          path="/official/profile/:id" 
          element={
            <ProtectedRoute>
              <Suspense fallback={<LoadingSpinner message="Loading profile..." />}>
                <ProfileView />
              </Suspense>
            </ProtectedRoute>
          } 
        />
        <Route path="/coming-soon" element={<ComingSoon />} />
        <Route path="/support" element={<Support />} />
        
        {/* Catch-all route */}
        <Route path="*" element={<NotFound />} />
        {/*footer links*/}
        <Route path="/privacy" element={<Privacy />} />
        <Route path="/terms" element={<Terms />} />
        <Route path="/about" element={<About />} />
      </Routes>
    </Suspense>
  );
};

const App = () => (
  <ErrorBoundary>
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <AuthProvider>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 transition-all duration-300">
                <AppRoutes />
              </div>
            </BrowserRouter>
          </TooltipProvider>
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  </ErrorBoundary>
);

export default App;