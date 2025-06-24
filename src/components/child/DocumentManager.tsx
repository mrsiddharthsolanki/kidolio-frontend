import React, { useState, useEffect, useRef } from 'react';
import { 
  AlertCircle, 
  Download, 
  FileText,
  File,
  FileHeart,
  FileIcon,
  Filter, 
  Search, 
  Trash2, 
  Upload,
  Calendar,
  Eye,
  Edit,
  Heart,
  User,
  GraduationCap
} from 'lucide-react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import {
  Alert,
  AlertTitle,
  AlertDescription,
} from "@/components/ui/alert";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { toast } from '@/hooks/use-toast';
import { uploadToCloudinary } from '@/lib/uploadToCloudinary';

interface Document {
  id: string;
  _id?: string; // Add optional _id for MongoDB
  name: string;
  type: 'school' | 'health' | 'personal' | 'college' | 'other';
  size: string;
  uploadDate: string;
  fileType: string;
  url?: string;
  content?: string;
}

interface DocumentManagerProps {
  childId: string;
}

const SUPPORTED_TYPES = [
  'PDF', 'DOC', 'DOCX', 'JPG', 'JPEG', 'PNG'
];
const DOC_TYPE_OPTIONS = [
  { value: 'personal', label: 'Personal' },
  { value: 'health', label: 'Health' },
  { value: 'school', label: 'School' },
  { value: 'college', label: 'College' },
  { value: 'other', label: 'Other' },
];

const DocumentManager: React.FC<DocumentManagerProps> = ({ childId }) => {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [dragActive, setDragActive] = useState(false);
  const [editingDoc, setEditingDoc] = useState<Document | null>(null);
  const [viewingDoc, setViewingDoc] = useState<Document | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [pendingFiles, setPendingFiles] = useState<File[]>([]);
  const [pendingFileIndex, setPendingFileIndex] = useState(0);
  const [showTypeDialog, setShowTypeDialog] = useState(false);
  const [selectedDocType, setSelectedDocType] = useState('personal');
  const [selectedFileType, setSelectedFileType] = useState('PDF');
  const [currentFileName, setCurrentFileName] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState<string | null>(null);

  // Drag events handler (for drag highlight)
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  // Fetch documents from new Document DB endpoint on mount
  useEffect(() => {
    (async () => {
      setIsLoading(true);
      setErrorMsg(null);
      try {
        const api = (await import('@/lib/api')).default;
        const res = await api.get(`/record/document/all?childId=${childId}`);
        setDocuments(res.data);
      } catch (error: unknown) {
        let msg = 'Failed to load documents.';
        if (
          typeof error === 'object' &&
          error !== null &&
          'response' in error &&
          typeof (error as { response?: { data?: { message?: string } } }).response?.data?.message === 'string'
        ) {
          msg = (error as { response: { data: { message: string } } }).response.data.message;
        }
        setErrorMsg(msg);
        toast({ title: 'Error', description: msg, variant: 'destructive' });
      } finally {
        setIsLoading(false);
      }
    })();
  }, [childId]);

  // Helper to start upload flow (opens dialog for each file)
  const startUploadFlow = (files: FileList | File[]) => {
    const arr = Array.from(files).filter(f => {
      const ext = f.name.split('.').pop()?.toUpperCase() || '';
      return SUPPORTED_TYPES.includes(ext);
    });
    if (arr.length === 0) {
      toast({ title: 'Error', description: 'No supported file types selected.', variant: 'destructive' });
      return;
    }
    setPendingFiles(arr);
    setPendingFileIndex(0);
    setShowTypeDialog(true);
    const file = arr[0];
    setCurrentFileName(file.name);
    setSelectedFileType(file.name.split('.').pop()?.toUpperCase() || 'PDF');
    setSelectedDocType('personal');
  };

  // Called when user confirms type for a file
  const handleTypeDialogConfirm = async () => {
    const file = pendingFiles[pendingFileIndex];
    if (!file) return;
    try {      setIsLoading(true);
      const fileType = selectedFileType;
      const size = file.size; // Save the raw size in bytes
      const doc = await uploadToCloudinary(file, childId, file.name, fileType, size.toString(), selectedDocType);
      setDocuments(prev => [doc, ...prev]);
      toast({ title: 'Success', description: `${file.name} uploaded successfully!` });
    } catch (error: unknown) {
      let msg = 'Failed to upload document.';
      if (
        typeof error === 'object' &&
        error !== null &&
        'response' in error &&
        typeof (error as { response?: { data?: { message?: string } } }).response?.data?.message === 'string'
      ) {
        msg = (error as { response: { data: { message: string } } }).response.data.message;
      }
      toast({ title: 'Error', description: msg, variant: 'destructive' });
    } finally {
      setIsLoading(false);
      // Next file or close dialog
      if (pendingFileIndex < pendingFiles.length - 1) {
        const nextIdx = pendingFileIndex + 1;
        setPendingFileIndex(nextIdx);
        const nextFile = pendingFiles[nextIdx];
        setCurrentFileName(nextFile.name);
        setSelectedFileType(nextFile.name.split('.').pop()?.toUpperCase() || 'PDF');
        setSelectedDocType('personal');
      } else {
        setShowTypeDialog(false);
        setPendingFiles([]);
        setPendingFileIndex(0);
      }
    }
  };

  // Called when user cancels dialog
  const handleTypeDialogCancel = () => {
    setShowTypeDialog(false);
    setPendingFiles([]);
    setPendingFileIndex(0);
  };

  // Upload document to backend (Cloudinary and Document DB)
  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files) startUploadFlow(files);
  };

  // Drag and drop upload (Cloudinary and Document DB)
  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      startUploadFlow(e.dataTransfer.files);
    }
  };

  // Delete document from backend, Cloudinary, and frontend
  const handleDelete = async (docId: string) => {
    // Find doc by id or _id
    const doc = documents.find((d) => d._id === docId || d.id === docId);
    if (!doc) return;
    const backendId = doc._id || doc.id;
    if (!window.confirm(`Delete document "${doc.name}"? This will permanently remove it from your account.`)) return;
    try {
      setIsLoading(true);
      const api = (await import('@/lib/api')).default;
      await api.delete(`/record/document/${backendId}`);
      setDocuments((prev) => prev.filter((d) => (d._id || d.id) !== backendId));
      toast({ title: 'Success', description: `${doc.name} deleted successfully!` });
    } catch (error: unknown) {
      let msg = 'Failed to delete document.';
      if (
        typeof error === 'object' &&
        error !== null &&
        'response' in error &&
        typeof (error as { response?: { data?: { message?: string } } }).response?.data?.message === 'string'
      ) {
        msg = (error as { response: { data: { message: string } } }).response.data.message;
      }
      toast({ title: 'Error', description: msg, variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  };

  // Download document (use backend URL)
  const handleDownload = (doc: Document) => {
    if (!doc.url) {
      toast({ title: 'Error', description: 'No file URL available.', variant: 'destructive' });
      return;
    }
    try {
      // Always use backend for relative or non-absolute URLs
      let fileUrl = doc.url;
      if (!/^https?:\/\//i.test(fileUrl)) {
        const API_URL = import.meta.env.VITE_API_URL || 'https://kidolio.onrender.com';
        fileUrl = `${API_URL}${fileUrl.startsWith('/') ? '' : '/'}${fileUrl}`;
      }
      fetch(fileUrl, { mode: 'cors' })
        .then(async (response) => {
          if (!response.ok) throw new Error('Network response was not ok');
          const blob = await response.blob();
          const url = window.URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.href = url;
          link.download = doc.name;
          document.body.appendChild(link);
          link.click();
          setTimeout(() => {
            window.URL.revokeObjectURL(url);
            document.body.removeChild(link);
          }, 100);
          toast({ title: 'Download Started', description: `${doc.name} is being downloaded...` });
        })
        .catch(() => {
          toast({ title: 'Download Failed', description: 'There was an error downloading the file. Please try again.', variant: 'destructive' });
        });
    } catch (error) {
      toast({ title: 'Download Failed', description: 'There was an error downloading the file. Please try again.', variant: 'destructive' });
    }
  };

  // Edit document details (name/type)
  const handleEdit = (doc: Document) => {
    setEditingDoc(doc);
  };

  // Save edit to backend and update frontend state
  const saveEdit = async () => {
    if (editingDoc) {
      try {
        setIsLoading(true);
        const api = (await import('@/lib/api')).default;
        // Always use _id if present, fallback to id
        const backendId = editingDoc._id || editingDoc.id;
        // Only send updatable fields
        const updatePayload = {
          name: editingDoc.name,
          type: editingDoc.type,
        };
        // Update backend document
        const res = await api.put(`/record/document/${backendId}`, updatePayload);
        // Update frontend state with new data
        setDocuments(prev => prev.map(doc =>
          (doc._id || doc.id) === backendId ? { ...doc, ...updatePayload } : doc
        ));
        setEditingDoc(null);
        toast({ title: 'Success', description: 'Document updated successfully!' });
      } catch (error: unknown) {
        let msg = 'Failed to update document.';
        if (
          typeof error === 'object' &&
          error !== null &&
          'response' in error &&
          typeof (error as { response?: { data?: { message?: string } } }).response?.data?.message === 'string'
        ) {
          msg = (error as { response: { data: { message: string } } }).response.data.message;
        }
        toast({ title: 'Error', description: msg, variant: 'destructive' });
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleView = (doc: Document) => {
    setViewingDoc(doc);
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'school': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'health': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'personal': return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'school': return <GraduationCap className="w-4 h-4" />;
      case 'health': return <Heart className="w-4 h-4" />;
      case 'personal': return <User className="w-4 h-4" />;
      default: return <FileText className="w-4 h-4" />;
    }
  };

  const filteredDocuments = documents.filter(doc => {
    const matchesSearch = doc.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = typeFilter === 'all' || doc.type === typeFilter;
    return matchesSearch && matchesType;
  });

  // Fix the formatFileSize function to handle string input
  const formatFileSize = (size: string | number) => {
    if (typeof size === 'string') {
      // If size is already formatted (e.g., "2.5 MB"), return as is
      if (size.includes('MB') || size.includes('KB') || size.includes('GB')) {
        return size;
      }
      // Try to parse the string as a number
      const parsed = parseFloat(size);
      if (isNaN(parsed)) return size;
      size = parsed;
    }
    
    if (size === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(size) / Math.log(k));
    return parseFloat((size / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };  // Document card component
  const DocumentCard = ({ doc }: { doc: Document }) => {
    const formattedDate = formatDate(doc.uploadDate);
    const formattedSize = formatFileSize(doc.size);

    return (
      <Card className="group relative overflow-hidden border-2 border-gray-100/50 dark:border-gray-800/50 shadow-lg hover:shadow-xl hover:border-purple-200/50 dark:hover:border-purple-700/50 transition-all duration-300 bg-white/75 dark:bg-gray-800/75 backdrop-blur-sm">
        <CardContent className="p-4">
          {/* Top Section with Icon and Type */}
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-lg bg-gradient-to-br from-purple-500/10 to-fuchsia-500/10 text-purple-600 dark:text-purple-400 group-hover:scale-110 transition-transform duration-300">
                {getFileIcon(doc.type)}
              </div>
              <Badge 
                variant="secondary" 
                className={`${getTypeColor(doc.type)} capitalize px-2.5 py-0.5 text-xs font-medium`}
              >
                {doc.type}
              </Badge>
            </div>
            <Badge variant="outline" className="bg-gray-50 dark:bg-gray-900/50 text-xs font-medium">
              {doc.fileType}
            </Badge>
          </div>

          {/* Document Name with Tooltip */}
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100 truncate mb-2 cursor-default hover:text-purple-600 dark:hover:text-purple-400 transition-colors">
                  {doc.name}
                </h3>
              </TooltipTrigger>
              <TooltipContent side="top" className="max-w-[300px]">
                <p className="text-sm">{doc.name}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>          {/* Meta Information */}
          <div className="flex items-center gap-3 text-xs text-gray-500 dark:text-gray-400 mb-4">
            <div className="flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5" />
              {formattedDate}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-1.5 pt-2 border-t border-gray-100 dark:border-gray-700">
            <Button
              size="sm"
              variant="ghost"
              onClick={() => handleView(doc)}
              className="h-8 w-8 p-0 hover:bg-purple-50 dark:hover:bg-purple-900/20 hover:text-purple-600 dark:hover:text-purple-400"
            >
              <Eye className="w-4 h-4" />
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => handleDownload(doc)}
              className="h-8 w-8 p-0 hover:bg-purple-50 dark:hover:bg-purple-900/20 hover:text-purple-600 dark:hover:text-purple-400"
            >
              <Download className="w-4 h-4" />
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => handleEdit(doc)}
              className="h-8 w-8 p-0 hover:bg-purple-50 dark:hover:bg-purple-900/20 hover:text-purple-600 dark:hover:text-purple-400"
            >
              <Edit className="w-4 h-4" />
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => handleDelete(doc._id || doc.id)}
              className="h-8 w-8 p-0 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-600 dark:hover:text-red-400"
              disabled={isLoading}
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="space-y-6">
      {/* Type selection dialog for uploads */}
      <Dialog open={showTypeDialog} onOpenChange={handleTypeDialogCancel}>
        <DialogContent className="border border-gray-100 dark:border-gray-800 shadow-md bg-white dark:bg-gray-800">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5 text-purple-500 dark:text-purple-400" />
              Set Document Type
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {isLoading ? (
              <div className="flex flex-col items-center justify-center py-8">
                <svg className="animate-spin h-8 w-8 text-purple-600 mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path>
                </svg>
                <div className="text-purple-600 font-medium">Uploading document, please wait...</div>
              </div>
            ) : (
              <>
                <div className="space-y-2">
                  <Label>File Name</Label>
                  <div className="text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-gray-900/50 rounded-lg px-3 py-2">
                    {currentFileName}
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Document Category</Label>
                  <Select value={selectedDocType} onValueChange={setSelectedDocType}>
                    <SelectTrigger className="border-gray-200 dark:border-gray-700">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {DOC_TYPE_OPTIONS.map(opt => (
                        <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex gap-2 pt-2">
                  <Button 
                    onClick={handleTypeDialogConfirm}
                    className="flex-1 bg-gradient-to-r from-purple-500 to-fuchsia-500 hover:from-purple-600 hover:to-fuchsia-600 text-white"
                  >
                    Upload Document
                  </Button>
                  <Button variant="outline" onClick={handleTypeDialogCancel} className="flex-1">
                    Cancel
                  </Button>
                </div>
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Header with Search and Filters */}
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">My Documents</h3>
          <div className="flex gap-2">
            <input
              type="file"
              multiple
              onChange={handleFileUpload}
              className="hidden"
              id="file-upload"
              accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
            />
            <label htmlFor="file-upload">
              <Button className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white shadow-lg hover:shadow-xl transition-all cursor-pointer" asChild>
                <span>
                  <Upload className="w-4 h-4 mr-2" />
                  Upload Files
                </span>
              </Button>
            </label>
          </div>
        </div>

        {/* Search and Filter Bar */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <Input
              placeholder="Search documents..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 border-purple-200 focus:border-purple-500 focus:ring-purple-500"
            />
          </div>
          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className="w-full sm:w-48 border-purple-200 focus:border-purple-500 focus:ring-purple-500">
              <Filter className="w-4 h-4 mr-2" />
              <SelectValue placeholder="Filter by type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Documents</SelectItem>
              <SelectItem value="school">School</SelectItem>
              <SelectItem value="health">Health</SelectItem>
              <SelectItem value="personal">Personal</SelectItem>
              <SelectItem value="college">College</SelectItem>
              <SelectItem value="other">Other</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Upload Area */}
      <Card 
        className={`border-2 border-dashed transition-all ${
          dragActive 
            ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20' 
            : 'border-purple-200 hover:border-purple-300 hover:bg-purple-50/50'
        } rounded-xl`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <CardContent className="text-center py-12">
          <Upload className={`w-16 h-16 mx-auto mb-4 ${dragActive ? 'text-purple-500' : 'text-purple-300'} transition-colors`} />
          <p className="text-lg font-medium text-gray-700 dark:text-gray-300 mb-2">
            Drag and drop files here
          </p>
          <p className="text-sm text-gray-500">
            or <span className="text-purple-600 hover:text-purple-700 cursor-pointer">browse</span> to choose files
          </p>
          <p className="text-xs text-gray-400 mt-4">
            Supports PDF, DOC, DOCX, JPG, PNG files up to 10MB
          </p>
        </CardContent>
      </Card>

      {/* Document List */}
      {filteredDocuments.length === 0 ? (
        <div className="text-center py-12">
          <FileText className="w-16 h-16 mx-auto text-gray-300 mb-4" />
          <h3 className="text-lg font-medium text-gray-700 dark:text-gray-300 mb-2">
            No documents found
          </h3>
          <p className="text-sm text-gray-500">
            {searchTerm || typeFilter !== 'all' 
              ? 'Try adjusting your search or filters'
              : 'Upload some documents to get started'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredDocuments.map((doc) => (
            <DocumentCard key={doc._id || doc.id} doc={doc} />
          ))}
        </div>
      )}

      {/* Loading State */}
      {isLoading && (
        <div className="relative">
          <div className="absolute inset-0 bg-white/80 dark:bg-gray-950/80 flex items-center justify-center">
            <div className="flex flex-col items-center gap-2">
              <div className="w-12 h-12 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin" />
              <p className="text-sm text-gray-500">Loading documents...</p>
            </div>
          </div>
        </div>
      )}

      {/* Error State */}
      {error && (
        <Alert variant="destructive" className="mt-4">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Edit Dialog */}
      <Dialog open={!!editingDoc} onOpenChange={() => setEditingDoc(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Document</DialogTitle>
          </DialogHeader>
          {editingDoc && (
            <div className="space-y-4">
              <div>
                <Label htmlFor="edit-name">Document Name</Label>
                <Input
                  id="edit-name"
                  value={editingDoc.name}
                  onChange={(e) => setEditingDoc({...editingDoc, name: e.target.value})}
                />
              </div>
              <div>
                <Label htmlFor="edit-type">Document Type</Label>
                <Select
                  value={editingDoc.type}
                  onValueChange={(value: 'school' | 'health' | 'personal' | 'college' | 'other') => 
                    setEditingDoc({...editingDoc, type: value})
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="school">School</SelectItem>
                    <SelectItem value="health">Health</SelectItem>
                    <SelectItem value="personal">Personal</SelectItem>
                    <SelectItem value="college">College</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex gap-2">
                <Button onClick={saveEdit} className="flex-1">Save Changes</Button>
                <Button variant="outline" onClick={() => setEditingDoc(null)}>Cancel</Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Enhanced View Dialog with Preview */}
      <Dialog open={!!viewingDoc} onOpenChange={() => setViewingDoc(null)}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Document Preview: {viewingDoc?.name}</DialogTitle>
          </DialogHeader>
          {viewingDoc && (
            <div className="space-y-4">
              {/* Document Preview */}
              <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-6 min-h-96">
                {viewingDoc.fileType === 'PDF' ? (
                  <div className="text-center space-y-4">
                    <FileText className="w-24 h-24 mx-auto text-red-500" />
                    <div>
                      <h3 className="text-lg font-medium mb-2">{viewingDoc.name}</h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                        PDF Document • {viewingDoc.size}
                      </p>
                      <div className="bg-white dark:bg-gray-700 rounded-lg p-4 text-left max-w-2xl mx-auto">
                        <h4 className="font-medium mb-2">Document Content:</h4>
                        <p className="text-sm text-gray-700 dark:text-gray-300">
                          {viewingDoc.content || 'This is a preview of the document content. The actual PDF would be displayed here with proper rendering.'}
                        </p>
                      </div>
                    </div>
                  </div>
                ) : viewingDoc.fileType === 'JPG' || viewingDoc.fileType === 'PNG' || viewingDoc.fileType === 'JPEG' ? (
                  <div className="text-center">
                    {viewingDoc.url ? (
                      <img 
                        src={viewingDoc.url} 
                        alt={viewingDoc.name}
                        className="max-w-full max-h-96 mx-auto rounded-lg shadow-lg"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                          e.currentTarget.nextElementSibling?.classList.remove('hidden');
                        }}
                      />
                    ) : null}
                    <div className="hidden space-y-4">
                      <FileText className="w-24 h-24 mx-auto text-blue-500" />
                      <div>
                        <h3 className="text-lg font-medium">{viewingDoc.name}</h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          Image file preview not available
                        </p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center space-y-4">
                    <File className="w-24 h-24 mx-auto text-gray-500" />
                    <div>
                      <h3 className="text-lg font-medium">{viewingDoc.name}</h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                        {viewingDoc.fileType} Document • {viewingDoc.size}
                      </p>
                      <div className="bg-white dark:bg-gray-700 rounded-lg p-4 text-left max-w-2xl mx-auto">
                        <h4 className="font-medium mb-2">Document Content:</h4>
                        <p className="text-sm text-gray-700 dark:text-gray-300">
                          {viewingDoc.content || 'Document content preview would appear here.'}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Document Details */}
              <div className="grid grid-cols-2 gap-4 text-sm bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
                <div>
                  <span className="font-medium">Type:</span> 
                  <Badge className={`ml-2 ${getTypeColor(viewingDoc.type)}`} variant="secondary">
                    {viewingDoc.type}
                  </Badge>
                </div>
                <div>
                  <span className="font-medium">File Type:</span> {viewingDoc.fileType}
                </div>
                <div>
                  <span className="font-medium">Size:</span> {viewingDoc.size}
                </div>
                <div>
                  <span className="font-medium">Upload Date:</span> {new Date(viewingDoc.uploadDate).toLocaleDateString()}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2">
                <Button onClick={() => handleDownload(viewingDoc)} className="flex-1">
                  <Download className="w-4 h-4 mr-2" />
                  Download Original
                </Button>
                <Button variant="outline" onClick={() => {
                  setViewingDoc(null);
                  handleEdit(viewingDoc);
                }}>
                  <Edit className="w-4 h-4 mr-2" />
                  Edit
                </Button>
                <Button variant="outline" onClick={() => setViewingDoc(null)}>
                  Close
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default DocumentManager;

// Utility functions
const formatDate = (date: string) => {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
};

const getFileIcon = (type: string) => {
  // You can customize this based on your file types
  switch (type.toLowerCase()) {
    case 'school':
    case 'college':
      return <File className="w-6 h-6" />;
    case 'health':
      return <FileHeart className="w-6 h-6" />;
    case 'personal':
      return <FileText className="w-6 h-6" />;
    default:
      return <FileIcon className="w-6 h-6" />;
  }
};
