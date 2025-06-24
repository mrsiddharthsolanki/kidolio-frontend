import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Plus, Edit, Trash2, Book, Calendar, User } from 'lucide-react';

interface AcademicRecord {
  id: string;
  subject: string;
  grade: string;
  year: string;
  teacher: string;
  school: string;
  notes: string;
  examType: string;
}

interface AcademicRecordsProps {
  childId: string;
}

type RawAcademicRecord = Record<string, unknown>;

const AcademicRecords: React.FC<AcademicRecordsProps> = ({ childId }) => {
  const [records, setRecords] = useState<AcademicRecord[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingRecord, setEditingRecord] = useState<AcademicRecord | null>(null);
  const [formData, setFormData] = useState({
    subject: '',
    grade: '',
    year: '',
    teacher: '',
    school: '',
    notes: '',
    examType: ''
  });
  // Add or update record using backend
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Fetch academic records from backend on mount
  React.useEffect(() => {
    (async () => {
      setIsLoading(true);
      setErrorMsg(null);
      try {
        const api = (await import('@/lib/api')).default;
        const res = await api.get(`/record?childId=${childId}&type=academic`);
        // Normalize all records to ensure 'id' is present
        const normalized = (res.data || []).map((rec) => {
          const r = rec as RawAcademicRecord;
          const data = (r["data"] ?? {}) as RawAcademicRecord;
          return {
            ...r,
            id: r["_id"] || r["id"],
            subject: r["subject"] ?? data["subject"] ?? '',
            grade: r["grade"] ?? data["grade"] ?? '',
            year: r["year"] ?? data["year"] ?? '',
            teacher: r["teacher"] ?? data["teacher"] ?? '',
            school: r["school"] ?? data["school"] ?? '',
            notes: r["notes"] ?? data["notes"] ?? '',
            examType: r["examType"] ?? data["examType"] ?? '',
          };
        });
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMsg(null);
    try {
      const api = (await import('@/lib/api')).default;
      if (editingRecord) {
        // Update record (for academic, only send { data: formData })
        const res = await api.put(`/record/${editingRecord.id}`, { data: formData });
        // After update, refetch all records to ensure frontend and backend are in sync
        const refreshed = await api.get(`/record?childId=${childId}&type=academic`);
        const normalized = (refreshed.data || []).map((rec) => {
          const r = rec as RawAcademicRecord;
          const data = (r["data"] ?? {}) as RawAcademicRecord;
          return {
            ...r,
            id: r["_id"] || r["id"],
            subject: r["subject"] ?? data["subject"] ?? '',
            grade: r["grade"] ?? data["grade"] ?? '',
            year: r["year"] ?? data["year"] ?? '',
            teacher: r["teacher"] ?? data["teacher"] ?? '',
            school: r["school"] ?? data["school"] ?? '',
            notes: r["notes"] ?? data["notes"] ?? '',
            examType: r["examType"] ?? data["examType"] ?? '',
          };
        });
        setRecords(normalized);
      } else {
        // Add new record
        const res = await api.post('/record', {
          childId,
          type: 'academic',
          data: formData,
        });
        // Normalize the new record to ensure 'id' and all fields are at the top level
        const newRecord = {
          ...res.data,
          id: res.data._id || res.data.id,
          subject: res.data.subject ?? res.data.data?.subject ?? '',
          grade: res.data.grade ?? res.data.data?.grade ?? '',
          year: res.data.year ?? res.data.data?.year ?? '',
          teacher: res.data.teacher ?? res.data.data?.teacher ?? '',
          school: res.data.school ?? res.data.data?.school ?? '',
          notes: res.data.notes ?? res.data.data?.notes ?? '',
          examType: res.data.examType ?? res.data.data?.examType ?? '',
        };
        setRecords(prev => [...prev, newRecord]);
      }
      setShowForm(false);
      setEditingRecord(null);
      setFormData({ subject: '', grade: '', year: '', teacher: '', school: '', notes: '', examType: '' });
    } catch (error) {
      // Advanced error handling
      let msg = 'Failed to save record.';
      if (error && typeof error === 'object' && 'response' in error && error.response?.data?.message) {
        msg = error.response.data.message;
      }
      setErrorMsg(msg);
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      subject: '',
      grade: '',
      year: '',
      teacher: '',
      school: '',
      notes: '',
      examType: ''
    });
    setShowForm(false);
    setEditingRecord(null);
  };

  const handleEdit = (record: AcademicRecord) => {
    // Always use normalized record with 'id'
    setFormData({
      subject: record.subject,
      grade: record.grade,
      year: record.year,
      teacher: record.teacher,
      school: record.school,
      notes: record.notes,
      examType: record.examType,
    });
    setEditingRecord(record); // record.id is guaranteed
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
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

  const getGradeColor = (grade: string) => {
    const gradeUpper = grade.toUpperCase();
    if (gradeUpper.includes('A')) return 'text-green-600 bg-green-100 dark:bg-green-900/20';
    if (gradeUpper.includes('B')) return 'text-blue-600 bg-blue-100 dark:bg-blue-900/20';
    if (gradeUpper.includes('C')) return 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900/20';
    if (gradeUpper.includes('D')) return 'text-orange-600 bg-orange-100 dark:bg-orange-900/20';
    return 'text-gray-600 bg-gray-100 dark:bg-gray-900/20';
  };

  // In the main render, show loading and error states
  if (isLoading && !showForm) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[40vh] w-full">
        <div className="flex flex-col items-center gap-4">
          <svg className="animate-spin h-10 w-10 text-blue-600 mb-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>
          </svg>
          <div className="text-lg font-bold text-blue-600">Academic Records Loading...</div>
        </div>
      </div>
    );
  }

  if (errorMsg && !showForm) {
    return (
      <Card className="relative overflow-hidden border-0 shadow-2xl bg-white/90 dark:bg-gray-800/90 backdrop-blur-md">
        <div className="absolute inset-0 bg-gradient-to-br from-red-50/60 via-transparent to-rose-50/60 dark:from-red-900/30 dark:to-rose-900/30" />
        <CardContent className="relative flex flex-col items-center justify-center py-16 space-y-4">
          <div className="text-lg font-semibold text-red-600 dark:text-red-400">{errorMsg}</div>
          <Button onClick={() => window.location.reload()} 
                  className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg hover:shadow-xl transition-all duration-300">
            Retry
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (showForm) {
    return (
      <Card className="shadow-lg border-0 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Book className="w-5 h-5" />
            {editingRecord ? 'Edit Academic Record' : 'Add New Academic Record'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="subject">Subject *</Label>
                <Input
                  id="subject"
                  value={formData.subject}
                  onChange={(e) => setFormData({...formData, subject: e.target.value})}
                  placeholder="Subject name"
                  required
                />
              </div>
              <div>
                <Label htmlFor="grade">Grade *</Label>
                <Input
                  id="grade"
                  value={formData.grade}
                  onChange={(e) => setFormData({...formData, grade: e.target.value})}
                  placeholder="A+, B, 85%, etc."
                  required
                />
              </div>
              <div>
                <Label htmlFor="year">Academic Year *</Label>
                <Input
                  id="year"
                  value={formData.year}
                  onChange={(e) => setFormData({...formData, year: e.target.value})}
                  placeholder="2024"
                  required
                />
              </div>
              <div>
                <Label htmlFor="examType">Exam Type</Label>
                <select
                  id="examType"
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
                  value={formData.examType}
                  onChange={(e) => setFormData({...formData, examType: e.target.value})}
                >
                  <option value="">Select Exam Type</option>
                  <option value="Final Exam">Final Exam</option>
                  <option value="Mid-term">Mid-term</option>
                  <option value="Quiz">Quiz</option>
                  <option value="Assignment">Assignment</option>
                  <option value="Project">Project</option>
                  <option value="Practical">Practical</option>
                </select>
              </div>
              <div>
                <Label htmlFor="teacher">Teacher</Label>
                <Input
                  id="teacher"
                  value={formData.teacher}
                  onChange={(e) => setFormData({...formData, teacher: e.target.value})}
                  placeholder="Teacher's name"
                />
              </div>
              <div>
                <Label htmlFor="school">School/Institution</Label>
                <Input
                  id="school"
                  value={formData.school}
                  onChange={(e) => setFormData({...formData, school: e.target.value})}
                  placeholder="School name"
                />
              </div>
              <div className="md:col-span-2">
                <Label htmlFor="notes">Notes</Label>
                <Textarea
                  id="notes"
                  value={formData.notes}
                  onChange={(e) => setFormData({...formData, notes: e.target.value})}
                  placeholder="Additional notes about this record"
                  rows={3}
                />
              </div>
            </div>
            <div className="flex gap-4">
              <Button type="submit" className="flex-1" disabled={isLoading}>
                {isLoading ? (editingRecord ? 'Updating...' : 'Adding...') : (editingRecord ? 'Update Record' : 'Add Record')}
              </Button>
              <Button type="button" variant="outline" onClick={resetForm} className="flex-1" disabled={isLoading}>
                Cancel
              </Button>
            </div>
            {errorMsg && (
              <div className="text-red-600 text-sm mt-2">{errorMsg}</div>
            )}
          </form>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6 p-6 ">
      {/* Header Section */}
      <div className="flex justify-between items-center mb-8">
        <h3 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
          Academic Records
        </h3>
        <Button 
          onClick={() => setShowForm(true)} 
          className="group relative overflow-hidden bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md hover:shadow-xl transition-all duration-300"
        >
          <div className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          <Plus className="w-4 h-4 mr-2" />
          Add Record
        </Button>
      </div>

      {/* Records Grid */}
      <div className="grid gap-6">
        {records.map((record) => (
          <Card 
            key={record.id} 
            className="group relative overflow-hidden border border-gray-200 dark:border-gray-700/50 shadow-lg hover:shadow-xl transition-all duration-500 bg-white dark:bg-gray-800/90"
          >
            <CardContent className="relative p-6">
              <div className="flex flex-col space-y-4">
                {/* Header Section */}
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-4">
                    <div className="relative">
                      <div className="p-3 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 text-white shadow group-hover:shadow-lg group-hover:scale-110 transition-all duration-300">
                        <Book className="w-6 h-6" />
                      </div>
                      <div className="absolute -inset-1 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl blur opacity-20 group-hover:opacity-30 transition-opacity duration-300" />
                    </div>
                    <div>
                      <h4 className="text-xl font-bold text-gray-900 dark:text-gray-100">
                        {record.subject}
                      </h4>
                      <div className="flex items-center gap-3 mt-2">
                        <span className={`px-3 py-1 rounded-full text-sm font-semibold ${getGradeColor(record.grade)} shadow-sm`}>
                          Grade: {record.grade}
                        </span>
                        {record.examType && (
                          <span className="px-3 py-1 rounded-full text-sm font-medium bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 shadow-sm">
                            {record.examType}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-all duration-300">
                    <Button 
                      size="sm" 
                      variant="outline" 
                      onClick={() => handleEdit(record)}
                      className="relative bg-white dark:bg-gray-800 hover:bg-blue-50 dark:hover:bg-blue-900/20 border border-blue-200 dark:border-blue-800 shadow hover:shadow-md transition-all duration-300"
                    >
                      <Edit className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline" 
                      onClick={() => handleDelete(record.id)}
                      className="relative bg-white dark:bg-gray-800 hover:bg-red-50 dark:hover:bg-red-900/20 border border-red-200 dark:border-red-800 shadow hover:shadow-md transition-all duration-300"
                    >
                      <Trash2 className="w-4 h-4 text-red-600 dark:text-red-400" />
                    </Button>
                  </div>
                </div>

                {/* Details Section */}
                {record.notes && (
                  <div className="pl-16 mt-2">
                    <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                      {record.notes}
                    </p>
                  </div>
                )}

                {/* Footer Section */}
                <div className="pl-16 flex flex-wrap items-center gap-3 mt-2">
                  <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800/30 shadow-sm">
                    <Calendar className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      {record.year}
                    </span>
                  </div>
                  
                  {record.teacher && (
                    <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-purple-50 dark:bg-purple-900/20 border border-purple-100 dark:border-purple-800/30 shadow-sm">
                      <User className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        {record.teacher}
                      </span>
                    </div>
                  )}
                  
                  {record.school && (
                    <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-100 dark:border-emerald-800/30 shadow-sm">
                      <span className="text-emerald-600 dark:text-emerald-400 font-bold">@</span>
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        {record.school}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Empty State */}
      {records.length === 0 && (
        <Card className="relative overflow-hidden border border-gray-200 dark:border-gray-700/50 shadow-lg bg-white dark:bg-gray-800">
          <CardContent className="relative flex flex-col items-center justify-center py-16 space-y-4">
            <div className="p-4 rounded-full bg-blue-50 dark:bg-blue-900/20">
              <Book className="w-8 h-8 text-blue-600 dark:text-blue-400" />
            </div>
            <p className="text-lg font-medium text-gray-600 dark:text-gray-400">No academic records yet</p>
            <Button 
              onClick={() => setShowForm(true)}
              className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg hover:shadow-xl transition-all duration-300"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add First Record
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default AcademicRecords;
