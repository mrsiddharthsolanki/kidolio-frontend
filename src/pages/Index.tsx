import React, { useState, useEffect, Suspense, useRef } from 'react';
import { Link } from 'react-router-dom';
import { 
  Users,File, Baby,Lock, Shield, ArrowRight, Star, 
  BookOpen, Heart, CheckCircle, Trophy, Brain,
  Play, ChevronRight, Globe, Award, Zap,
  Sun, Moon, Menu, X, ChevronDown, Building2
} from 'lucide-react';
import FAQSection from '../components/FAQSection';
import api from '../lib/api';
import SEO from '../components/SEO';
import TeamSection from '../components/TeamSection';

// Lazy load the 3D component
const LazyKidolio3D = React.lazy(() => import('../components/3dElement/Kidolio3D'));

// Intersection Observer hook to detect hero in view
function useHeroInView() {
  const ref = useRef(null); // ref type is React.RefObject<HTMLElement>
  const [inView, setInView] = useState(false);
  useEffect(() => {
    if (!ref.current) return;
    const observer = new window.IntersectionObserver(
      ([entry]) => setInView(entry.isIntersecting),
      { threshold: 0.1 }
    );
    observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);
  return { ref, inView };
}

// Real-time stats from backend
const useLiveStats = () => {
  const [stats, setStats] = useState({
    totalChildren: 0,
    totalParents: 0,
    citiesCovered: 0,
    topStates: [],
    totalAchievements: 0,
    learningTime: 0,
    overallProgress: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        const res = await api.get('/stats');
        setStats(res.data);
      } catch (e) {
        // fallback or error
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
    const interval = setInterval(fetchStats, 10000); // refresh every 10s
    return () => clearInterval(interval);
  }, []);

  return { stats, loading };
};

// Animated, glassmorphism status card for landing page
const StatusCard = ({ icon: Icon, label, value, gradient }) => (
  <div className="relative w-56 h-40 bg-white/60 dark:bg-gray-900/60 backdrop-blur-2xl shadow-2xl rounded-3xl border border-white/30 dark:border-gray-800/60 flex flex-col items-center justify-center cursor-default transition-all duration-500 ease-out overflow-hidden animate-glow group">
    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -skew-x-12 translate-x-[-120%] group-hover:translate-x-[120%] animate-shimmer pointer-events-none" />
    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center bg-gradient-to-br ${gradient} mb-3 animate-float shadow-xl`}>
      <Icon className="w-7 h-7 text-white drop-shadow-lg" />
    </div>
    <div className="text-2xl font-bold text-gray-900 dark:text-white drop-shadow-lg mb-1 animate-fadeInUp">{label}</div>
    <div className="text-3xl font-extrabold text-cyan-600 dark:text-cyan-300 drop-shadow-xl animate-countup">{value}</div>
    <div className="absolute -top-6 -right-6 w-14 h-14 bg-gradient-to-br from-blue-400/30 to-fuchsia-500/30 rounded-full blur-2xl animate-float z-0" />
  </div>
);

// Flatten teamRows from TeamSection for SEO
const teamRows = [
  [
    { name: 'Sujal Shah', role: 'Frontend Engineer' },
    { name: 'Jenil Trambadia', role: 'Team Lead - Backend Engineering' },
    { name: 'Krish Satasiya', role: 'Ui/UX Designer & Backend Support' },
  ],
  [
    { name: 'Siddharth Solanki', role: 'Frontend Engineer' },
    { name: 'Pranav Patel', role: 'Support & Testing Engineer' },
  ],
];
const teamMembers = teamRows.flat();

const Index = () => {
  const [activeTestimonial, setActiveTestimonial] = useState(0);
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [heroVisible, setHeroVisible] = useState(false);
  const [isYearly, setIsYearly] = useState(false);

  const features = [
    {
      icon: Shield,
      title: 'Advanced Security',
      description: 'All family and child data is protected with strong encryption and secure login including document uploads and access control by parents.',
      color: 'from-blue-500 to-blue-600',
      hoverColor: 'hover:from-blue-400 hover:to-blue-500'
    },
    {
      icon: File,
      title: 'Unified Records',
      description: 'Store everything in one place from birth certificates and pernoal id to medical history, school progress, and achievements.',
      color: 'from-green-500 to-green-600',
      hoverColor: 'hover:from-green-400 hover:to-green-500'
    },
    {
      icon: Users,
      title: 'Parent & Child Dashboard',
      description: 'Parents can manage all their children’s profiles, grant access to kids, and monitor health, academics, and activities from one panel.',
      color: 'from-purple-500 to-purple-600',
      hoverColor: 'hover:from-purple-400 hover:to-purple-500'
    },
    {
      icon: Lock,
      title: 'Verified Official Access',
      description: 'Government, NGOs, or recruiters can securely request filtered data ike top students or profiles by city, career, or category with consent.',
      color: 'from-orange-500 to-orange-600',
      hoverColor: 'hover:from-orange-400 hover:to-orange-500'
    }
  ];

  // Get live stats from backend
  const { stats: liveStats, loading: statsLoading } = useLiveStats();

  // Status cards for landing page
  const statusCards = [
    { label: 'Active Children', value: statsLoading ? '...' : liveStats.totalChildren, icon: Baby, gradient: 'from-blue-400 via-blue-500 to-blue-600' },
    { label: 'Total Parents', value: statsLoading ? '...' : liveStats.totalParents, icon: Users, gradient: 'from-green-400 via-emerald-500 to-teal-500' },
    { label: 'Cities Covered', value: statsLoading ? '...' : liveStats.citiesCovered, icon: Globe, gradient: 'from-amber-400 via-orange-500 to-red-500' },
    { label: 'Active Accounts', value: statsLoading ? '...' : (Number(liveStats.totalChildren || 0) + Number(liveStats.totalParents || 0)), icon: Shield, gradient: 'from-purple-500 via-blue-600 to-green-500' },
  ];

  const testimonials = [
    {
      quote: "Kidolio has revolutionized how we approach family education. The platform's intuitive design and robust safety features give me complete peace of mind.",
      author: "Sarah Martinez",
      role: "Parent & Software Engineer",
      company: "Microsoft",
      avatar: "https://images.unsplash.com/photo-1494790108755-2616b612b647?w=100&h=100&fit=crop&crop=face",
      rating: 5
    },
    {
      quote: "As an educator, I'm impressed by Kidolio's commitment to verified content and evidence-based learning methodologies. It's the future of education.",
      author: "Dr. James Chen",
      role: "Educational Technology Researcher",
      company: "Stanford University",
      avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face",
      rating: 5
    },
    {
      quote: "My children are more engaged with learning than ever before. The interactive features and gamification make education genuinely enjoyable.",
      author: "Maria Rodriguez",
      role: "Parent & UX Designer",
      company: "Google",
      avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&crop=face",
      rating: 5
    }
  ];

  const userTypes = [
    {
      icon: Users,
      title: 'Parents',
      subtitle: 'Take control of your Children\'s learning journey',
      description: 'A full dashboard to add children, track health, academics, achievements, and upload key documents like Aadhaar and certificates.',
      features: ['Add & manage child profiles', ' Upload and store vital documents', ' Upload and store vital documents', 'Generate secure login for your child'],
      color: 'from-blue-500/20 to-blue-600/20',
      borderColor: 'border-blue-500/30',
      iconBg: 'bg-blue-500',
      darkColor: 'dark:from-blue-400/10 dark:to-blue-500/10',
      darkBorder: 'dark:border-blue-400/30'
    },
    {
      icon: Baby,
      title: 'Children',
      subtitle: 'Your space to grow, share, and shine',
      description: 'Log in with credentials from your parents to manage your own documents, access your library, and showcase your journey.',
      features: ['Document storage & sharing', 'Personal book library', ' View academic milestones (Comming Soon)', ' Connect with mentors (Comming Soon)'],
      color: 'from-green-500/20 to-green-600/20',
      borderColor: 'border-green-500/30',
      iconBg: 'bg-green-500',
      darkColor: 'dark:from-green-400/10 dark:to-green-500/10',
      darkBorder: 'dark:border-green-400/30'
    },
    {
      icon: Shield,
      title: ' Officials',
      subtitle: 'Smart access to real, verified family data',
      description: 'View filtered child/parent data (with permissions) to support jobs, education, or research needs.',
      features: ['Search by location, skill, category', 'Access verified child-parent profiles', 'Discover top students by interest', 'Insights for programs and hiring'],
      color: 'from-purple-500/20 to-purple-600/20',
      borderColor: 'border-purple-500/30',
      iconBg: 'bg-purple-500',
      darkColor: 'dark:from-purple-400/10 dark:to-purple-500/10',
      darkBorder: 'dark:border-purple-400/30'
    }
  ];

  const pricingPlans = [
    {
      title: 'Starter',
      description: 'Basic features for families getting started',
      priceMonthly: 19.99,
      priceYearly: 18.99,
      features: [
        '1 Child Account',
        'Basic Progress Tracking',
        'Standard Content Access',
        'Email Support'
      ],
      icon: <Users className="w-6 h-6 text-white" />,
      iconBg: 'bg-gradient-to-r from-blue-500 to-purple-600',
      featured: false
    },
    {
      title: 'Professional',
      description: 'Advanced features for growing families',
      priceMonthly: 29.99,
      priceYearly: 25.99,
      features: [
        'Up to 3 Child Accounts',
        'Advanced Progress Tracking',
        'Full Content Access',
        'Priority Email Support',
        'Monthly Webinars'
      ],
      icon: <BookOpen className="w-6 h-6 text-white" />,
      iconBg: 'bg-gradient-to-r from-green-500 to-blue-500',
      featured: true
    },
    {
      title: 'Enterprise',
      description: 'Comprehensive solution for larger families or educators',
      priceMonthly: 49.99,
      priceYearly: 40.99,
      features: [
        'Unlimited Child Accounts',
        'Comprehensive Analytics',
        'Custom Content Creation',
        'Dedicated Account Manager',
        '24/7 Support'
      ],
      icon: <Shield className="w-6 h-6 text-white" />,
      iconBg: 'bg-gradient-to-r from-purple-500 to-blue-600',
      featured: false
    }
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveTestimonial((prev) => (prev + 1) % testimonials.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [testimonials.length]); // Fix: add testimonials.length as dependency

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const handleMouseMove = (e) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  useEffect(() => {
    // Trigger hero animation on initial mount only
    const timer = setTimeout(() => setHeroVisible(true), 100);
    return () => clearTimeout(timer);
  }, []);

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
    document.documentElement.classList.toggle('dark');
  };

  const { ref: heroRef, inView: heroInView } = useHeroInView();

  return (
    <>
      <SEO
        title="Meet the Kidolio Team"
        description="Get to know the talented team behind Kidolio."
        teamMembers={teamMembers}
      />
      <div className={`min-h-screen w-full overflow-x-hidden transition-all duration-700 ease-in-out ${isDarkMode ? 'dark' : ''}`} style={{ fontFamily: 'Inter, system-ui, -apple-system, sans-serif' }}>
        {/* Navigation */}
        <nav className={`fixed top-0 w-full z-50 transition-all duration-700 ease-out ${
          isScrolled 
            ? 'bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border-b border-gray-200/50 dark:border-gray-700/50 shadow-2xl shadow-gray-500/5' 
            : 'bg-transparent'
        }`}>
          <div className="max-w-7xl mx-auto px-4 sm:px-6">
            <div className="flex items-center justify-between h-16 lg:h-20">
              <div className="flex items-center space-x-8">
                <Link 
                  to="/" 
                  className={`transition-transform duration-300 hover:scale-105 animate-fadeInUp flex items-center space-x-3`}
                  style={{ animationDelay: '0.1s' }}
                >
                  <div className="flex items-center space-x-3">
                    {/* Kidolio Logo */}
                    <div className="h-12">
                      <img 
                        src="/logo.png"
                        alt="Kidolio"
                        className="h-full w-auto dark:hidden" 
                      />
                      <img 
                        src="./logo.png"
                        alt="Kidolio logo"
                        className="h-full w-auto hidden dark:block" 
                      />
                    </div>
                    
                    {/* Separator and Bolt Logo */}
                    <div className="flex items-center space-x-3">
                      <span className="text-gray-400 dark:text-gray-500 text-xl font-light">|</span>
                      
                      {/* Bolt Logo - Using Zap icon from Lucide */}
                      <div className="flex items-center space-x-2">
                        <div className="w-8 h-8 flex items-center justify-center shadow-lg">
                          <button onClick={() => window.location.reload()} className="focus:outline-none">
                            <img 
                              src="/boltLogo.png" 
                              alt="Bolt Logo" 
                              className="w-8 h-8 object-contain" 
                              style={{ pointerEvents: 'none' }}
                            />
                          </button>
                        </div>
                        <span className="text-lg font-bold text-gray-800 dark:text-white">
                          Built with Bolt.new
                        </span>
                      </div>
                    </div>
                  </div>
                </Link>
              </div>
              
              <div className="flex items-center space-x-4">
                <button 
                  onClick={toggleDarkMode}
                  className={`p-2.5 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-500 transform hover:scale-110 hover:rotate-12 animate-fadeInUp`}
                  style={{ animationDelay: '0.5s' }}
                >
                  {isDarkMode ? 
                    <Sun className="w-5 h-5 text-yellow-500" /> : 
                    <Moon className="w-5 h-5 text-gray-600" />
                  }
                </button>
                
                <div className="hidden sm:flex items-center space-x-4">
                  <Link 
                    to="/signin" 
                    className={`text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-all duration-500 font-medium relative group animate-fadeInUp`}
                    style={{ animationDelay: '0.6s' }}
                  >
                    Sign In
                    <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-blue-600 to-purple-600 transition-all duration-300 group-hover:w-full"></span>
                  </Link>
                  <Link 
                    to="/signup" 
                    className={`bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-2.5 rounded-xl hover:shadow-2xl hover:shadow-blue-500/25 transition-all duration-500 font-medium transform hover:scale-105 hover:from-blue-500 hover:to-purple-500 relative overflow-hidden group animate-fadeInUp`}
                    style={{ animationDelay: '0.7s' }}
                  >
                    <span className="relative z-10">Get Started</span>
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-500 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                  </Link>
                </div>

                <button 
                  onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                  className={`lg:hidden p-2.5 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-500 transform hover:scale-110 animate-fadeInUp`}
                  style={{ animationDelay: '0.8s' }}
                >
                  <div className="relative w-6 h-6">
                    <span className={`absolute inset-0 transition-all duration-300 ${isMobileMenuOpen ? 'rotate-45 translate-y-0' : ''}`}>
                      {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                    </span>
                  </div>
                </button>
              </div>
            </div>
            
            {/* Mobile Menu */}
            <div className={`lg:hidden absolute top-full left-0 w-full bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl border-b border-gray-200 dark:border-gray-700 shadow-2xl transition-all duration-500 ease-out transform origin-top ${
              isMobileMenuOpen ? 'scale-y-100 opacity-100' : 'scale-y-0 opacity-0'
            }`}>
              <div className="px-4 py-6 space-y-4">
                {['Features', 'Solutions', 'Testimonials'].map((item, index) => (
                  <a 
                    key={item}
                    href={`#${item.toLowerCase()}`}
                    className="block text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-all duration-500 font-medium transform hover:translate-x-2 hover:scale-105"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    {item}
                  </a>
                ))}
                <div className="pt-4 space-y-3">
                  <Link 
                    to="/signin" 
                    className="block w-full text-left text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-all duration-500 font-medium transform hover:translate-x-2"
                  >
                    Sign In
                  </Link>
                  <Link 
                    to="/signup" 
                    className="block w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-xl hover:shadow-2xl hover:shadow-blue-500/25 transition-all duration-500 font-medium transform hover:scale-105 hover:from-blue-500 hover:to-purple-500 text-center"
                  >
                    Get Started
                  </Link>
                </div>

               
              </div>
            </div>
          </div>
        </nav>

        {/* HERO SECTION with 3D Background and Aceternity-inspired animated accents */}
        {/* HERO SECTION with 3D Background and Aceternity-inspired animated accents */}
        <section ref={heroRef} className="relative z-20 w-full min-h-[700px] flex flex-col items-center justify-center text-center overflow-hidden">
          {/* Animated accent blobs and lines */}
          <div className="pointer-events-none absolute inset-0 -z-10">
            {/* Animated gradient blobs */}
            <div className="absolute left-1/2 top-0 w-[600px] h-[600px] -translate-x-1/2 -translate-y-1/3 bg-gradient-to-br from-blue-400/40 via-purple-400/30 to-fuchsia-400/20 rounded-full blur-3xl animate-blobMove1" />
            <div className="absolute right-0 bottom-0 w-[400px] h-[400px] bg-gradient-to-br from-green-400/30 via-blue-400/20 to-purple-400/10 rounded-full blur-2xl animate-blobMove2" />
            {/* Animated lines */}
            <div className="absolute left-0 top-1/2 w-1 h-64 bg-gradient-to-b from-blue-400/40 to-purple-400/0 rounded-full blur-lg animate-lineFloat1" />
            <div className="absolute right-0 top-1/3 w-1 h-48 bg-gradient-to-b from-fuchsia-400/40 to-blue-400/0 rounded-full blur-lg animate-lineFloat2" />
          </div>
          {/* Animated accent blobs and lines */}
          <div className="pointer-events-none absolute inset-0 -z-10">
            {/* Animated gradient blobs */}
            <div className="absolute left-1/2 top-0 w-[600px] h-[600px] -translate-x-1/2 -translate-y-1/3 bg-gradient-to-br from-blue-400/40 via-purple-400/30 to-fuchsia-400/20 rounded-full blur-3xl animate-blobMove1" />
            <div className="absolute right-0 bottom-0 w-[400px] h-[400px] bg-gradient-to-br from-green-400/30 via-blue-400/20 to-purple-400/10 rounded-full blur-2xl animate-blobMove2" />
            {/* Animated lines */}
            <div className="absolute left-0 top-1/2 w-1 h-64 bg-gradient-to-b from-blue-400/40 to-purple-400/0 rounded-full blur-lg animate-lineFloat1" />
            <div className="absolute right-0 top-1/3 w-1 h-48 bg-gradient-to-b from-fuchsia-400/40 to-blue-400/0 rounded-full blur-lg animate-lineFloat2" />
          </div>
          {/* Full-width 3D Universe Background */}
          <div className="absolute inset-0 w-full h-full -z-10">
            {/* Lazy load 3D scene only when hero is in view */}
            <Suspense fallback={<div className="w-full h-full bg-gradient-to-br from-blue-100 via-sky-200 to-indigo-100 dark:from-slate-900 dark:via-blue-950 dark:to-indigo-950 animate-pulse" />}> 
              {heroInView && (
                <LazyKidolio3D planetsDropIn={heroVisible} disableScrollZoom mode={isDarkMode ? 'dark' : 'light'} />
              )}
            </Suspense>
          </div>
          {/* Hero Content (no glass overlay) */}
          <div className="relative z-10 max-w-4xl mx-auto px-4 py-28 flex flex-col items-center text-center">
            <h1
              className={
                `text-5xl sm:text-6xl lg:text-7xl font-black bg-clip-text animate-gradient bg-300% animate-gradientShift mb-6 drop-shadow-2xl ` +
                (isDarkMode
                  ? 'bg-gradient-to-r from-blue-600 via-purple-600 to-green-600 text-transparent'
                  : 'bg-gradient-to-r from-[#2532eb] via-[#a21caf] to-[#f54242] text-transparent')
              }
              style={{
                fontFamily: 'Inter, Segoe UI, system-ui, -apple-system, BlinkMacSystemFont, sans-serif',
                textShadow: isDarkMode
                  ? '0 4px 32px #0006,0 1px 0 #fff8'
                  : '0 4px 32px #fbbf2444, 0 1px 0 #fff8',
                letterSpacing: '-0.02em',
                WebkitFontSmoothing: 'antialiased',
                MozOsxFontSmoothing: 'grayscale',
                color: undefined, // let gradient show
              }}
            >
              Empowering Families. <br />
              <span
                className={
                  `font-extrabold bg-clip-text animate-glow ` +
                  (isDarkMode
                    ? 'text-transparent bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-500'
                    : 'text-transparent bg-gradient-to-r from-[#0ea5e9] via-[#a21caf] to-[#f54242]')
                }
                style={{
                  textShadow: isDarkMode
                    ? '0 2px 16px #38bdf8cc,0 1px 0 #fff8'
                    : '0 2px 16px #a21caf44,0 1px 0 #fff8',
                  fontSize: '1.2em',
                  letterSpacing: '-0.03em',
                  WebkitFontSmoothing: 'antialiased',
                  MozOsxFontSmoothing: 'grayscale',
                  color: undefined, // let gradient show
                }}
              >
                Kidolio
              </span>{' '}
              <span className={isDarkMode ? 'text-white/90 dark:text-white font-extrabold' : 'text-[#1e293b] font-extrabold'}>Universe</span>
            </h1>
            <p className="text-xl sm:text-2xl text-gray-100 max-w-2xl mx-auto leading-relaxed mb-10 drop-shadow-lg animate-fadeInUp" style={{textShadow:'0 2px 12px #0004', fontWeight: 500, letterSpacing: '-0.01em'}}>
              Track. Grow. Thrive.
Manage records, monitor progress, and unlock every child’s full potential — all in one intelligent universe.
            </p>
            {/* CTA BUTTONS with animated accent */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a href="/signup" className="px-8 py-4 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold shadow-xl hover:scale-105 transition-all text-lg relative overflow-hidden group animate-fadeInUp">
                <span className="relative z-10">Get Started Free</span>
                <span className="absolute inset-0 bg-gradient-to-r from-blue-400/60 via-purple-400/40 to-fuchsia-400/30 opacity-0 group-hover:opacity-100 transition-opacity duration-700 blur-xl animate-glowPulse" />
              </a>
              <a href="#features" className="px-8 py-4 rounded-xl bg-white/90 dark:bg-gray-900/90 text-blue-700 dark:text-blue-300 font-semibold shadow-xl hover:scale-105 transition-all text-lg border border-blue-200 dark:border-blue-800 relative overflow-hidden group animate-fadeInUp">
                <span className="relative z-10">Explore Features</span>
                <span className="absolute inset-0 bg-gradient-to-r from-blue-400/20 via-purple-400/20 to-fuchsia-400/10 opacity-0 group-hover:opacity-100 transition-opacity duration-700 blur-xl animate-glowPulse" />
              </a>
            </div>
          </div>
        </section>

        {/* Status Section - below Hero, above Features */}
        <section className="py-12 lg:py-20 bg-white/60 dark:bg-gray-900/60 backdrop-blur-xl border-t border-b border-gray-200/40 dark:border-gray-800/40 relative z-10 animate-fadeInUp">
          <div className="max-w-7xl mx-auto px-4 sm:px-6">
            <div className="text-center mb-12">
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 animate-gradient bg-300% animate-gradientShift mb-4">
                Real-Time Family Status
              </h2>
              <p className="text-lg text-gray-700 dark:text-gray-300 max-w-2xl mx-auto animate-fadeInUp">
                Live stats and progress, updated.
              </p>
            </div>
            <div className="flex flex-wrap justify-center gap-8">
              {statusCards.map((card, idx) => (
                <StatusCard key={card.label} icon={card.icon} label={card.label} value={card.value} gradient={card.gradient} />
              ))}
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="py-20 lg:py-32 bg-gray-50/50 dark:bg-gray-800/50 backdrop-blur-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6">
            <div className="text-center mb-16 lg:mb-20">
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-light text-gray-900 dark:text-white mb-6">
                Built for the
                <span className="block font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">modern family</span>
              </h2>
              <p className="text-lg lg:text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
                Your all-in-one platform to securely manage, support, and celebrate every step of your child’s journey — from birth to brilliance.
              </p>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {features.map((feature, index) => (
                <div 
                  key={index} 
                  className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl rounded-3xl p-6 lg:p-8 shadow-xl hover:shadow-2xl transition-all duration-700 group border border-gray-200/50 dark:border-gray-700/50 transform hover:scale-105 hover:-translate-y-2"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${feature.color} ${feature.hoverColor} flex items-center justify-center mb-6 group-hover:scale-110 group-hover:rotate-6 transition-all duration-500 shadow-lg group-hover:shadow-xl`}>
                    <feature.icon className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors duration-300">{feature.title}</h3>
                  <p className="text-gray-600 dark:text-gray-300 leading-relaxed">{feature.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Solutions Section */}
        <section id="solutions" className="py-20 lg:py-32 bg-white dark:bg-gray-900">
          <div className="max-w-7xl mx-auto px-4 sm:px-6">
            <div className="text-center mb-16 lg:mb-20">
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-light text-gray-900 dark:text-white mb-6">
                Solutions for
                <span className="block font-bold">everyone</span>
              </h2>
              <p className="text-lg lg:text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
                Whether you're a parent, child, or educator, Kidolio provides tailored experiences that meet your specific needs.
              </p>
            </div>

            <div className="grid lg:grid-cols-3 gap-8">
              {userTypes.map((type, index) => (
                <div key={index} className={`bg-gradient-to-br ${type.color} ${type.darkColor} border ${type.borderColor} ${type.darkBorder} rounded-2xl p-6 lg:p-8 hover:shadow-xl transition-all group`}>
                  <div className={`w-16 h-16 ${type.iconBg} rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
                    <type.icon className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-2xl font-semibold text-gray-900 dark:text-white mb-2">{type.title}</h3>
                  <p className="text-gray-600 dark:text-gray-400 mb-4 font-medium">{type.subtitle}</p>
                  <p className="text-gray-700 dark:text-gray-300 mb-6 leading-relaxed">{type.description}</p>
                  
                  <div className="space-y-3 mb-8">
                    {type.features.map((feature, featureIndex) => (
                      <div key={featureIndex} className="flex items-center space-x-3">
                        <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                        <span className="text-gray-700 dark:text-gray-300">{feature}</span>
                      </div>
                    ))}
                  </div>

                 
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Pricing Section */}
        <section id="pricing" className="py-20 lg:py-32 bg-gradient-to-br from-blue-50/60 via-white to-purple-50/60 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800 transition-all duration-700 ease-in-out relative">
          <div className="max-w-7xl mx-auto px-4 sm:px-6">
            <div className="text-center mb-16 lg:mb-20">
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-light text-gray-900 dark:text-white mb-6">
                Simple, transparent <span className="block font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">pricing</span>
              </h2>
              <p className="text-lg lg:text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
                Choose the plan that fits your family. No hidden fees. Cancel anytime.
              </p>
            </div>
            <div className="flex justify-center mb-12">
              <div className="inline-flex items-center bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl rounded-full p-2 border border-gray-200/50 dark:border-gray-700/50 shadow-lg">
                <button
                  className={`px-6 py-2 rounded-full font-semibold transition-all duration-300 focus:outline-none ${!isYearly ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-xl scale-105' : 'text-gray-700 dark:text-gray-200'}`}
                  onClick={() => setIsYearly(false)}
                >
                  Monthly
                </button>
                <button
                  className={`px-6 py-2 rounded-full font-semibold transition-all duration-300 focus:outline-none ${isYearly ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-xl scale-105' : 'text-gray-700 dark:text-gray-200'}`}
                  onClick={() => setIsYearly(true)}
                >
                  Yearly 
                </button>
              </div>
            </div>
            <div className="grid md:grid-cols-3 gap-8">
              {pricingPlans.map((plan, idx) => (
                <div
                  key={plan.title}
                  className={`relative bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl rounded-3xl p-8 shadow-xl border border-gray-200/50 dark:border-gray-700/50 flex flex-col items-center transition-all duration-700 group hover:scale-105 hover:shadow-2xl ${plan.featured ? 'ring-2 ring-blue-500/40 dark:ring-blue-400/40 z-10' : ''}`}
                  style={{ animationDelay: `${idx * 0.1}s` }}
                >
                  <div className={`absolute -top-6 left-1/2 -translate-x-1/2 w-16 h-16 rounded-full flex items-center justify-center shadow-lg ${plan.iconBg}`}>{plan.icon}</div>
                  <h3 className="mt-10 text-2xl font-bold text-gray-900 dark:text-white mb-2">{plan.title}</h3>
                  <p className="text-gray-600 dark:text-gray-300 mb-6 text-center">{plan.description}</p>
                  <div className="flex items-end mb-6">
                    <span className="text-4xl font-extrabold text-gray-900 dark:text-white">${isYearly ? plan.priceYearly : plan.priceMonthly}</span>
                    <span className="text-lg text-gray-500 dark:text-gray-400 ml-2">/mo</span>
                  </div>
                  <ul className="mb-8 space-y-3 w-full">
                    {plan.features.map((feature, i) => (
                      <li key={i} className="flex items-center space-x-3 text-gray-700 dark:text-gray-300">
                        <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                  <Link
                    to="/coming-soon"
                    className={`w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 rounded-xl font-semibold hover:shadow-xl transition-all flex items-center justify-center space-x-2 group ${plan.featured ? 'scale-105' : ''}`}
                  >
                    <span>Start {plan.title === 'Starter' ? 'Free' : 'Now'}</span>
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </Link>
                  {plan.featured && (
                    <div className="absolute top-4 right-4 bg-blue-600 text-white text-xs px-3 py-1 rounded-full font-bold shadow-lg animate-bounce">Most Popular</div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Team Section */}
        <TeamSection />

        {/* FAQ Section */}
        <FAQSection />

        {/* CTA Section */}
        <section className="py-20 lg:py-32 bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600">
          <div className="max-w-4xl mx-auto text-center px-4 sm:px-6">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-light text-white mb-6">
              Ready to unlock
              <span className="block font-bold">your child’s full potential?</span>
            </h2>
            <p className="text-lg lg:text-xl text-white/90 mb-12 max-w-2xl mx-auto leading-relaxed">
              Join thousands of families using Kidolio to securely manage health, academics, and personal growth all in one intelligent family hub.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-6 justify-center">
              <button
                className="bg-white text-blue-600 px-8 py-4 rounded-lg font-semibold hover:shadow-xl transition-all flex items-center justify-center space-x-2 group"
                onClick={() => window.location.href = '/signup'}
              >
                <span>Start your free trial</span>
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>
              <button
                className="border-2 border-white text-white px-8 py-4 rounded-lg font-semibold hover:bg-white/10 transition-all"
                 onClick={() => window.location.href = '/signup'}
              >
                Schedule a demo
              </button>
            </div>

            <div className="mt-12 text-white/80 text-sm">
              No credit card required • 30-day free trial • Cancel anytime
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 transition-all duration-500">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              <div>
                <h3 className="text-sm font-semibold text-gray-900 dark:text-white uppercase tracking-wider">Company</h3>
                <ul className="mt-4 space-y-4">
                  <li>
                    <Link to="/about" className="text-base text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-all duration-300">About</Link>
                  </li>
                  
                  <li>
                    <Link to="/parent-dashboard" className="text-base text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-all duration-300">Parent Dashboard</Link>
                  </li>
                  <li>
                    <Link to="/child-dashboard" className="text-base text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-all duration-300">Child Dashboard</Link>
                  </li>
                  <li>
                    <Link to="/official-dashboard" className="text-base text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-all duration-300">Official Dashboard</Link>
                  </li>
                </ul>
              </div>
              <div>
                <h3 className="text-sm font-semibold text-gray-900 dark:text-white uppercase tracking-wider">Legal</h3>
                <ul className="mt-4 space-y-4">
                  <li>
                    <Link to="/privacy" className="text-base text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-all duration-300" onClick={() => window.scrollTo({top: 0, behavior: 'smooth'})}>Privacy Policy</Link>
                  </li>
                  <li>
                    <Link to="/terms" className="text-base text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-all duration-300" onClick={() => window.scrollTo({top: 0, behavior: 'smooth'})}>Terms of Service</Link>
                  </li>
                </ul>
              </div>
              <div>
                <h3 className="text-sm font-semibold text-gray-900 dark:text-white uppercase tracking-wider">Support</h3>
                <ul className="mt-4 space-y-4">
                  <li>
                    <Link to="/support" className="text-base text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-all duration-300">Support</Link>
                  </li>
                  <li>
                    <Link to="/coming-soon" className="text-base text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-all duration-300">Coming Soon</Link>
                  </li>
                </ul>
              </div>
              <div>
                <h3 className="text-sm font-semibold text-gray-900 dark:text-white uppercase tracking-wider">Quick Links</h3>
                <ul className="mt-4 space-y-4">
                  <li>
                    <Link to="/signin" className="text-base text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-all duration-300">Sign In</Link>
                  </li>
                  <li>
                    <Link to="/signup" className="text-base text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-all duration-300">Sign Up</Link>
                  </li>
                  <li>
                    <Link to="/" className="text-base text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-all duration-300">Home</Link>
                  </li>
                </ul>
              </div>
            </div>
            <div className="mt-8 border-t border-gray-200 dark:border-gray-800 pt-8">
              <p className="text-base text-gray-500 dark:text-gray-400 text-center">
                © {new Date().getFullYear()} Kidolio. All rights reserved.
              </p>
            </div>
          </div>
        </footer>
      </div>
    </>
  );
};

export default Index;