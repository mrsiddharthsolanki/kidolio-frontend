import React, { useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, Edit, Trash2, Calendar, User, Building2, Pill, AlertTriangle, Heart as HeartIcon, ArrowRight } from 'lucide-react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { ScrollArea } from '@/components/ui/scroll-area';

interface HealthRecord {
  id: string;
  type: 'visit' | 'immunization' | 'allergy';
  date: string;
  title: string;
  description: string;
  doctor?: string;
  hospital?: string;
  medication?: string;
  severity?: string;
}

interface HealthRecordsProps {
  childId: string;
}

const HealthRecords: React.FC<HealthRecordsProps> = ({ childId }) => {
  // Advanced tab routing state
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  // Determine initial tab from URL or default to 'visit'
  const urlTab = searchParams.get('healthTab');
  const [tab, setTab] = useState(
    urlTab === 'immunization' || urlTab === 'allergy' ? urlTab : 'visit'
  );

  // Sync tab state with URL param on mount and when param changes
  React.useEffect(() => {
    if (
      urlTab &&
      urlTab !== tab &&
      (urlTab === 'visit' || urlTab === 'immunization' || urlTab === 'allergy')
    ) {
      setTab(urlTab);
    }
    // If no param, set it to default
    if (!urlTab) {
      searchParams.set('healthTab', 'visit');
      setSearchParams(searchParams, { replace: true });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [urlTab]);

  // When tab changes, update URL param
  const handleTabChange = (value: string) => {
    setTab(value);
    searchParams.set('healthTab', value);
    setSearchParams(searchParams, { replace: true });
  };

  const [visits, setVisits] = useState<HealthRecord[]>([]);
  const [immunizations, setImmunizations] = useState<HealthRecord[]>([]);
  const [allergies, setAllergies] = useState<HealthRecord[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingRecord, setEditingRecord] = useState<HealthRecord | null>(null);
  const [formData, setFormData] = useState({
    type: 'visit' as 'visit' | 'immunization' | 'allergy',
    date: '',
    title: '',
    description: '',
    doctor: '',
    hospital: '',
    medication: '',
    severity: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Fetch health records from backend on mount
  React.useEffect(() => {
    (async () => {
      setIsLoading(true);
      setErrorMsg(null);
      try {
        const api = (await import('@/lib/api')).default;
        const res = await api.get(`/record?childId=${childId}&type=health`);
        // Support both object and array response
        if (res.data && typeof res.data === 'object' && !Array.isArray(res.data)) {
          setVisits(Array.isArray(res.data.visit)
            ? res.data.visit.map(r => {
                // Normalize type from both r.type and r.data?.type
                let t = r.type || (r.data && r.data.type);
                if (t === 'visits') t = 'visit';
                if (t === 'immunizations') t = 'immunization';
                if (t === 'allergies') t = 'allergy';
                // Flatten data if needed
                const flat = r.data ? { ...r, ...r.data } : r;
                return { ...flat, id: r._id || r.id, type: t || 'visit' };
              })
            : []);
          setImmunizations(Array.isArray(res.data.immunization)
            ? res.data.immunization.map(r => {
                let t = r.type || (r.data && r.data.type);
                if (t === 'immunizations') t = 'immunization';
                if (t === 'visits') t = 'visit';
                if (t === 'allergies') t = 'allergy';
                const flat = r.data ? { ...r, ...r.data } : r;
                return { ...flat, id: r._id || r.id, type: t || 'immunization' };
              })
            : []);
          setAllergies(Array.isArray(res.data.allergy)
            ? res.data.allergy.map(r => {
                let t = r.type || (r.data && r.data.type);
                if (t === 'allergies') t = 'allergy';
                if (t === 'visits') t = 'visit';
                if (t === 'immunizations') t = 'immunization';
                const flat = r.data ? { ...r, ...r.data } : r;
                return { ...flat, id: r._id || r.id, type: t || 'allergy' };
              })
            : []);
        } else if (Array.isArray(res.data)) {
          setVisits(res.data.filter(r => {
            let t = r.type || (r.data && r.data.type);
            return t === 'visit' || t === 'visits';
          }).map(r => {
            let t = r.type || (r.data && r.data.type);
            if (t === 'visits') t = 'visit';
            const flat = r.data ? { ...r, ...r.data } : r;
            return { ...flat, id: r._id || r.id, type: t || 'visit' };
          }));
          setImmunizations(res.data.filter(r => {
            let t = r.type || (r.data && r.data.type);
            return t === 'immunization' || t === 'immunizations';
          }).map(r => {
            let t = r.type || (r.data && r.data.type);
            if (t === 'immunizations') t = 'immunization';
            const flat = r.data ? { ...r, ...r.data } : r;
            return { ...flat, id: r._id || r.id, type: t || 'immunization' };
          }));
          setAllergies(res.data.filter(r => {
            let t = r.type || (r.data && r.data.type);
            return t === 'allergy' || t === 'allergies';
          }).map(r => {
            let t = r.type || (r.data && r.data.type);
            if (t === 'allergies') t = 'allergy';
            const flat = r.data ? { ...r, ...r.data } : r;
            return { ...flat, id: r._id || r.id, type: t || 'allergy' };
          }));
        } else {
          setVisits([]);
          setImmunizations([]);
          setAllergies([]);
        }
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
        const res = await api.put(`/record/${editingRecord.id}`, {
          childId,
          type: 'health',
          data: formData,
        });
        // Always refetch all health records after update to handle type changes
        const refreshed = await api.get(`/record?childId=${childId}&type=health`);
        if (refreshed.data && typeof refreshed.data === 'object' && !Array.isArray(refreshed.data)) {
          setVisits(Array.isArray(refreshed.data.visit)
            ? refreshed.data.visit.map(r => {
                // Normalize type from both r.type and r.data?.type
                let t = r.type || (r.data && r.data.type);
                if (t === 'visits') t = 'visit';
                if (t === 'immunizations') t = 'immunization';
                if (t === 'allergies') t = 'allergy';
                // Flatten data if needed
                const flat = r.data ? { ...r, ...r.data } : r;
                return { ...flat, id: r._id || r.id, type: t || 'visit' };
              })
            : []);
          setImmunizations(Array.isArray(refreshed.data.immunization)
            ? refreshed.data.immunization.map(r => {
                let t = r.type || (r.data && r.data.type);
                if (t === 'immunizations') t = 'immunization';
                if (t === 'visits') t = 'visit';
                if (t === 'allergies') t = 'allergy';
                const flat = r.data ? { ...r, ...r.data } : r;
                return { ...flat, id: r._id || r.id, type: t || 'immunization' };
              })
            : []);
          setAllergies(Array.isArray(refreshed.data.allergy)
            ? refreshed.data.allergy.map(r => {
                let t = r.type || (r.data && r.data.type);
                if (t === 'allergies') t = 'allergy';
                if (t === 'visits') t = 'visit';
                if (t === 'immunizations') t = 'immunization';
                const flat = r.data ? { ...r, ...r.data } : r;
                return { ...flat, id: r._id || r.id, type: t || 'allergy' };
              })
            : []);
        } else if (Array.isArray(refreshed.data)) {
          setVisits(refreshed.data.filter(r => {
            let t = r.type || (r.data && r.data.type);
            return t === 'visit' || t === 'visits';
          }).map(r => {
            let t = r.type || (r.data && r.data.type);
            if (t === 'visits') t = 'visit';
            const flat = r.data ? { ...r, ...r.data } : r;
            return { ...flat, id: r._id || r.id, type: t || 'visit' };
          }));
          setImmunizations(refreshed.data.filter(r => {
            let t = r.type || (r.data && r.data.type);
            return t === 'immunization' || t === 'immunizations';
          }).map(r => {
            let t = r.type || (r.data && r.data.type);
            if (t === 'immunizations') t = 'immunization';
            const flat = r.data ? { ...r, ...r.data } : r;
            return { ...flat, id: r._id || r.id, type: t || 'immunization' };
          }));
          setAllergies(refreshed.data.filter(r => {
            let t = r.type || (r.data && r.data.type);
            return t === 'allergy' || t === 'allergies';
          }).map(r => {
            let t = r.type || (r.data && r.data.type);
            if (t === 'allergies') t = 'allergy';
            const flat = r.data ? { ...r, ...r.data } : r;
            return { ...flat, id: r._id || r.id, type: t || 'allergy' };
          }));
        } else {
          setVisits([]);
          setImmunizations([]);
          setAllergies([]);
        }
      } else {
        // Add new record
        const res = await api.post('/record', {
          childId,
          type: 'health',
          data: formData,
        });
        // Flatten the new record: bring all fields from data to top level, and set type to data.type
        const r = res.data;
        const data = r.data || {};
        // Normalize type for visit/visits
        let normType = data.type;
        if (normType === 'visits') normType = 'visit';
        if (normType === 'immunizations') normType = 'immunization';
        if (normType === 'allergies') normType = 'allergy';
        const newRecord = {
          ...r,
          ...data,
          id: r._id || r.id,
          type: normType || formData.type,
        };
        if (newRecord.type === 'visit') setVisits(prev => [...prev, newRecord]);
        if (newRecord.type === 'immunization') setImmunizations(prev => [...prev, newRecord]);
        if (newRecord.type === 'allergy') setAllergies(prev => [...prev, newRecord]);
      }
      setShowForm(false);
      setEditingRecord(null);
      setFormData({ type: 'visit', date: '', title: '', description: '', doctor: '', hospital: '', medication: '', severity: '' });
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

  const handleEdit = (record: HealthRecord) => {
    setEditingRecord(record);
    setFormData({
      type: record.type,
      date: record.date,
      title: record.title,
      description: record.description,
      doctor: record.doctor || '',
      hospital: record.hospital || '',
      medication: record.medication || '',
      severity: record.severity || ''
    });
    setShowForm(true);
  };

  const handleDelete = async (id: string, type: 'visit' | 'immunization' | 'allergy') => {
    if (confirm('Are you sure you want to delete this record?')) {
      setIsLoading(true);
      setErrorMsg(null);
      try {
        const api = (await import('@/lib/api')).default;
        await api.delete(`/record/${id}?type=health&childId=${childId}&subtype=${type}`);
        setVisits(visits.filter(record => record.id !== id));
        setImmunizations(immunizations.filter(record => record.id !== id));
        setAllergies(allergies.filter(record => record.id !== id));
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
      type: 'visit',
      date: '',
      title: '',
      description: '',
      doctor: '',
      hospital: '',
      medication: '',
      severity: ''
    });
    setEditingRecord(null);
    setShowForm(false);
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'visit': return 'bg-blue-100 text-blue-800';
      case 'immunization': return 'bg-green-100 text-green-800';
      case 'allergy': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'visit': return <User className="w-4 h-4" />;
      case 'immunization': return <HeartIcon className="w-4 h-4" />;
      case 'allergy': return <AlertTriangle className="w-4 h-4" />;
      default: return <HeartIcon className="w-4 h-4" />;
    }
  };

  const filterRecordsByType = (type: string) => {
    if (type === 'visit') return visits;
    if (type === 'immunization') return immunizations;
    if (type === 'allergy') return allergies;
    return [];
  };

  if (isLoading && !showForm) {
    return (
      <Card className="shadow-lg border-0 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm text-center py-12">
        <CardContent>
          <div className="text-lg text-blue-600 font-semibold">Loading health records...</div>
        </CardContent>
      </Card>
    );
  }
  if (errorMsg && !showForm) {
    return (
      <Card className="shadow-lg border-0 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm text-center py-12">
        <CardContent>
          <div className="text-lg text-red-600 font-semibold mb-4">{errorMsg}</div>
          <Button onClick={() => window.location.reload()} className="bg-blue-600 hover:bg-blue-700">Retry</Button>
        </CardContent>
      </Card>
    );
  }

  if (showForm) {
    return (
      <Card className="shadow-lg border-0 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
        <CardHeader>
          <CardTitle>{editingRecord ? 'Edit' : 'Add New'} Health Record</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Type</label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({...formData, type: e.target.value as 'visit' | 'immunization' | 'allergy'})}
                  className="w-full p-2 border rounded-md bg-[#020819] text-white placeholder-gray-400"
                  required
                >
                  <option value="visit">Doctor Visit</option>
                  <option value="immunization">Immunization</option>
                  <option value="allergy">Allergy</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">Date</label>
                <input
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData({...formData, date: e.target.value})}
                  className="w-full p-2 border rounded-md bg-[#020819] text-white placeholder-gray-400"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Title</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({...formData, title: e.target.value})}
                  className="w-full p-2 border rounded-md bg-[#020819] text-white placeholder-gray-400"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Doctor</label>
                <input
                  type="text"
                  value={formData.doctor}
                  onChange={(e) => setFormData({...formData, doctor: e.target.value})}
                  className="w-full p-2 border rounded-md bg-[#020819] text-white placeholder-gray-400"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Hospital</label>
                <input
                  type="text"
                  value={formData.hospital}
                  onChange={(e) => setFormData({...formData, hospital: e.target.value})}
                  className="w-full p-2 border rounded-md bg-[#020819] text-white placeholder-gray-400"
                />
              </div>

              {formData.type !== 'visit' && (
                <div>
                  <label className="block text-sm font-medium mb-2">
                    {formData.type === 'allergy' ? 'Severity' : 'Medication'}
                  </label>
                  <input
                    type="text"
                    value={formData.type === 'allergy' ? formData.severity : formData.medication}
                    onChange={(e) => setFormData({
                      ...formData, 
                      [formData.type === 'allergy' ? 'severity' : 'medication']: e.target.value
                    })}
                    className="w-full p-2 border rounded-md bg-[#020819] text-white placeholder-gray-400"
                  />
                </div>
              )}
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

            <div className="flex gap-2">
              <Button type="submit" className="bg-green-600 hover:bg-green-700">
                {editingRecord ? 'Update' : 'Add'} Record
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
    <div className="space-y-6">
      {/* Add Record Button */}
      <div className="flex justify-end">
        <Button
          onClick={() => {
            setShowForm(true);
            setEditingRecord(null);
            setFormData({ type: tab as 'visit' | 'immunization' | 'allergy', date: '', title: '', description: '', doctor: '', hospital: '', medication: '', severity: '' });
          }}
          className="group relative overflow-hidden bg-gradient-to-r from-rose-500 to-red-600 text-white hover:shadow-lg transition-all duration-300"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          <Plus className="w-4 h-4 mr-2" />
          Add Health Record
        </Button>
      </div>

      {/* Main Content */}
      <Card className='bg-black/0 border-0'>
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-gray-900 dark:text-gray-100">Health Records</CardTitle>
          <CardDescription className="text-gray-500 dark:text-gray-400">
            Manage medical visits, immunizations, and allergies
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={tab} onValueChange={handleTabChange} className="w-full">
            <TabsList className="grid w-full grid-cols-3 gap-4 p-1 bg-muted/20 rounded-lg mb-6">
              <TabsTrigger
                value="visit"
                className="group relative overflow-hidden rounded-md data-[state=active]:bg-gradient-to-r data-[state=active]:from-rose-500 data-[state=active]:to-red-600 data-[state=active]:text-white transition-all duration-300"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-rose-500/10 to-red-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <div className="relative flex items-center gap-2 px-4 py-2">
                  <Building2 className="w-4 h-4" />
                  <span className="font-medium">Medical Visits</span>
                  <Badge variant="secondary" className="ml-auto bg-white/20">{visits.length}</Badge>
                </div>
              </TabsTrigger>
             
              <TabsTrigger
                value="immunization"
                className="group relative overflow-hidden rounded-md data-[state=active]:bg-gradient-to-r data-[state=active]:from-rose-500 data-[state=active]:to-red-600 data-[state=active]:text-white transition-all duration-300"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-rose-500/10 to-red-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <div className="relative flex items-center gap-2 px-4 py-2">
                  <Pill className="w-4 h-4" />
                  <span className="font-medium">Immunizations</span>
                  <Badge variant="secondary" className="ml-auto bg-white/20">{immunizations.length}</Badge>
                </div>
              </TabsTrigger>
              
              <TabsTrigger
                value="allergy"
                className="group relative overflow-hidden rounded-md data-[state=active]:bg-gradient-to-r data-[state=active]:from-rose-500 data-[state=active]:to-red-600 data-[state=active]:text-white transition-all duration-300"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-rose-500/10 to-red-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <div className="relative flex items-center gap-2 px-4 py-2">
                  <AlertTriangle className="w-4 h-4" />
                  <span className="font-medium">Allergies</span>
                  <Badge variant="secondary" className="ml-auto bg-white/20">{allergies.length}</Badge>
                </div>
              </TabsTrigger>
            </TabsList>
            <div className="relative">
              <ScrollArea className="h-[60vh] px-4 relative">
                <TabsContent value="visit" className="mt-0 space-y-4">
                  {visits.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-12 text-gray-500 dark:text-gray-400">
                      <Building2 className="w-12 h-12 mb-4 opacity-50" />
                      <p className="text-lg font-medium">No medical visits recorded</p>
                      <p className="text-sm">Click the Add Health Record button to add one</p>
                    </div>
                  ) : (
                    <Accordion type="single" collapsible className="space-y-4">
                      {visits.map(record => (
                        <AccordionItem
                          key={record.id}
                          value={record.id}
                          className="group relative overflow-hidden border border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800 hover:shadow-md transition-all duration-300"
                        >
                          <AccordionTrigger className="px-6 py-4 hover:no-underline">
                            <div className="flex items-center justify-between w-full">
                              <div className="flex items-center gap-4">
                                <div className="p-2 rounded-full bg-rose-100 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400">
                                  <Building2 className="w-5 h-5" />
                                </div>
                                <div className="text-left">
                                  <h3 className="font-semibold text-gray-900 dark:text-gray-100">{record.title}</h3>
                                  <p className="text-sm text-gray-500 dark:text-gray-400">
                                    <Calendar className="w-4 h-4 inline mr-1" />
                                    {new Date(record.date).toLocaleDateString()}
                                  </p>
                                </div>
                              </div>
                              <ArrowRight className="w-4 h-4 text-gray-400 transform transition-transform group-data-[state=open]:rotate-90" />
                            </div>
                          </AccordionTrigger>
                          <AccordionContent className="px-6 pb-4">
                            <div className="space-y-4">
                              <div className="grid grid-cols-2 gap-4">
                                {record.doctor && (
                                  <div className="flex items-center gap-2 text-gray-600 dark:text-gray-300">
                                    <User className="w-4 h-4" />
                                    <span>{record.doctor}</span>
                                  </div>
                                )}
                                {record.hospital && (
                                  <div className="flex items-center gap-2 text-gray-600 dark:text-gray-300">
                                    <Building2 className="w-4 h-4" />
                                    <span>{record.hospital}</span>
                                  </div>
                                )}
                              </div>
                              <p className="text-gray-600 dark:text-gray-300">{record.description}</p>
                              <div className="flex items-center justify-end gap-2 pt-2">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleEdit(record)}
                                  className="hover:bg-gray-100 dark:hover:bg-gray-700"
                                >
                                  <Edit className="w-4 h-4 mr-1" />
                                  Edit
                                </Button>
                                <Button
                                  variant="destructive"
                                  size="sm"
                                  onClick={() => handleDelete(record.id, record.type)}
                                  className="hover:bg-red-600"
                                >
                                  <Trash2 className="w-4 h-4 mr-1" />
                                  Delete
                                </Button>
                              </div>
                            </div>
                          </AccordionContent>
                        </AccordionItem>
                      ))}
                    </Accordion>
                  )}
                </TabsContent>

                <TabsContent value="immunization" className="mt-0 space-y-4">
                  {filterRecordsByType('immunization').length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-12 text-gray-500 dark:text-gray-400">
                      <HeartIcon className="w-12 h-12 mb-4 opacity-50" />
                      <p className="text-lg font-medium">No immunizations recorded</p>
                      <p className="text-sm">Click the Add Health Record button to add one</p>
                    </div>
                  ) : (
                    <Accordion type="single" collapsible className="space-y-4">
                      {filterRecordsByType('immunization').map(record => (
                        <AccordionItem
                          key={record.id}
                          value={record.id}
                          className="group relative overflow-hidden border border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800 hover:shadow-md transition-all duration-300"
                        >
                          <AccordionTrigger className="px-6 py-4 hover:no-underline">
                            <div className="flex items-center justify-between w-full">
                              <div className="flex items-center gap-4">
                                <div className="p-2 rounded-full bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400">
                                  <Pill className="w-5 h-5" />
                                </div>
                                <div className="text-left">
                                  <h3 className="font-semibold text-gray-900 dark:text-gray-100">{record.title}</h3>
                                  <p className="text-sm text-gray-500 dark:text-gray-400">
                                    <Calendar className="w-4 h-4 inline mr-1" />
                                    {new Date(record.date).toLocaleDateString()}
                                  </p>
                                </div>
                              </div>
                              <ArrowRight className="w-4 h-4 text-gray-400 transform transition-transform group-data-[state=open]:rotate-90" />
                            </div>
                          </AccordionTrigger>
                          <AccordionContent className="px-6 pb-4">
                            <div className="space-y-4">
                              <div className="grid grid-cols-2 gap-4">
                                {record.doctor && (
                                  <div className="flex items-center gap-2 text-gray-600 dark:text-gray-300">
                                    <User className="w-4 h-4" />
                                    <span>{record.doctor}</span>
                                  </div>
                                )}
                                {record.hospital && (
                                  <div className="flex items-center gap-2 text-gray-600 dark:text-gray-300">
                                    <Building2 className="w-4 h-4" />
                                    <span>{record.hospital}</span>
                                  </div>
                                )}
                                {record.medication && (
                                  <div className="flex items-center gap-2 text-gray-600 dark:text-gray-300">
                                    <Pill className="w-4 h-4" />
                                    <span>{record.medication}</span>
                                  </div>
                                )}
                              </div>
                              <p className="text-gray-600 dark:text-gray-300">{record.description}</p>
                              <div className="flex items-center justify-end gap-2 pt-2">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleEdit(record)}
                                  className="hover:bg-gray-100 dark:hover:bg-gray-700"
                                >
                                  <Edit className="w-4 h-4 mr-1" />
                                  Edit
                                </Button>
                                <Button
                                  variant="destructive"
                                  size="sm"
                                  onClick={() => handleDelete(record.id, record.type)}
                                  className="hover:bg-red-600"
                                >
                                  <Trash2 className="w-4 h-4 mr-1" />
                                  Delete
                                </Button>
                              </div>
                            </div>
                          </AccordionContent>
                        </AccordionItem>
                      ))}
                    </Accordion>
                  )}
                </TabsContent>

                <TabsContent value="allergy" className="mt-0 space-y-4">
                  {filterRecordsByType('allergy').length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-12 text-gray-500 dark:text-gray-400">
                      <AlertTriangle className="w-12 h-12 mb-4 opacity-50" />
                      <p className="text-lg font-medium">No allergies recorded</p>
                      <p className="text-sm">Click the Add Health Record button to add one</p>
                    </div>
                  ) : (
                    <Accordion type="single" collapsible className="space-y-4">
                      {filterRecordsByType('allergy').map(record => (
                        <AccordionItem
                          key={record.id}
                          value={record.id}
                          className="group relative overflow-hidden border border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800 hover:shadow-md transition-all duration-300"
                        >
                          <AccordionTrigger className="px-6 py-4 hover:no-underline">
                            <div className="flex items-center justify-between w-full">
                              <div className="flex items-center gap-4">
                                <div className="p-2 rounded-full bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400">
                                  <AlertTriangle className="w-5 h-5" />
                                </div>
                                <div className="text-left">
                                  <h3 className="font-semibold text-gray-900 dark:text-gray-100">{record.title}</h3>
                                  <p className="text-sm text-gray-500 dark:text-gray-400">
                                    <Calendar className="w-4 h-4 inline mr-1" />
                                    {new Date(record.date).toLocaleDateString()}
                                  </p>
                                </div>
                              </div>
                              <ArrowRight className="w-4 h-4 text-gray-400 transform transition-transform group-data-[state=open]:rotate-90" />
                            </div>
                          </AccordionTrigger>
                          <AccordionContent className="px-6 pb-4">
                            <div className="space-y-4">
                              <div className="grid grid-cols-2 gap-4">
                                {record.doctor && (
                                  <div className="flex items-center gap-2 text-gray-600 dark:text-gray-300">
                                    <User className="w-4 h-4" />
                                    <span>{record.doctor}</span>
                                  </div>
                                )}
                                {record.hospital && (
                                  <div className="flex items-center gap-2 text-gray-600 dark:text-gray-300">
                                    <Building2 className="w-4 h-4" />
                                    <span>{record.hospital}</span>
                                  </div>
                                )}
                                {record.severity && (
                                  <div className="flex items-center gap-2 text-gray-600 dark:text-gray-300">
                                    <AlertTriangle className="w-4 h-4" />
                                    <span>Severity: {record.severity}</span>
                                  </div>
                                )}
                              </div>
                              <p className="text-gray-600 dark:text-gray-300">{record.description}</p>
                              <div className="flex items-center justify-end gap-2 pt-2">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleEdit(record)}
                                  className="hover:bg-gray-100 dark:hover:bg-gray-700"
                                >
                                  <Edit className="w-4 h-4 mr-1" />
                                  Edit
                                </Button>
                                <Button
                                  variant="destructive"
                                  size="sm"
                                  onClick={() => handleDelete(record.id, record.type)}
                                  className="hover:bg-red-600"
                                >
                                  <Trash2 className="w-4 h-4 mr-1" />
                                  Delete
                                </Button>
                              </div>
                            </div>
                          </AccordionContent>
                        </AccordionItem>
                      ))}
                    </Accordion>
                  )}
                </TabsContent>
              </ScrollArea>
            </div>
          </Tabs>
        </CardContent>
      </Card>

      {/* Form Modal */}
      {showForm && (
        <Card className="fixed inset-0 z-50 m-auto max-w-3xl p-4 shadow-lg border-0 bg-white/90 dark:bg-gray-800/90 backdrop-blur-md">
          <CardHeader>
            <CardTitle className="text-xl font-semibold">{editingRecord ? 'Edit' : 'Add New'} Health Record</CardTitle>
            <CardDescription className="text-gray-500 dark:text-gray-400">
              {editingRecord ? 'Update the details of the health record.' : 'Fill in the details of the new health record.'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Type</label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({...formData, type: e.target.value as 'visit' | 'immunization' | 'allergy'})}
                    className="w-full p-3 border rounded-md bg-[#020819] text-white placeholder-gray-400 focus:ring-2 focus:ring-rose-500 focus:outline-none"
                    required
                  >
                    <option value="visit">Doctor Visit</option>
                    <option value="immunization">Immunization</option>
                    <option value="allergy">Allergy</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2">Date</label>
                  <input
                    type="date"
                    value={formData.date}
                    onChange={(e) => setFormData({...formData, date: e.target.value})}
                    className="w-full p-3 border rounded-md bg-[#020819] text-white placeholder-gray-400 focus:ring-2 focus:ring-rose-500 focus:outline-none"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Title</label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({...formData, title: e.target.value})}
                    className="w-full p-3 border rounded-md bg-[#020819] text-white placeholder-gray-400 focus:ring-2 focus:ring-rose-500 focus:outline-none"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Doctor</label>
                  <input
                    type="text"
                    value={formData.doctor}
                    onChange={(e) => setFormData({...formData, doctor: e.target.value})}
                    className="w-full p-3 border rounded-md bg-[#020819] text-white placeholder-gray-400 focus:ring-2 focus:ring-rose-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Hospital</label>
                  <input
                    type="text"
                    value={formData.hospital}
                    onChange={(e) => setFormData({...formData, hospital: e.target.value})}
                    className="w-full p-3 border rounded-md bg-[#020819] text-white placeholder-gray-400 focus:ring-2 focus:ring-rose-500 focus:outline-none"
                  />
                </div>

                {formData.type !== 'visit' && (
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      {formData.type === 'allergy' ? 'Severity' : 'Medication'}
                    </label>
                    <input
                      type="text"
                      value={formData.type === 'allergy' ? formData.severity : formData.medication}
                      onChange={(e) => setFormData({
                        ...formData, 
                        [formData.type === 'allergy' ? 'severity' : 'medication']: e.target.value
                      })}
                      className="w-full p-3 border rounded-md bg-[#020819] text-white placeholder-gray-400 focus:ring-2 focus:ring-rose-500 focus:outline-none"
                    />
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  className="w-full p-3 border rounded-md h-24 bg-[#020819] text-white placeholder-gray-400 focus:ring-2 focus:ring-rose-500 focus:outline-none"
                  required
                />
              </div>

              <div className="flex gap-2">
                <Button type="submit" className="bg-green-600 hover:bg-green-700">
                  {editingRecord ? 'Update' : 'Add'} Record
                </Button>
                <Button type="button" variant="outline" onClick={resetForm}>
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Error Message */}
      {errorMsg && (
        <div className="p-4 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-lg text-red-600 dark:text-red-400">
          {errorMsg}
        </div>
      )}
    </div>
  );
};

export default HealthRecords;