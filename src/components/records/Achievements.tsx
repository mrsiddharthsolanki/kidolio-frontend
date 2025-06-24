import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Plus, Edit, Trash2, Calendar, Trophy, Award, Medal, Star } from 'lucide-react';

type RawAchievement = {
  _id?: string;
  id?: string;
  title?: string;
  type?: string;
  date?: string;
  description?: string;
  organization?: string;
  level?: string;
  position?: string;
  certificate?: string;
  [key: string]: unknown;
};

interface Achievement {
  id: string;
  title: string;
  type: 'award' | 'certificate' | 'competition' | 'recognition';
  date: string;
  description: string;
  organization: string;
  level: 'school' | 'district' | 'state' | 'national' | 'international';
  position?: string;
  certificate?: File | null;
}

interface AchievementsProps {
  childId: string;
}

const Achievements: React.FC<AchievementsProps> = ({ childId }) => {
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingAchievement, setEditingAchievement] = useState<Achievement | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    type: 'award' as 'award' | 'certificate' | 'competition' | 'recognition',
    date: '',
    description: '',
    organization: '',
    level: 'school' as 'school' | 'district' | 'state' | 'national' | 'international',
    position: '',
    certificate: null as File | null
  });
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [uploadStatus, setUploadStatus] = useState<string | null>(null);

  // Fetch achievements from backend on mount
  React.useEffect(() => {
    (async () => {
      setIsLoading(true);
      setErrorMsg(null);
      try {
        const api = (await import('@/lib/api')).default;
        const res = await api.get(`/record?childId=${childId}&type=achievement`);
        // Normalize all achievements to ensure 'id' is present
        const normalized = (res.data || []).map((rec: RawAchievement) => ({
          ...rec,
          id: rec._id || rec.id,
        }));
        setAchievements(normalized);
      } catch (error) {
        let msg = 'Failed to load achievements.';
        if (error && typeof error === 'object' && 'response' in error && error.response?.data?.message) {
          msg = error.response.data.message;
        }
        setErrorMsg(msg);
      } finally {
        setIsLoading(false);
      }
    })();
  }, [childId]);

  // Add or update achievement using backend
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMsg(null);
    setUploadStatus(null);
    try {
      const api = (await import('@/lib/api')).default;
      let certificateUrl = null;
      const oldCertificateUrl = editingAchievement && typeof editingAchievement.certificate === 'string' ? editingAchievement.certificate : '';
      // If a certificate file is present and is a new File, upload to Cloudinary
      if (formData.certificate && formData.certificate instanceof File) {
        // If editing and there was a previous certificate, delete it from Cloudinary
        if (editingAchievement && oldCertificateUrl) {
          try {
            await api.post('/auth/delete-certificate', { url: oldCertificateUrl });
          } catch (err) {
            // Log but do not block update if Cloudinary delete fails
            console.warn('Cloudinary delete error:', err);
          }
        }
        setUploadStatus('Uploading document...');
        const uploadData = new FormData();
        uploadData.append('certificate', formData.certificate);
        const uploadRes = await api.post('/auth/upload/official-certificate', uploadData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        certificateUrl = uploadRes.data.url;
      }
      setUploadStatus('Saving achievement...');
      // Prepare payload for backend (store certificate as URL)
      const payload = {
        ...formData,
        certificate: certificateUrl !== null ? certificateUrl : oldCertificateUrl,
      };
      if (editingAchievement) {
        // Update achievement
        const res = await api.put(`/record/${editingAchievement.id}`, { data: payload });
        // After update, refetch all achievements to ensure UI is in sync
        const refreshed = await api.get(`/record?childId=${childId}&type=achievement`);
        const normalized = (refreshed.data || []).map((rec: RawAchievement) => ({
          ...rec,
          id: rec._id || rec.id,
        }));
        setAchievements(normalized);
      } else {
        // Add new achievement
        const res = await api.post('/record', {
          childId,
          type: 'achievement',
          data: payload,
        });
        // After adding, refetch all achievements to ensure UI is in sync
        const refreshed = await api.get(`/record?childId=${childId}&type=achievement`);
        // Normalize all achievements to ensure 'id' is present
        const normalized = (refreshed.data || []).map((rec: RawAchievement) => ({
          ...rec,
          id: rec._id || rec.id,
        }));
        setAchievements(normalized);
      }
      setShowForm(false);
      setEditingAchievement(null);
      setFormData({ title: '', type: 'award', date: '', description: '', organization: '', level: 'school', position: '', certificate: null });
      setUploadStatus(null);
    } catch (error) {
      let msg = 'Failed to save achievement.';
      if (error && typeof error === 'object' && 'response' in error && error.response?.data?.message) {
        msg = error.response.data.message;
      }
      setErrorMsg(msg);
      setUploadStatus(null);
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      type: 'award',
      date: '',
      description: '',
      organization: '',
      level: 'school',
      position: '',
      certificate: null
    });
    setEditingAchievement(null);
    setShowForm(false);
  };

  const handleEdit = (achievement: Achievement) => {
    setEditingAchievement(achievement);
    setFormData({
      title: achievement.title,
      type: achievement.type,
      date: achievement.date,
      description: achievement.description,
      organization: achievement.organization,
      level: achievement.level,
      position: achievement.position || '',
      certificate: achievement.certificate || null
    });
    setShowForm(true);
  };

  const handleDelete = async (id: string | undefined) => {
    if (!id) {
      console.warn('Attempted to delete achievement with undefined id');
      setErrorMsg('Could not delete: invalid record id.');
      return;
    }
    if (confirm('Are you sure you want to delete this achievement?')) {
      setIsLoading(true);
      setErrorMsg(null);
      try {
        const api = (await import('@/lib/api')).default;
        await api.delete(`/record/${id}`);
        // After delete, refetch all achievements to ensure UI is in sync
        const refreshed = await api.get(`/record?childId=${childId}&type=achievement`);
        // Normalize all achievements to ensure 'id' is present
        const normalized = (refreshed.data || []).map((rec: RawAchievement) => ({
          ...rec,
          id: rec._id || rec.id,
        }));
        setAchievements(normalized);
      } catch (error) {
        let msg = 'Failed to delete achievement.';
        if (error && typeof error === 'object' && 'response' in error && error.response?.data?.message) {
          msg = error.response.data.message;
        }
        setErrorMsg(msg);
      } finally {
        setIsLoading(false);
      }
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'award': return 'bg-yellow-100 text-yellow-800';
      case 'certificate': return 'bg-blue-100 text-blue-800';
      case 'competition': return 'bg-purple-100 text-purple-800';
      case 'recognition': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'international': return 'bg-red-100 text-red-800';
      case 'national': return 'bg-orange-100 text-orange-800';
      case 'state': return 'bg-yellow-100 text-yellow-800';
      case 'district': return 'bg-blue-100 text-blue-800';
      case 'school': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'award': return <Trophy className="w-4 h-4" />;
      case 'certificate': return <Award className="w-4 h-4" />;
      case 'competition': return <Medal className="w-4 h-4" />;
      case 'recognition': return <Star className="w-4 h-4" />;
      default: return <Trophy className="w-4 h-4" />;
    }
  };

  // Defensive filter to ensure only valid achievement types are shown
  const filteredAchievements = achievements.filter(a => ['award', 'certificate', 'competition', 'recognition'].includes(a.type));

  if (isLoading && !showForm) {
    return (
      <Card className="border border-gray-100 dark:border-gray-800 shadow-md bg-white dark:bg-gray-800">
        <CardContent className="flex items-center justify-center py-16">
          <div className="flex items-center gap-3 text-lg font-semibold text-orange-500 dark:text-orange-400">
            <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path>
            </svg>
            Loading achievements...
          </div>
        </CardContent>
      </Card>
    );
  }

  if (errorMsg && !showForm) {
    return (
      <Card className="border border-gray-100 dark:border-gray-800 shadow-md bg-white dark:bg-gray-800">
        <CardContent className="flex flex-col items-center justify-center py-16 space-y-4">
          <div className="text-lg font-semibold text-red-600 dark:text-red-400">{errorMsg}</div>
          <Button 
            onClick={() => window.location.reload()} 
            className="bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white"
          >
            Retry
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (showForm) {
    return (
      <Card className="border border-gray-100 dark:border-gray-800 shadow-md bg-white dark:bg-gray-800">
        <CardHeader className="border-b border-gray-100 dark:border-gray-800">
          <CardTitle className="flex items-center gap-2 text-xl font-semibold">
            <Trophy className="w-5 h-5 text-orange-500 dark:text-orange-400" />
            {editingAchievement ? 'Edit Achievement' : 'Add New Achievement'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <Label htmlFor="title">Achievement Title *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData({...formData, title: e.target.value})}
                  placeholder="Achievement title"
                  required
                />
              </div>
              <div>
                <Label htmlFor="type">Type *</Label>
                <select
                  id="type"
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
                  value={formData.type}
                  onChange={(e) => setFormData({...formData, type: e.target.value as 'award' | 'certificate' | 'competition' | 'recognition'})}
                  required
                >
                  <option value="award">Award</option>
                  <option value="certificate">Certificate</option>
                  <option value="competition">Competition</option>
                  <option value="recognition">Recognition</option>
                </select>
              </div>
              <div>
                <Label htmlFor="date">Date *</Label>
                <Input
                  id="date"
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData({...formData, date: e.target.value})}
                  required
                />
              </div>
              <div>
                <Label htmlFor="level">Level *</Label>
                <select
                  id="level"
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
                  value={formData.level}
                  onChange={(e) => setFormData({...formData, level: e.target.value as 'school' | 'district' | 'state' | 'national' | 'international'})}
                  required
                >
                  <option value="school">School</option>
                  <option value="district">District</option>
                  <option value="state">State</option>
                  <option value="national">National</option>
                  <option value="international">International</option>
                </select>
              </div>
              <div>
                <Label htmlFor="position">Position/Rank</Label>
                <Input
                  id="position"
                  value={formData.position}
                  onChange={(e) => setFormData({...formData, position: e.target.value})}
                  placeholder="1st Place, Gold Medal, etc."
                />
              </div>
              <div className="md:col-span-2">
                <Label htmlFor="organization">Organization/Institution</Label>
                <Input
                  id="organization"
                  value={formData.organization}
                  onChange={(e) => setFormData({...formData, organization: e.target.value})}
                  placeholder="Organizing body or institution"
                />
              </div>
              <div className="md:col-span-2">
                <Label htmlFor="description">Description *</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  placeholder="Describe the achievement"
                  rows={3}
                  required
                />
              </div>
              <div className="md:col-span-2">
                <Label htmlFor="certificate">Certificate/Document</Label>
                <Input
                  id="certificate"
                  type="file"
                  onChange={(e) => setFormData({...formData, certificate: e.target.files?.[0] || null})}
                  accept=".pdf,.jpg,.jpeg,.png"
                />
              </div>
            </div>
            {uploadStatus && (
              <div className="text-blue-600 text-sm mb-2 flex items-center gap-2">
                <svg className="animate-spin h-4 w-4 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path></svg>
                {uploadStatus}
              </div>
            )}
            <div className="flex gap-2">
              <Button type="submit" className="bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white" disabled={isLoading}>
                {isLoading ? (uploadStatus ? uploadStatus : (editingAchievement ? 'Updating...' : 'Adding...')) : (editingAchievement ? 'Update' : 'Add') + ' Achievement'}
              </Button>
              <Button type="button" variant="outline" onClick={resetForm}>
                Cancel
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6 p-4 sm:p-6">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-6 sm:mb-8 gap-4 sm:gap-0">
        <h3 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-orange-500 to-amber-500 bg-clip-text text-transparent">
          Achievements & Awards
        </h3>
        <Button 
          onClick={() => setShowForm(true)} 
          className="w-full sm:w-auto group relative overflow-hidden bg-gradient-to-r from-orange-500 to-amber-500 text-white hover:shadow-lg transition-all duration-300"
        >
          <div className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          <Plus className="w-4 h-4 mr-2" />
          Add Achievement
        </Button>
      </div>

      {filteredAchievements.length === 0 ? (
        <Card className="border border-gray-100 dark:border-gray-800 shadow-md bg-white dark:bg-gray-800">
          <CardContent className="flex flex-col items-center justify-center py-12 sm:py-16 space-y-4">
            <div className="p-4 rounded-full bg-orange-50 dark:bg-orange-900/20">
              <Trophy className="w-8 h-8 text-orange-500 dark:text-orange-400" />
            </div>
            <p className="text-base sm:text-lg font-medium text-gray-600 dark:text-gray-400 text-center">No achievements recorded yet</p>
            <Button 
              onClick={() => setShowForm(true)}
              className="w-full sm:w-auto bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add First Achievement
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:gap-6">
          {filteredAchievements.map((achievement) => (
            <Card 
              key={achievement.id} 
              className="group relative overflow-hidden border border-gray-100 dark:border-gray-800 shadow-md hover:shadow-xl transition-all duration-500 bg-white dark:bg-gray-800"
            >
              <CardContent className="p-4 sm:p-6">
                <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
                  <div className="flex items-start gap-3 sm:gap-4 flex-1 w-full">
                    <div className="shrink-0">
                      <div className="p-2 sm:p-3 rounded-xl bg-gradient-to-br from-orange-500 to-amber-500 text-white shadow group-hover:shadow-md group-hover:scale-105 transition-all duration-300">
                        {getTypeIcon(achievement.type)}
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-gray-100 mb-1 sm:mb-2">
                        {achievement.title}
                      </h4>
                      <div className="flex flex-wrap items-center gap-2 mb-2 sm:mb-3">
                        <span className={`px-3 py-1 rounded-full text-xs sm:text-sm font-medium shadow-sm ${getTypeColor(achievement.type)}`}> 
                          {achievement.type}
                        </span>
                        <span className={`px-3 py-1 rounded-full text-xs sm:text-sm font-medium shadow-sm ${getLevelColor(achievement.level)}`}> 
                          {achievement.level}
                        </span>
                        {achievement.position && (
                          <span className="px-3 py-1 rounded-full text-xs sm:text-sm font-medium bg-amber-50 text-amber-700 dark:bg-amber-900/20 dark:text-amber-400 shadow-sm">
                            {achievement.position}
                          </span>
                        )}
                      </div>
                      <p className="text-gray-600 dark:text-gray-400 leading-relaxed mb-2 sm:mb-3 text-sm sm:text-base">
                        {achievement.description}
                      </p>
                      <div className="flex flex-wrap items-center gap-2 sm:gap-4 text-xs sm:text-sm">
                        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-orange-50 dark:bg-orange-900/20 text-orange-700 dark:text-orange-300">
                          <Calendar className="w-4 h-4" />
                          {new Date(achievement.date).toLocaleDateString()}
                        </div>
                        {achievement.organization && (
                          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-300">
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                            </svg>
                            {achievement.organization}
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-2 mt-2 sm:mt-0 opacity-100 sm:opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <Button 
                        size="sm" 
                        variant="outline" 
                        onClick={() => handleEdit(achievement)}
                        className="bg-white dark:bg-gray-800 hover:bg-orange-50 dark:hover:bg-orange-900/20 border-orange-200 dark:border-orange-800"
                      >
                        <Edit className="w-4 h-4 text-orange-600 dark:text-orange-400" />
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline" 
                        onClick={() => handleDelete(achievement.id)}
                        className="bg-white dark:bg-gray-800 hover:bg-red-50 dark:hover:bg-red-900/20 border-red-200 dark:border-red-800"
                      >
                        <Trash2 className="w-4 h-4 text-red-600 dark:text-red-400" />
                      </Button>
                    </div>
                  </div>
                </div>
                {achievement.certificate && typeof achievement.certificate === 'string' && achievement.certificate !== '' && (
                  <div className="mt-3 sm:mt-4 pl-0 sm:pl-16">
                    <a 
                      href={achievement.certificate} 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-orange-50 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400 hover:bg-orange-100 dark:hover:bg-orange-900/40 transition-colors duration-200 text-xs sm:text-sm"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                      </svg>
                      View Certificate
                    </a>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default Achievements;
