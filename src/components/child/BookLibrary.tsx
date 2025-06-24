import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Book, Plus, Search, Download, Eye, Lock, Globe, Star, BookOpen, Edit, Trash2, Loader2 } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { useSearchParams } from 'react-router-dom';

interface BookData {
  id: string;
  title: string;
  author: string;
  description: string;
  access: 'public' | 'private';
  uploadDate: string;
  downloads: number;
  owner: string;
  isOwner: boolean;
  rating: number;
  category: string;
  fileUrl?: string;
  childId: string;
}

interface BookLibraryProps {
  childId: string;
}

const BookCard: React.FC<{
  book: BookData;
  privateBookPasswords: { [bookId: string]: string };
  setPrivateBookPasswords: React.Dispatch<React.SetStateAction<{ [bookId: string]: string }>>;
  privateBookLoading: { [bookId: string]: boolean };
  privateBookError: { [bookId: string]: string | null };
  handlePrivateBookAccess: (book: BookData) => void;
  handleView: (book: BookData) => void;
  handleEdit: (book: BookData) => void;
  handleDelete: (bookId: string) => void;
  handleDownload: (book: BookData) => void;
}> = ({
  book,
  privateBookPasswords,
  setPrivateBookPasswords,
  privateBookLoading,
  privateBookError,
  handlePrivateBookAccess,
  handleView,
  handleEdit,
  handleDelete,
  handleDownload,
}) => (
  <Card className="shadow-lg border-0 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
    <CardHeader className="pb-3">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-2">
          <Book className="w-5 h-5 text-blue-600" />
          <div>
            <h4 className="font-medium">{book.title}</h4>
            <p className="text-sm text-gray-600 dark:text-gray-400">by {book.author}</p>
            <div className="flex items-center gap-1 mt-1">
              <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
              <span className="text-xs text-gray-500">{book.rating}</span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {book.access === 'private' ? (
            <Lock className="w-4 h-4 text-gray-400" />
          ) : (
            <Globe className="w-4 h-4 text-green-600" />
          )}
          <Badge variant={book.access === 'public' ? 'default' : 'secondary'}>
            {book.access}
          </Badge>
        </div>
      </div>
    </CardHeader>
    <CardContent className="space-y-3">
      <Badge variant="outline" className="text-xs">
        {book.category}
      </Badge>
      <p className="text-sm text-gray-700 dark:text-gray-300">{book.description}</p>
      <div className="flex justify-between items-center text-xs text-gray-500">
        <span>Added: {new Date(book.uploadDate).toLocaleDateString()}</span>
      </div>
      <div className="flex gap-2">
        <Button size="sm" variant="outline" onClick={() => handleView(book)} className="flex-1">
          <Eye className="w-3 h-3 mr-1" />
          View
        </Button>
        {book.isOwner ? (
          <>
            <Button size="sm" variant="outline" onClick={() => handleEdit(book)}>
              <Edit className="w-3 h-3" />
            </Button>
            <Button size="sm" variant="outline" onClick={() => handleDelete(book.id)} className="hover:bg-red-50 hover:text-red-600">
              <Trash2 className="w-3 h-3" />
            </Button>
          </>
        ) : (
          <Button size="sm" className="bg-blue-600 hover:bg-blue-700" onClick={() => handleDownload(book)}>
            <Download className="w-3 h-3 mr-1" />
            Download
          </Button>
        )}
      </div>
      {book.fileUrl && book.access === 'private' && (
        <div>
          <Input
            type="password"
            placeholder="Enter password to view file"
            value={privateBookPasswords[book.id] || ''}
            onChange={e => setPrivateBookPasswords(prev => ({ ...prev, [book.id]: e.target.value }))}
            className="mb-2"
            autoComplete="off"
          />
          <Button
            type="button"
            size="sm"
            onClick={() => handlePrivateBookAccess(book)}
            disabled={privateBookLoading[book.id] || !(privateBookPasswords[book.id])}
            className="mb-2"
          >
            {privateBookLoading[book.id] ? 'Loading...' : 'Access File'}
          </Button>
          {privateBookError[book.id] && <div className="text-xs text-red-600">{privateBookError[book.id]}</div>}
        </div>
      )}
      {book.fileUrl && book.access === 'public' && (
        <a
          href={book.fileUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="block text-xs text-blue-600 underline"
        >
          Download File
        </a>
      )}
    </CardContent>
  </Card>
);

const BookLibrary: React.FC<BookLibraryProps> = ({ childId }) => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState(searchParams.get('bookTab') || 'my-books');
  const [books, setBooks] = useState<BookData[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [viewingBook, setViewingBook] = useState<BookData | null>(null);
  const [editingBook, setEditingBook] = useState<BookData | null>(null);
  const [filterCategory, setFilterCategory] = useState('all');
  const [formData, setFormData] = useState({
    title: '',
    author: '',
    description: '',
    access: 'private' as 'public' | 'private',
    category: 'Fiction'
  });
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  // Per-book state for private book password, loading, error, and url
  const [privateBookPasswords, setPrivateBookPasswords] = useState<{ [bookId: string]: string }>({});
  const [privateBookLoading, setPrivateBookLoading] = useState<{ [bookId: string]: boolean }>({});
  const [privateBookError, setPrivateBookError] = useState<{ [bookId: string]: string | null }>({});
  const [privateBookUrl, setPrivateBookUrl] = useState<{ [bookId: string]: string | null }>({});
  // Add password to formData for add-book form
  const [formPassword, setFormPassword] = useState('');
  // Add state for edit password prompt
  const [editPassword, setEditPassword] = useState('');
  const [showEditPassword, setShowEditPassword] = useState(false);
  const [editAccessTarget, setEditAccessTarget] = useState<'public' | 'private' | null>(null);

  const categories = ['Fiction', 'Science', 'Education', 'Adventure', 'Mystery', 'Biography'];
  const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

  // Fetch books from backend for this child
  React.useEffect(() => {
    (async () => {
      setIsLoading(true);
      setErrorMsg(null);
      try {
        const api = (await import('@/lib/api')).default;
        const res = await api.get(`/book?childId=${childId}`);
        // Set isOwner based on owner matching childId
        const booksWithOwner = res.data.map((book: BookData) => ({
          ...book,
          isOwner: book.owner === childId
        }));
        setBooks(booksWithOwner);
      } catch (error) {
        let msg = 'Failed to load books.';
        if (error && typeof error === 'object' && 'response' in error && error.response?.data?.message) {
          msg = error.response.data.message;
        }
        setErrorMsg(msg);
      } finally {
        setIsLoading(false);
      }
    })();
  }, [childId]);

  // Advanced tab routing for book tabs
  React.useEffect(() => {
    const tab = searchParams.get('bookTab');
    if (tab && tab !== activeTab) {
      setActiveTab(tab);
    } else if (!tab && activeTab !== 'my-books') {
      setActiveTab('my-books');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  React.useEffect(() => {
    if (activeTab && activeTab !== searchParams.get('bookTab')) {
      setSearchParams({ ...Object.fromEntries(searchParams.entries()), bookTab: activeTab }, { replace: true });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab]);

  // Add book using backend
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUploading(true);
    setIsLoading(true);
    setErrorMsg(null);
    if (file && file.size > MAX_FILE_SIZE) {
      setIsUploading(false);
      setIsLoading(false);
      setErrorMsg('File size must be less than 10MB.');
      toast({ title: 'Error', description: 'File size must be less than 10MB.' });
      return;
    }
    try {
      const api = (await import('@/lib/api')).default;
      const form = new FormData();
      form.append('title', formData.title);
      form.append('author', formData.author);
      form.append('description', formData.description);
      form.append('access', formData.access);
      form.append('category', formData.category);
      form.append('childId', childId);
      if (file) form.append('file', file);
      if (formData.access === 'private') form.append('password', formPassword);
      const res = await api.post('/book', form, { headers: { 'Content-Type': 'multipart/form-data' } });
      // After adding, re-fetch the book list to ensure frontend is in sync with backend
      const booksRes = await api.get(`/book?childId=${childId}`);
      const booksWithOwner = booksRes.data.map((book: BookData) => ({
        ...book,
        isOwner: (book.owner === childId) || (book.childId === childId)
      }));
      setBooks(booksWithOwner);
      setFormData({ title: '', author: '', description: '', access: 'private', category: 'Fiction' });
      setFile(null);
      setFormPassword('');
      setShowForm(false);
      toast({ title: "Success", description: "Book added successfully!" });
    } catch (error) {
      let msg = 'Failed to add book.';
      if (error && typeof error === 'object' && 'response' in error && error.response?.data?.message) {
        msg = error.response.data.message;
      }
      setErrorMsg(msg);
      toast({ title: "Error", description: msg });
    } finally {
      setIsUploading(false);
      setIsLoading(false);
    }
  };

  const handleDownload = (book: BookData) => {
    setBooks(prev => prev.map(b => 
      b.id === book.id ? { ...b, downloads: b.downloads + 1 } : b
    ));
    toast({ title: "Download Started", description: `Downloading ${book.title}...` });
  };

  const handleView = (book: BookData) => {
    setViewingBook(book);
  };

  const handleEdit = (book: BookData) => {
    if (book.isOwner) {
      setEditingBook(book);
    }
  };

  const handleDelete = async (bookId: string) => {
    const book = books.find(b => b.id === bookId);
    if (!book?.isOwner) return;
    if (!window.confirm(`Delete book "${book.title}"? This will permanently remove it and its file from your account.`)) return;
    try {
      setIsLoading(true);
      const api = (await import('@/lib/api')).default;
      await api.delete(`/book/${bookId}`);
      setBooks(books.filter(b => b.id !== bookId));
      toast({ title: "Success", description: "Book deleted successfully!" });
    } catch (error) {
      let msg = 'Failed to delete book.';
      if (error && typeof error === 'object' && 'response' in error && error.response?.data?.message) {
        msg = error.response.data.message;
      }
      toast({ title: "Error", description: msg });
    } finally {
      setIsLoading(false);
    }
  };

  const saveEdit = async () => {
    if (!editingBook) return;
    setIsLoading(true);
    setErrorMsg(null);
    try {
      const api = (await import('@/lib/api')).default;
      // If changing to private, require password
      if (editingBook.access === 'private' && (!editPassword || editPassword.trim() === '')) {
        setShowEditPassword(true);
        setIsLoading(false);
        return;
      }
      // Build payload
      const payload: Record<string, unknown> = {
        title: editingBook.title,
        author: editingBook.author,
        description: editingBook.description,
        access: editingBook.access,
        category: editingBook.category,
      };
      if (editingBook.access === 'private' && editPassword) {
        payload.password = editPassword;
      }
      // PUT to backend
      await api.put(`/book/${editingBook.id}`, payload);
      // Refresh book list
      const booksRes = await api.get(`/book?childId=${childId}`);
      const booksWithOwner = booksRes.data.map((book: BookData) => ({
        ...book,
        isOwner: (book.owner === childId) || (book.childId === childId)
      }));
      setBooks(booksWithOwner);
      setEditingBook(null);
      setEditPassword('');
      setShowEditPassword(false);
      setEditAccessTarget(null);
      toast({ title: 'Success', description: 'Book updated successfully!' });
    } catch (error) {
      let msg = 'Failed to update book.';
      if (error && typeof error === 'object' && 'response' in error && error.response?.data?.message) {
        msg = error.response.data.message;
      }
      setErrorMsg(msg);
      toast({ title: 'Error', description: msg });
    } finally {
      setIsLoading(false);
    }
  };

  const filteredBooks = books.filter(book => {
    const matchesSearch = book.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         book.author.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         book.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = filterCategory === 'all' || book.category === filterCategory;
    return matchesSearch && matchesCategory;
  });

  const myBooks = filteredBooks.filter(book => book.isOwner);
  // Show all public books, including the current child's public books
  const publicBooks = filteredBooks.filter(book => book.access === 'public');

  if (showForm) {
    return (
      <div className="relative">
        {isUploading && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
            <div className="flex flex-col items-center gap-4 p-8 bg-white dark:bg-gray-900 rounded-xl shadow-xl border">
              <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
              <div className="text-blue-700 font-semibold">Uploading book, please wait...</div>
            </div>
          </div>
        )}
        <Card className="shadow-lg border-0 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
          <CardHeader>
            <CardTitle>Add New Book</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4" encType="multipart/form-data">
              <div>
                <Label className="block text-sm font-medium mb-2">Title *</Label>
                <Input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({...formData, title: e.target.value})}
                  required
                />
              </div>

              <div>
                <Label className="block text-sm font-medium mb-2">Author</Label>
                <Input
                  type="text"
                  value={formData.author}
                  onChange={(e) => setFormData({...formData, author: e.target.value})}
                  placeholder="Leave blank to use 'Me'"
                />
              </div>

              <div>
                <Label className="block text-sm font-medium mb-2">Category</Label>
                <Select
                  value={formData.category}
                  onValueChange={(value) => setFormData({...formData, category: value})}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map(cat => (
                      <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label className="block text-sm font-medium mb-2">Description *</Label>
                <Textarea
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  className="h-24"
                  required
                />
              </div>

              <div>
                <Label className="block text-sm font-medium mb-2">Access Level</Label>
                <Select
                  value={formData.access}
                  onValueChange={(value: 'public' | 'private') => {
                    setFormData({...formData, access: value});
                    if (value === 'public') setFormPassword('');
                  }}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="private">Private (Only I can see)</SelectItem>
                    <SelectItem value="public">Public (Everyone can see)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              {formData.access === 'private' && (
                <div>
                  <Label className="block text-sm font-medium mb-2">Password *</Label>
                  <Input
                    type="password"
                    value={formPassword}
                    onChange={e => setFormPassword(e.target.value)}
                    required={formData.access === 'private'}
                  />
                </div>
              )}

              <div>
                <Label className="block text-sm font-medium mb-2">Upload File (PDF/DOC)</Label>
                <Input type="file" accept=".pdf,.doc,.docx" onChange={e => setFile(e.target.files?.[0] || null)} />
              </div>

              <div className="flex gap-2">
                <Button type="submit" className="bg-green-600 hover:bg-green-700">
                  Add Book
                </Button>
                <Button type="button" variant="outline" onClick={() => setShowForm(false)}>
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    );
  }

  // In the main render, show loading and error states
  if (isLoading && !showForm) {
    return (
      <Card className="shadow-lg border-0 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm text-center py-12">
        <CardContent>
          <div className="text-lg text-blue-600 font-semibold">Loading books...</div>
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

  // Handler for private book file access (per book)
  const handlePrivateBookAccess = async (book: BookData) => {
    setPrivateBookLoading(prev => ({ ...prev, [book.id]: true }));
    setPrivateBookError(prev => ({ ...prev, [book.id]: null }));
    setPrivateBookUrl(prev => ({ ...prev, [book.id]: null }));
    try {
      const api = (await import('@/lib/api')).default;
      const password = privateBookPasswords[book.id] || '';
      const res = await api.post(`/book/private-url/${book.id}`, { password });
      setPrivateBookUrl(prev => ({ ...prev, [book.id]: res.data.url }));
      // --- TEMPORARILY DISABLED: update backend with actual accessed URL for deletion reliability ---
      // await api.put(`/book/accessed-public-id/${book.id}`, { accessedUrl: res.data.url });
      // --- END DISABLED ---
      window.open(res.data.url, '_blank');
    } catch (error) {
      let msg = 'Failed to get file.';
      if (error && typeof error === 'object' && 'response' in error && error.response && error.response.data && error.response.data.message) {
        msg = error.response.data.message;
      }
      setPrivateBookError(prev => ({ ...prev, [book.id]: msg }));
    } finally {
      setPrivateBookLoading(prev => ({ ...prev, [book.id]: false }));
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-xl font-semibold">Book Library</h3>
        <Button onClick={() => setShowForm(true)} className="bg-blue-600 hover:bg-blue-700">
          <Plus className="w-4 h-4 mr-2" />
          Add Book
        </Button>
      </div>

      {/* Search and Filter */}
      <div className="flex gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            type="text"
            placeholder="Search books by title, author, or description..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={filterCategory} onValueChange={setFilterCategory}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Filter by category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {categories.map(cat => (
              <SelectItem key={cat} value={cat}>{cat}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="my-books">My Books ({myBooks.length})</TabsTrigger>
          <TabsTrigger value="public-books">Public Books ({publicBooks.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="my-books" className="mt-6">
          {myBooks.length === 0 ? (
            <Card className="text-center py-8">
              <CardContent>
                <Book className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                <p className="text-gray-600 dark:text-gray-400">No books added yet.</p>
                <Button onClick={() => setShowForm(true)} className="mt-4 bg-blue-600 hover:bg-blue-700">
                  Add Your First Book
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {myBooks.map((book) => (
                <BookCard
                  key={book.id}
                  book={book}
                  privateBookPasswords={privateBookPasswords}
                  setPrivateBookPasswords={setPrivateBookPasswords}
                  privateBookLoading={privateBookLoading}
                  privateBookError={privateBookError}
                  handlePrivateBookAccess={handlePrivateBookAccess}
                  handleView={handleView}
                  handleEdit={handleEdit}
                  handleDelete={handleDelete}
                  handleDownload={handleDownload}
                />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="public-books" className="mt-6">
          {publicBooks.length === 0 ? (
            <Card className="text-center py-8">
              <CardContent>
                <Book className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                <p className="text-gray-600 dark:text-gray-400">No public books available.</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {publicBooks.map((book) => (
                <BookCard
                  key={book.id}
                  book={book}
                  privateBookPasswords={privateBookPasswords}
                  setPrivateBookPasswords={setPrivateBookPasswords}
                  privateBookLoading={privateBookLoading}
                  privateBookError={privateBookError}
                  handlePrivateBookAccess={handlePrivateBookAccess}
                  handleView={handleView}
                  handleEdit={handleEdit}
                  handleDelete={handleDelete}
                  handleDownload={handleDownload}
                />
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* View Dialog */}
      <Dialog open={!!viewingBook} onOpenChange={() => setViewingBook(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <BookOpen className="w-5 h-5" />
              {viewingBook?.title}
            </DialogTitle>
          </DialogHeader>
          {viewingBook && (
            <div className="space-y-4">
              <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-lg p-6">
                <div className="flex items-center gap-4 mb-4">
                  <Book className="w-12 h-12 text-blue-600" />
                  <div>
                    <h3 className="text-xl font-semibold">{viewingBook.title}</h3>
                    <p className="text-gray-600 dark:text-gray-400">by {viewingBook.author}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant="outline">{viewingBook.category}</Badge>
                    </div>
                  </div>
                </div>
                <p className="text-gray-700 dark:text-gray-300">{viewingBook.description}</p>
              </div>
              
              {/* Remove downloads, stars, owner info */}
              
              {/* Show preview or password input based on access */}
              {viewingBook.access === 'public' && viewingBook.fileUrl && (
                <iframe
                  src={viewingBook.fileUrl}
                  title="Book Preview"
                  className="w-full h-96 border rounded-lg mt-4"
                  style={{ background: 'white' }}
                />
              )}
              {viewingBook.access === 'private' && (
                <div className="mt-4">
                  <Label htmlFor="view-password">Enter password to view file</Label>
                  <Input
                    id="view-password"
                    type="password"
                    value={privateBookPasswords[viewingBook.id] || ''}
                    onChange={e => setPrivateBookPasswords(prev => ({ ...prev, [viewingBook.id]: e.target.value }))}
                    className="mb-2"
                    autoComplete="off"
                  />
                  <Button
                    type="button"
                    size="sm"
                    onClick={() => handlePrivateBookAccess(viewingBook)}
                    disabled={privateBookLoading[viewingBook.id] || !(privateBookPasswords[viewingBook.id])}
                  >
                    {privateBookLoading[viewingBook.id] ? 'Loading...' : 'Access File'}
                  </Button>
                  {privateBookError[viewingBook.id] && <div className="text-xs text-red-600">{privateBookError[viewingBook.id]}</div>}
                </div>
              )}
              <div className="flex gap-2 mt-4">
                <Button variant="outline" onClick={() => setViewingBook(null)}>
                  Close
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={!!editingBook} onOpenChange={() => setEditingBook(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Book</DialogTitle>
          </DialogHeader>
          {editingBook && (
            <div className="space-y-4">
              <div>
                <Label htmlFor="edit-title">Title</Label>
                <Input
                  id="edit-title"
                  value={editingBook.title}
                  onChange={(e) => setEditingBook({...editingBook, title: e.target.value})}
                />
              </div>
              <div>
                <Label htmlFor="edit-author">Author</Label>
                <Input
                  id="edit-author"
                  value={editingBook.author}
                  onChange={(e) => setEditingBook({...editingBook, author: e.target.value})}
                />
              </div>
              <div>
                <Label htmlFor="edit-category">Category</Label>
                <Select
                  value={editingBook.category}
                  onValueChange={(value) => setEditingBook({...editingBook, category: value})}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map(cat => (
                      <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="edit-description">Description</Label>
                <Textarea
                  id="edit-description"
                  value={editingBook.description}
                  onChange={(e) => setEditingBook({...editingBook, description: e.target.value})}
                  className="h-24"
                />
              </div>
              {/* Access level and password fields are removed for edit */}
              <div className="flex gap-2">
                <Button onClick={saveEdit} className="flex-1">Save Changes</Button>
                <Button variant="outline" onClick={() => { setEditingBook(null); setShowEditPassword(false); setEditPassword(''); }}>Cancel</Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default BookLibrary;
