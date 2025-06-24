import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/contexts/AuthContext';
import { Edit, Save, X, Camera, Users, Phone, Mail, MapPin, Briefcase, Calendar as CalendarIcon, GraduationCap, Heart, Activity, AlertCircle, BookOpen, Star, User2, Shell, Droplet, Building, Map, CalendarDays } from 'lucide-react';
import Layout from '../Layout';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import { useNavigate } from 'react-router-dom';

// Define Child interface
interface Child {
  id?: string;
  _id?: string;
  name: string;
  age: number;
  photo?: string;
  gender?: string;
  dob?: string;
  country?: string;
  district?: string;
  city?: string;
  disability?: string;
  bloodGroup?: string;
  aadhaarNumber?: string;
  isActive?: boolean;
  hasLogin?: boolean;
  birthHospital?: string;
  birthCertificate?: string;
  doctorName?: string;
  majorMarks?: string;
  birthTime?: string;
  status?: string;
}

// Helper function to format date
const formatDate = (dateString: string) => {
  if (!dateString) return 'N/A';
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  } catch (error) {
    return dateString;
  }
};

// Helper function to calculate age from DOB
const calculateAge = (dob: string): number | null => {
  if (!dob) return null;
  try {
    const birthDate = new Date(dob);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    
    // Adjust age if birthday hasn't occurred this year
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  } catch (error) {
    return null;
  }
};

const ParentProfile: React.FC = () => {
  const { user } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [profileData, setProfileData] = useState({
    email: user?.email || '',
    address: '',
    fatherName: '',
    motherName: '',
    aadhaar: '',
    phone: '',
  });
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [children, setChildren] = useState<Child[]>([]);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  // Add mouse movement effect
  React.useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  // Fetch parent profile from backend on mount
  React.useEffect(() => {
    (async () => {
      try {
        const api = (await import('@/lib/api')).default;
        const res = await api.get('/user/me');
        // Only set profile data if user is parent
        if (res.data.role === 'parent') {
          setProfileData({
            email: res.data.email || '',
            address: res.data.address || '',
            fatherName: res.data.fatherName || '',
            motherName: res.data.motherName || '',
            aadhaar: res.data.aadhaar || '',
            phone: res.data.phone || '',
          });
        }
      } catch (error: unknown) {
        // Optionally show error toast
      }
    })();
  }, []);

  // Fetch children from backend on mount
  React.useEffect(() => {
    (async () => {
      try {
        const api = (await import('@/lib/api')).default;
        const res = await api.get('/child');
        setChildren(res.data);
      } catch (error: unknown) {
        // Optionally handle error
      }
    })();
  }, []);

  // Save profile to backend
  const handleSave = async () => {
    setIsLoading(true);
    setErrorMsg(null);
    try {
      const api = (await import('@/lib/api')).default;
      await api.put('/user/me', profileData);
      setIsEditing(false);
    } catch (error: unknown) {
      let msg = 'Failed to update profile.';
      if (
        typeof error === 'object' &&
        error !== null &&
        'response' in error &&
        typeof (error as { response?: { data?: { message?: string } } }).response?.data?.message === 'string'
      ) {
        msg = (error as { response: { data: { message: string } } }).response.data.message;
      }
      setErrorMsg(msg);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    (async () => {
      
        const api = (await import('@/lib/api')).default;
        const res = await api.get('/user/me');
        if (res.data.role === 'parent') {
          setProfileData({
            email: res.data.email || '',
            address: res.data.address || '',
            fatherName: res.data.fatherName || '',
            motherName: res.data.motherName || '',
            aadhaar: res.data.aadhaar || '',
            phone: res.data.phone || '',
          });
        }
        
    })();
  };

  const handleInputChange = (field: string, value: string) => {
    setProfileData(prev => ({ ...prev, [field]: value }));
  };

  // Utility: map field keys to user-friendly labels
  const fieldLabels: Record<string, string> = {
    // name: 'Full Name', // Removed as per user request
    email: 'Email',
    phone: 'Phone',
    address: 'Address',
    fatherName: "Father's Name",
    motherName: "Mother's Name",
    aadhaar: 'National ID',
    profileImage: 'Profile Image',
    // Add more known fields as needed
  };

  // Utility: fields to skip rendering
  const skipFields = [
    'name', // Skip name field everywhere
    '_id', 'id', 'role', 'password', 'createdAt', 'updatedAt', '__v', 'children', 'records',
  ];

  // Utility: fields that are images
  const imageFields = ['profileImage', 'photo', 'birthCertificate'];

  // Utility: fields that are not editable (for now)
  const nonEditableFields = ['email', 'profileImage', 'createdAt', 'updatedAt', 'role', '_id', 'id'];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/50 to-indigo-50/50 dark:from-gray-900 dark:via-blue-900/25 dark:to-indigo-900/25 transition-all duration-1000 ease-in-out">
      {/* Animated Background Elements */}
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

      <div className="relative container mx-auto max-w-7xl px-4 py-8">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Welcome to Your
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent"> Family Dashboard</span>
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Manage your family profile and keep track of your children's progress in one place
          </p>
        </div>

        {/* Main Content Tabs */}
        <Tabs defaultValue="profile" className="space-y-8">
          <TabsList className="grid grid-cols-2 max-w-[400px] mx-auto bg-white/20 dark:bg-gray-800/20 backdrop-blur-xl rounded-full p-1 shadow-xl">
            <TabsTrigger 
              value="profile" 
              className="rounded-full data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-600 data-[state=active]:to-purple-600 data-[state=active]:text-white"
            >
              Profile Details
            </TabsTrigger>
            <TabsTrigger 
              value="children" 
              className="rounded-full data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-600 data-[state=active]:to-purple-600 data-[state=active]:text-white"
            >
              My Children
            </TabsTrigger>
          </TabsList>

          <TabsContent value="profile" className="space-y-6">
            {/* Profile Header */}
        <Card className="shadow-2xl border-0 bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl animate-fadeIn">
          <CardHeader>
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-2 md:gap-0">
              <CardTitle className="flex items-center gap-2">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center">
                  <Users className="w-6 h-6 text-white" />
                </div>
                <div>
                  <span className="text-sm text-gray-500 dark:text-gray-400">Welcome Back,</span>
                  <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                    Parent Profile
                  </h1>
                </div>
              </CardTitle>
              <div className="w-full md:w-auto mt-3 md:mt-0">
                {isEditing ? (
                  <div className="flex flex-row gap-2 w-full">
                    <Button 
                      onClick={handleSave} 
                      size="sm" 
                      className="w-full md:w-auto bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white flex items-center gap-1 px-4 py-2 rounded-xl shadow-lg transition-all duration-200" 
                      disabled={isLoading}
                    >
                      <Save className="w-4 h-4" />
                      {isLoading ? 'Saving...' : 'Save Changes'}
                    </Button>
                    <Button 
                      onClick={handleCancel} 
                      size="sm" 
                      className="w-full md:w-auto bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 flex items-center gap-1 px-4 py-2 rounded-xl shadow-md transition-all duration-200" 
                      variant="outline"
                    >
                      <X className="w-4 h-4" />
                      Cancel
                    </Button>
                  </div>
                ) : (
                  <Button 
                    onClick={() => setIsEditing(true)} 
                    size="sm" 
                    className="w-full md:w-auto bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white flex items-center gap-1 px-4 py-2 rounded-xl shadow-lg transition-all duration-200"
                  >
                    <Edit className="w-4 h-4" />
                    Edit Profile
                  </Button>
                )}
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="w-full flex flex-col md:flex-row gap-8">
            {/* Profile Information Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 w-full">
              {/* Parent Info Card */}
              <div className={cn(
                "lg:col-span-1 backdrop-blur-xl rounded-3xl p-6",
                "bg-white/90 dark:bg-gray-900/60",
                "border border-gray-100 dark:border-gray-800",
                "transition-all duration-300",
                "shadow-lg hover:shadow-xl"
              )}>
                <div className="space-y-6">
                  <div className="flex items-center gap-4">
                    <div className={cn(
                      "w-12 h-12 rounded-2xl flex items-center justify-center",
                      "bg-gradient-to-br from-purple-500/20 to-blue-500/20 dark:from-purple-400/20 dark:to-blue-400/20"
                    )}>
                      <Users className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Parent Details</h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Family Information</p>
                    </div>
                  </div>

                  {/* Parent Information Fields */}
                  <div className="space-y-4">
                    {/* Father's Name */}
                    <div className={cn(
                      "p-4 rounded-xl",
                      "bg-gradient-to-br from-blue-50/50 to-purple-50/50 dark:from-gray-800/50 dark:to-gray-700/50",
                      "border border-gray-100 dark:border-gray-700"
                    )}>
                      <Label className="flex items-center gap-2 text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">
                        <div className="w-8 h-8 rounded-lg bg-blue-100 dark:bg-blue-900/50 flex items-center justify-center">
                          <Users className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                        </div>
                        Father's Name
                      </Label>
                      {isEditing ? (
                        <Input
                          value={profileData.fatherName}
                          onChange={e => handleInputChange('fatherName', e.target.value)}
                          className="bg-white/70 dark:bg-gray-800/70 border-0 shadow-sm"
                          placeholder="Enter Father's Name"
                        />
                      ) : (
                        <div className="px-4 py-2 rounded-lg bg-white/70 dark:bg-gray-800/70">
                          {profileData.fatherName || <span className="text-gray-400 italic">Not set</span>}
                        </div>
                      )}
                    </div>
                    
                    {/* Mother's Name */}
                    <div className={cn(
                      "p-4 rounded-xl",
                      "bg-gradient-to-br from-pink-50/50 to-purple-50/50 dark:from-gray-800/50 dark:to-gray-700/50",
                      "border border-gray-100 dark:border-gray-700"
                    )}>
                      <Label className="flex items-center gap-2 text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">
                        <div className="w-8 h-8 rounded-lg bg-purple-100 dark:bg-purple-900/50 flex items-center justify-center">
                          <Users className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                        </div>
                        Mother's Name
                      </Label>
                      {isEditing ? (
                        <Input
                          value={profileData.motherName}
                          onChange={e => handleInputChange('motherName', e.target.value)}
                          className="bg-white/70 dark:bg-gray-800/70 border-0 shadow-sm"
                          placeholder="Enter Mother's Name"
                        />
                      ) : (
                        <div className="px-4 py-2 rounded-lg bg-white/70 dark:bg-gray-800/70">
                          {profileData.motherName || <span className="text-gray-400 italic">Not set</span>}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Contact Details Grid */}
              <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  {
                    key: 'email',
                    icon: Mail,
                    bgLight: 'bg-emerald-100',
                    bgDark: 'dark:bg-emerald-900/50',
                    iconLight: 'text-emerald-600',
                    iconDark: 'dark:text-emerald-400'
                  },
                  {
                    key: 'phone',
                    icon: Phone,
                    bgLight: 'bg-yellow-100',
                    bgDark: 'dark:bg-yellow-900/50',
                    iconLight: 'text-yellow-600',
                    iconDark: 'dark:text-yellow-400'
                  },
                  {
                    key: 'address',
                    icon: MapPin,
                    bgLight: 'bg-pink-100',
                    bgDark: 'dark:bg-pink-900/50',
                    iconLight: 'text-pink-600',
                    iconDark: 'dark:text-pink-400'
                  },
                  {
                    key: 'aadhaar',
                    icon: Users,
                    bgLight: 'bg-sky-100',
                    bgDark: 'dark:bg-sky-900/50',
                    iconLight: 'text-sky-600',
                    iconDark: 'dark:text-sky-400'
                  }
                ].map((item) => (
                  <div 
                    key={item.key}
                    className={cn(
                      "backdrop-blur-xl rounded-xl p-4",
                      "bg-white/90 dark:bg-gray-900/60",
                      "hover:bg-gray-50/90 dark:hover:bg-gray-900/80",
                      "border border-gray-100 dark:border-gray-800",
                      "transition-all duration-300",
                      "shadow-lg hover:shadow-xl"
                    )}
                  >
                    <Label className="flex items-center gap-3 text-sm font-medium text-gray-500 dark:text-gray-400 mb-3">
                      <div className={cn(
                        "w-8 h-8 rounded-lg flex items-center justify-center",
                        item.bgLight,
                        item.bgDark
                      )}>
                        <item.icon className={cn(
                          "w-4 h-4",
                          item.iconLight,
                          item.iconDark
                        )} />
                      </div>
                      {fieldLabels[item.key]}
                    </Label>
                    {isEditing ? (
                      <Input
                        value={profileData[item.key]}
                        onChange={e => handleInputChange(item.key, e.target.value)}
                        className="bg-white/70 dark:bg-gray-800/70 border-0 shadow-sm"
                        placeholder={`Enter ${fieldLabels[item.key]}`}
                        disabled={nonEditableFields.includes(item.key)}
                      />
                    ) : (
                      <div className="px-4 py-2.5 rounded-lg bg-white/70 dark:bg-gray-800/70 text-gray-900 dark:text-white">
                        {profileData[item.key] || <span className="text-gray-400 italic">Not set</span>}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
          {errorMsg && (
            <div className="mt-4 p-4 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
              <p className="text-red-600 dark:text-red-400">{errorMsg}</p>
            </div>
          )}
          </CardContent>
        </Card>

          </TabsContent>

          <TabsContent value="children" className="space-y-6">
            {/* Children Section */}
            <Card className={cn(
              "border-0 backdrop-blur-xl animate-fadeIn",
              "bg-white/80 dark:bg-gray-900/60", // Light/dark mode background
              "transition-colors duration-300"
            )}>
              <CardHeader className={cn(
                "border-b",
                "border-gray-200 dark:border-gray-800" // Light/dark mode border
              )}>
                <div className="flex items-center justify-between flex-wrap gap-4">
                  <div className="flex items-center gap-3">
                    <div className={cn(
                      "w-12 h-12 rounded-2xl flex items-center justify-center",
                      "bg-blue-500/20 dark:bg-blue-500/20" // Light/dark mode background
                    )}>
                      <Users className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div>
                      <h2 className="text-sm text-blue-600 dark:text-blue-400">Family Members</h2>
                      <h1 className="text-xl font-semibold text-gray-900 dark:text-white">My Children</h1>
                    </div>
                  </div>
                  <Button 
                    className={cn(
                      "bg-emerald-500 hover:bg-emerald-600 text-white rounded-full px-4",
                      "shadow-lg hover:shadow-emerald-500/25" // Add shadow effect
                    )}
                    size="sm"
                  >
                    <User2 className="w-4 h-4 mr-2" />
                    Add New Child
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="p-4 md:p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 md:gap-6">
                  {children.map((child, idx) => (
                    <div 
                      key={child.id || child._id} 
                      className={cn(
                        "backdrop-blur-xl rounded-3xl p-4 md:p-6",
                        "bg-white/90 dark:bg-gray-900/60", // Light/dark mode background
                        "hover:bg-gray-50/90 dark:hover:bg-gray-900/80", // Light/dark mode hover
                        "border border-gray-100 dark:border-gray-800", // Light/dark mode border
                        "transition-all duration-300",
                        "shadow-lg hover:shadow-xl" // Enhanced shadow effect
                      )}
                    >
                      {/* Header with Photo and Name */}
                      <div className="flex items-start gap-4 mb-6">
                        {child.photo ? (
                          <div className="w-16 md:w-20 h-16 md:h-20 rounded-2xl overflow-hidden border border-gray-200 dark:border-gray-700">
                            <img src={child.photo} alt={child.name} className="w-full h-full object-cover" />
                          </div>
                        ) : (
                          <div className="w-16 md:w-20 h-16 md:h-20 rounded-2xl bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 flex items-center justify-center">
                            <Users className="w-8 h-8 text-gray-400" />
                          </div>
                        )}
                        <div className="flex-1 min-w-0"> {/* Add min-w-0 to allow text truncation */}
                          <h3 className="text-lg md:text-xl font-semibold text-gray-900 dark:text-white mb-1 truncate">{child.name}</h3>
                          <p className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-2">
                            <CalendarIcon className="w-4 h-4 flex-shrink-0" />
                            <span className="truncate">Age: {calculateAge(child.dob) ?? 'N/A'} {calculateAge(child.dob) ? 'years' : ''}</span>
                          </p>
                        </div>
                      </div>

                      {/* Info Grid */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 isolate"> {/* Added isolate for stacking context */}
                        {[
                          {
                            label: 'DOB',
                            value: formatDate(child.dob || ''),
                            fullValue: child.dob,
                            icon: CalendarDays,
                            bgLight: 'bg-emerald-100',
                            bgDark: 'dark:bg-emerald-900/90',
                            iconLight: 'text-emerald-600',
                            iconDark: 'dark:text-emerald-300'
                          },
                          {
                            label: 'Gender',
                            value: child.gender || 'N/A',
                            fullValue: child.gender,
                            icon: User2,
                            bgLight: 'bg-purple-100',
                            bgDark: 'dark:bg-purple-900/90',
                            iconLight: 'text-purple-600',
                            iconDark: 'dark:text-purple-300'
                          },
                          {
                            label: 'Country',
                            value: child.country || 'N/A',
                            fullValue: child.country,
                            icon: Map,
                            bgLight: 'bg-blue-100',
                            bgDark: 'dark:bg-blue-900/90',
                            iconLight: 'text-blue-600',
                            iconDark: 'dark:text-blue-300'
                          },
                          {
                            label: 'District',
                            value: child.district || 'N/A',
                            fullValue: child.district,
                            icon: Building,
                            bgLight: 'bg-indigo-100',
                            bgDark: 'dark:bg-indigo-900/90',
                            iconLight: 'text-indigo-600',
                            iconDark: 'dark:text-indigo-300'
                          },
                          {
                            label: 'City',
                            value: child.city || 'N/A',
                            fullValue: child.city,
                            icon: MapPin,
                            bgLight: 'bg-pink-100',
                            bgDark: 'dark:bg-pink-900/50',
                            iconLight: 'text-pink-600',
                            iconDark: 'dark:text-pink-400'
                          },
                          {
                            label: 'Disability',
                            value: child.disability || 'None',
                            fullValue: child.disability,
                            icon: AlertCircle,
                            bgLight: 'bg-yellow-100',
                            bgDark: 'dark:bg-yellow-900/50',
                            iconLight: 'text-yellow-600',
                            iconDark: 'dark:text-yellow-400'
                          },
                          {
                            label: 'Blood Group',
                            value: child.bloodGroup || 'N/A',
                            fullValue: child.bloodGroup,
                            icon: Droplet,
                            bgLight: 'bg-red-100',
                            bgDark: 'dark:bg-red-900/50',
                            iconLight: 'text-red-600',
                            iconDark: 'dark:text-red-400'
                          },
                          {
                            label: 'Aadhaar',
                            value: child.aadhaarNumber ? `${child.aadhaarNumber.slice(0, 4)}...` : 'N/A',
                            fullValue: child.aadhaarNumber,
                            icon: User2,
                            bgLight: 'bg-sky-100',
                            bgDark: 'dark:bg-sky-900/50',
                            iconLight: 'text-sky-600',
                            iconDark: 'dark:text-sky-400'
                          }
                        ].map((item, index) => (
                          <div key={item.label} className="relative"> {/* Added relative container */}
                            <HoverCard openDelay={200}>
                              <HoverCardTrigger>
                                <div 
                                  className={cn(
                                    "flex gap-2 items-center p-3 rounded-xl cursor-help",
                                    "bg-white dark:!bg-gray-800/90", // Added !important
                                    "hover:bg-gray-50 dark:hover:!bg-gray-800/70",
                                    "border border-gray-100 dark:border-gray-700",
                                    "transition-all duration-200",
                                    "shadow-sm hover:shadow-md"
                                  )}
                                >
                                  <div className={cn(
                                    "w-8 h-8 rounded-lg flex items-center justify-center backdrop-blur-sm",
                                    item.bgLight,
                                    item.bgDark,
                                    "shadow-sm dark:shadow-black/20",
                                    "transition-colors duration-200"
                                  )}>
                                    <item.icon className={cn(
                                      "w-4 h-4",
                                      item.iconLight,
                                      item.iconDark,
                                      "transition-colors duration-200"
                                    )} />
                                  </div>
                                  <div className="min-w-0 flex-1">
                                    <span className="text-xs text-gray-500 dark:text-gray-400 block">{item.label}</span>
                                    <p className="text-sm text-gray-900 dark:text-white font-medium truncate">
                                      {item.value}
                                    </p>
                                  </div>
                                </div>
                              </HoverCardTrigger>
                              <HoverCardContent 
                                side="top"
                                align="start"
                                alignOffset={-20}
                                sideOffset={8}
                                className={cn(
                                  "w-auto min-w-[120px] px-3 py-2",
                                  "!z-[999]",
                                  "bg-white/95 dark:!bg-gray-800/95",
                                  "border border-gray-200/50 dark:border-gray-700/50",
                                  "shadow-lg dark:shadow-black/20",
                                  "backdrop-blur-sm",
                                  "animate-in fade-in-0 zoom-in-95 data-[side=top]:slide-in-from-bottom-1",
                                  "data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95",
                                  "fixed" // Force fixed positioning
                                )}
                                style={{
                                  transform: 'translate3d(0, 0, 999px)' // Force higher stacking context
                                }}
                              >
                                <div className="flex items-center gap-2">
                                  <item.icon className={cn(
                                    "w-4 h-4",
                                    item.iconLight,
                                    "dark:" + item.iconDark
                                  )} />
                                  <p className="text-sm font-medium text-gray-900 dark:text-white whitespace-normal">
                                    {item.fullValue || 'Not Available'}
                                  </p>
                                </div>
                              </HoverCardContent>
                            </HoverCard>
                          </div>
                        ))}

                        {/* Status Row with similar dark mode improvements */}
                        <div className={cn(
                          "col-span-full flex gap-2 items-center p-3 rounded-xl",
                          "bg-white dark:!bg-gray-800/90", // Added !important
                          "border border-gray-100 dark:border-gray-700",
                          "shadow-sm relative" // Added relative positioning
                        )}>
                          <div className={cn(
                            "w-8 h-8 rounded-lg flex items-center justify-center",
                            "bg-green-100/90 dark:bg-green-900/90"
                          )}>
                            <Activity className="w-4 h-4 text-green-600 dark:text-green-300" />
                          </div>
                          <div className="flex-1">
                            <span className="text-xs text-gray-500 dark:text-gray-400">Status</span>
                            <div className="flex items-center justify-between">
                              <p className="text-sm text-gray-900 dark:text-white font-medium">
                                {child.isActive ? 'Active' : 'Inactive'}
                              </p>
                              <div className={cn(
                                "h-2.5 w-2.5 rounded-full",
                                child.isActive 
                                  ? "bg-green-500 dark:bg-green-400" 
                                  : "bg-red-500 dark:bg-red-400",
                                "shadow-sm"
                              )}></div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default ParentProfile;