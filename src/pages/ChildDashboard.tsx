import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import Layout from '@/components/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  FileText, 
  Book, 
  Users, 
  Briefcase, 
  User, 
  UserPlus,
  Calendar,
  Target,
  Trophy,
  Star,
  MessageCircle,
  Bell,
  Settings,
  TrendingUp,
  BookOpen,
  Clock,
  Award,
  Activity,
  PlusCircle,
  CheckCircle,
  AlertCircle,
  Heart,
  Zap,
  Globe,
  Sparkles,
  Rocket,
  Play
} from 'lucide-react';

// Import existing components
import DocumentManager from '@/components/child/DocumentManager';
import BookLibrary from '@/components/child/BookLibrary';
import CareerPortal from '@/components/child/CareerPortal';
import MentorshipMatch from '@/components/mentorship/MentorshipMatch';
import ChildProfileTab from '@/components/child/ChildProfileTab';

const ChildDashboard: React.FC = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState(searchParams.get('tab') || 'profile');
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [scrollY, setScrollY] = useState(0);
  const [particles, setParticles] = useState([]);
  const [timeOfDay, setTimeOfDay] = useState('');

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  // Advanced tab routing: sync tab with URL query param (no flicker, no warning)
  useEffect(() => {
    const tab = searchParams.get('tab');
    // Always update if tab exists and is different
    if (tab && tab !== activeTab) {
      setActiveTab(tab);
    } else if (!tab && activeTab !== 'profile') {
      setActiveTab('profile');
    }
  }, [searchParams, activeTab]);

  // Ensure tab state and URL are always in sync, and update both on tab change
  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    setSearchParams({ tab }, { replace: true });
  };

  useEffect(() => {
    // Set time-based greeting
    const hour = new Date().getHours();
    if (hour < 12) setTimeOfDay('morning');
    else if (hour < 17) setTimeOfDay('afternoon');
    else setTimeOfDay('evening');
  }, []);

  useEffect(() => {
    const handleMouseMove = (e) => {
      setMousePosition({ 
        x: e.clientX / window.innerWidth, 
        y: e.clientY / window.innerHeight 
      });
    };

    const handleScroll = () => {
      setScrollY(window.scrollY);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('scroll', handleScroll);
    
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'book': return <BookOpen className="w-4 h-4 text-blue-500" />;
      case 'mentor': return <UserPlus className="w-4 h-4 text-green-500" />;
      case 'goal': return <Target className="w-4 h-4 text-purple-500" />;
      case 'document': return <FileText className="w-4 h-4 text-orange-500" />;
      default: return <Activity className="w-4 h-4 text-gray-500" />;
    }
  };

  const getGreeting = () => {
    const greetings = {
      morning: "Good morning",
      afternoon: "Good afternoon", 
      evening: "Good evening"
    };
    return greetings[timeOfDay] || "Hello";
  };

  const tabConfig = [
    { 
      value: 'profile', 
      icon: User, 
      label: 'Profile', 
      gradient: 'from-violet-600 via-purple-600 to-blue-600',
      bgGradient: 'from-violet-50/80 via-purple-50/60 to-blue-50/80',
      darkBgGradient: 'from-violet-900/20 via-purple-900/20 to-blue-900/20'
    },
    { 
      value: 'documents', 
      icon: FileText, 
      label: 'Documents', 
      gradient: 'from-orange-500 via-red-500 to-pink-600',
      bgGradient: 'from-orange-50/80 via-red-50/60 to-pink-50/80',
      darkBgGradient: 'from-orange-900/20 via-red-900/20 to-pink-900/20'
    },
    { 
      value: 'library', 
      icon: Book, 
      label: 'Library', 
      gradient: 'from-emerald-500 via-teal-500 to-cyan-600',
      bgGradient: 'from-emerald-50/80 via-teal-50/60 to-cyan-50/80',
      darkBgGradient: 'from-emerald-900/20 via-teal-900/20 to-cyan-900/20'
    },
    { 
      value: 'mentorship', 
      icon: UserPlus, 
      label: 'Mentors', 
      // swapped gradient direction
      gradient: 'from-fuchsia-600 via-pink-500 to-rose-500',
      bgGradient: 'from-fuchsia-50/80 via-pink-50/60 to-rose-50/80',
      darkBgGradient: 'from-fuchsia-900/20 via-pink-900/20 to-rose-900/20'
    },
    { 
      value: 'career', 
      icon: Briefcase, 
      label: 'Career', 
      gradient: 'from-indigo-500 via-blue-500 to-cyan-600',
      bgGradient: 'from-indigo-50/80 via-blue-50/60 to-cyan-50/80',
      darkBgGradient: 'from-indigo-900/20 via-blue-900/20 to-cyan-900/20'
    }
  ];

  const currentTabConfig = tabConfig.find(tab => tab.value === activeTab) || tabConfig[0];

  return (
    <Layout activeTab={activeTab} onTabChange={setActiveTab}>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/50 dark:from-slate-900 dark:via-slate-800 dark:to-indigo-900/20 transition-all duration-1000 ease-in-out relative overflow-hidden">
        
        {/* Enhanced Animated Background Elements */}
        <div className="fixed inset-0 pointer-events-none overflow-hidden">
          {/* Primary floating orb */}
          <div 
            className="absolute w-[500px] h-[500px] bg-gradient-to-r from-blue-400/20 via-purple-400/15 to-pink-400/20 dark:from-blue-400/10 dark:via-purple-400/8 dark:to-pink-400/10 rounded-full blur-3xl transition-all duration-[2000ms] ease-out animate-pulse"
            style={{
              transform: `translate(${mousePosition.x * 50 - 25}px, ${mousePosition.y * 50 - 25}px) rotate(${mousePosition.x * 360}deg)`,
              left: '10%',
              top: '15%'
            }}
          />
          
          {/* Secondary floating orb */}
          <div 
            className="absolute w-[400px] h-[400px] bg-gradient-to-r from-emerald-400/15 via-teal-400/10 to-cyan-400/15 dark:from-emerald-400/8 dark:via-teal-400/5 dark:to-cyan-400/8 rounded-full blur-3xl transition-all duration-[1500ms] ease-out animate-pulse"
            style={{
              transform: `translate(${mousePosition.x * -40 + 20}px, ${mousePosition.y * -40 + 20}px) rotate(${-mousePosition.x * 180}deg)`,
              right: '15%',
              bottom: '20%',
              animationDelay: '1s'
            }}
          />
          
          {/* Tertiary accent orb */}
          <div 
            className="absolute w-[300px] h-[300px] bg-gradient-to-r from-violet-400/10 via-fuchsia-400/8 to-rose-400/10 dark:from-violet-400/5 dark:via-fuchsia-400/4 dark:to-rose-400/5 rounded-full blur-3xl transition-all duration-[2500ms] ease-out animate-pulse"
            style={{
              transform: `translate(${mousePosition.x * 30}px, ${mousePosition.y * -30}px) scale(${1 + mousePosition.y * 0.1})`,
              left: '50%',
              top: '40%',
              animationDelay: '2s'
            }}
          />

          {/* Floating particles */}
          <div className="absolute inset-0">
            {[...Array(20)].map((_, i) => (
              <div
                key={i}
                className={`absolute w-2 h-2 bg-gradient-to-r ${i % 4 === 0 ? 'from-blue-400 to-purple-400' : i % 4 === 1 ? 'from-green-400 to-teal-400' : i % 4 === 2 ? 'from-pink-400 to-rose-400' : 'from-yellow-400 to-orange-400'} rounded-full opacity-20 dark:opacity-10 animate-pulse`}
                style={{
                  left: `${(i * 7 + 10) % 90}%`,
                  top: `${(i * 11 + 15) % 80}%`,
                  transform: `translate(${Math.sin(mousePosition.x * Math.PI + i) * 20}px, ${Math.cos(mousePosition.y * Math.PI + i) * 20}px)`,
                  animationDelay: `${i * 0.3}s`,
                  animationDuration: `${2 + i * 0.1}s`
                }}
              />
            ))}
          </div>
        </div>

        <div className="relative min-h-screen p-4 lg:p-6">
          <div className="max-w-7xl mx-auto">
            
            {/* Enhanced Header with Modern Typography */}
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-8 lg:mb-12">
              <div className="mb-6 lg:mb-0">
                <div className="flex items-center gap-6 mb-4">
                  <div className="relative group">
                    <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600 flex items-center justify-center shadow-2xl transform hover:scale-110 hover:rotate-12 transition-all duration-700 cursor-pointer relative overflow-hidden">
                      <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent"></div>
                      <Sparkles className="w-10 h-10 text-white relative z-10 drop-shadow-lg" />
                      <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-blue-400/50 to-purple-400/50 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                    </div>
                    <div className="absolute -inset-2 bg-gradient-to-r from-blue-600 to-purple-600 rounded-3xl opacity-20 group-hover:opacity-40 blur transition-all duration-500"></div>
                  </div>
                  
                  <div>
                    <div className="mb-2">
                      <p className="text-lg lg:text-xl text-gray-600 dark:text-gray-400 font-medium">
                        {getGreeting()},
                      </p>
                      <h1 className="text-4xl lg:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 leading-tight">
                        {user?.name}!
                      </h1>
                    </div>
                    <p className="text-lg lg:text-xl text-gray-700 dark:text-gray-300 font-light max-w-md">
                      Ready to continue your amazing learning adventure? ✨
                    </p>
                  </div>
                </div>
                
                {/* Enhanced Quick Stats */}
                <div className="flex flex-wrap items-center gap-4 mt-6">
                  <div className="group flex items-center gap-3 bg-white/90 dark:bg-gray-800/90 backdrop-blur-xl rounded-2xl px-6 py-3 shadow-xl border border-white/50 dark:border-gray-700/50 hover:shadow-2xl transition-all duration-500 hover:scale-105">
                    <div className="relative">
                      <div className="w-4 h-4 bg-emerald-500 rounded-full animate-pulse"></div>
                      <div className="absolute inset-0 w-4 h-4 bg-emerald-400 rounded-full animate-ping opacity-20"></div>
                    </div>
                    <span className="text-sm font-semibold text-gray-800 dark:text-gray-200">Online & Active</span>
                  </div>
                   
                </div>
              </div>
            </div>
            
            {/* Enhanced Navigation Tabs */}
            <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
                <div className="w-full lg:mb-12">
                  {/* Mobile Dropdown */}
                  <div className="flex lg:hidden w-full justify-between mb-6 gap-2">
                    {tabConfig.map((tab) => {
                      const Icon = tab.icon;
                      return (
                        <button
                          key={tab.value}
                          onClick={() => handleTabChange(tab.value)}
                          className={`flex flex-col items-center justify-center flex-1 p-2 rounded-xl transition-all
                            ${activeTab === tab.value 
                              ? 'bg-gradient-to-r ' + tab.gradient + ' text-white shadow-lg scale-105'
                              : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700/50'
                            }`}
                          aria-label={tab.label}
                          type="button"
                        >
                          <Icon className="w-7 h-7 mb-1" />
                          {/* Optionally show label below icon on mobile, comment out if you want icon only */}
                          {/* <span className="text-xs font-semibold">{tab.label}</span> */}
                        </button>
                      );
                    })}
                  </div>

                  {/* Desktop Tabs */}
                  <TabsList className="hidden lg:grid w-full h-19 gap-2 bg-white/95 dark:bg-gray-800/95 backdrop-blur-2xl border-0 shadow-2xl rounded-3xl p-3 grid-cols-5">
                    {tabConfig.map((tab) => {
                      const Icon = tab.icon;
                      return (
                        <TabsTrigger 
                          key={tab.value}
                          value={tab.value} 
                          className={`group relative flex items-center h-12 px-4 gap-3 rounded-2xl
                          data-[state=active]:bg-gradient-to-r data-[state=active]:${tab.gradient} 
                          data-[state=active]:text-white data-[state=active]:shadow-xl 
                          hover:scale-105 
                          ${activeTab === tab.value ? 'scale-105' : 'hover:bg-gray-100 dark:hover:bg-gray-700/50'}
                          w-full justify-center`}
                        >
                          <div className={`flex items-center gap-3 ${
                            activeTab === tab.value 
                              ? 'text-white' 
                              : 'text-gray-700 dark:text-gray-200'
                          }`}>
                            <div className={`p-2 rounded-xl flex-shrink-0 ${
                              activeTab === tab.value 
                                ? 'bg-white/20 shadow-lg' 
                                : 'bg-gray-100 dark:bg-gray-700 group-hover:bg-gray-200 dark:group-hover:bg-gray-600'
                            }`}>
                              <Icon className="w-5 h-5" />
                            </div>
                            <span className="text-base font-bold whitespace-nowrap">{tab.label}</span>
                          </div>
                          {activeTab === tab.value && (
                            <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-white/10 to-transparent pointer-events-none"></div>
                          )}
                        </TabsTrigger>
                      );
                    })}
                  </TabsList>
                </div>

              {/* Enhanced Tab Contents */}
              {tabConfig.map((tabConf) => (
                <TabsContent key={tabConf.value} value={tabConf.value}>
                  <div className={`group relative bg-white/95 dark:bg-gray-800/95 backdrop-blur-2xl rounded-[2rem] shadow-2xl border-0 overflow-hidden hover:shadow-3xl`}>
                  {/* Dynamic background gradient */}
                  <div className={`absolute inset-0 bg-gradient-to-br ${tabConf.bgGradient} dark:${tabConf.darkBgGradient} opacity-50`}></div>
                  {/* Content area */}
                  <div className="relative flex flex-col">
                    {/* Enhanced Header with better spacing */}
                    <div className="relative p-8 lg:p-10 border-b border-gray-200/50 dark:border-gray-700/30">
                    <div className="flex items-start lg:items-center gap-8">
                      <div className={`relative shrink-0 w-20 h-20 rounded-3xl bg-gradient-to-r ${tabConf.gradient} flex items-center justify-center shadow-2xl group-hover:scale-110`}>
                      <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-white/20 to-transparent"></div>
                      <tabConf.icon className="w-10 h-10 text-white relative z-10 drop-shadow-lg" />
                      </div>
                      <div className="flex-1 min-w-0">
                      <h2 className="text-3xl lg:text-4xl font-black text-gray-900 dark:text-white mb-3 tracking-tight">
                        {tabConf.value === 'profile' && 'Your Profile'}
                        {tabConf.value === 'documents' && 'Document Manager'}
                        {tabConf.value === 'library' && 'Book Library'}
                        {tabConf.value === 'mentorship' && 'Mentorship Hub'}
                        {tabConf.value === 'career' && 'Career Portal'}
                      </h2>
                      <p className="text-lg text-gray-600 dark:text-gray-400 font-medium leading-relaxed max-w-2xl">
                        {tabConf.value === 'profile' && 'View and manage your personal information'}
                        {tabConf.value === 'documents' && 'Organize and secure your important documents'}
                        {tabConf.value === 'library' && 'Discover amazing books and track your reading journey'}
                        {tabConf.value === 'mentorship' && 'Connect with mentors who inspire and guide you'}
                        {tabConf.value === 'career' && 'Explore exciting career paths and opportunities'}
                      </p>
                      </div>
                    </div>
                    {/* Refined decorative elements */}
                    <div className={`absolute -top-10 -right-10 w-32 h-32 bg-gradient-to-r ${tabConf.gradient} opacity-20 rounded-full blur-2xl animate-pulse`}></div>
                    <div className={`absolute -bottom-6 -left-6 w-24 h-24 bg-gradient-to-r ${tabConf.gradient} opacity-10 rounded-full blur-xl animate-pulse`} style={{ animationDelay: '1s' }}></div>
                    </div>
                    {/* Tab content with consistent padding */}
                    <div className="relative p-8 lg:p-10">
                    <div className="max-w-[1400px] mx-auto">
                      {tabConf.value === 'profile' && <ChildProfileTab />}
                      {tabConf.value === 'documents' && <DocumentManager childId={user?.id || ''} />}
                      {tabConf.value === 'library' && <BookLibrary childId={user?.id || ''} />}
                      {tabConf.value === 'mentorship' && (
                        <div className="flex flex-col items-center justify-center min-h-[300px] py-12">
                          <div className="flex flex-col items-center gap-4">
                            <Rocket className="w-16 h-16 text-fuchsia-500 animate-bounce" />
                            <h3 className="text-3xl font-bold text-fuchsia-700 dark:text-fuchsia-300">Coming Soon!</h3>
                            <p className="text-lg text-gray-600 dark:text-gray-300 text-center max-w-md">The Mentorship Hub is launching soon. Stay tuned for inspiring mentor connections and guidance!</p>
                          </div>
                        </div>
                      )}
                      {tabConf.value === 'career' && (
                        <div className="flex flex-col items-center justify-center min-h-[300px] py-12">
                          <div className="flex flex-col items-center gap-4">
                            <Sparkles className="w-16 h-16 text-indigo-500 animate-bounce" />
                            <h3 className="text-3xl font-bold text-indigo-700 dark:text-indigo-300">Coming Soon!</h3>
                            <p className="text-lg text-gray-600 dark:text-gray-300 text-center max-w-md">The Career Portal is on its way. Exciting career paths and opportunities will be available here soon!</p>
                          </div>
                        </div>
                      )}
                    </div>
                    </div>
                  </div>
                  {/* Enhanced floating accent elements */}
                  <div className={`absolute -top-16 -right-16 w-40 h-40 bg-gradient-to-r ${tabConf.gradient} opacity-10 rounded-full blur-3xl animate-pulse pointer-events-none`}></div>
                  <div className={`absolute -bottom-12 -left-12 w-32 h-32 bg-gradient-to-r ${tabConf.gradient} opacity-5 rounded-full blur-2xl animate-pulse pointer-events-none`} style={{ animationDelay: '2s' }}></div>
                  </div>
                </TabsContent>
              ))}
            </Tabs>
          </div>
        </div>
      </div>
      {/* Custom CSS for enhanced animations */}
      {/* All animation/transition/delay for tab switching removed for instant render */}
    </Layout>
  );
};

export default ChildDashboard;