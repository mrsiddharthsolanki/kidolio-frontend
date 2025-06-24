import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus, Edit, Trash2, Calendar, Activity, Users, Music, Palette } from 'lucide-react';

interface ExtracurricularRecord {
  id: string;
  activity: string;
  type: 'sports' | 'music' | 'art' | 'dance' | 'drama' | 'clubs' | 'hobby' | 'competition';
  startDate: string;
  endDate?: string;
  description: string;
  instructor: string;
  organization: string;
  level: 'beginner' | 'intermediate' | 'advanced' | 'professional';
  achievements: string;
  status: 'active' | 'completed' | 'paused';
}

interface ExtracurricularProps {
  childId: string;
}

type RawExtracurricularRecord = {
  _id?: string;
  id?: string;
  data?: Partial<ExtracurricularRecord>;
} & Partial<ExtracurricularRecord>;

const Extracurricular: React.FC<ExtracurricularProps> = ({ childId }) => {
  const [records, setRecords] = useState<ExtracurricularRecord[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingRecord, setEditingRecord] = useState<ExtracurricularRecord | null>(null);
  const [formData, setFormData] = useState({
    activity: '',
    type: 'sports' as 'sports' | 'music' | 'art' | 'dance' | 'drama' | 'clubs' | 'hobby' | 'competition',
    startDate: '',
    endDate: '',
    description: '',
    instructor: '',
    organization: '',
    level: 'beginner' as 'beginner' | 'intermediate' | 'advanced' | 'professional',
    achievements: '',
    status: 'active' as 'active' | 'completed' | 'paused'
  });
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Fetch extracurricular records from backend on mount
  React.useEffect(() => {
    (async () => {
      setIsLoading(true);
      setErrorMsg(null);
      try {
        const api = (await import('@/lib/api')).default;
        const res = await api.get(`/record?childId=${childId}&type=extracurricular`);
        // Normalize all records to ensure 'id' is present at the top level
        const normalized = (res.data || []).map((rec: RawExtracurricularRecord) => ({
          ...rec,
          ...(rec.data ?? {}),
          id: rec._id || rec.id,
        }));
        setRecords(normalized);
      } catch (error) {
        let msg = 'Failed to load records.';
        if (error && typeof error === 'object' && 'response' in error && error.response?.data?.message) {
          msg = error.response.data.message;
        }
        setErrorMsg(msg);
      } finally {
        setIsLoading(false);
      }
    })();
  }, [childId]);

  // Add or update record using backend
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMsg(null);
    try {
      const api = (await import('@/lib/api')).default;
      if (editingRecord) {
        // Update record
        const res = await api.put(`/record/${editingRecord.id}`, { data: formData });
        // Flatten and normalize the updated record
        const r = res.data;
        const data = (r["data"] ?? {}) as typeof formData;
        const updatedRecord = {
          ...r,
          ...data,
          id: r._id || r.id,
        };
        setRecords(prev => prev.map(record => record.id === editingRecord.id ? updatedRecord : record));
      } else {
        // Add new record
        const res = await api.post('/record', {
          childId,
          type: 'extracurricular',
          data: formData,
        });
        // Flatten and normalize the new record to ensure all fields are at the top level
        const r = res.data;
        const data = (r["data"] ?? {}) as typeof formData;
        const newRecord = {
          ...r,
          ...data,
          id: r._id || r.id,
        };
        setRecords(prev => [...prev, newRecord]);
      }
      setShowForm(false);
      setEditingRecord(null);
      setFormData({ activity: '', type: 'sports', startDate: '', endDate: '', description: '', instructor: '', organization: '', level: 'beginner', achievements: '', status: 'active' });
    } catch (error) {
      let msg = 'Failed to save record.';
      if (error && typeof error === 'object' && 'response' in error && error.response?.data?.message) {
        msg = error.response.data.message;
      }
      setErrorMsg(msg);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = (record: ExtracurricularRecord) => {
    setEditingRecord(record);
    setFormData({
      activity: record.activity,
      type: record.type,
      startDate: record.startDate,
      endDate: record.endDate || '',
      description: record.description,
      instructor: record.instructor,
      organization: record.organization,
      level: record.level,
      achievements: record.achievements,
      status: record.status
    });
    setShowForm(true);
  };

  const handleDelete = async (id: string | undefined) => {
    if (!id) {
      setErrorMsg('Could not delete: invalid record id.');
      return;
    }
    if (confirm('Are you sure you want to delete this record?')) {
      setIsLoading(true);
      setErrorMsg(null);
      try {
        const api = (await import('@/lib/api')).default;
        await api.delete(`/record/${id}`);
        setRecords(prev => prev.filter(record => record.id !== id));
      } catch (error) {
        let msg = 'Failed to delete record.';
        if (error && typeof error === 'object' && 'response' in error && error.response?.data?.message) {
          msg = error.response.data.message;
        }
        setErrorMsg(msg);
      } finally {
        setIsLoading(false);
      }
    }
  };

  const resetForm = () => {
    setFormData({
      activity: '',
      type: 'sports',
      startDate: '',
      endDate: '',
      description: '',
      instructor: '',
      organization: '',
      level: 'beginner',
      achievements: '',
      status: 'active'
    });
    setEditingRecord(null);
    setShowForm(false);
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'sports': return 'bg-blue-100 text-blue-800';
      case 'music': return 'bg-purple-100 text-purple-800';
      case 'art': return 'bg-pink-100 text-pink-800';
      case 'dance': return 'bg-red-100 text-red-800';
      case 'drama': return 'bg-yellow-100 text-yellow-800';
      case 'clubs': return 'bg-green-100 text-green-800';
      case 'hobby': return 'bg-indigo-100 text-indigo-800';
      case 'competition': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'completed': return 'bg-blue-100 text-blue-800';
      case 'paused': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'sports': return <Activity className="w-4 h-4" />;
      case 'music': return <Music className="w-4 h-4" />;
      case 'art': return <Palette className="w-4 h-4" />;
      case 'clubs': return <Users className="w-4 h-4" />;
      default: return <Activity className="w-4 h-4" />;
    }
  };

  // Defensive filter to ensure only valid extracurricular types are shown
  const filteredRecords = records.filter(r => ['sports', 'music', 'art', 'dance', 'drama', 'clubs', 'hobby', 'competition'].includes(r.type));

  if (isLoading && !showForm) {
    return (
      <Card className="border border-gray-100 dark:border-gray-800 shadow-md bg-white dark:bg-gray-800">
        <CardContent className="flex items-center justify-center py-16">
          <div className="flex items-center gap-3 text-lg font-semibold text-emerald-500 dark:text-emerald-400">
            <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path>
            </svg>
            Loading extracurricular activities...
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
            className="bg-gradient-to-r from-emerald-500 to-green-500 hover:from-emerald-600 hover:to-green-600 text-white"
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
            <Activity className="w-5 h-5 text-emerald-500 dark:text-emerald-400" />
            {editingRecord ? 'Edit Activity' : 'Add New Activity'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Activity Name</label>
              <input
                type="text"
                value={formData.activity}
                onChange={(e) => setFormData({...formData, activity: e.target.value})}
                className="w-full p-2 border rounded-md bg-[#020819] text-white placeholder-gray-400"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Type</label>
              <select
                value={formData.type}
                onChange={(e) => setFormData({...formData, type: e.target.value as 'sports' | 'music' | 'art' | 'dance' | 'drama' | 'clubs' | 'hobby' | 'competition'})}
                className="w-full p-2 border rounded-md bg-[#020819] text-white placeholder-gray-400"
                required
              >
                <option value="sports">Sports</option>
                <option value="music">Music</option>
                <option value="art">Art</option>
                <option value="dance">Dance</option>
                <option value="drama">Drama</option>
                <option value="clubs">Clubs</option>
                <option value="hobby">Hobby</option>
                <option value="competition">Competition</option>
              </select>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Start Date</label>
                <input
                  type="date"
                  value={formData.startDate}
                  onChange={(e) => setFormData({...formData, startDate: e.target.value})}
                  className="w-full p-2 border rounded-md bg-[#020819] text-white placeholder-gray-400"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">End Date (Optional)</label>
                <input
                  type="date"
                  value={formData.endDate}
                  onChange={(e) => setFormData({...formData, endDate: e.target.value})}
                  className="w-full p-2 border rounded-md bg-[#020819] text-white placeholder-gray-400"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Description</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                className="w-full p-2 border rounded-md h-24 bg-[#020819] text-white placeholder-gray-400"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Instructor</label>
              <input
                type="text"
                value={formData.instructor}
                onChange={(e) => setFormData({...formData, instructor: e.target.value})}
                className="w-full p-2 border rounded-md bg-[#020819] text-white placeholder-gray-400"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Organization</label>
              <input
                type="text"
                value={formData.organization}
                onChange={(e) => setFormData({...formData, organization: e.target.value})}
                className="w-full p-2 border rounded-md bg-[#020819] text-white placeholder-gray-400"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Level</label>
              <select
                value={formData.level}
                onChange={(e) => setFormData({...formData, level: e.target.value as 'beginner' | 'intermediate' | 'advanced' | 'professional'})}
                className="w-full p-2 border rounded-md bg-[#020819] text-white placeholder-gray-400"
                required
              >
                <option value="beginner">Beginner</option>
                <option value="intermediate">Intermediate</option>
                <option value="advanced">Advanced</option>
                <option value="professional">Professional</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Achievements</label>
              <input
                type="text"
                value={formData.achievements}
                onChange={(e) => setFormData({...formData, achievements: e.target.value})}
                className="w-full p-2 border rounded-md bg-[#020819] text-white placeholder-gray-400"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Status</label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({...formData, status: e.target.value as 'active' | 'completed' | 'paused'})}
                className="w-full p-2 border rounded-md bg-[#020819] text-white placeholder-gray-400"
                required
              >
                <option value="active">Active</option>
                <option value="completed">Completed</option>
                <option value="paused">Paused</option>
              </select>
            </div>

            <div className="flex gap-2">
              <Button type="submit" className="bg-gradient-to-r from-emerald-500 to-green-500 hover:from-emerald-600 hover:to-green-600 text-white" disabled={isLoading}>
                {isLoading ? (editingRecord ? 'Updating...' : 'Adding...') : (editingRecord ? 'Update' : 'Add') + ' Activity'}
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
        <h3 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-emerald-500 to-green-500 bg-clip-text text-transparent">
          Extracurricular Activities
        </h3>
        <Button 
          onClick={() => setShowForm(true)} 
          className="w-full sm:w-auto group relative overflow-hidden bg-gradient-to-r from-emerald-500 to-green-500 text-white hover:shadow-lg transition-all duration-300"
        >
          <div className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          <Plus className="w-4 h-4 mr-2" />
          Add Activity
        </Button>
      </div>

      {filteredRecords.length === 0 ? (
        <Card className="border border-gray-100 dark:border-gray-800 shadow-md bg-white dark:bg-gray-800">
          <CardContent className="flex flex-col items-center justify-center py-12 sm:py-16 space-y-4">
            <div className="p-4 rounded-full bg-emerald-50 dark:bg-emerald-900/20">
              <Activity className="w-8 h-8 text-emerald-500 dark:text-emerald-400" />
            </div>
            <p className="text-base sm:text-lg font-medium text-gray-600 dark:text-gray-400 text-center">No extracurricular activities recorded yet</p>
            <Button 
              onClick={() => setShowForm(true)}
              className="w-full sm:w-auto bg-gradient-to-r from-emerald-500 to-green-500 hover:from-emerald-600 hover:to-green-600 text-white"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add First Activity
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:gap-6 md:grid-cols-2">
          {filteredRecords.map((record) => (
            <Card 
              key={record.id} 
              className="group relative overflow-hidden border border-gray-100 dark:border-gray-800 shadow-md hover:shadow-xl transition-all duration-500 bg-white dark:bg-gray-800"
            >
              <CardContent className="p-4 sm:p-6">
                <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
                  <div className="flex items-start gap-3 sm:gap-4 flex-1 w-full">
                    <div className="shrink-0">
                      <div className="p-2 sm:p-3 rounded-xl bg-gradient-to-br from-emerald-500 to-green-500 text-white shadow group-hover:shadow-md group-hover:scale-105 transition-all duration-300">
                        {getTypeIcon(record.type)}
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-gray-100 mb-1 sm:mb-2">
                        {record.activity}
                      </h4>
                      <div className="flex flex-wrap items-center gap-2 mb-2 sm:mb-3">
                        <span className={`px-3 py-1 rounded-full text-xs sm:text-sm font-medium shadow-sm ${getTypeColor(record.type)}`}> 
                          {record.type}
                        </span>
                        <span className={`px-3 py-1 rounded-full text-xs sm:text-sm font-medium shadow-sm ${getStatusColor(record.status)}`}> 
                          {record.status}
                        </span>
                      </div>
                      <p className="text-gray-600 dark:text-gray-400 leading-relaxed mb-2 sm:mb-4 text-sm sm:text-base">
                        {record.description}
                      </p>
                      <div className="flex flex-wrap gap-2 sm:gap-4 text-xs sm:text-sm">
                        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-300">
                          <Calendar className="w-4 h-4" />
                          <span>{new Date(record.startDate).toLocaleDateString()}</span>
                          {record.endDate && (
                            <>
                              <span>-</span>
                              <span>{new Date(record.endDate).toLocaleDateString()}</span>
                            </>
                          )}
                        </div>
                        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-300">
                          <Users className="w-4 h-4" />
                          {record.instructor}
                        </div>
                      </div>
                      <div className="mt-3 sm:mt-4 pt-3 sm:pt-4 border-t border-gray-100 dark:border-gray-700">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-4 text-xs sm:text-sm">
                          <div>
                            <span className="text-gray-500 dark:text-gray-400">Organization:</span>
                            <p className="text-gray-900 dark:text-gray-100">{record.organization}</p>
                          </div>
                          <div>
                            <span className="text-gray-500 dark:text-gray-400">Level:</span>
                            <p className="text-gray-900 dark:text-gray-100 capitalize">{record.level}</p>
                          </div>
                          {record.achievements && (
                            <div className="col-span-1 sm:col-span-2">
                              <span className="text-gray-500 dark:text-gray-400">Achievements:</span>
                              <p className="text-gray-900 dark:text-gray-100">{record.achievements}</p>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2 mt-2 sm:mt-0 opacity-100 sm:opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <Button 
                        size="sm" 
                        variant="outline" 
                        onClick={() => handleEdit(record)}
                        className="bg-white dark:bg-gray-800 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800"
                      >
                        <Edit className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline" 
                        onClick={() => handleDelete(record.id)}
                        className="bg-white dark:bg-gray-800 hover:bg-red-50 dark:hover:bg-red-900/20 border-red-200 dark:border-red-800"
                      >
                        <Trash2 className="w-4 h-4 text-red-600 dark:text-red-400" />
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default Extracurricular;
