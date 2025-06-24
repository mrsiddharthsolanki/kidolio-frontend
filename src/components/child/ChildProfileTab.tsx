import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { User, Calendar, MapPin, Heart, FileText, Award, Activity, Sparkles,CheckCircle,Zap,Star, Clock , Shield, Eye, Download} from 'lucide-react';
import api from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import Layout from '../Layout';

interface ChildProfile {
  id: string;
  name: string;
  dob: string;
  gender: string;
  country?: string;
  district?: string;
  city?: string;
  disability?: string;
  aadhaarNumber?: string;
  bloodGroup?: string;
  birthHospital?: string;
  firstTreatmentDoctor?: string;
  majorMark?: string;
  photo?: string;
  birthdayTime?: string;
  birthCertificate?: string;
  status?: string;
  hasLogin?: boolean;
  userId?: string;
  password?: string;
  isActive?: boolean;
  createdAt?: string;
  records?: string[];
}

interface ParentProfile {
  name?: string;
  fatherName?: string;
  motherName?: string;
  email?: string;
  phone?: string;
  address?: string;
  occupation?: string;
  emergencyContact?: string;
  aadhaar?: string;
}

const ChildProfileTab: React.FC = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState<ChildProfile | null>(null);
  const [parent, setParent] = useState<ParentProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
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
    if (!user || !user.id) {
      setError('No child user is signed in.');
      setLoading(false);
      return;
    }
    setLoading(true);
    api.get(`/child/${user.id}`)
      .then(async res => {
        const data = res.data;
        if (!data || data.message === 'Child not found') {
          setError('Profile not found. Please contact your parent to add your profile.');
          setLoading(false);
          return;
        }
        setProfile({
          id: data._id || data.id,
          name: data.name,
          dob: data.dob ? new Date(data.dob).toLocaleDateString() : '',
          gender: data.gender,
          country: data.country,
          district: data.district,
          city: data.city,
          disability: data.disability,
          aadhaarNumber: data.aadhaarNumber,
          bloodGroup: data.bloodGroup,
          birthHospital: data.birthHospital,
          firstTreatmentDoctor: data.firstTreatmentDoctor,
          majorMark: data.majorMark,
          photo: data.photo,
          birthdayTime: data.birthdayTime,
          birthCertificate: data.birthCertificate,
          status: data.status,
          hasLogin: data.hasLogin,
          userId: data.userId,
          password: data.password,
          isActive: data.isActive,
          createdAt: data.createdAt ? new Date(data.createdAt).toLocaleDateString() : '',
          records: data.records,
        });
        setError(null);
        // Fetch parent info if parent id exists
        if (data.parent) {
          try {
            const parentRes = await api.get(`/user/${data.parent}`);
            setParent(parentRes.data);
          } catch {
            setParent(null);
          }
        } else {
          setParent(null);
        }
        setLoading(false);
      })
      .catch((err) => {
        let msg = 'Failed to load profile';
        if (err.response && err.response.data && err.response.data.message) {
          msg = err.response.data.message;
        }
        setError(msg);
        setLoading(false);
      });
  }, [user]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="relative w-20 h-20 mx-auto mb-6">
            <div className="absolute inset-0 rounded-full border-4 border-blue-200 dark:border-blue-800"></div>
            <div className="absolute inset-0 rounded-full border-4 border-blue-600 border-t-transparent animate-spin"></div>
            <div className="absolute inset-3 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center">
              <Sparkles className="w-6 h-6 text-white animate-pulse" />
            </div>
          </div>
          <p className="text-xl font-semibold text-gray-700 dark:text-gray-300 mb-2">Loading your amazing profile...</p>
          <p className="text-gray-500 dark:text-gray-400">Just a moment while we gather your details ✨</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center max-w-md">
          <div className="w-20 h-20 mx-auto mb-6 rounded-3xl bg-gradient-to-r from-red-500 to-pink-500 flex items-center justify-center shadow-2xl">
            <User className="w-10 h-10 text-white" />
          </div>
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">Oops! Something went wrong</h3>
          <p className="text-lg text-red-600 dark:text-red-400 mb-6">{error}</p>
          <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-3 rounded-2xl font-semibold shadow-xl hover:shadow-2xl transition-all duration-300">
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  if (!profile) return null;

  return (
    <div className="space-y-8">
      {/* Hero Profile Section */}
      <div className={`relative group ${isLoaded ? 'animate-fadeInUp' : 'opacity-0'}`}>
        <div className="absolute inset-0 bg-gradient-to-r from-violet-600/10 via-blue-600/10 to-purple-600/10 dark:from-violet-600/5 dark:via-blue-600/5 dark:to-purple-600/5 rounded-[2rem] blur-xl group-hover:blur-2xl transition-all duration-500"></div>
        
        <div className="relative bg-white/95 dark:bg-gray-800/95 backdrop-blur-2xl rounded-[2rem] shadow-2xl border-0 overflow-hidden">
          {/* Floating background elements */}
          <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-[2rem]">
            <div 
              className="absolute w-64 h-64 bg-gradient-to-r from-blue-400/10 to-purple-400/10 dark:from-blue-400/5 dark:to-purple-400/5 rounded-full blur-3xl transition-all duration-1000"
              style={{
                transform: `translate(${mousePosition.x * 30}px, ${mousePosition.y * 30}px)`,
                left: '10%',
                top: '10%'
              }}
            />
            <div 
              className="absolute w-48 h-48 bg-gradient-to-r from-pink-400/10 to-rose-400/10 dark:from-pink-400/5 dark:to-rose-400/5 rounded-full blur-3xl transition-all duration-1000"
              style={{
                transform: `translate(${mousePosition.x * -20}px, ${mousePosition.y * -20}px)`,
                right: '10%',
                bottom: '10%'
              }}
            />
          </div>

          {/* Header Section */}
          <div className="relative p-8 lg:p-12">
            <div className="flex flex-col lg:flex-row items-center gap-8 lg:gap-12">
              {/* Profile Picture */}
              <div className="relative group/avatar">
                <div className="absolute -inset-4 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 rounded-full opacity-20 group-hover/avatar:opacity-40 blur-xl transition-all duration-500"></div>
                <div className="relative">
                  {profile.photo ? (
                    <img 
                      src={profile.photo} 
                      alt={profile.name} 
                      className="w-32 h-32 lg:w-40 lg:h-40 rounded-full object-cover border-4 border-white dark:border-gray-700 shadow-2xl ring-4 ring-blue-200/50 dark:ring-purple-700/50 group-hover/avatar:scale-105 transition-all duration-500" 
                    />
                  ) : (
                    <div className="w-32 h-32 lg:w-40 lg:h-40 rounded-full bg-gradient-to-br from-blue-400 via-purple-400 to-pink-400 flex items-center justify-center border-4 border-white dark:border-gray-700 shadow-2xl ring-4 ring-blue-200/50 dark:ring-purple-700/50 group-hover/avatar:scale-105 transition-all duration-500">
                      <User className="w-16 h-16 lg:w-20 lg:h-20 text-white drop-shadow-lg" />
                    </div>
                  )}
                  
                  {/* Status Indicator */}
                  <div className="absolute -top-2 -right-2 flex items-center gap-1">
                    <div className="w-8 h-8 bg-gradient-to-r from-emerald-400 to-blue-500 rounded-full flex items-center justify-center shadow-lg border-2 border-white dark:border-gray-800">
                      <CheckCircle className="w-4 h-4 text-white" />
                    </div>
                    {profile.isActive && (
                      <div className="w-6 h-6 bg-emerald-500 rounded-full animate-pulse shadow-lg border-2 border-white dark:border-gray-800"></div>
                    )}
                  </div>
                </div>
              </div>

              {/* Profile Information */}
              <div className="flex-1 text-center lg:text-left">
                <div className="mb-6">
                  <h1 className="text-4xl lg:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 mb-2 leading-tight">
                    {profile.name}
                  </h1>
                  <p className="text-xl lg:text-2xl text-gray-600 dark:text-gray-300 font-light">
                    Your amazing profile journey ✨
                  </p>
                </div>

                {/* Quick Info Badges */}
                <div className="flex flex-wrap justify-center lg:justify-start gap-3 mb-6">
                  <Badge className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white px-6 py-3 rounded-2xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer">
                    <User className="w-4 h-4 mr-2" />
                    {profile.gender}
                  </Badge>
                  
                  {profile.bloodGroup && (
                    <Badge className="bg-gradient-to-r from-red-500 to-pink-600 hover:from-red-600 hover:to-pink-700 text-white px-6 py-3 rounded-2xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer">
                      <Heart className="w-4 h-4 mr-2" />
                      {profile.bloodGroup}
                    </Badge>
                  )}
                  
                  <Badge className={`px-6 py-3 rounded-2xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer ${
                    profile.isActive 
                      ? 'bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 text-white' 
                      : 'bg-gradient-to-r from-gray-500 to-gray-600 hover:from-gray-600 hover:to-gray-700 text-white'
                  }`}>
                    <Zap className="w-4 h-4 mr-2" />
                    {profile.isActive ? 'Active' : 'Inactive'}
                  </Badge>
                </div>

                {/* Location */}
                {profile.country && (
                  <div className="flex items-center justify-center lg:justify-start gap-3 text-gray-600 dark:text-gray-300 mb-6">
                    <div className="w-10 h-10 rounded-2xl bg-gradient-to-r from-emerald-500 to-blue-500 flex items-center justify-center shadow-lg">
                      <MapPin className="w-5 h-5 text-white" />
                    </div>
                    <span className="text-lg font-medium">
                      {profile.city}, {profile.district}, {profile.country}
                    </span>
                  </div>
                )}

                {/* Quick Stats */}
                <div className="flex flex-wrap justify-center lg:justify-start gap-4">
                  <div className="group flex items-center gap-3 bg-white/90 dark:bg-gray-800/90 backdrop-blur-xl rounded-2xl px-6 py-3 shadow-xl border border-white/50 dark:border-gray-700/50 hover:shadow-2xl transition-all duration-500 hover:scale-105">
                    <Calendar className="w-5 h-5 text-blue-500" />
                    <div className="text-left">
                      <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">Born on</p>
                      <p className="text-sm font-bold text-gray-900 dark:text-white">{profile.dob}</p>
                    </div>
                  </div>
                  
                  {profile.createdAt && (
                    <div className="group flex items-center gap-3 bg-white/90 dark:bg-gray-800/90 backdrop-blur-xl rounded-2xl px-6 py-3 shadow-xl border border-white/50 dark:border-gray-700/50 hover:shadow-2xl transition-all duration-500 hover:scale-105">
                      <Star className="w-5 h-5 text-purple-500" />
                      <div className="text-left">
                        <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">Member since</p>
                        <p className="text-sm font-bold text-gray-900 dark:text-white">{profile.createdAt}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Details Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
        {/* Personal Information Card */}
        <div className={`group ${isLoaded ? 'animate-fadeInUp' : 'opacity-0'}`} style={{ animationDelay: '0.1s' }}>
          <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 to-purple-600/10 dark:from-blue-600/5 dark:to-purple-600/5 rounded-[2rem] blur-xl group-hover:blur-2xl transition-all duration-500"></div>
          
          <div className="relative bg-white/95 dark:bg-gray-800/95 backdrop-blur-2xl rounded-[2rem] shadow-2xl border-0 overflow-hidden">
            {/* Card Header */}
            <div className="relative p-6 lg:p-8 border-b border-gray-200/50 dark:border-gray-700/30">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center shadow-lg">
                  <User className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white">Personal Information</h3>
                  <p className="text-gray-600 dark:text-gray-400">Your personal details and identity</p>
                </div>
              </div>
            </div>

            {/* Card Content */}
            <div className="relative p-6 lg:p-8 space-y-4">
              {/* Date of Birth */}
              <div className="group/item flex items-center gap-4 p-4 bg-gradient-to-r from-blue-50/50 to-purple-50/50 dark:from-blue-900/10 dark:to-purple-900/10 backdrop-blur-sm rounded-2xl border border-blue-200/20 dark:border-blue-700/20 hover:shadow-lg hover:scale-[1.02] transition-all duration-300">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-r from-blue-500 to-blue-600 flex items-center justify-center shadow-md group-hover/item:scale-110 transition-all duration-300">
                  <Calendar className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Date of Birth</p>
                  <p className="text-lg font-bold text-gray-900 dark:text-white">{profile.dob}</p>
                </div>
              </div>

              {/* Birth Time */}
              {profile.birthdayTime && (
                <div className="group/item flex items-center gap-4 p-4 bg-gradient-to-r from-purple-50/50 to-pink-50/50 dark:from-purple-900/10 dark:to-pink-900/10 backdrop-blur-sm rounded-2xl border border-purple-200/20 dark:border-purple-700/20 hover:shadow-lg hover:scale-[1.02] transition-all duration-300">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-r from-purple-500 to-purple-600 flex items-center justify-center shadow-md group-hover/item:scale-110 transition-all duration-300">
                    <Clock className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Birth Time</p>
                    <p className="text-lg font-bold text-gray-900 dark:text-white">{profile.birthdayTime}</p>
                  </div>
                </div>
              )}

              {/* Disability */}
              {profile.disability && (
                <div className="group/item flex items-center gap-4 p-4 bg-gradient-to-r from-orange-50/50 to-red-50/50 dark:from-orange-900/10 dark:to-red-900/10 backdrop-blur-sm rounded-2xl border border-orange-200/20 dark:border-orange-700/20 hover:shadow-lg hover:scale-[1.02] transition-all duration-300">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-r from-orange-500 to-red-500 flex items-center justify-center shadow-md group-hover/item:scale-110 transition-all duration-300">
                    <Shield className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Special Needs</p>
                    <p className="text-lg font-bold text-gray-900 dark:text-white">{profile.disability}</p>
                  </div>
                </div>
              )}

              {/* Major Mark */}
              {profile.majorMark && (
                <div className="group/item flex items-center gap-4 p-4 bg-gradient-to-r from-yellow-50/50 to-orange-50/50 dark:from-yellow-900/10 dark:to-orange-900/10 backdrop-blur-sm rounded-2xl border border-yellow-200/20 dark:border-yellow-700/20 hover:shadow-lg hover:scale-[1.02] transition-all duration-300">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-r from-yellow-500 to-orange-500 flex items-center justify-center shadow-md group-hover/item:scale-110 transition-all duration-300">
                    <Award className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Identifying Mark</p>
                    <p className="text-lg font-bold text-gray-900 dark:text-white">{profile.majorMark}</p>
                  </div>
                </div>
              )}
            </div>

            {/* Floating decoration */}
            <div className="absolute -top-8 -right-8 w-24 h-24 bg-gradient-to-r from-blue-400/20 to-purple-400/20 rounded-full blur-2xl animate-pulse pointer-events-none"></div>
          </div>
        </div>

        {/* Medical & Documents Card */}
        <div className={`group ${isLoaded ? 'animate-fadeInUp' : 'opacity-0'}`} style={{ animationDelay: '0.2s' }}>
          <div className="absolute inset-0 bg-gradient-to-r from-emerald-600/10 to-blue-600/10 dark:from-emerald-600/5 dark:to-blue-600/5 rounded-[2rem] blur-xl group-hover:blur-2xl transition-all duration-500"></div>
          
          <div className="relative bg-white/95 dark:bg-gray-800/95 backdrop-blur-2xl rounded-[2rem] shadow-2xl border-0 overflow-hidden">
            {/* Card Header */}
            <div className="relative p-6 lg:p-8 border-b border-gray-200/50 dark:border-gray-700/30">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-r from-emerald-500 to-blue-600 flex items-center justify-center shadow-lg">
                  <FileText className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white">Medical & Documents</h3>
                  <p className="text-gray-600 dark:text-gray-400">Important documents and medical info</p>
                </div>
              </div>
            </div>

            {/* Card Content */}
            <div className="relative p-6 lg:p-8 space-y-4">
              {/* Aadhaar Number */}
              {profile.aadhaarNumber && (
                <div className="group/item flex items-center gap-4 p-4 bg-gradient-to-r from-blue-50/50 to-indigo-50/50 dark:from-blue-900/10 dark:to-indigo-900/10 backdrop-blur-sm rounded-2xl border border-blue-200/20 dark:border-blue-700/20 hover:shadow-lg hover:scale-[1.02] transition-all duration-300">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-r from-blue-500 to-indigo-600 flex items-center justify-center shadow-md group-hover/item:scale-110 transition-all duration-300">
                    <FileText className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">National ID</p>
                    <p className="text-lg font-bold text-gray-900 dark:text-white">{profile.aadhaarNumber}</p>
                  </div>
                </div>
              )}

              {/* Birth Hospital */}
              {profile.birthHospital && (
                <div className="group/item flex items-center gap-4 p-4 bg-gradient-to-r from-red-50/50 to-pink-50/50 dark:from-red-900/10 dark:to-pink-900/10 backdrop-blur-sm rounded-2xl border border-red-200/20 dark:border-red-700/20 hover:shadow-lg hover:scale-[1.02] transition-all duration-300">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-r from-red-500 to-pink-500 flex items-center justify-center shadow-md group-hover/item:scale-110 transition-all duration-300">
                    <Heart className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Birth Hospital</p>
                    <p className="text-lg font-bold text-gray-900 dark:text-white">{profile.birthHospital}</p>
                  </div>
                </div>
              )}

              {/* First Treatment Doctor */}
              {profile.firstTreatmentDoctor && (
                <div className="group/item flex items-center gap-4 p-4 bg-gradient-to-r from-emerald-50/50 to-green-50/50 dark:from-emerald-900/10 dark:to-green-900/10 backdrop-blur-sm rounded-2xl border border-emerald-200/20 dark:border-emerald-700/20 hover:shadow-lg hover:scale-[1.02] transition-all duration-300">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-r from-emerald-500 to-green-500 flex items-center justify-center shadow-md group-hover/item:scale-110 transition-all duration-300">
                    <User className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">First Treatment Doctor</p>
                    <p className="text-lg font-bold text-gray-900 dark:text-white">{profile.firstTreatmentDoctor}</p>
                  </div>
                </div>
              )}

              {/* Birth Certificate */}
              {profile.birthCertificate && (
                <div className="group/item flex items-center gap-4 p-4 bg-gradient-to-r from-purple-50/50 to-violet-50/50 dark:from-purple-900/10 dark:to-violet-900/10 backdrop-blur-sm rounded-2xl border border-purple-200/20 dark:border-purple-700/20 hover:shadow-lg hover:scale-[1.02] transition-all duration-300 flex-col sm:flex-row sm:items-center">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-r from-purple-500 to-violet-500 flex items-center justify-center shadow-md group-hover/item:scale-110 transition-all duration-300 mb-3 sm:mb-0">
                    <FileText className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex-1 w-full">
                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Birth Certificate</p>
                    <div className="flex flex-col sm:flex-row gap-2 mt-2 w-full">
                      <a href={profile.birthCertificate} target="_blank" rel="noopener noreferrer" className="w-full sm:w-auto">
                        <Button className="w-full sm:w-auto bg-gradient-to-r from-purple-500 to-violet-600 hover:from-purple-600 hover:to-violet-700 text-white px-4 py-2 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300 text-sm">
                          <Eye className="w-4 h-4 mr-2" />
                          View
                        </Button>
                      </a>
                      <a href={profile.birthCertificate} download className="w-full sm:w-auto">
                        <Button className="w-full sm:w-auto bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white px-4 py-2 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300 text-sm">
                          <Download className="w-4 h-4 mr-2" />
                          Download
                        </Button>
                      </a>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Floating decoration */}
            <div className="absolute -top-8 -right-8 w-24 h-24 bg-gradient-to-r from-emerald-400/20 to-blue-400/20 rounded-full blur-2xl animate-pulse pointer-events-none"></div>
          </div>
        </div>
      </div>

      {/* Parent Information Card */}
      {parent && (
        <div className={`bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-3xl shadow-2xl border-0 overflow-hidden ${
          isLoaded ? 'animate-fadeInUp' : 'opacity-0'
        }`} style={{ animationDelay: '0.4s' }}>
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-br from-green-50/50 via-white/20 to-blue-50/50 dark:from-gray-800/50 dark:via-gray-700/20 dark:to-gray-600/50"></div>
                
                <div className="relative p-8">
                  <div className="flex items-center gap-4 mb-8">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-r from-green-500 to-blue-600 flex items-center justify-center shadow-lg">
                      <User className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold text-gray-900 dark:text-white">Parent Information</h3>
                      <p className="text-gray-600 dark:text-gray-400">Guardian and emergency contact details</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {parent.name && (
                      <div className="flex items-center gap-4 p-4 bg-white/60 dark:bg-gray-700/60 backdrop-blur-sm rounded-2xl border border-gray-200/50 dark:border-gray-600/50 hover:shadow-lg transition-all duration-300">
                        <User className="w-6 h-6 text-blue-500" />
                        <div>
                          <p className="text-sm text-gray-500 dark:text-gray-400">Name</p>
                          <p className="font-semibold text-gray-900 dark:text-white">{parent.name}</p>
                        </div>
                      </div>
                    )}

                    {parent.fatherName && (
                      <div className="flex items-center gap-4 p-4 bg-white/60 dark:bg-gray-700/60 backdrop-blur-sm rounded-2xl border border-gray-200/50 dark:border-gray-600/50 hover:shadow-lg transition-all duration-300">
                        <User className="w-6 h-6 text-green-500" />
                        <div>
                          <p className="text-sm text-gray-500 dark:text-gray-400">Father's Name</p>
                          <p className="font-semibold text-gray-900 dark:text-white">{parent.fatherName}</p>
                        </div>
                      </div>
                    )}

                    {parent.motherName && (
                      <div className="flex items-center gap-4 p-4 bg-white/60 dark:bg-gray-700/60 backdrop-blur-sm rounded-2xl border border-gray-200/50 dark:border-gray-600/50 hover:shadow-lg transition-all duration-300">
                        <User className="w-6 h-6 text-pink-500" />
                        <div>
                          <p className="text-sm text-gray-500 dark:text-gray-400">Mother's Name</p>
                          <p className="font-semibold text-gray-900 dark:text-white">{parent.motherName}</p>
                        </div>
                      </div>
                    )}

                    {parent.email && (
                      <div className="flex items-center gap-4 p-4 bg-white/60 dark:bg-gray-700/60 backdrop-blur-sm rounded-2xl border border-gray-200/50 dark:border-gray-600/50 hover:shadow-lg transition-all duration-300">
                        <FileText className="w-6 h-6 text-purple-500" />
                        <div>
                          <p className="text-sm text-gray-500 dark:text-gray-400">Email</p>
                          <p className="font-semibold text-gray-900 dark:text-white break-all">{parent.email}</p>
                        </div>
                      </div>
                    )}

                    {parent.phone && (
                      <div className="flex items-center gap-4 p-4 bg-white/60 dark:bg-gray-700/60 backdrop-blur-sm rounded-2xl border border-gray-200/50 dark:border-gray-600/50 hover:shadow-lg transition-all duration-300">
                        <Heart className="w-6 h-6 text-red-500" />
                        <div>
                          <p className="text-sm text-gray-500 dark:text-gray-400">Phone</p>
                          <p className="font-semibold text-gray-900 dark:text-white">{parent.phone}</p>
                        </div>
                      </div>
                    )}

                    {parent.occupation && (
                      <div className="flex items-center gap-4 p-4 bg-white/60 dark:bg-gray-700/60 backdrop-blur-sm rounded-2xl border border-gray-200/50 dark:border-gray-600/50 hover:shadow-lg transition-all duration-300">
                        <Award className="w-6 h-6 text-orange-500" />
                        <div>
                          <p className="text-sm text-gray-500 dark:text-gray-400">Occupation</p>
                          <p className="font-semibold text-gray-900 dark:text-white">{parent.occupation}</p>
                        </div>
                      </div>
                    )}

                    {parent.address && (
                      <div className="flex items-start gap-4 p-4 bg-white/60 dark:bg-gray-700/60 backdrop-blur-sm rounded-2xl border border-gray-200/50 dark:border-gray-600/50 hover:shadow-lg transition-all duration-300 md:col-span-2">
                        <MapPin className="w-6 h-6 text-blue-500 mt-1" />
                        <div>
                          <p className="text-sm text-gray-500 dark:text-gray-400">Address</p>
                          <p className="font-semibold text-gray-900 dark:text-white">{parent.address}</p>
                        </div>
                      </div>
                    )}

                    {parent.emergencyContact && (
                      <div className="flex items-center gap-4 p-4 bg-white/60 dark:bg-gray-700/60 backdrop-blur-sm rounded-2xl border border-gray-200/50 dark:border-gray-600/50 hover:shadow-lg transition-all duration-300">
                        <Activity className="w-6 h-6 text-red-500" />
                        <div>
                          <p className="text-sm text-gray-500 dark:text-gray-400">Emergency Contact</p>
                          <p className="font-semibold text-gray-900 dark:text-white">{parent.emergencyContact}</p>
                        </div>
                      </div>
                    )}

                    {parent.aadhaar && (
                      <div className="flex items-center gap-4 p-4 bg-white/60 dark:bg-gray-700/60 backdrop-blur-sm rounded-2xl border border-gray-200/50 dark:border-gray-600/50 hover:shadow-lg transition-all duration-300">
                        <FileText className="w-6 h-6 text-gray-500" />
                        <div>
                          <p className="text-sm text-gray-500 dark:text-gray-400">Aadhaar</p>
                          <p className="font-semibold text-gray-900 dark:text-white">{parent.aadhaar}</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
                
                {/* Floating Elements */}
                <div className="absolute -top-10 -right-10 w-32 h-32 bg-green-400/20 rounded-full blur-3xl animate-pulse"></div>
              </div>
            </div>
          )}
        </div>
      
    
    
  );
};

export default ChildProfileTab;