import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import Layout from '@/components/Layout';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Progress } from '@/components/ui/progress';
import { 
  FileText, 
  Book, 
  Users, 
  Briefcase, 
  User, 
  Baby,
  Plus,
  Activity,
  Award,
  TrendingUp,
  ArrowRight,
  Key,
  XCircle,
  BarChart3,
  Trophy,
  Copy,
  Check
} from 'lucide-react';
import AddChildForm from '@/components/child/AddChildForm';
import ChildCard from '@/components/child/ChildCard';
import ChildRecordsManager from '@/components/child/ChildRecordsManager';
import ParentProfile from '@/components/parent/ParentProfile';
import ParentAnalytics from '@/components/analytics/ParentAnalytics';
import ChildLeaderboard from '@/components/leaderboard/ChildLeaderboard';
import { generateChildLogin, deactivateChild } from '@/lib/childApi';
import type { ChildFormData } from '@/components/child/AddChildForm';

// Update shimmerStyle CSS
const shimmerStyle = `
@keyframes shimmer {
  0% { background-position: -400px 0; }
  100% { background-position: 400px 0; }
}
.shimmer {
  background: linear-gradient(90deg, #d6d6d7 25%, #e8e8e8 37%, #d6d6d7 63%);
  background-size: 400px 100%;
  animation: shimmer 1.2s infinite linear;
  pointer-events: none;
}
.dark .shimmer {
  background: linear-gradient(90deg, #d6d6d7 25%, #e8e8e8 37%, #d6d6d7 63%);
  background-size: 400px 100%;
}
`;


// Define a proper Child type
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
  credits?: number;
}

interface Credentials {
  userId: string;
  password: string;
}

const ParentDashboard: React.FC = () => {
  const { user, logout } = useAuth();
  
  
  const location = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState(searchParams.get('tab') || 'dashboard');
  const [showAddChild, setShowAddChild] = useState(false);
  const [selectedChild, setSelectedChild] = useState<string | null>(null);
  const [children, setChildren] = useState<Child[]>([]);
  const [totalAchievements, setTotalAchievements] = useState(0);
  const [isLoaded, setIsLoaded] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [showCredentials, setShowCredentials] = useState<string | null>(null);
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [childRecordTabs, setChildRecordTabs] = useState<Record<string, string>>({});

  useEffect(() => {
    setIsLoaded(false);
    const t = setTimeout(() => setIsLoaded(true), 800); // Reduced timing for better UX
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  // Handle navigation state from other components
  useEffect(() => {
    if (location.state?.activeTab) {
      setActiveTab(location.state.activeTab);
      // Clear the state to prevent issues on refresh
      window.history.replaceState({}, document.title);
    }
  }, [location.state]);

  // Advanced tab routing: sync tab with URL query param (no flicker, no warning)
  useEffect(() => {
    const tab = searchParams.get('tab');
    if (tab && tab !== activeTab) {
      setActiveTab(tab);
    } else if (!tab && activeTab !== 'dashboard') {
      setActiveTab('dashboard');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  // Advanced tab routing for child records view
  useEffect(() => {
    const tab = searchParams.get('tab');
    const childId = searchParams.get('childId');
    const recordTab = searchParams.get('recordTab');

    // Handle records view
    if (tab === 'records' && childId) {
      // Only update if something changed
      if (selectedChild !== childId || activeTab !== 'records') {
        setSelectedChild(childId);
        setActiveTab('records');
      }
      
      // Update the record tab if provided
      if (recordTab) {
        setChildRecordTabs(prev => ({...prev, [childId]: recordTab}));
      }
    } 
    // Handle other tabs
    else if (tab && tab !== activeTab && ['dashboard', 'analytics', 'leaderboard', 'profile'].includes(tab)) {
      setActiveTab(tab);
      setSelectedChild(null);
    } 
    // Default to dashboard
    else if (!tab && activeTab !== 'dashboard') {
      setActiveTab('dashboard');
      setSelectedChild(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  useEffect(() => {
    if (activeTab === 'records' && selectedChild) {
      if (searchParams.get('tab') !== 'records' || searchParams.get('childId') !== selectedChild) {
        setSearchParams({ tab: 'records', childId: selectedChild }, { replace: true });
      }
    } else if (activeTab && activeTab !== searchParams.get('tab')) {
      setSearchParams({ tab: activeTab }, { replace: true });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab, selectedChild]);

  useEffect(() => {
    (async () => {
      try {
        const api = (await import('@/lib/api')).default;
        const res = await api.get('/child');
        const childrenWithId: Child[] = Array.isArray(res.data)
          ? res.data.map((child: Record<string, unknown>) => ({
              ...child,
              id: typeof child._id === 'string' ? child._id : (child.id as string),
              name: String(child.name),
              dob: String(child.dob),
              gender: String(child.gender),
              photo: typeof child.photo === 'string' ? child.photo : undefined,
              hasLogin: Boolean(child.hasLogin),
              userId: typeof child.userId === 'string' ? child.userId : undefined,
              password: typeof child.password === 'string' ? child.password : undefined,
              bloodGroup: String(child.bloodGroup),
              disability: String(child.disability),
              isActive: typeof child.isActive === 'boolean' ? child.isActive : true,
              credits: typeof child.credits === 'number' ? child.credits : 0,
            }))
          : [];
        setChildren(childrenWithId);
        // Fetch total achievements for all children
        if (childrenWithId.length > 0) {
          let total = 0;
          for (const child of childrenWithId) {
            const recRes = await api.get(`/record?childId=${child.id}&type=achievement`);
            if (Array.isArray(recRes.data)) total += recRes.data.length;
          }
          setTotalAchievements(total);
        } else {
          setTotalAchievements(0);
        }
      } catch (error: unknown) {
        setTotalAchievements(0);
      }
    })();
  }, [activeTab]);

  // Add child using backend response
  const handleAddChild = async (childData: Child) => {
    // The child data is already formatted correctly from the AddChildForm
    setChildren(prev => [...prev, childData]);
    setShowAddChild(false);
    setActiveTab('dashboard');
  };

  const handleGenerateLogin = async (childId: string) => {
    try {
      const credentials = await generateChildLogin(childId);
      if (credentials && credentials.userId && credentials.password) {
        setChildren(children.map(child => 
          child.id === childId 
            ? { ...child, hasLogin: true, userId: credentials.userId, password: credentials.password, isActive: true }
            : child
        ));
      }
    } catch (err) {
      console.error('Error generating login:', err);
      // You can add toast notification here if needed
    }
  };

  const handleToggleChildStatus = async (childId: string, isActive: boolean) => {
    if (!isActive) {
      // Deactivate and remove credentials
      try {
        await deactivateChild(childId);
        setChildren(children.map(child => 
          child.id === childId 
            ? { ...child, isActive: false, hasLogin: false, userId: undefined, password: undefined }
            : child
        ));
      } catch (err) {
        // Optionally show error toast
      }
    } else {
      // Optionally, you could allow re-activation here (not implemented)
    }
  };

  const handleChildClick = (childId: string) => {
    if (!childId) return; // Safety check
    
    const lastTab = childRecordTabs[childId] || 'health'; // Default to health tab
    
    // Update state in a more predictable order
    setSelectedChild(childId);
    setActiveTab('records');
    
    // Use setTimeout to ensure state updates have processed
    setTimeout(() => {
      setSearchParams({ 
        tab: 'records', 
        childId, 
        recordTab: lastTab 
      }, { 
        replace: true 
      });
    }, 0);
  };

  const handleCopy = async (text: string, field: string) => {
    await navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  // Add effect to scroll to top when navigating to records
  useEffect(() => {
    if (selectedChild && activeTab === 'records') {
      // Ensure the scroll happens after the component has rendered
      setTimeout(() => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }, 100);
    }
  }, [selectedChild, activeTab]);

  // Effect to handle child record tab persistence
  useEffect(() => {
    const tab = searchParams.get('recordTab');
    const childId = searchParams.get('childId');
    
    if (childId && tab) {
      // Ensure we're not accidentally overwriting with undefined or invalid values
      if (typeof tab === 'string' && tab.length > 0) {
        setChildRecordTabs(prev => ({...prev, [childId]: tab}));
      }
    }
  }, [searchParams]);

  // Effect to sync URL params with tab state
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const recordTab = params.get('recordTab');
    const childId = params.get('childId');

    if (recordTab && childId && selectedChild === childId) {
      setChildRecordTabs(prev => ({...prev, [childId]: recordTab}));
    }
  }, [selectedChild]);

  // Effect to handle first-time tab selection
  useEffect(() => {
    if (selectedChild) {
      const recordTab = searchParams.get('recordTab');
      if (!recordTab) {
        // Set default tab if none is selected
        setSearchParams({ 
          tab: 'records', 
          childId: selectedChild, 
          recordTab: 'health' 
        }, { 
          replace: true 
        });
      }
    }
  }, [selectedChild, searchParams, setSearchParams]);

  if (showAddChild) {
    return (
      <Layout activeTab={activeTab} 
      onTabChange={setActiveTab}>
        <div className="min-h-screen bg-gradient-to-br from-blue-50/50 via-white to-purple-50/50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800 transition-all duration-700 ease-in-out relative overflow-hidden">
          {/* Animated Background Elements */}
          <div className="fixed inset-0 pointer-events-none">
            <div className="absolute w-96 h-96 bg-gradient-to-r from-blue-500/10 to-purple-500/10 dark:from-blue-400/5 dark:to-purple-400/5 rounded-full blur-3xl animate-pulse" style={{ left: '10%', top: '20%' }} />
            <div className="absolute w-64 h-64 bg-gradient-to-r from-green-500/10 to-blue-500/10 dark:from-green-400/5 dark:to-blue-400/5 rounded-full blur-3xl animate-pulse" style={{ right: '10%', bottom: '20%' }} />
          </div>
          
          <div className="relative min-h-screen p-4">
            <div className="max-w-4xl mx-auto">
              <div className="flex items-center mb-8">
                <Button 
                  variant="outline" 
                  onClick={() => setShowAddChild(false)} 
                  className="mr-4 bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl border-0 shadow-lg hover:shadow-xl transition-all duration-500 transform hover:scale-105"
                >
                  ← Back to Dashboard
                </Button>
                <h1 className="text-3xl font-light text-gray-900 dark:text-white">
                  Add New
                  <span className="block font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                    Child
                  </span>
                </h1>
              </div>
              <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-3xl shadow-2xl border-0 p-6">
                <AddChildForm onSubmit={handleAddChild} onCancel={() => setShowAddChild(false)} />
              </div>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  if (selectedChild && activeTab === 'records') {
    const child = children.find(c => c.id === selectedChild);
    return (
      <Layout activeTab={activeTab} onTabChange={setActiveTab}>
        <div className="min-h-screen bg-gradient-to-br from-blue-50/50 via-white to-purple-50/50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800 transition-all duration-700 ease-in-out relative overflow-hidden">
          {/* Animated Background Elements */}
          <div className="fixed inset-0 pointer-events-none">
            <div className="absolute w-96 h-96 bg-gradient-to-r from-blue-500/10 to-purple-500/10 dark:from-blue-400/5 dark:to-purple-400/5 rounded-full blur-3xl animate-pulse" style={{ left: '10%', top: '20%' }} />
            <div className="absolute w-64 h-64 bg-gradient-to-r from-green-500/10 to-blue-500/10 dark:from-green-400/5 dark:to-blue-400/5 rounded-full blur-3xl animate-pulse" style={{ right: '10%', bottom: '20%' }} />
          </div>
          
          <div className="relative min-h-screen p-4">
            <div className="max-w-6xl mx-auto">
              <div className="flex items-center mb-8">
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setSelectedChild(null);
                    setActiveTab('dashboard');
                    setSearchParams({ tab: 'dashboard' }, { replace: true });
                  }}
                  className="mr-4 bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl border-0 shadow-lg hover:shadow-xl transition-all duration-500 transform hover:scale-105"
                >
                  ← Back to Dashboard
                </Button>
                <h1 className="text-3xl font-light text-gray-900 dark:text-white">
                  {child?.name}
                  <span className="block font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                    Records Management
                  </span>
                </h1>
              </div>
              <div className="backdrop-blur-xl rounded-3xl shadow-2xl border-0 p-6">
                <ChildRecordsManager 
                  childId={selectedChild} 
                  childName={children.find(c => c.id === selectedChild)?.name || ''}
                />
              </div>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  // Shimmer placeholder for cards
  const ShimmerCard = () => (
    <Card className="relative overflow-hidden border-0 shadow-lg bg-[#d6d6d7]/20">
      <CardContent className="relative p-10">
        <div className="flex flex-col gap-4">
          {/* Title */}
          <div className="shimmer h-4 w-24 rounded-md" />
          {/* Value */}
          <div className="shimmer h-12 w-32 rounded-lg" />
          {/* Subtitle */}
          <div className="flex items-center gap-2">
            <div className="shimmer h-4 w-4 rounded-full" />
            <div className="shimmer h-4 w-20 rounded-md" />
          </div>
          {/* Progress bar */}
          <div className="shimmer h-1.5 w-full rounded-full mt-2" />
          {/* Icon container */}
          <div className="absolute top-8 right-8">
            <div className="shimmer w-12 h-12 rounded-xl" />
          </div>
        </div>
      </CardContent>
    </Card>
  );

  // Shimmer placeholder for children cards
  const ShimmerChildCard = () => (
    <Card className="relative overflow-hidden border-0 shadow-lg bg-[#d6d6d7]/5">
      <CardContent className="relative p-8">
        <div className="flex flex-col items-center text-center mb-6 gap-4">
          <div className="shimmer w-28 h-28 rounded-3xl mb-4" />
          <div className="shimmer h-6 w-24 rounded" />
          <div className="shimmer h-4 w-32 rounded" />
        </div>
        <div className="flex gap-3">
          <div className="shimmer h-10 w-24 rounded-xl" />
          <div className="shimmer h-10 w-24 rounded-xl" />
        </div>
      </CardContent>
    </Card>
  );

  // Add shimmer for header
  const ShimmerHeader = () => (
    <div className="  flex flex-col lg:flex-row justify-between items-start lg:items-center mb-12 bg-[#d6d6d7]/7">
      <div className="mb-6 lg:mb-0 flex items-center gap-8">
        <div className="shimmer w-24 h-24 rounded-3xl" />
        <div className="space-y-2">
          <div className="shimmer h-10 w-64 rounded" />
          <div className="shimmer h-8 w-48 rounded" />
          <div className="shimmer h-6 w-80 rounded" />
        </div>
      </div>
    </div>
  );

  // Add shimmer for analytics, leaderboard, profile tab content
  const ShimmerTabContent = () => (
    <Card className="relative overflow-hidden border-0 shadow-2xl bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-900 animate-pulse">
      <CardContent className="relative p-8">
        <div className="flex flex-col gap-6">
          <div className="shimmer h-8 w-64 rounded mb-4" />
          <div className="shimmer h-6 w-96 rounded mb-4" />
          <div className="shimmer h-40 w-full rounded mb-4" />
          <div className="shimmer h-8 w-1/2 rounded mb-4" />
          <div className="shimmer h-6 w-1/3 rounded" />
        </div>
      </CardContent>
    </Card>
  );

  return (
    <>
      <style>{shimmerStyle}</style>
      <Layout>
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/50 to-indigo-50/50 dark:from-gray-900 dark:via-blue-900/25 dark:to-indigo-900/25 transition-all duration-1000 ease-in-out">
          {/* Enhanced Animated Background Elements - hidden on mobile */}
          <div className="fixed inset-0 pointer-events-none hidden sm:block">
            <div 
              className="absolute w-[500px] h-[500px] bg-gradient-to-r from-blue-500/15 to-purple-500/15 dark:from-blue-400/8 dark:to-purple-400/8 rounded-full blur-3xl transition-all duration-1000 ease-out"
              style={{
                transform: `translate(${mousePosition.x * 0.03}px, ${mousePosition.y * 0.03}px)`,
                left: '5%',
                top: '15%'
              }}
            />
            <div 
              className="absolute w-80 h-80 bg-gradient-to-r from-green-500/15 to-blue-500/15 dark:from-green-400/8 dark:to-blue-400/8 rounded-full blur-3xl transition-all duration-1000 ease-out"
              style={{
                transform: `translate(${mousePosition.x * -0.02}px, ${mousePosition.y * -0.02}px)`,
                right: '5%',
                bottom: '15%'
              }}
            />
            <div 
              className="absolute w-64 h-64 bg-gradient-to-r from-purple-500/10 to-pink-500/10 dark:from-purple-400/5 dark:to-pink-400/5 rounded-full blur-3xl transition-all duration-1000 ease-out"
              style={{
                transform: `translate(${mousePosition.x * 0.015}px, ${mousePosition.y * 0.015}px)`,
                left: '50%',
                top: '50%'
              }}
            />
          </div>

          <div className="relative min-h-screen p-2 sm:p-8">
            <div className="max-w-7xl mx-auto w-full px-0 sm:px-2">
              {/* Header */}
              {isLoaded ? (
                <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-12">
                  <div className="mb-6 lg:mb-0 flex items-center gap-8">
                    <div className="relative group">
                      <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600 flex items-center justify-center shadow-2xl transform hover:scale-110 transition-all duration-700 cursor-pointer relative overflow-hidden p-4">
                        <div className="absolute inset-0 bg-gradient-to-br from-white/30 to-transparent"></div>
                        <img 
                          src="./whilte_logo.png"
                          alt="Logo"
                          className="w-full h-full object-contain relative z-10 drop-shadow-lg dark:hidden" 
                        />
                        <img 
                          src="./whilte_logo.png"
                          alt="Logo"
                          className="w-full h-full object-contain relative z-10 drop-shadow-lg hidden dark:block" 
                        />
                        <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-blue-400/50 to-purple-400/50 opacity-0 "></div>
                      </div>
                      <div className="absolute -inset-3 bg-gradient-to-r from-blue-600 to-purple-600 rounded-[2rem] opacity-20 m-1"></div>
                    </div>
                    
                    <div className="space-y-1">
                      <h1 className="text-4xl lg:text-5xl font-black bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 dark:from-white dark:via-gray-100 dark:to-white bg-clip-text text-transparent">
                        Welcome back,
                      </h1>
                      <p className="text-3xl lg:text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 transform hover:translate-x-2 transition-transform duration-700">
                        {user?.name}
                      </p>
                      <p className="text-lg text-gray-600 dark:text-gray-400 font-medium">
                        Manage your children's progress and achievements
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                <ShimmerHeader />
              )}

              {/* Main Content */}
              <div className="space-y-8">
                {/* Navigation Tabs */}
                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full -mt-8">
                  <TabsList className={`grid grid-cols-4 mb-10 bg-white/70 dark:bg-gray-800/90 backdrop-blur-3xl border-0 shadow-2xl rounded-3xl pt-19 pb-16 px-2 sm:w-[110%] sm:-ml-[5%] sm:px-8 max-w-full w-full ml-0`} style={{ animationDelay: '0.1s' }}>
                    <TabsTrigger 
                      value="dashboard" 
                      className="group relative flex items-center justify-center h-16 gap-3 rounded-2xl
                      data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-600 data-[state=active]:via-indigo-600 data-[state=active]:to-purple-600 
                      data-[state=active]:text-white data-[state=active]:shadow-lg 
                      transition-all duration-500 transform hover:scale-105 hover:-translate-y-1
                      px-2 sm:px-4"
                    >
                      <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                      <Users className="w-5 h-5" />
                      <span className="font-medium hidden xs:hidden sm:inline md:inline lg:inline xl:inline">Children Dashboard</span>
                      {activeTab === 'dashboard' && (
                        <>
                          <div className="absolute -top-1 -right-1 w-2 h-2 bg-white rounded-full animate-ping"></div>
                          <div className="absolute -bottom-1 -left-1 w-2 h-2 bg-white/70 rounded-full animate-pulse"></div>
                        </>
                      )}
                    </TabsTrigger>
                    <TabsTrigger 
                      value="analytics" 
                      className="group relative flex items-center justify-center h-16 gap-3 rounded-2xl
                      data-[state=active]:bg-gradient-to-r data-[state=active]:from-emerald-600 data-[state=active]:via-green-600 data-[state=active]:to-teal-600 
                      data-[state=active]:text-white data-[state=active]:shadow-lg 
                      transition-all duration-500 transform hover:scale-105 hover:-translate-y-1
                      px-2 sm:px-4"
                    >
                      <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                      <BarChart3 className="w-5 h-5" />
                      <span className="font-medium hidden xs:hidden sm:inline md:inline lg:inline xl:inline">Analytics</span>
                      {activeTab === 'analytics' && (
                        <>
                          <div className="absolute -top-1 -right-1 w-2 h-2 bg-white rounded-full animate-ping"></div>
                          <div className="absolute -bottom-1 -left-1 w-2 h-2 bg-white/70 rounded-full animate-pulse"></div>
                        </>
                      )}
                    </TabsTrigger>
                    <TabsTrigger 
                      value="leaderboard" 
                      className="group relative flex items-center justify-center h-16 gap-3 rounded-2xl
                      data-[state=active]:bg-gradient-to-r data-[state=active]:from-amber-600 data-[state=active]:via-orange-600 data-[state=active]:to-red-600 
                      data-[state=active]:text-white data-[state=active]:shadow-lg 
                      transition-all duration-500 transform hover:scale-105 hover:-translate-y-1
                      px-2 sm:px-4"
                    >
                      <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                      <Trophy className="w-5 h-5" />
                      <span className="font-medium hidden xs:hidden sm:inline md:inline lg:inline xl:inline">Leaderboard</span>
                      {activeTab === 'leaderboard' && (
                        <>
                          <div className="absolute -top-1 -right-1 w-2 h-2 bg-white rounded-full animate-ping"></div>
                          <div className="absolute -bottom-1 -left-1 w-2 h-2 bg-white/70 rounded-full animate-pulse"></div>
                        </>
                      )}
                    </TabsTrigger>
                    <TabsTrigger 
                      value="profile" 
                      className="group relative flex items-center justify-center h-16 gap-3 rounded-2xl
                      data-[state=active]:bg-gradient-to-r data-[state=active]:from-rose-600 data-[state=active]:via-pink-600 data-[state=active]:to-fuchsia-600 
                      data-[state=active]:text-white data-[state=active]:shadow-lg 
                      transition-all duration-500 transform hover:scale-105 hover:-translate-y-1
                      px-2 sm:px-4"
                    >
                      <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                      <User className="w-5 h-5" />
                      <span className="font-medium hidden xs:hidden sm:inline md:inline lg:inline xl:inline">My Profile</span>
                      {activeTab === 'profile' && (
                        <>
                          <div className="absolute -top-1 -right-1 w-2 h-2 bg-white rounded-full animate-ping"></div>
                          <div className="absolute -bottom-1 -left-1 w-2 h-2 bg-white/70 rounded-full animate-pulse"></div>
                        </>
                      )}
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="dashboard" className="space-y-8">
                    {/* Quick Stats */}
                    <div className={`grid grid-cols-1 md:grid-cols-4 gap-8 mb-10`}>
                      {!isLoaded
                        ? Array.from({ length: 4 }).map((_, i) => (
                            <div key={i} className="animate-fadeIn" style={{ animationDelay: `${i * 0.1}s` }}>
                              <ShimmerCard />
                            </div>
                          ))
                        : [
                          { 
                            icon: <Users className="w-8 h-8 text-white drop-shadow-lg" />, 
                            title: "Total Children", 
                            value: children.length, 
                            gradient: "from-blue-600 via-blue-700 to-indigo-800",
                            delay: "0.3s"
                          },
                          { 
                            icon: <Activity className="w-8 h-8 text-white drop-shadow-lg" />, 
                            title: "Active Logins", 
                            value: children.filter(c => c.hasLogin && c.isActive !== false).length, 
                            gradient: "from-emerald-500 via-emerald-600 to-teal-700",
                            delay: "0.4s"
                          },
                          { 
                            icon: <Award className="w-8 h-8 text-white drop-shadow-lg" />, 
                            title: "Total Achievements", 
                            value: totalAchievements, 
                            gradient: "from-rose-500 via-pink-600 to-fuchsia-700",
                            delay: "0.5s"
                          },
                          { 
                            icon: <Users className="w-8 h-8 text-white drop-shadow-lg" />, 
                            title: "Active Accounts", 
                            value: children.filter(c => c.isActive !== false).length, 
                            gradient: "from-amber-500 via-orange-600 to-red-600",
                            delay: "0.6s"
                          }
                        ].map((stat, index) => (
                          <Card 
                            key={index}
                            className={`group relative overflow-hidden border-0 shadow-2xl hover:shadow-3xl transition-all duration-700 transform hover:-translate-y-4 hover:scale-105 cursor-pointer bg-gradient-to-br ${stat.gradient} animate-fadeInUp`}
                            style={{ animationDelay: stat.delay }}
                          >
                            {/* Enhanced Animated Background Pattern */}
                            <div className="absolute inset-0 opacity-15">
                              <div className="absolute -top-6 -right-6 w-32 h-32 rounded-full bg-white/30 group-hover:scale-200 transition-transform duration-1000 ease-out"></div>
                              <div className="absolute -bottom-8 -left-8 w-40 h-40 rounded-full bg-white/15 group-hover:scale-150 transition-transform duration-1000 delay-100 ease-out"></div>
                              <div className="absolute top-1/2 left-1/2 w-24 h-24 rounded-full bg-white/10 group-hover:scale-125 transition-transform duration-800 delay-200 ease-out"></div>
                            </div>
                            
                            {/* Enhanced Gradient Overlay */}
                            <div className="absolute inset-0 bg-gradient-to-br from-white/25 via-white/10 to-black/15 group-hover:from-white/35 group-hover:via-white/15 group-hover:to-black/20 transition-all duration-700"></div>
                            
                            {/* Enhanced Shimmer Effect */}
                            <div className="absolute inset-0 opacity-0 group-hover:opacity-100 bg-gradient-to-r from-transparent via-white/30 to-transparent -skew-x-12 translate-x-[-150%] group-hover:translate-x-[250%] transition-all duration-1200 ease-out"></div>
                            
                            {/* Floating Particles Effect */}
                            <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                              <div className="absolute top-4 right-8 w-1 h-1 bg-white/60 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                              <div className="absolute top-12 right-16 w-1.5 h-1.5 bg-white/40 rounded-full animate-bounce" style={{ animationDelay: '0.5s' }}></div>
                              <div className="absolute bottom-8 left-12 w-1 h-1 bg-white/50 rounded-full animate-bounce" style={{ animationDelay: '0.8s' }}></div>
                            </div>
                            
                            <CardContent className="relative p-10">
                              <div className="flex justify-between items-start">
                                <div className="space-y-4">
                                  <div className="flex items-center space-x-3">
                                    <p className="text-sm font-black text-white/95 uppercase tracking-widest letter-spacing-2">{stat.title}</p>
                                    <div className="w-1.5 h-1.5 rounded-full bg-white/70 group-hover:scale-200 group-hover:bg-white transition-all duration-500"></div>
                                    <div className="w-1 h-1 rounded-full bg-white/50 group-hover:scale-150 transition-all duration-700 delay-100"></div>
                                  </div>
                                  <p className="text-5xl font-black text-white group-hover:scale-110 group-hover:text-white/95 transition-all duration-500 drop-shadow-lg">
                                    {stat.value.toLocaleString()}
                                  </p>
                                  <div className="flex items-center space-x-3 text-white/85">
                                    <TrendingUp className="w-5 h-5 group-hover:rotate-12 group-hover:scale-110 transition-all duration-500" />
                                    <span className="text-sm font-bold tracking-wide">Active Records</span>
                                    <ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 group-hover:translate-x-2 transition-all duration-500 delay-200" />
                                  </div>
                                  
                                  {/* New Progress Indicator */}
                                  <div className="w-full h-1.5 bg-white/20 rounded-full overflow-hidden">
                                    <div className="h-full w-0 bg-white/60 rounded-full group-hover:w-full transition-all duration-1000 delay-300"></div>
                                  </div>
                                </div>
                                <div className="p-5 rounded-3xl bg-white/30 backdrop-blur-md group-hover:scale-125 group-hover:rotate-12 group-hover:bg-white/40 transition-all duration-700 shadow-2xl border border-white/20">
                                  {stat.icon}
                                  {/* Icon Glow Effect */}
                                  <div className="absolute inset-0 rounded-3xl bg-white/40 blur opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        ))
                      }
                    </div>

                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 gap-4 sm:gap-0">
                      <div className="space-y-1 w-full sm:w-auto">
                        <h2 className="text-3xl font-black bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 dark:from-white dark:via-gray-100 dark:to-white bg-clip-text text-transparent">
                          My Children
                        </h2>
                        <p className="text-sm text-gray-600 dark:text-gray-400 font-medium">
                          Manage and monitor your children's progress
                        </p>
                      </div>
                      <div className="w-full sm:w-auto flex justify-center sm:justify-end">
                        {isLoaded ? (
                          <Button 
                            onClick={() => setShowAddChild(true)}
                            className="relative group bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold text-lg shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-300 rounded-2xl px-8 py-4 border border-white/10 w-9/12 sm:w-auto items-center"
                          >
                            <div className="relative flex items-center gap-3 justify-center">
                              <div className="p-2 bg-white/10 rounded-lg">
                                <Plus className="w-5 h-5" />
                              </div>
                              Add New Child
                            </div>
                          </Button>
                        ) : (
                          <div className="shimmer h-12 rounded-xl w-11/12 sm:w-40" />
                        )}
                      </div>
                    </div>

                    {/* Children Cards */}
                    <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 ${
                      isLoaded ? 'animate-fadeInUp' : 'opacity-0'
                    }`} style={{ animationDelay: '0.8s' }}>
                      {!isLoaded
                        ? Array.from({ length: 3 }).map((_, i) => <ShimmerChildCard key={i} />)
                        : children.map((child, index) => (
                          <div key={child.id} className="animate-fadeInUp" style={{ animationDelay: `${0.9 + index * 0.1}s` }}>
                            <Card 
                              className="group relative overflow-hidden border-0 shadow-2xl hover:shadow-3xl transition-all duration-700 transform hover:-translate-y-4 hover:scale-105 bg-gradient-to-br from-white/90 via-gray-50/95 to-white/90 dark:from-gray-800/90 dark:via-gray-750/95 dark:to-gray-800/90"
                            >
                              {/* Enhanced Background Pattern */}
                              <div className="absolute inset-0 opacity-15">
                                <div className="absolute -top-6 -right-6 w-32 h-32 rounded-full bg-gradient-to-br from-blue-400/20 to-purple-400/20 group-hover:scale-200 transition-transform duration-1000 ease-out"></div>
                                <div className="absolute -bottom-8 -left-8 w-40 h-40 rounded-full bg-gradient-to-br from-purple-400/15 to-pink-400/15 group-hover:scale-150 transition-transform duration-1000 delay-100 ease-out"></div>
                              </div>
                              
                              <CardContent className="relative p-8">
                                  <div className="p-2">
                                    <div className="flex flex-col items-center text-center mb-6">
                                      <div className="relative mb-4">
                                        <div className="relative group/photo">
                                          <div className="relative w-28 h-28 rounded-3xl bg-gradient-to-br from-blue-600 to-purple-600 p-[2px] shadow-xl transform-gpu transition-all duration-500 hover:scale-105">
                                            <div className="w-full h-full rounded-[1.3rem] overflow-hidden relative bg-white dark:bg-gray-800">
                                              {child.photo ? (
                                                <img 
                                                  src={child.photo} 
                                                  alt={child.name}
                                                  className="w-full h-full object-cover transform transition-transform duration-700 group-hover/photo:scale-110"
                                                />
                                              ) : (
                                                <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-900/30 dark:to-purple-900/30">
                                                  <User className="w-12 h-12 text-blue-600/80 dark:text-blue-400/80 transform-gpu transition-transform duration-500 group-hover/photo:scale-110" />
                                                </div>
                                              )}
                                              {/* Subtle shine effect */}
                                              <div className="absolute inset-0 bg-gradient-to-tr from-white/0 via-white/30 to-white/0 opacity-0 group-hover/photo:opacity-100 transition-all duration-700 blur-sm"></div>
                                            </div>
                                          </div>
                                        </div>
                                        {/* Status Indicator */}
                                        <div className="absolute -top-2 -right-2 w-7 h-7 rounded-full border-2 border-white dark:border-gray-800 shadow-lg flex items-center justify-center">
                                          {child.isActive !== false ? (
                                            <div className="w-full h-full bg-gradient-to-br from-emerald-400 to-green-500 rounded-full flex items-center justify-center">
                                              <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                                            </div>
                                          ) : (
                                            <div className="w-full h-full bg-gradient-to-br from-red-400 to-red-500 rounded-full flex items-center justify-center">
                                              <div className="w-2 h-2 bg-white/80 rounded-full"></div>
                                            </div>
                                          )}
                                        </div>
                                      </div>
                                      <h3 className="text-2xl font-bold bg-gradient-to-br from-gray-900 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent mb-3 group-hover:scale-105 transition-transform duration-500">
                                        {child.name}
                                      </h3>
                                      <div className="flex flex-col items-center gap-3 w-full">
                                        {child.hasLogin && child.isActive !== false ? (
                                          <>
                                            <Badge variant="default" className="bg-gradient-to-r from-emerald-500 to-green-600 px-4 py-1 text-sm shadow-lg">
                                              <div className="flex items-center gap-2">
                                                <Activity className="w-3.5 h-3.5" />
                                                Active Account
                                              </div>
                                            </Badge>
                                            <Button
                                              onClick={() => setShowCredentials(child.id)}
                                              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl hover:shadow-blue-500/25 transition-all duration-500 rounded-xl relative group/btn overflow-hidden"
                                            >
                                              <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 translate-x-[-100%] group-hover/btn:translate-x-[100%] transition-transform duration-700"></div>
                                              <div className="flex items-center justify-center gap-2 py-0.5">
                                                <Key className="w-4 h-4" />
                                                View Login Details
                                              </div>
                                            </Button>
                                          </>
                                        ) : (
                                          <Badge variant="secondary" className="bg-gradient-to-r from-gray-500 to-gray-600 px-4 py-1">
                                            <div className="flex items-center gap-2">
                                              <XCircle className="w-3.5 h-3.5" />
                                              Inactive Account
                                            </div>
                                          </Badge>
                                        )}
                                      </div>
                                    </div>

                                  <div className="flex flex-wrap gap-3">
                                    <Button
                                      onClick={() => handleChildClick(child.id)}
                                      className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transition-all duration-500 transform hover:scale-105"
                                    >
                                      <div className="flex items-center justify-center gap-2">
                                        <FileText className="w-4 h-4" />
                                        View Records
                                      </div>
                                    </Button>

                                    {!child.hasLogin && (
                                      <Button
                                        onClick={() => handleGenerateLogin(child.id)}
                                        className="flex-1 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white shadow-lg hover:shadow-xl transition-all duration-500 transform hover:scale-105"
                                      >
                                        <div className="flex items-center justify-center gap-2">
                                          <Key className="w-4 h-4" />
                                          Generate Login
                                        </div>
                                      </Button>
                                    )}

                                    {child.hasLogin && child.isActive !== false && (
                                      <Button
                                        onClick={() => handleToggleChildStatus(child.id, false)}
                                        variant="destructive"
                                        className="flex-1 bg-gradient-to-r from-red-500 to-rose-600 hover:from-red-600 hover:to-rose-700 text-white shadow-lg hover:shadow-xl transition-all duration-500 transform hover:scale-105"
                                      >
                                        <div className="flex items-center justify-center gap-2">
                                          <XCircle className="w-4 h-4" />
                                          Deactivate
                                        </div>
                                      </Button>
                                    )}
                                  </div>
                                </div>
                              </CardContent>
                            </Card>
                          </div>
                        ))
                      }
                    </div>

                    {children.length === 0 && (
                      <Card className={`relative overflow-hidden bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl shadow-2xl border-0 transform hover:scale-[1.02] transition-all duration-700 ease-out ${
                        isLoaded ? 'animate-fadeInUp' : 'opacity-0'
                      }`} style={{ animationDelay: '0.8s' }}>
                        <div className="absolute inset-0 bg-gradient-to-br from-blue-50/50 via-white/20 to-purple-50/50 dark:from-gray-800/50 dark:via-gray-700/20 dark:to-gray-600/50"></div>
                        <CardContent className="relative text-center py-16">
                          <div className="w-20 h-20 mx-auto mb-6 rounded-3xl bg-gradient-to-r from-blue-100 to-blue-200 dark:from-blue-900/30 dark:to-blue-800/30 flex items-center justify-center">
                            <Baby className="w-10 h-10 text-blue-600 dark:text-blue-400" />
                          </div>
                          <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">No children added yet</h3>
                          <p className="text-lg text-gray-600 dark:text-gray-400 mb-8 max-w-md mx-auto leading-relaxed">
                            Start by adding your first child to manage their records and activities.
                          </p>
                          <Button 
                            onClick={() => setShowAddChild(true)} 
                            className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 border-0 shadow-xl hover:shadow-2xl hover:shadow-blue-500/25 transform hover:scale-105 transition-all duration-500 rounded-2xl px-8 py-4 text-lg relative overflow-hidden group"
                          >
                            <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-500 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                            <div className="relative z-10 flex items-center gap-3">
                              <Plus className="w-6 h-6" />
                              Add Your First Child
                            </div>
                          </Button>
                        </CardContent>
                        <div className="absolute -top-10 -right-10 w-32 h-32 bg-blue-400/20 rounded-full blur-3xl animate-pulse"></div>
                        <div className="absolute -bottom-10 -left-10 w-24 h-24 bg-purple-400/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
                      </Card>
                    )}
                  </TabsContent>

                  <TabsContent value="analytics" className="w-full">
                    {isLoaded ? (
                      <Card className="relative overflow-hidden border-0 shadow-2xl bg-white/90 dark:bg-gray-800/90 backdrop-blur-3xl w-full">
                        {/* Enhanced Background Pattern */}
                        <div className="absolute inset-0">
                          <div className="absolute -top-6 -right-6 w-32 h-32 bg-gradient-to-br from-emerald-400/20 to-teal-400/20 rounded-full blur-2xl animate-pulse"></div>
                          <div className="absolute -bottom-8 -left-8 w-40 h-40 bg-gradient-to-br from-green-400/15 to-emerald-400/15 rounded-full blur-2xl animate-pulse" style={{ animationDelay: '1s' }}></div>
                        </div>
                        <CardContent className="relative p-2">
                          <ParentAnalytics parentId={user?.id || ''} />
                        </CardContent>
                      </Card>
                    ) : (
                      <ShimmerTabContent />
                    )}
                  </TabsContent>

                  <TabsContent value="leaderboard" className="w-full">
                    {isLoaded ? (
                      <Card className="relative overflow-hidden border-0 shadow-2xl bg-white/90 dark:bg-gray-800/90 backdrop-blur-3xl w-full">
                        {/* Enhanced Background Pattern */}
                        <div className="absolute inset-0">
                          <div className="absolute -top-6 -right-6 w-32 h-32 bg-gradient-to-br from-amber-400/20 to-orange-400/20 rounded-full blur-2xl animate-pulse"></div>
                          <div className="absolute -bottom-8 -left-8 w-40 h-40 bg-gradient-to-br from-orange-400/15 to-red-400/15 rounded-full blur-2xl animate-pulse" style={{ animationDelay: '1s' }}></div>
                        </div>
                        <CardContent className="relative p-2">
                          <ChildLeaderboard />
                        </CardContent>
                      </Card>
                    ) : (
                      <ShimmerTabContent />
                    )}
                  </TabsContent>

                  <TabsContent value="profile" className="w-full">
                    {isLoaded ? (
                      <Card className="relative overflow-hidden border-0 shadow-2xl bg-white/90 dark:bg-gray-800/90 backdrop-blur-3xl w-full">
                        {/* Enhanced Background Pattern */}
                        <div className="absolute inset-0">
                          <div className="absolute -top-6 -right-6 w-32 h-32 bg-gradient-to-br from-rose-400/20 to-pink-400/20 rounded-full blur-2xl animate-pulse"></div>
                          <div className="absolute -bottom-8 -left-8 w-40 h-40 bg-gradient-to-br from-pink-400/15 to-fuchsia-400/15 rounded-full blur-2xl animate-pulse" style={{ animationDelay: '1s' }}></div>
                        </div>
                        <CardContent className="relative p-2">
                          <ParentProfile />
                        </CardContent>
                      </Card>
                    ) : (
                      <ShimmerTabContent />
                    )}
                  </TabsContent>
                </Tabs>
              </div>
            </div>
          </div>
        </div>
        
        {/* Credentials Modal */}
        <CredentialsModal 
          showCredentials={showCredentials}
          setShowCredentials={setShowCredentials}
          children={children}
          copiedField={copiedField}
          handleCopy={handleCopy}
        />
      </Layout>
    </>
  );
};

{/* Credentials Modal */}
const CredentialsModal = ({ 
  showCredentials, 
  setShowCredentials, 
  children, 
  copiedField, 
  handleCopy 
}: { 
  showCredentials: string | null;
  setShowCredentials: (id: string | null) => void;
  children: Child[];
  copiedField: string | null;
  handleCopy: (text: string, field: string) => void;
}) => {
  const child = children.find(c => c.id === showCredentials);
  
  if (!child || !child.userId || !child.password) return null;
  
  return (
    <Dialog open={!!showCredentials} onOpenChange={() => setShowCredentials(null)}>
      <DialogContent className="bg-white/95 dark:bg-gray-800/95 backdrop-blur-xl border-0 shadow-2xl">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center">
              <Key className="w-5 h-5 text-white" />
            </div>
            Login Credentials
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-6 p-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 rounded-xl bg-gray-50 dark:bg-gray-700/50 group hover:bg-gray-100 dark:hover:bg-gray-700 transition-all duration-200">
              <div className="flex items-center gap-3">
                <User className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                <div>
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Username</p>
                  <p className="text-lg font-semibold text-gray-900 dark:text-white">{child.userId}</p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleCopy(child.userId, 'username')}
                className="opacity-0 group-hover:opacity-100 transition-opacity"
              >
                {copiedField === 'username' ? (
                  <Check className="w-4 h-4 text-green-500" />
                ) : (
                  <Copy className="w-4 h-4" />
                )}
              </Button>
            </div>
            
            <div className="flex items-center justify-between p-4 rounded-xl bg-gray-50 dark:bg-gray-700/50 group hover:bg-gray-100 dark:hover:bg-gray-700 transition-all duration-200">
              <div className="flex items-center gap-3">
                <Key className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                <div>
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Password</p>
                  <p className="text-lg font-semibold text-gray-900 dark:text-white">{child.password}</p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleCopy(child.password, 'password')}
                className="opacity-0 group-hover:opacity-100 transition-opacity"
              >
                {copiedField === 'password' ? (
                  <Check className="w-4 h-4 text-green-500" />
                ) : (
                  <Copy className="w-4 h-4" />
                )}
              </Button>
            </div>
          </div>
          
          <div className="flex justify-end">
            <Button
              variant="default"
              onClick={() => setShowCredentials(null)}
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
            >
              Close
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ParentDashboard;