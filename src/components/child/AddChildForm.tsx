import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Upload,Clock ,MapPin, Heart, FileText, Baby, ArrowLeft, Save, Plus, Info } from 'lucide-react';
import { Calendar } from "@/components/ui/calendar";
import TimePicker from '@/components/ui/timePicker'
import { Tooltip, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip';
import { useToast } from '@/hooks/use-toast';

// Interface for the form data (includes File objects)
export interface ChildFormData {
  name: string;
  dob: string;
  gender: string;
  country: string;
  district: string;
  city: string;
  disability: string;
  birthCertificate: File | null;
  aadhaarNumber: string;
  bloodGroup: string;
  birthHospital: string;
  firstTreatmentDoctor: string;
  majorMark: string;
  photo: File | null;
  birthdayTime: string;
}

// Interface for the final child data (matches backend response)
export interface Child {
  id: string;
  name: string;
  dob: string;
  gender: string;
  photo?: string;
  hasLogin: boolean;
  userId?: string;
  password?: string;
  bloodGroup: string;
  disability: string;
  isActive?: boolean;
  country: string;
  district: string;
  city: string;
  aadhaarNumber: string;
  birthHospital: string;
  firstTreatmentDoctor: string;
  majorMark: string;
  birthdayTime: string;
  birthCertificate?: string;
}

interface AddChildFormProps {
  onSubmit: (data: Child) => void;
  onCancel: () => void;
}

const AddChildForm: React.FC<AddChildFormProps> = ({ onSubmit, onCancel }) => {
  const [ showCalendar,  setShowCalendar] = useState(false);
  const [ showTimePicker,  setShowTimePicker] = useState(false);
  const [formData, setFormData] = useState<ChildFormData>({
    name: '',
    dob: '',
    gender: '',
    country: '',
    district: '',
    city: '',
    disability: '',
    birthCertificate: null,
    aadhaarNumber: '',
    bloodGroup: '',
    birthHospital: '',
    firstTreatmentDoctor: '',
    majorMark: '',
    photo: null,
    birthdayTime: ''
  });
  const [draftId, setDraftId] = useState<string | null>(null);
  const [draftCount, setDraftCount] = useState(0);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  // Interface for draft child from API response
  interface APIChild {
    _id: string;
    name?: string;
    dob?: string;
    gender?: string;
    photo?: string;
    status?: string;
    country?: string;
    district?: string;
    city?: string;
    disability?: string;
    aadhaarNumber?: string;
    bloodGroup?: string;
    birthHospital?: string;
    firstTreatmentDoctor?: string;
    majorMark?: string;
    birthdayTime?: string;
    birthCertificate?: string;
    hasLogin?: boolean;
    userId?: string;
    password?: string;
    isActive?: boolean;
  }

  interface DraftChild extends Partial<ChildFormData> {
    _id: string;
    status?: string;
    dob?: string;
  }

  useEffect(() => {
    // Fetch draft child for this parent (if any)
    (async () => {
      try {
        const api = (await import('@/lib/api')).default;
        const res = await api.get('/child');
        const drafts = Array.isArray(res.data) ? (res.data as DraftChild[]).filter((c) => c.status === 'draft') : [];
        setDraftCount(drafts.length);
        
        if (drafts.length > 0) {
          // Use the most recent draft
          const draft = drafts[drafts.length - 1];
          setDraftId(draft._id);
          setFormData((prev) => ({
            ...prev,
            name: draft.name || '',
            dob: draft.dob ? draft.dob.slice(0, 10) : '',
            gender: draft.gender || '',
            country: draft.country || '',
            district: draft.district || '',
            city: draft.city || '',
            disability: draft.disability || '',
            aadhaarNumber: draft.aadhaarNumber || '',
            bloodGroup: draft.bloodGroup || '',
            birthHospital: draft.birthHospital || '',
            firstTreatmentDoctor: draft.firstTreatmentDoctor || '',
            majorMark: draft.majorMark || '',
            birthdayTime: draft.birthdayTime || '',
            // File fields (photo, birthCertificate) cannot be pre-filled for security reasons
            birthCertificate: null,
            photo: null,
          }));
        }
      } catch (e) {
        console.error('Failed to fetch drafts:', e);
        // Reset draft state on error
        setDraftId(null);
        setDraftCount(0);
      }
    })();
  }, []);

  const clearDraft = async () => {
    try {
      if (draftId) {
        const api = (await import('@/lib/api')).default;
        await api.delete(`/child/${draftId}`);
        toast({ 
          title: 'Draft Cleared', 
          description: 'Your draft has been removed.' 
        });
      }
    } catch (e) {
      console.error('Failed to delete draft:', e);
    }
    
    // Reset all state
    setFormData({
      name: '',
      dob: '',
      gender: '',
      country: '',
      district: '',
      city: '',
      disability: '',
      birthCertificate: null,
      aadhaarNumber: '',
      bloodGroup: '',
      birthHospital: '',
      firstTreatmentDoctor: '',
      majorMark: '',
      photo: null,
      birthdayTime: ''
    });
    setDraftId(null);
    setDraftCount(prev => Math.max(0, prev - 1));
    setErrorMsg(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMsg(null);
    const formPayload = new FormData();

    // Add all form fields to payload
    Object.entries(formData).forEach(([key, value]) => {
      if (value !== null && !(value instanceof File)) {
        formPayload.append(key, value);
      }
    });
    if (formData.birthCertificate) formPayload.append('birthCertificate', formData.birthCertificate);
    if (formData.photo) formPayload.append('photo', formData.photo);
    formPayload.append('status', 'submitted');

    try {
      const api = (await import('@/lib/api')).default;
      let res;
      
      if (draftId) {
        // Update existing draft to submitted status
        res = await api.put(`/child/${draftId}`, formPayload, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        setDraftCount(prev => Math.max(0, prev - 1));
        // Clear all other drafts for this child
        try {
          const allDrafts = await api.get<{ data: APIChild[] }>('/child');
          const drafts = Array.isArray(allDrafts.data) ? 
            allDrafts.data.filter(c => c.status === 'draft' && c._id !== draftId) : [];
          for (const draft of drafts) {
            await api.delete(`/child/${draft._id}`);
          }
        } catch (e) {
          console.error('Error cleaning up drafts:', e);
        }
        toast({
          title: 'Success',
          description: 'Child profile has been successfully submitted.',
          duration: 3000,
        });
      } else {
        // Create new child
        res = await api.post('/child', formPayload, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        toast({
          title: 'Success',
          description: 'New child profile has been created.',
          duration: 3000,
        });
      }
      
      // Format the response data to match Child interface
      const childData: Child = {
        id: res.data._id || res.data.id,
        name: res.data.name,
        dob: res.data.dob,
        gender: res.data.gender,
        country: res.data.country,
        district: res.data.district,
        city: res.data.city,
        disability: res.data.disability,
        aadhaarNumber: res.data.aadhaarNumber,
        bloodGroup: res.data.bloodGroup,
        birthHospital: res.data.birthHospital,
        firstTreatmentDoctor: res.data.firstTreatmentDoctor,
        majorMark: res.data.majorMark,
        birthdayTime: res.data.birthdayTime,
        photo: res.data.photo,
        birthCertificate: res.data.birthCertificate,
        hasLogin: Boolean(res.data.hasLogin),
        userId: res.data.userId,
        password: res.data.password,
        isActive: res.data.isActive !== false,
      };

      // Clear form and draft state
      setFormData({
        name: '',
        dob: '',
        gender: '',
        country: '',
        district: '',
        city: '',
        disability: '',
        birthCertificate: null,
        aadhaarNumber: '',
        bloodGroup: '',
        birthHospital: '',
        firstTreatmentDoctor: '',
        majorMark: '',
        photo: null,
        birthdayTime: ''
      });
      setDraftId(null);
      setDraftCount(0);
      
      onSubmit(childData);
    } catch (error) {
      let msg = 'Failed to submit child profile.';
      if (error && typeof error === 'object' && 'response' in error && error.response?.data?.message) {
        msg = error.response.data.message;
      }
      setErrorMsg(msg);
    } finally {
      setIsLoading(false);
    }
  };

  // Add a helper for draft save
  const handleSaveDraft = async () => {
    setIsLoading(true);
    setErrorMsg(null);
    const formPayload = new FormData();

    // Add all form fields to payload
    Object.entries(formData).forEach(([key, value]) => {
      if (value !== null && !(value instanceof File)) {
        formPayload.append(key, value);
      }
    });
    if (formData.birthCertificate) formPayload.append('birthCertificate', formData.birthCertificate);
    if (formData.photo) formPayload.append('photo', formData.photo);
    formPayload.append('status', 'draft');

    try {
      const api = (await import('@/lib/api')).default;
      
      if (draftId) {
        // Update existing draft
        await api.put(`/child/${draftId}`, formPayload, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        toast({ 
          title: 'Draft Updated', 
          description: 'Your changes have been saved. You can continue later.' 
        });
      } else {
        // Create new draft
        const res = await api.post('/child', formPayload, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        setDraftId(res.data._id);
        setDraftCount(prev => prev + 1);
        toast({ 
          title: 'Draft Created', 
          description: 'Child draft saved. You can continue later.' 
        });
      }
      onCancel();
    } catch (error) {
      let msg = 'Failed to save draft.';
      if (error && typeof error === 'object' && 'response' in error && error.response?.data?.message) {
        msg = error.response.data.message;
      }
      setErrorMsg(msg);
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleFileChange = (field: string, file: File | null) => {
    setFormData(prev => ({ ...prev, [field]: file }));
  };
  // State for showing the calendar popup

  // for brithdate time

  const formatTimeForDisplay = (time24: string) => {
    if (!time24) return '';
    const [hours, minutes, seconds = '00'] = time24.split(':');
    const hour24 = parseInt(hours);
    const hour12 = hour24 === 0 ? 12 : hour24 > 12 ? hour24 - 12 : hour24;
    const period = hour24 >= 12 ? 'PM' : 'AM';
    return `${hour12}:${minutes}:${seconds} ${period}`;
  };

  return (
    <Card className="shadow-lg border-0 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Baby className="w-6 h-6 text-blue-500" />
          Add New Child
          <Tooltip>
            <TooltipTrigger>
              <Info className="w-4 h-4 text-gray-400" />
            </TooltipTrigger>
            <TooltipContent>
              <p>Fill in your child's details to create their profile and manage their records</p>
            </TooltipContent>
          </Tooltip>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="name">Full Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                required
                placeholder="Enter child's full name"
              />
            </div>
            <div>
              <Label htmlFor="dob">Date of Birth *</Label>
                <div className="relative">
                  <Input
                  id="dob"
                  type="text"
                  value={formData.dob}
                  onClick={() => setShowCalendar(true)}
                  required
                  className="pr-10 cursor-pointer"
                  placeholder="YYYY-MM-DD"
                  readOnly
                  />
                  <div 
                  className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer"
                  onClick={() => setShowCalendar(true)}
                  >
                  <Save className="w-5 h-5 text-gray-400" />
                  </div>
                  {showCalendar && (
                  <div className="absolute z-50 mt-2 right-0">
                    <div
                    className="fixed inset-0 bg-black/20"
                    onClick={() => setShowCalendar(false)}
                    aria-hidden="true"
                    />
                    <Calendar
                    mode="single"
                    selected={formData.dob ? new Date(formData.dob) : undefined}
                    onSelect={(date) => {
                      if (date) {
                      handleInputChange('dob', date.toISOString().split('T')[0]);
                      setShowCalendar(false);
                      }
                    }}
                    className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-4"
                    />
                  </div>
                  )}
                </div>
            </div>
            <div>
              <Label htmlFor="gender">Gender *</Label>
              <select
                id="gender"
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                value={formData.gender}
                onChange={(e) => handleInputChange('gender', e.target.value)}
                required
              >
                <option value="">Select Gender</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>
            <div>
              <Label htmlFor="birthdayTime">Birth Time</Label>
              <div className="relative">
                <Input
                  id="birthdayTime"
                  type="text"
                  value={formatTimeForDisplay(formData.birthdayTime)}
                  onClick={() => setShowTimePicker(true)}
                  className="pr-10 cursor-pointer"
                  placeholder="Select time"
                  readOnly
                />
                <div 
                  className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer"
                  onClick={() => setShowTimePicker(true)}
                >
                  <Clock className="w-5 h-5 text-gray-400" />
                </div>
                {showTimePicker && (
                  <div className="absolute z-50 mt-2 right-0">
                    <div
                      className="fixed inset-0 bg-black/20"
                      onClick={(e) => {
                          if (e.target === e.currentTarget) {
                            setShowTimePicker(false);
                          }
                        }}
                        style={{ pointerEvents: 'auto' }}
                      aria-hidden="true"
                    />
                    <TimePicker
                      value={formData.birthdayTime}
                      onChange={(time) => handleInputChange('birthdayTime', time)}
                      onClose={() => setShowTimePicker(false)}
                    />
                  </div>
                )}
              </div>
              </div>
            </div>
    
          {/* Location Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium flex items-center gap-2">
              <MapPin className="w-4 h-4" />
              Location Details
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="country">Country *</Label>
                <Input
                  id="country"
                  value={formData.country}
                  onChange={(e) => handleInputChange('country', e.target.value)}
                  required
                  placeholder="Country"
                />
              </div>
              <div>
                <Label htmlFor="district">District *</Label>
                <Input
                  id="district"
                  value={formData.district}
                  onChange={(e) => handleInputChange('district', e.target.value)}
                  required
                  placeholder="District"
                />
              </div>
              <div>
                <Label htmlFor="city">City *</Label>
                <Input
                  id="city"
                  value={formData.city}
                  onChange={(e) => handleInputChange('city', e.target.value)}
                  required
                  placeholder="City"
                />
              </div>
            </div>
          </div>

          {/* Medical Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium flex items-center gap-2">
              <Heart className="w-4 h-4" />
              Medical Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="bloodGroup">Blood Group</Label>
                <select
                  id="bloodGroup"
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  value={formData.bloodGroup}
                  onChange={(e) => handleInputChange('bloodGroup', e.target.value)}
                >
                  <option value="">Select Blood Group</option>
                  <option value="A+">A+</option>
                  <option value="A-">A-</option>
                  <option value="B+">B+</option>
                  <option value="B-">B-</option>
                  <option value="AB+">AB+</option>
                  <option value="AB-">AB-</option>
                  <option value="O+">O+</option>
                  <option value="O-">O-</option>
                </select>
              </div>
              <div>
                <Label htmlFor="disability">Disability Status</Label>
                <select
                  id="disability"
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  value={formData.disability}
                  onChange={(e) => handleInputChange('disability', e.target.value)}
                >
                  <option value="">Select Disability</option>
                  <option value="None">None</option>
                  <option value="Visual Impairment (Blindness / Low Vision)">Visual Impairment (Blindness / Low Vision)</option>
                  <option value="Hearing Impairment (Deaf / Hard of Hearing)">Hearing Impairment (Deaf / Hard of Hearing)</option>
                  <option value="Speech and Language Disability">Speech and Language Disability</option>
                  <option value="Locomotor Disability (Physical / Mobility Disability)">Locomotor Disability (Physical / Mobility Disability)</option>
                  <option value="Mental Illness">Mental Illness</option>
                  <option value="Intellectual Disability (Cognitive Impairment)">Intellectual Disability (Cognitive Impairment)</option>
                  <option value="Learning Disabilities (Dyslexia, Dyscalculia, etc)">Learning Disabilities (Dyslexia, Dyscalculia, etc)</option>
                  <option value="Autism Spectrum Disorder">Autism Spectrum Disorder</option>
                  <option value="Cerebral Palsy">Cerebral Palsy</option>
                  <option value="Multiple Sclerosis">Multiple Sclerosis</option>
                  <option value="Muscular Dystrophy">Muscular Dystrophy</option>
                  <option value="Spinal Cord Injury">Spinal Cord Injury</option>
                  <option value="Amputation">Amputation</option>
                  <option value="Neurological Disorder">Neurological Disorder</option>
                  <option value="Dwarfism (Short Stature)">Dwarfism (Short Stature)</option>
                  <option value="Thalassemia">Thalassemia</option>
                  <option value="Hemophilia">Hemophilia</option>
                  <option value="Sickle Cell Disease">Sickle Cell Disease</option>
                  <option value="Chronic Neurological Conditions">Chronic Neurological Conditions</option>
                  <option value="Parkinson's Disease">Parkinson's Disease</option>
                  <option value="Multiple Disabilities (more than one condition)">Multiple Disabilities (more than one condition)</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <div>
                <Label htmlFor="birthHospital">Birth Hospital</Label>
                <Input
                  id="birthHospital"
                  value={formData.birthHospital}
                  onChange={(e) => handleInputChange('birthHospital', e.target.value)}
                  placeholder="Hospital name"
                />
              </div>
              <div>
                <Label htmlFor="firstTreatmentDoctor">First Treatment Doctor</Label>
                <Input
                  id="firstTreatmentDoctor"
                  value={formData.firstTreatmentDoctor}
                  onChange={(e) => handleInputChange('firstTreatmentDoctor', e.target.value)}
                  placeholder="Doctor's name"
                />
              </div>
            </div>
            <div>
              <Label htmlFor="majorMark">Major Mole/Mark Description</Label>
              <Textarea
                id="majorMark"
                value={formData.majorMark}
                onChange={(e) => handleInputChange('majorMark', e.target.value)}
                placeholder="Describe any distinctive marks or moles"
                rows={3}
              />
            </div>
          </div>

          {/* Documents */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium flex items-center gap-2">
              <FileText className="w-4 h-4" />
              Documents & Identity
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="aadhaarNumber">National ID</Label>
                <Input
                  id="aadhaarNumber"
                  value={formData.aadhaarNumber}
                  onChange={(e) => handleInputChange('aadhaarNumber', e.target.value)}
                  placeholder="Enter National ID Number"
                  maxLength={12}
                />
              </div>
              <div>
                <Label htmlFor="birthCertificate">Birth Certificate</Label>
                <div className="flex items-center gap-2">
                  <Input
                    id="birthCertificate"
                    type="file"
                    onChange={(e) => handleFileChange('birthCertificate', e.target.files?.[0] || null)}
                    accept=".pdf,.jpg,.jpeg,.png"
                  />
                  <Upload className="w-4 h-4 text-gray-400" />
                </div>
              </div>
              <div className="md:col-span-2">
                <Label htmlFor="photo">Child's Photo</Label>
                <div className="flex items-center gap-2">
                  <Input
                    id="photo"
                    type="file"
                    onChange={(e) => handleFileChange('photo', e.target.files?.[0] || null)}
                    accept=".jpg,.jpeg,.png"
                  />
                  <Upload className="w-4 h-4 text-gray-400" />
                </div>
              </div>
            </div>
          </div>

          {/* Enhanced Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 pt-6 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Dashboard
            </Button>
            <div className="flex gap-2 ml-auto">            
              <Button
                type="submit"
                disabled={isLoading || !formData.name || !formData.dob || !formData.gender}
                className="bg-blue-600 hover:bg-blue-700 flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                {isLoading ? 'Adding...' : 'Add Child'}
              </Button>
            </div>
          </div>
          {errorMsg && (
            <div className="text-red-600 text-sm mt-2">{errorMsg}</div>
          )}
        </form>
      </CardContent>
    </Card>
  );
};

export default AddChildForm;
