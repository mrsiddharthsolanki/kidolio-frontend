import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  User, 
  Users, 
  MapPin, 
  Phone, 
  Mail, 
  Heart, 
  GraduationCap, 
  Briefcase, 
  FileText,
  Calendar,
  Award,
  Activity,
  ArrowLeft
} from 'lucide-react';
import api from '@/lib/api';
import { AxiosError } from 'axios';

interface ParentInfo {
  name?: string;
  email?: string;
  phone?: string;
  occupation?: string;
  address?: string;
  emergencyContact?: string;
  fatherName?: string;
  motherName?: string;
  fatherEducation?: string;
  motherEducation?: string;
  yearlyIncome?: string;
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
  parent: ParentInfo;
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

// Strict interfaces for each record type
interface AcademicRecord {
  _id: string;
  type: 'academic';
  data: {
    subject: string;
    grade: string;
    year: string;
    score: number;
    [key: string]: unknown;
  };
  createdAt?: string;
}

// Make HealthRecord flexible for all possible backend fields
interface HealthRecord {
  _id: string;
  type: 'health';
  data: {
    type?: string;
    title?: string;
    description?: string;
    date?: string;
    doctor?: string;
    hospital?: string;
    medication?: string;
    severity?: string;
    [key: string]: unknown;
  };
  createdAt?: string;
}

// Make AchievementRecord flexible for all possible backend fields
interface AchievementRecord {
  _id: string;
  type: 'achievement';
  data: {
    title?: string;
    date?: string;
    description?: string;
    organization?: string;
    level?: string;
    position?: string;
    type?: string;
    certificate?: string;
    [key: string]: unknown;
  };
  createdAt?: string;
}

// Update DocumentRecord to match backend document schema
interface DocumentRecord {
  _id: string;
  child: string;
  name: string;
  url: string;
  fileType: string;
  size: string;
  type: string;
  uploadDate: string;
}

const ProfileView: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState<string>(searchParams.get('profileTab') || 'academic');
  const [profile, setProfile] = useState<ChildProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [academicLoading, setAcademicLoading] = useState(false);
  const [healthLoading, setHealthLoading] = useState(false);
  const [achievementsLoading, setAchievementsLoading] = useState(false);
  const [docLoading, setDocLoading] = useState(false);

  // New: State for dynamic records
  const [academicRecords, setAcademicRecords] = useState<AcademicRecord[]>([]);
  const [medicalHistory, setMedicalHistory] = useState<HealthRecord[]>([]);
  const [achievements, setAchievements] = useState<AchievementRecord[]>([]);
  const [documents, setDocuments] = useState<DocumentRecord[]>([]);

  // Fetch functions for each section
  type IdType = string | undefined;
  const fetchAcademic = useCallback(async (id: IdType) => {
    setAcademicLoading(true);
    try {
      await minDelay(
        api.get(`/record?childId=${id}`).then((recRes) => {
          const records = recRes.data as Array<AcademicRecord | HealthRecord | AchievementRecord>;
          setAcademicRecords(records.filter((r): r is AcademicRecord => r.type === 'academic'));
        }),
        300
      );
    } catch {
      setAcademicRecords([]);
    } finally {
      setAcademicLoading(false);
    }
  }, []);
  const fetchHealth = useCallback(async (id: IdType) => {
    setHealthLoading(true);
    try {
      await minDelay(
        api.get(`/record?childId=${id}&type=health`).then((healthRes) => {
          const healthData = healthRes.data;
          let allHealth: HealthRecord[] = [];
          if (typeof healthData === 'object' && healthData !== null) {
            Object.values(healthData).forEach((arr) => {
              if (Array.isArray(arr)) allHealth = allHealth.concat(arr as HealthRecord[]);
            });
          }
          setMedicalHistory(allHealth);
        }),
        300
      );
    } catch {
      setMedicalHistory([]);
    } finally {
      setHealthLoading(false);
    }
  }, []);
  const fetchAchievements = useCallback(async (id: IdType) => {
    setAchievementsLoading(true);
    try {
      await minDelay(
        api.get(`/record?childId=${id}&type=achievement`).then((achRes) => {
          const achData = achRes.data;
          if (Array.isArray(achData)) setAchievements(achData as AchievementRecord[]);
          else if (typeof achData === 'object' && achData !== null) {
            let allAch: AchievementRecord[] = [];
            Object.values(achData).forEach((arr) => {
              if (Array.isArray(arr)) allAch = allAch.concat(arr as AchievementRecord[]);
            });
            setAchievements(allAch);
          } else setAchievements([]);
        }),
        300
      );
    } catch {
      setAchievements([]);
    } finally {
      setAchievementsLoading(false);
    }
  }, []);
  const fetchDocuments = useCallback(async (id: IdType) => {
    setDocLoading(true);
    try {
      await minDelay(
        api.get(`/record/document/all?childId=${id}`).then((docRes) => {
          const docs: DocumentRecord[] = Array.isArray(docRes.data)
            ? docRes.data.map((doc) => ({
                _id: typeof doc._id === 'object' && doc._id !== null ? doc._id.$oid : doc._id || '',
                child: typeof doc.child === 'object' && doc.child !== null ? doc.child.$oid : doc.child || '',
                name: doc.name,
                url: doc.url,
                fileType: doc.fileType,
                size: doc.size,
                type: doc.type,
                uploadDate: doc.uploadDate && typeof doc.uploadDate === 'object' && doc.uploadDate.$date ? doc.uploadDate.$date : doc.uploadDate || '',
              }))
            : [];
          setDocuments(docs);
        }),
        300
      );
    } catch {
      setDocuments([]);
    } finally {
      setDocLoading(false);
    }
  }, []);

  // Only fetch profile (basic info) on mount or id change
  useEffect(() => {
    const fetchProfile = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await api.get(`/child/${id}`);
        const child = res.data;
        setProfile({
          id: child._id,
          name: child.name || 'None',
          age: child.dob ? Math.floor((Date.now() - new Date(child.dob).getTime()) / (365.25 * 24 * 60 * 60 * 1000)) : null,
          gender: child.gender || 'None',
          city: child.city || 'None',
          country: child.country || 'None',
          disability: child.disability || 'None',
          bloodGroup: child.bloodGroup || 'None',
          skills: child.skills && child.skills.length ? child.skills : ['None'],
          parent: child.parent || {},
          medicalHistory: [],
          academicRecords: [],
          achievements: [],
          documents: [],
        });
      } catch (err) {
        if (err && typeof err === 'object' && err !== null && 'isAxiosError' in err) {
          setError((err as AxiosError<{ message?: string }>).response?.data?.message || 'Failed to load profile.');
        } else {
          setError('Failed to load profile.');
        }
      } finally {
        setLoading(false);
      }
    };
    if (id) fetchProfile();
  }, [id]);

  // Lazy load each section when its tab is selected
  useEffect(() => {
    if (!id) return;
    if (activeTab === 'academic') fetchAcademic(id);
    if (activeTab === 'health') fetchHealth(id);
    if (activeTab === 'achievements') fetchAchievements(id);
    if (activeTab === 'documents') fetchDocuments(id);
  }, [activeTab, id, fetchAcademic, fetchHealth, fetchAchievements, fetchDocuments]);

  // Advanced tab routing for profile tabs
  useEffect(() => {
    const tab = searchParams.get('profileTab');
    if (tab && tab !== activeTab) {
      setActiveTab(tab);
    } else if (!tab && activeTab !== 'academic') {
      setActiveTab('academic');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  useEffect(() => {
    if (activeTab && activeTab !== searchParams.get('profileTab')) {
      setSearchParams({ ...Object.fromEntries(searchParams.entries()), profileTab: activeTab }, { replace: true });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab]);

  if (loading) return <div className="p-8 text-center">Loading profile...</div>;
  if (error) return <div className="p-8 text-center text-red-500">{error}</div>;
  if (!profile) return <div className="p-8 text-center">Profile not found.</div>;

  const parent = profile.parent || {};

  return (
    <div className="max-w-6xl mx-auto px-2 md:px-8 py-10 space-y-10 bg-gradient-to-br from-blue-50/60 via-white/80 to-purple-50/60 dark:from-gray-900 dark:via-gray-950 dark:to-blue-950 rounded-2xl shadow-xl">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6 mb-6 border-b border-blue-200 dark:border-blue-900 pb-4">
        <div className="flex items-center gap-4">
          <Button variant="outline" onClick={() => navigate(-1)} className="shadow-sm hover:scale-105 transition-transform">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Search
          </Button>
          <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight text-blue-700 dark:text-blue-200 drop-shadow-sm">Child Profile</h2>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="secondary" className="text-base px-4 py-1 bg-blue-600 text-white shadow rounded-full font-semibold">{profile.name}</Badge>
          <Badge variant="outline" className="text-xs border-blue-400 text-blue-700 bg-blue-50 dark:bg-blue-900/30 rounded-full">{profile.gender}</Badge>
          <Badge variant="outline" className="text-xs border-green-400 text-green-700 bg-green-50 dark:bg-green-900/30 rounded-full">{profile.age} yrs</Badge>
        </div>
      </div>

      {/* Profile Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Child Information */}
        <Card className="shadow-lg border-0 bg-gradient-to-br from-blue-100/60 to-white/90 dark:from-gray-800/80 dark:to-gray-900/90 rounded-2xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-blue-700 dark:text-blue-200">
              <User className="w-6 h-6" /> Child Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm">
            <div className="flex items-center gap-2"><User className="w-4 h-4 text-gray-400" /><span className="font-medium">Name:</span> {profile.name}</div>
            <div className="flex items-center gap-2"><Calendar className="w-4 h-4 text-gray-400" /><span className="font-medium">Age:</span> {profile.age} years</div>
            <div className="flex items-center gap-2"><Users className="w-4 h-4 text-gray-400" /><span className="font-medium">Gender:</span> {profile.gender}</div>
            <div className="flex items-center gap-2"><MapPin className="w-4 h-4 text-gray-400" /><span className="font-medium">Location:</span> {profile.city}, {profile.country}</div>
            <div className="flex items-center gap-2"><Heart className="w-4 h-4 text-gray-400" /><span className="font-medium">Blood Group:</span> <Badge variant="outline" className="rounded-full px-2">{profile.bloodGroup}</Badge></div>
            <div className="flex items-center gap-2"><Activity className="w-4 h-4 text-gray-400" /><span className="font-medium">Disability:</span> {profile.disability}</div>
          </CardContent>
        </Card>

        {/* Parent Information */}
        <Card className="shadow-lg border-0 bg-gradient-to-br from-purple-100/60 to-white/90 dark:from-gray-800/80 dark:to-gray-900/90 rounded-2xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-purple-700 dark:text-purple-200">
              <Users className="w-6 h-6" /> Parent Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm">
            {parent.fatherName && (<div className="flex items-center gap-2"><User className="w-4 h-4 text-gray-400" /><span className="font-medium">Father's Name:</span> {parent.fatherName}</div>)}
            {parent.motherName && (<div className="flex items-center gap-2"><User className="w-4 h-4 text-gray-400" /><span className="font-medium">Mother's Name:</span> {parent.motherName}</div>)}
            {parent.name && (<div className="flex items-center gap-2"><User className="w-4 h-4 text-gray-400" /><span className="font-medium">Name:</span> {parent.name}</div>)}
            {parent.email && (<div className="flex items-center gap-2"><Mail className="w-4 h-4 text-gray-400" /><span className="font-medium">Email:</span> {parent.email}</div>)}
            {parent.phone && (<div className="flex items-center gap-2"><Phone className="w-4 h-4 text-gray-400" /><span className="font-medium">Phone:</span> {parent.phone}</div>)}
            {parent.occupation && (<div className="flex items-center gap-2"><Briefcase className="w-4 h-4 text-gray-400" /><span className="font-medium">Occupation:</span> {parent.occupation}</div>)}
            {parent.fatherEducation && (<div className="flex items-center gap-2"><GraduationCap className="w-4 h-4 text-gray-400" /><span className="font-medium">Father's Education:</span> {parent.fatherEducation}</div>)}
            {parent.motherEducation && (<div className="flex items-center gap-2"><GraduationCap className="w-4 h-4 text-gray-400" /><span className="font-medium">Mother's Education:</span> {parent.motherEducation}</div>)}
            {parent.yearlyIncome && (<div className="flex items-center gap-2"><span className="font-medium">Income Range:</span> {parent.yearlyIncome}</div>)}
          </CardContent>
        </Card>

        {/* Contact & Emergency (Child) */}
        <Card className="shadow-lg border-0 bg-gradient-to-br from-green-100/60 to-white/90 dark:from-gray-800/80 dark:to-gray-900/90 rounded-2xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-green-700 dark:text-green-200">
              <MapPin className="w-6 h-6" /> Contact & Emergency
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm">
            {parent.address && (
              <div>
                <span className="font-medium">Address:</span>
                <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">{parent.address}</p>
              </div>
            )}
            {parent.emergencyContact && (
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-red-400" />
                <span className="font-medium">Emergency:</span> {parent.emergencyContact}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Detailed Information Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full mt-10">
        <TabsList className="grid w-full grid-cols-4 bg-gradient-to-r from-blue-100/80 to-purple-100/80 dark:from-gray-800 dark:to-gray-900 rounded-xl shadow mb-2">
          <TabsTrigger value="academic" className="transition-all data-[state=active]:bg-blue-600 data-[state=active]:text-white data-[state=active]:shadow-lg rounded-xl text-base font-semibold">Academic Records</TabsTrigger>
          <TabsTrigger value="health" className="transition-all data-[state=active]:bg-red-600 data-[state=active]:text-white data-[state=active]:shadow-lg rounded-xl text-base font-semibold">Health Records</TabsTrigger>
          <TabsTrigger value="achievements" className="transition-all data-[state=active]:bg-yellow-500 data-[state=active]:text-white data-[state=active]:shadow-lg rounded-xl text-base font-semibold">Achievements</TabsTrigger>
          <TabsTrigger value="documents" className="transition-all data-[state=active]:bg-blue-800 data-[state=active]:text-white data-[state=active]:shadow-lg rounded-xl text-base font-semibold">Documents</TabsTrigger>
        </TabsList>

        {/* Animated tab content wrapper */}
        <div className="relative min-h-[340px] md:min-h-[280px]">
          <TabsContent value="academic" className="tab-content-fade" tabIndex={-1}>
            <Card className="shadow-lg border-0 bg-gradient-to-br from-green-50/80 to-white/95 dark:from-green-900/40 dark:to-gray-900/80 rounded-2xl">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-green-700 dark:text-green-200">
                  <GraduationCap className="w-5 h-5" /> Academic Performance
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {academicLoading ? (
                    <div className="col-span-full"><Spinner /></div>
                  ) : academicRecords.length === 0 ? (
                    <div className="col-span-full text-gray-400">No academic records available.</div>
                  ) : (
                    academicRecords.map((record, index) => (
                      <Card key={index} className="border border-green-100 dark:border-green-700 bg-gradient-to-br from-green-100/60 to-white/90 dark:from-green-900/40 dark:to-gray-900/80 rounded-2xl shadow-md hover:scale-[1.025] hover:shadow-xl transition-transform duration-200">
                        <CardContent className="p-6">
                          <div className="flex justify-between items-center mb-2">
                            <h4 className="font-semibold text-green-700 dark:text-green-200 text-lg cursor-default">{record.data?.subject}</h4>
                            <Badge variant={record.data?.score >= 85 ? 'default' : record.data?.score >= 70 ? 'secondary' : 'destructive'} className="text-base px-3 py-1 rounded-full font-bold">
                              {record.data?.grade}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-4 text-xs text-gray-600 dark:text-gray-400">
                            <span>Year: <span className="font-medium">{record.data?.year}</span></span>
                          </div>
                        </CardContent>
                      </Card>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Health TabContent */}
          <TabsContent value="health" className="tab-content-fade" tabIndex={-1}>
            <Card className="shadow-lg border-0 bg-gradient-to-br from-red-50/80 to-white/95 dark:from-red-900/40 dark:to-gray-900/80 rounded-2xl">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-red-700 dark:text-red-200">
                  <Heart className="w-5 h-5" /> Health Information
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div>
                    <h4 className="font-semibold mb-2 text-lg text-red-700 dark:text-red-200">Health Records</h4>
                    <div className="space-y-4">
                      {healthLoading ? (
                        <div className="text-gray-400"><Spinner /></div>
                      ) : medicalHistory.length === 0 ? (
                        <div className="text-gray-400">No health records available.</div>
                      ) : (
                        medicalHistory.map((record, index) => (
                          <Card key={index} className="border border-red-100 dark:border-red-700 bg-gradient-to-br from-red-100/60 to-white/90 dark:from-red-900/40 dark:to-gray-900/80 rounded-2xl shadow-md hover:scale-[1.025] hover:shadow-xl transition-transform duration-200">
                            <CardContent className="p-6">
                              <div className="flex items-center gap-2 mb-1">
                                <Heart className="w-4 h-4 text-red-400" />
                                <span className="font-medium capitalize text-red-700 dark:text-red-200 cursor-default">{record.data?.type}</span>
                                <span className="text-xs text-gray-500 ml-2">{record.data?.date ? new Date(record.data.date as string).toLocaleDateString() : ''}</span>
                              </div>
                              {record.data?.title && <div className="text-base font-semibold text-red-800 dark:text-red-100 cursor-default">{record.data.title as string}</div>}
                              {record.data?.description && <div className="text-xs text-gray-600 dark:text-gray-400 mb-1 cursor-default">{record.data.description as string}</div>}
                              <div className="flex flex-wrap gap-2 mt-2">
                                {record.data?.doctor && <span className="text-xs bg-red-50 dark:bg-red-900/30 px-2 py-1 rounded-full">Doctor: {record.data.doctor as string}</span>}
                                {record.data?.hospital && <span className="text-xs bg-red-50 dark:bg-red-900/30 px-2 py-1 rounded-full">Hospital: {record.data.hospital as string}</span>}
                                {record.data?.medication && record.data.medication !== '' && <span className="text-xs bg-red-50 dark:bg-red-900/30 px-2 py-1 rounded-full">Medication: {record.data.medication as string}</span>}
                                {record.data?.severity && record.data.severity !== '' && <span className="text-xs bg-red-50 dark:bg-red-900/30 px-2 py-1 rounded-full">Severity: {record.data.severity as string}</span>}
                              </div>
                            </CardContent>
                          </Card>
                        ))
                      )}
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-red-200 dark:border-red-900">
                    <div>
                      <span className="font-medium">Blood Group:</span> {profile.bloodGroup}
                    </div>
                    <div>
                      <span className="font-medium">Disability Status:</span> {profile.disability}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Achievements TabContent */}
          <TabsContent value="achievements" className="tab-content-fade" tabIndex={-1}>
            <Card className="shadow-lg border-0 bg-gradient-to-br from-yellow-50/80 to-white/95 dark:from-yellow-900/40 dark:to-gray-900/80 rounded-2xl">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-yellow-700 dark:text-yellow-200">
                  <Award className="w-5 h-5" /> Achievements & Awards
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {achievementsLoading ? (
                    <div className="text-gray-400"><Spinner /></div>
                  ) : achievements.length === 0 ? (
                    <div className="text-gray-400">No achievements available.</div>
                  ) : (
                    achievements.map((record, index) => (
                      <Card key={index} className="border border-yellow-100 dark:border-yellow-700 bg-gradient-to-br from-yellow-100/60 to-white/90 dark:from-yellow-900/40 dark:to-gray-900/80 rounded-2xl shadow-md hover:scale-[1.025] hover:shadow-xl transition-transform duration-200">
                        <CardContent className="p-6">
                          <div className="flex items-center gap-3 mb-1">
                            <Award className="w-5 h-5 text-yellow-500" />
                            <h4 className="font-semibold text-yellow-700 dark:text-yellow-200 text-base cursor-default">{record.data?.title ?? ''}</h4>
                            <span className="text-xs text-gray-500">{record.data?.date ? new Date(record.data.date as string).toLocaleDateString() : ''}</span>
                          </div>
                          <p className="text-xs text-gray-600 dark:text-gray-400 mb-1 cursor-default">{record.data?.description ?? ''}</p>
                          <div className="flex flex-wrap gap-2 mt-2">
                            {record.data?.organization && <span className="text-xs bg-yellow-50 dark:bg-yellow-900/30 px-2 py-1 rounded-full">Org: {record.data.organization as string}</span>}
                            {record.data?.level && <span className="text-xs bg-yellow-50 dark:bg-yellow-900/30 px-2 py-1 rounded-full">Level: {record.data.level as string}</span>}
                            {record.data?.position && <span className="text-xs bg-yellow-50 dark:bg-yellow-900/30 px-2 py-1 rounded-full">Position: {record.data.position as string}</span>}
                            {record.data?.type && <span className="text-xs bg-yellow-50 dark:bg-yellow-900/30 px-2 py-1 rounded-full">Type: {record.data.type as string}</span>}
                            {record.data?.certificate && (
                              <a href={record.data.certificate as string} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline text-xs hover:text-blue-800 transition-colors">View Certificate</a>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="documents" className="tab-content-fade" tabIndex={-1}>
            <Card className="shadow-lg border-0 bg-gradient-to-br from-blue-50/80 to-white/95 dark:from-blue-900/40 dark:to-gray-900/80 rounded-2xl">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-blue-700 dark:text-blue-200">
                  <FileText className="w-5 h-5" /> Documents & Records
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {docLoading ? (
                    <div className="col-span-full"><Spinner /></div>
                  ) : documents.length === 0 ? (
                    <div className="col-span-full text-gray-400">No documents available.</div>
                  ) : (
                    documents.map((doc, index) => (
                      <Card key={index} className="border border-blue-100 dark:border-blue-700 bg-gradient-to-br from-blue-100/60 to-white/90 dark:from-blue-900/40 dark:to-gray-900/80 rounded-2xl shadow-md hover:scale-[1.025] hover:shadow-xl transition-transform duration-200">
                        <CardContent className="p-6">
                          <div className="flex items-center gap-3 mb-2">
                            <FileText className="w-5 h-5 text-blue-500" />
                            <div className="relative group flex items-center">
                              <span
                                className={
                                  `truncate max-w-[180px] font-semibold text-lg text-white cursor-default` +
                                  (doc.name.length > 22 ? '' : '')
                                }
                              >
                                {doc.name}
                              </span>
                              {doc.name.length > 22 && (
                                <span
                                  className="absolute left-0 top-full mt-1 z-20 w-max max-w-xs px-2 py-1 rounded bg-gray-900 text-white text-xs shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none"
                                  style={{ whiteSpace: 'pre-line' }}
                                >
                                  {doc.name}
                                </span>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge variant="outline" className="text-xs rounded-full">
                              {doc.fileType}
                            </Badge>
                            <Badge variant="outline" className="text-xs rounded-full">
                              {doc.type}
                            </Badge>
                          </div>
                          <div className="mt-2">
                            {doc.url && (
                              <a href={doc.url} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline text-xs hover:text-blue-800 transition-colors">View Document</a>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </div>
      </Tabs>

      {/* Add this style block at the bottom (or move to a CSS/SCSS file if preferred) */}
      <style>{`
      .tab-content-fade {
        transition: opacity 0.45s cubic-bezier(.4,0,.2,1), transform 0.45s cubic-bezier(.4,0,.2,1);
        opacity: 1;
        transform: translateY(0);
      }
      [data-state="inactive"].tab-content-fade {
        opacity: 0;
        pointer-events: none;
        position: absolute;
        top: 0; left: 0; width: 100%;
        transform: translateY(24px);
        z-index: 0;
      }
      [data-state="active"].tab-content-fade {
        opacity: 1;
        position: relative;
        z-index: 1;
        transform: translateY(0);
      }
      `}</style>
    </div>
  );
};

// Utility for minimum delay
function minDelay<T>(promise: Promise<T>, delay: number): Promise<T> {
  return Promise.all([
    promise,
    new Promise((resolve) => setTimeout(resolve, delay)),
  ]).then(([result]) => result);
}

// Replace all 'Loading ...' with a spinner
const Spinner = () => (
  <div className="flex justify-center items-center py-8">
    <svg className="animate-spin h-6 w-6 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
    </svg>
  </div>
);

export default ProfileView;
