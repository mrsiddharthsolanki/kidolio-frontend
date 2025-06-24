import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Users, 
  Search, 
  BarChart3, 
  MapPin, 
  User, 
  Heart, 
  Activity, 
  TrendingUp, 
  Clock, 
  Target, 
  Bell, 
  Sparkles, 
  ArrowRight,
  Award,
  Zap,
  Star
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import SearchView from '@/components/official/SearchView';
import StatsView from '@/components/official/StatsView';
import ProfileView from '@/components/official/ProfileView';
import Navigation from '@/components/Navigation';
import { fetchOfficialDashboardStats, fetchRecentActivity } from '@/lib/officialDashboardApi';
import { useSearchParams } from 'react-router-dom';

interface ActivityItem {
  _id?: string;
  type: string;
  subject: string;
  details: string;
  time: string | Date;
}

interface DashboardStats {
  totalChildren: number;
  totalParents: number;
  citiesCovered: number;
  disabilityMap: { [key: string]: number };
}

interface ChildProfile {
  id: string;
  name: string;
  age: number;
  gender: string;
  city: string;
  country: string;
  disability: string;
  bloodGroup: string;
  skills: string[];
  parentName: string;
  parentIncome: string;
  parentEducation: string;
  parentPhone: string;
  parentEmail: string;
  parentOccupation: string;
  address: string;
  emergencyContact: string;
  medicalHistory: string[];
  academicRecords: Array<{
    subject: string;
    grade: string;
    year: string;
    score: number;
  }>;
  achievements: Array<{
    title: string;
    date: string;
    description: string;
  }>;
  documents: Array<{
    name: string;
    type: string;
    date: string;
  }>;
}

interface DashboardCardProps {
  title: string;
  count: number;
  icon: React.ReactNode;
  bgColor: string;
  iconColor: string;
  onClick?: () => void;
}

const DashboardCard: React.FC<DashboardCardProps> = ({ 
  title, 
  count, 
  icon, 
  bgColor,
  iconColor,
  onClick
}) => {
  return (
    <Card 
      className={`group relative overflow-hidden border-0 shadow-2xl hover:shadow-3xl transition-all duration-700 transform hover:-translate-y-4 hover:scale-105 cursor-pointer ${bgColor}`}
      onClick={onClick}
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
              <p className="text-sm font-black text-white/95 uppercase tracking-widest letter-spacing-2">{title}</p>
              <div className="w-1.5 h-1.5 rounded-full bg-white/70 group-hover:scale-200 group-hover:bg-white transition-all duration-500"></div>
              <div className="w-1 h-1 rounded-full bg-white/50 group-hover:scale-150 transition-all duration-700 delay-100"></div>
            </div>
            <p className="text-5xl font-black text-white group-hover:scale-110 group-hover:text-white/95 transition-all duration-500 drop-shadow-lg">
              {count.toLocaleString()}
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
          <div className={`p-5 rounded-3xl bg-white/30 backdrop-blur-md group-hover:scale-125 group-hover:rotate-12 group-hover:bg-white/40 transition-all duration-700 shadow-2xl border border-white/20 ${iconColor}`}>
            {icon}
            {/* Icon Glow Effect */}
            <div className="absolute inset-0 rounded-3xl bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-sm"></div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

const QuickActionCard: React.FC<{
  title: string;
  description: string;
  icon: React.ReactNode;
  onClick: () => void;
  bgGradient: string;
}> = ({ title, description, icon, onClick, bgGradient }) => (
  <Card 
    className={`group cursor-pointer border-0 shadow-2xl hover:shadow-3xl transition-all duration-700 transform hover:-translate-y-4 hover:rotate-2 hover:scale-105 ${bgGradient} relative overflow-hidden`}
    onClick={onClick}
  >
    {/* Enhanced Animated Background Elements */}
    <div className="absolute -top-8 -right-8 w-28 h-28 rounded-full bg-white/15 group-hover:scale-175 group-hover:rotate-90 transition-all duration-1000 ease-out"></div>
    <div className="absolute -bottom-6 -left-6 w-20 h-20 rounded-full bg-white/10 group-hover:scale-150 transition-all duration-800 delay-150 ease-out"></div>
    <div className="absolute top-1/3 right-1/4 w-12 h-12 rounded-full bg-white/5 group-hover:scale-125 transition-all duration-600 delay-300"></div>
    
    {/* Enhanced Shimmer Effect */}
    <div className="absolute inset-0 opacity-0 group-hover:opacity-100 bg-gradient-to-r from-transparent via-white/25 to-transparent translate-x-[-120%] group-hover:translate-x-[220%] transition-all duration-1200 delay-300 ease-out"></div>
    
    {/* Floating Elements */}
    <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700">
      <Star className="absolute top-6 right-8 w-3 h-3 text-white/40 animate-pulse" style={{ animationDelay: '0.3s' }} />
      <Zap className="absolute bottom-8 left-6 w-4 h-4 text-white/30 animate-pulse" style={{ animationDelay: '0.7s' }} />
    </div>
    
    <CardContent className="relative p-10">
      <div className="flex items-center space-x-8">
        <div className="relative">
          <div className="p-5 rounded-3xl bg-white/30 backdrop-blur-md group-hover:scale-140 group-hover:rotate-15 transition-all duration-700 shadow-2xl border border-white/20">
            {icon}
          </div>
          {/* Icon Pulse Effect */}
          <div className="absolute inset-0 rounded-3xl bg-white/20 opacity-0 group-hover:opacity-100 animate-ping transition-opacity duration-500"></div>
        </div>
        <div className="space-y-3 flex-1">
          <h3 className="font-black text-white text-2xl group-hover:translate-x-3 group-hover:text-white/95 transition-all duration-500 drop-shadow-md">{title}</h3>
          <p className="text-white/90 text-base leading-relaxed group-hover:translate-x-2 transition-all duration-500 delay-100 font-medium">{description}</p>
          <div className="flex items-center space-x-3 opacity-0 group-hover:opacity-100 transition-all duration-500 delay-200">
            <span className="text-white/80 text-sm font-bold tracking-wide">Click to access</span>
            <ArrowRight className="w-4 h-4 text-white/80 group-hover:translate-x-1 transition-transform duration-300" />
            <div className="w-2 h-2 rounded-full bg-white/60 animate-pulse"></div>
          </div>
        </div>
      </div>
    </CardContent>
  </Card>
);

const ActivityCard: React.FC<{ activity: ActivityItem; index: number }> = ({ activity, index }) => {
  const formatTime = (time: string | Date) => {
    const date = new Date(time);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 60) {
      return `${diffInMinutes} minutes ago`;
    } else if (diffInMinutes < 1440) {
      return `${Math.floor(diffInMinutes / 60)} hours ago`;
    } else {
      return `${Math.floor(diffInMinutes / 1440)} days ago`;
    }
  };

  return (
    <div 
      className="group p-8 rounded-3xl bg-gradient-to-r from-white via-gray-50/80 to-white dark:from-gray-800 dark:via-gray-750 dark:to-gray-800 hover:from-blue-50 hover:via-indigo-50/90 hover:to-purple-50 dark:hover:from-blue-900/40 dark:hover:via-indigo-900/30 dark:hover:to-purple-900/40 transition-all duration-700 border-2 border-gray-100 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-500 hover:shadow-2xl transform hover:-translate-y-2 hover:scale-[1.02] relative overflow-hidden"
      style={{ animationDelay: `${index * 150}ms` }}
    >
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
        <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-400/10 to-purple-600/10 rounded-full -mr-16 -mt-16"></div>
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-br from-indigo-400/10 to-pink-600/10 rounded-full -ml-12 -mb-12"></div>
      </div>
      
      <div className="flex items-start space-x-6 relative">
        <div className="relative">
          <div className="p-4 rounded-2xl bg-gradient-to-br from-blue-500 via-indigo-600 to-purple-600 text-white shadow-2xl group-hover:scale-125 group-hover:rotate-12 transition-all duration-700 border border-white/20">
            <Activity className="w-6 h-6" />
          </div>
          <div className="absolute -top-2 -right-2 w-4 h-4 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full border-3 border-white animate-pulse shadow-lg"></div>
          {/* Glow Effect */}
          <div className="absolute inset-0 rounded-2xl bg-blue-400/20 opacity-0 group-hover:opacity-100 blur-lg transition-opacity duration-500"></div>
        </div>
        
        <div className="flex-1 space-y-4">
          <div className="flex items-center justify-between">
            <span className="font-black text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors duration-500 text-xl tracking-wide">
              {activity.type || 'Activity'}
            </span>
            <Badge variant="outline" className="text-[10px] sm:text-sm bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/40 dark:to-indigo-900/40 border-blue-300 dark:border-blue-600 backdrop-blur-sm px-2 sm:px-4 py-1 sm:py-2 font-bold whitespace-nowrap">
              <Clock className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
              {formatTime(activity.time)}
            </Badge>
          </div>
          
          <p className="text-base text-gray-700 dark:text-gray-300 leading-relaxed font-medium">
            <span className="font-black text-indigo-600 dark:text-indigo-400">{activity.subject}:</span>
            <span className="ml-3">{activity.details}</span>
          </p>
          
          {/* Enhanced Progress Bar */}
          <div className="w-full h-2 bg-gray-200 dark:bg-gray-600 rounded-full overflow-hidden shadow-inner">
            <div className="h-full w-0 bg-gradient-to-r from-blue-500 via-indigo-600 to-purple-600 rounded-full group-hover:w-full transition-all duration-1200 delay-300 shadow-lg"></div>
          </div>
          
          {/* Activity Status Indicator */}
          <div className="flex items-center space-x-2 opacity-0 group-hover:opacity-100 transition-all duration-500 delay-200">
            <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></div>
            <span className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Live Update</span>
          </div>
        </div>
      </div>
    </div>
  );
};

const LoadingCard: React.FC = () => (
  <Card className="border-0 shadow-2xl bg-gradient-to-br from-gray-100 via-gray-150 to-gray-200 dark:from-gray-800 dark:via-gray-750 dark:to-gray-700 animate-pulse relative overflow-hidden">
    {/* Enhanced Loading Animation */}
    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12 translate-x-[-100%] animate-shimmer"></div>
    <CardContent className="p-10">
      <div className="flex justify-between items-start">
        <div className="space-y-5">
          <div className="h-5 bg-gray-300 dark:bg-gray-600 rounded-xl w-32 animate-pulse"></div>
          <div className="h-10 bg-gray-300 dark:bg-gray-600 rounded-xl w-20 animate-pulse" style={{ animationDelay: '0.2s' }}></div>
          <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded-xl w-28 animate-pulse" style={{ animationDelay: '0.4s' }}></div>
        </div>
        <div className="w-20 h-20 bg-gray-300 dark:bg-gray-600 rounded-3xl animate-pulse" style={{ animationDelay: '0.1s' }}></div>
      </div>
    </CardContent>
  </Card>
);

const OfficialDashboard: React.FC = () => {
  const { user } = useAuth();
  
  const [selectedProfile, setSelectedProfile] = useState<ChildProfile | null>(null);


  
  const [searchParams, setSearchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState(searchParams.get('tab') || 'dashboard');

  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentActivity, setRecentActivity] = useState<ActivityItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [isLoaded, setIsLoaded] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    setIsLoaded(true);
  }, []);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        setLoading(true);
        const [statsData, activityData] = await Promise.all([
          fetchOfficialDashboardStats(),
          fetchRecentActivity()
        ]);
        setStats(statsData);
        setRecentActivity(activityData);
      } catch (error) {
        console.error('Error loading dashboard data:', error);
        toast({
          title: "Error",
          description: "Failed to load dashboard data. Please try again.",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };

    if (activeTab === 'dashboard') {
      loadDashboardData();
    }
  }, [activeTab]);

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

  // Fix: Always respect tab param from URL, even after profile navigation
  useEffect(() => {
    const tab = searchParams.get('tab');
    const childId = searchParams.get('childId');
    if (tab === 'profile-view' && childId && (!selectedProfile || selectedProfile.id !== childId || activeTab !== 'profile-view')) {
      setSelectedProfile({ ...(selectedProfile || {}), id: childId } as ChildProfile);
      setActiveTab('profile-view');
    } else if (tab && tab !== activeTab) {
      setActiveTab(tab);
      setSelectedProfile(null);
    } else if (!tab && activeTab !== 'dashboard') {
      setActiveTab('dashboard');
      setSelectedProfile(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  useEffect(() => {
    // Always update URL to match tab state
    if (activeTab === 'profile-view' && selectedProfile) {
      if (searchParams.get('tab') !== 'profile-view' || searchParams.get('childId') !== selectedProfile.id) {
        setSearchParams({ tab: 'profile-view', childId: selectedProfile.id }, { replace: true });
      }
    } else if (activeTab && activeTab !== searchParams.get('tab')) {
      setSearchParams({ tab: activeTab }, { replace: true });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab, selectedProfile]);

  // Fix: Navigation handler should always update tab param in URL
  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    setSearchParams({ tab }, { replace: true });
    if (tab !== 'profile-view') {
      setSelectedProfile(null);
    }
  };

  const handleViewProfile = (profile: ChildProfile) => {
    setSelectedProfile(profile);
    setActiveTab('profile-view');
  };

  const handleBackToSearch = () => {
    setSelectedProfile(null);
    setActiveTab('search');
  };

  const renderActiveTab = () => {
    if (selectedProfile) {
      return <ProfileView />;
    }

    switch (activeTab) {
      case 'search':
        return <SearchView />;
      case 'stats':
        return <StatsView />;
      case 'dashboard':
      default:
        return renderDashboard();
    }
  };

  const renderDashboard = () => {
    if (loading) {
      return (
        <div className="space-y-10">
          {/* Enhanced Loading Hero Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[1, 2, 3, 4].map((i) => (
              <LoadingCard key={i} />
            ))}
          </div>
          
          {/* Enhanced Loading Spinner */}
          <div className="flex items-center justify-center py-24">
            <div className="text-center space-y-8">
              <div className="relative w-28 h-28 mx-auto">
                <div className="absolute inset-0 border-6 border-blue-200 rounded-full animate-pulse"></div>
                <div className="absolute inset-0 border-6 border-transparent border-t-blue-600 rounded-full animate-spin"></div>
                <div className="absolute inset-3 border-4 border-transparent border-t-indigo-500 rounded-full animate-spin" style={{ animationDirection: 'reverse', animationDuration: '1.5s' }}></div>
                <div className="absolute inset-6 border-2 border-transparent border-t-purple-400 rounded-full animate-spin" style={{ animationDuration: '2s' }}></div>
              </div>
              <div className="space-y-3">
                <p className="text-2xl font-black text-gray-800 dark:text-gray-200">Loading Dashboard</p>
                <p className="text-lg text-gray-600 dark:text-gray-400 font-medium">Fetching latest data...</p>
                <div className="flex items-center justify-center space-x-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className="space-y-12">
        {/* Enhanced Hero Stats Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
          <DashboardCard 
            title="Total Children" 
            count={stats?.totalChildren ?? 0} 
            icon={<Users className="w-8 h-8 text-white drop-shadow-lg" />}
            bgColor="bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800"
            iconColor="text-white"
            onClick={() => setActiveTab('search')}
          />
          <DashboardCard 
            title="Special Needs"
            count={stats?.disabilityMap ? Object.keys(stats.disabilityMap).filter(k => k !== 'None').reduce((sum, k) => sum + stats.disabilityMap[k], 0) : 0} 
            icon={<Heart className="w-8 h-8 text-white drop-shadow-lg" />}
            bgColor="bg-gradient-to-br from-red-500 via-pink-600 to-rose-700"
            iconColor="text-white"
            onClick={() => setActiveTab('search')}
          />
          <DashboardCard 
            title="Cities Covered" 
            count={stats?.citiesCovered ?? 0} 
            icon={<MapPin className="w-8 h-8 text-white drop-shadow-lg" />}
            bgColor="bg-gradient-to-br from-amber-500 via-orange-600 to-red-600"
            iconColor="text-white"
            onClick={() => setActiveTab('stats')}
          />
          <DashboardCard 
            title="Total Parents"
            count={stats?.totalParents ?? 0} 
            icon={<Users className="w-8 h-8 text-white drop-shadow-lg" />}
            bgColor="bg-gradient-to-br from-green-500 via-emerald-600 to-teal-700"
            iconColor="text-white"
            onClick={() => setActiveTab('search')}
          />
        </div>

        {/* Enhanced Quick Actions */}
        <Card className="border-0 shadow-3xl bg-white/80 dark:bg-gray-800/80 backdrop-blur-2xl relative overflow-hidden">
          {/* Enhanced Decorative Background */}
          <div className="absolute inset-0 bg-gradient-to-br from-blue-50/60 via-transparent to-indigo-50/60 dark:from-blue-900/30 dark:to-indigo-900/30"></div>
          <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-br from-blue-400/15 to-indigo-600/15 rounded-full -mr-20 -mt-20 animate-pulse"></div>
          <div className="absolute bottom-0 left-0 w-32 h-32 bg-gradient-to-br from-purple-400/15 to-pink-600/15 rounded-full -ml-16 -mb-16 animate-pulse" style={{ animationDelay: '1s' }}></div>
          
          <CardHeader className="relative pb-10">
            <div className="flex items-center space-x-4">
              <div className="p-3 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 text-white shadow-2xl">
                <Sparkles className="w-7 h-7" />
              </div>
              <div>
                <CardTitle className="text-4xl font-black bg-gradient-to-r from-gray-900 via-blue-800 to-indigo-800 dark:from-white dark:via-blue-200 dark:to-indigo-200 bg-clip-text text-transparent">
                  Quick Actions
                </CardTitle>
                <p className="text-gray-600 dark:text-gray-400 text-xl font-bold">Access key features with one click</p>
              </div>
            </div>
          </CardHeader>
          <CardContent className="relative">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
              <QuickActionCard
                title="Search Profiles"
                description="Find and manage children profiles with advanced filters"
                icon={<Search className="w-8 h-8 text-white drop-shadow-lg" />}
                onClick={() => setActiveTab('search')}
                bgGradient="bg-gradient-to-br from-blue-600 via-indigo-700 to-purple-800"
              />
              <QuickActionCard
                title="View Statistics"
                description="Analyze data trends and generate comprehensive reports"
                icon={<BarChart3 className="w-8 h-8 text-white drop-shadow-lg" />}
                onClick={() => setActiveTab('stats')}
                bgGradient="bg-gradient-to-br from-green-600 via-emerald-700 to-teal-800"
              />
            </div>
          </CardContent>
        </Card>

        {/* Enhanced Recent Activity */}
        <Card className="border-0 shadow-3xl bg-white/80 dark:bg-gray-800/80 backdrop-blur-2xl relative overflow-hidden">
          {/* Enhanced Decorative Elements */}
          <div className="absolute inset-0 bg-gradient-to-br from-purple-50/40 via-transparent to-pink-50/40 dark:from-purple-900/15 dark:to-pink-900/15"></div>
          <div className="absolute top-0 left-0 w-48 h-48 bg-gradient-to-br from-purple-400/10 to-pink-600/10 rounded-full -ml-24 -mt-24 animate-pulse"></div>
          
          <CardHeader className="relative pb-4 sm:pb-6 md:pb-10">
            <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 items-start sm:items-center sm:justify-between">
              <div className="flex items-start space-x-3 sm:space-x-4 md:space-x-5">
                <div className="p-2.5 sm:p-3 md:p-4 rounded-2xl bg-gradient-to-br from-purple-500 via-pink-600 to-red-600 text-white shadow-2xl shrink-0">
                  <Bell className="w-5 h-5 sm:w-6 sm:h-6 md:w-7 md:h-7" />
                </div>
                <div className="space-y-0.5 sm:space-y-1 md:space-y-2">
                  <CardTitle className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-black bg-gradient-to-r from-gray-900 via-purple-800 to-pink-800 dark:from-white dark:via-purple-200 dark:to-pink-200 bg-clip-text text-transparent leading-tight">
                    Recent Activity
                  </CardTitle>
                  <p className="text-sm sm:text-base lg:text-lg text-gray-600 dark:text-gray-400 font-bold">Latest system updates and changes</p>
                </div>
              </div>
              <div className="flex items-center gap-2 sm:gap-3 text-gray-500 dark:text-gray-400">
                <Target className="w-4 h-4 sm:w-5 sm:h-5" />
                <span className="text-xs sm:text-sm md:text-base font-bold">Live Updates</span>
                <div className="w-2 h-2 sm:w-2.5 sm:h-2.5 md:w-3 md:h-3 rounded-full bg-green-400 animate-pulse"></div>
              </div>
            </div>
          </CardHeader>
          <CardContent className="relative">
            <div className="space-y-8">
              {recentActivity.length === 0 ? (
                <div className="text-center py-20">
                  <div className="relative mx-auto mb-8">
                    <div className="w-32 h-32 rounded-full bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-600 flex items-center justify-center shadow-2xl">
                      <Activity className="w-16 h-16 text-gray-400" />
                    </div>
                    <div className="absolute -top-3 -right-3 w-12 h-12 bg-gradient-to-br from-blue-400 to-indigo-600 rounded-full flex items-center justify-center shadow-xl">
                      <Sparkles className="w-6 h-6 text-white" />
                    </div>
                    <div className="absolute inset-0 rounded-full bg-blue-400/20 animate-ping"></div>
                  </div>
                  <div className="space-y-3">
                    <p className="text-2xl font-black text-gray-700 dark:text-gray-300">No Recent Activity</p>
                    <p className="text-lg text-gray-500 dark:text-gray-400 font-medium">Activity will appear here as it happens</p>
                  </div>
                </div>
              ) : (
                <div className="space-y-6">
                  {recentActivity.map((activity, index) => (
                    <ActivityCard key={activity._id || index} activity={activity} index={index} />
                  ))}
                </div>
              )}
            </div>
          </CardContent>
          <div className="absolute -top-12 -right-12 w-40 h-40 bg-blue-400/20 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute -bottom-12 -left-12 w-32 h-32 bg-purple-400/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1.5s' }}></div>
        </Card>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/50 to-indigo-50/50 dark:from-gray-900 dark:via-blue-900/25 dark:to-indigo-900/25">
      {/* Enhanced Animated Background Elements */}
      <div className="fixed inset-0 pointer-events-none">
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

      <Navigation onTabChange={handleTabChange} />
      <div className="relative min-h-screen p-8 md:p-10">
        <div className="max-w-7xl mx-auto">
          {/* Enhanced Header */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 md:mb-12 gap-6 md:gap-8">
            <div className="space-y-4 md:space-y-5 w-full">
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-6">
                <div className="p-2 sm:p-3 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 text-white shadow-2xl shrink-0">
                  {activeTab === 'dashboard' && <Target className="w-5 h-5 sm:w-7 sm:h-7" />}
                  {activeTab === 'search' && <Search className="w-5 h-5 sm:w-7 sm:h-7" />}
                  {activeTab === 'stats' && <BarChart3 className="w-5 h-5 sm:w-7 sm:h-7" />}
                </div>
                <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black bg-gradient-to-r from-gray-900 via-blue-800 to-indigo-800 dark:from-white dark:via-blue-200 dark:to-indigo-200 bg-clip-text text-transparent drop-shadow-sm leading-tight">
                  {activeTab === 'dashboard' && 'Official Dashboard'}
                  {activeTab === 'search' && 'Search Children Profiles'}
                  {activeTab === 'stats' && 'Statistical Analysis'}
                  {activeTab === 'profile-view' && 'Child Profile Details'}
                </h1>
              </div>
              <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                <p className="text-lg sm:text-xl md:text-2xl text-gray-600 dark:text-gray-400 font-medium">
                  Welcome back,
                </p>
                <div className="flex items-center gap-2 sm:gap-3">
                  <span className="font-black text-xl sm:text-2xl md:text-3xl bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400 bg-clip-text text-transparent">
                    {user?.name}
                  </span>
                  <div className="w-2 h-2 sm:w-3 sm:h-3 rounded-full bg-green-400 animate-pulse shadow-lg"></div>
                </div>
              </div>
            </div>
          </div>

          {/* Content based on active tab */}
          <div className={isLoaded ? 'animate-fadeInUp' : 'opacity-0'} style={{ animationDelay: '0.3s' }}>
            {renderActiveTab()}
          </div>
        </div>
      </div>
    </div>
  );
};

export default OfficialDashboard;