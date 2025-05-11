import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Pencil, Trash2, ArrowLeft, Plus, Upload, Book, BookText } from 'lucide-react';
import axios from 'axios';
import AdminHeader from '@/components/admin/AdminHeader';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const API_BASE_URL = 'http://localhost:5000/api';

interface BookResource {
  _id: string;
  title: string;
  author: string;
  description: string;
  fileUrl: string;
  coverUrl: string;
}

interface BibleVerse {
  _id: string;
  reference: string;
  text: string;
  translation: string;
}

const AdminResources = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('books');
  const [books, setBooks] = useState<BookResource[]>([]);
  const [verses, setVerses] = useState<BibleVerse[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [bookForm, setBookForm] = useState({
    title: '',
    author: '',
    description: '',
    fileUrl: '',
    coverUrl: ''
  });
  
  const [verseForm, setVerseForm] = useState({
    reference: '',
    text: '',
    translation: 'NIV'
  });
  
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [selectedCover, setSelectedCover] = useState<File | null>(null);
  const [isEditingBook, setIsEditingBook] = useState(false);
  const [isEditingVerse, setIsEditingVerse] = useState(false);
  const [currentBookId, setCurrentBookId] = useState<string | null>(null);
  const [currentVerseId, setCurrentVerseId] = useState<string | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [resourceToDelete, setResourceToDelete] = useState<string | null>(null);
  const [resourceType, setResourceType] = useState<'book' | 'verse'>('book');
  const [uploading, setUploading] = useState(false);
  const [booksTab, setBooksTab] = useState('list'); // 'list' or 'create'
const [versesTab, setVersesTab] = useState('list'); // 'list' or 'create'

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      toast({
        title: 'Authentication Error',
        description: 'Please login to access the admin dashboard.',
        variant: 'destructive',
      });
      navigate('/admin/login');
      return;
    }

    if (activeTab === 'books') {
      fetchBooks();
    } else {
      fetchVerses();
    }
  }, [navigate, toast, activeTab]);

  const fetchBooks = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_BASE_URL}/books`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      if (Array.isArray(response.data)) {
        setBooks(response.data);
      } else {
        setBooks([]);
        console.error('Unexpected response format:', response.data);
      }
    } catch (error) {
      console.error('Error fetching books:', error);
      toast({
        title: 'Error',
        description: 'Failed to load books. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchVerses = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_BASE_URL}/verses`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      if (Array.isArray(response.data)) {
        setVerses(response.data);
      } else {
        setVerses([]);
        console.error('Unexpected response format:', response.data);
      }
    } catch (error) {
      console.error('Error fetching verses:', error);
      toast({
        title: 'Error',
        description: 'Failed to load Bible verses. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleBookInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setBookForm({
      ...bookForm,
      [e.target.name]: e.target.value,
    });
  };

  const handleVerseInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setVerseForm({
      ...verseForm,
      [e.target.name]: e.target.value,
    });
  };

  const handleVerseTranslationChange = (value: string) => {
    setVerseForm({
      ...verseForm,
      translation: value,
    });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, type: 'file' | 'cover') => {
    if (e.target.files && e.target.files.length > 0) {
      if (type === 'file') {
        setSelectedFile(e.target.files[0]);
      } else {
        setSelectedCover(e.target.files[0]);
      }
    }
  };

  const handleFileUpload = async (fileType: 'bookFile' | 'coverImage') => {
    const fileInput = fileType === 'bookFile' ? bookFileInputRef.current : coverImageInputRef.current;
    const file = fileInput?.files?.[0];
  
    if (!file) {
      toast({
        title: 'Error',
        description: `Please select a ${fileType === 'bookFile' ? 'book file' : 'cover image'}`,
        variant: 'destructive',
      });
      return;
    }
  
    try {
      setUploading(true);
      const formData = new FormData();
      formData.append(fileType, file);
  
      const token = localStorage.getItem('token');
      const response = await axios.post(`${API_BASE_URL}/upload`, formData, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'multipart/form-data',
        },
      });
  
      setBookForm(prev => ({
        ...prev,
        [fileType === 'bookFile' ? 'fileUrl' : 'coverUrl']: response.data.fileUrl,
      }));
  
      toast({
        title: 'Success',
        description: `${fileType === 'bookFile' ? 'Book file' : 'Cover image'} uploaded successfully!`,
      });
    } catch (error) {
      console.error(`Error uploading ${fileType}:`, error);
      toast({
        title: 'Error',
        description: `Failed to upload ${fileType === 'bookFile' ? 'book file' : 'cover image'}`,
        variant: 'destructive',
      });
    } finally {
      setUploading(false);
    }
  };

  const handleBookSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!bookForm.fileUrl || !bookForm.coverUrl) {
      toast({
        title: 'Error',
        description: 'Please upload both a book file and a cover image.',
        variant: 'destructive',
      });
      return;
    }
    
    try {
      const token = localStorage.getItem('token');
      
      if (isEditingBook && currentBookId) {
        await axios.put(`${API_BASE_URL}/books/${currentBookId}`, bookForm, {
          headers: { 
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
        });
        
        toast({
          title: 'Success',
          description: 'Book updated successfully!',
        });
      } else {
        await axios.post(`${API_BASE_URL}/books`, bookForm, {
          headers: { 
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
        });
        
        toast({
          title: 'Success',
          description: 'Book added successfully!',
        });
      }
      
      resetBookForm();
      fetchBooks();
    } catch (error) {
      console.error('Error saving book:', error);
      toast({
        title: 'Error',
        description: 'Failed to save book. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const handleVerseSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const token = localStorage.getItem('token');
      
      if (isEditingVerse && currentVerseId) {
        await axios.put(`${API_BASE_URL}/verses/${currentVerseId}`, verseForm, {
          headers: { 
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
        });
        
        toast({
          title: 'Success',
          description: 'Bible verse updated successfully!',
        });
      } else {
        await axios.post(`${API_BASE_URL}/verses`, verseForm, {
          headers: { 
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
        });
        
        toast({
          title: 'Success',
          description: 'Bible verse added successfully!',
        });
      }
      
      resetVerseForm();
      fetchVerses();
    } catch (error) {
      console.error('Error saving verse:', error);
      toast({
        title: 'Error',
        description: 'Failed to save Bible verse. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const handleEditBook = (book: BookResource) => {
    setBookForm({
      title: book.title,
      author: book.author,
      description: book.description,
      fileUrl: book.fileUrl,
      coverUrl: book.coverUrl,
    });
    setIsEditingBook(true);
    setCurrentBookId(book._id);
  };

  const handleEditVerse = (verse: BibleVerse) => {
    setVerseForm({
      reference: verse.reference,
      text: verse.text,
      translation: verse.translation,
    });
    setIsEditingVerse(true);
    setCurrentVerseId(verse._id);
  };

  const openDeleteDialog = (id: string, type: 'book' | 'verse') => {
    setResourceToDelete(id);
    setResourceType(type);
    setDeleteDialogOpen(true);
  };

  const handleDelete = async () => {
    if (!resourceToDelete) return;
    
    try {
      const token = localStorage.getItem('token');
      
      if (resourceType === 'book') {
        await axios.delete(`${API_BASE_URL}/books/${resourceToDelete}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        fetchBooks();
      } else {
        await axios.delete(`${API_BASE_URL}/verses/${resourceToDelete}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        fetchVerses();
      }
      
      toast({
        title: 'Success',
        description: `${resourceType === 'book' ? 'Book' : 'Bible verse'} deleted successfully!`,
      });
      
    } catch (error) {
      console.error(`Error deleting ${resourceType}:`, error);
      toast({
        title: 'Error',
        description: `Failed to delete ${resourceType}. Please try again.`,
        variant: 'destructive',
      });
    } finally {
      setDeleteDialogOpen(false);
      setResourceToDelete(null);
    }
  };

  const resetBookForm = () => {
    setBookForm({
      title: '',
      author: '',
      description: '',
      fileUrl: '',
      coverUrl: '',
    });
    setSelectedFile(null);
    setSelectedCover(null);
    setIsEditingBook(false);
    setCurrentBookId(null);
  };

  const resetVerseForm = () => {
    setVerseForm({
      reference: '',
      text: '',
      translation: 'NIV',
    });
    setIsEditingVerse(false);
    setCurrentVerseId(null);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminHeader />
      
      <main className="container mx-auto px-4 py-8">
        <div className="flex items-center mb-6">
          <Button 
            variant="ghost" 
            onClick={() => navigate('/admin/dashboard')}
            className="mr-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Button>
          <h1 className="text-2xl font-serif font-bold">Manage Resources</h1>
        </div>

        <Tabs defaultValue="books" onValueChange={(value) => {
          setActiveTab(value);
          // Reset the inner tabs when switching between books/verses
          setBooksTab('list');
          setVersesTab('list');
        }}>
          <TabsList className="mb-6">
            <TabsTrigger value="books">Books</TabsTrigger>
            <TabsTrigger value="verses">Bible Verses</TabsTrigger>
          </TabsList>

          <TabsContent value="books">
          <Tabs value={booksTab} onValueChange={setBooksTab}>
              <TabsList className="mb-6">
                <TabsTrigger value="list">All Books</TabsTrigger>
                <TabsTrigger value="create">{isEditingBook ? 'Edit Book' : 'Add New Book'}</TabsTrigger>
              </TabsList>

              <TabsContent value="list">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-medium">Digital Books</h2>

<Button onClick={() => {
  resetBookForm();
  setBooksTab('create');
}}>
  <Plus className="h-4 w-4 mr-2" />
  Add New Book
</Button>

                </div>

                {loading ? (
                  <div className="flex justify-center items-center h-64">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-church-navy"></div>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {books.length === 0 ? (
                      <Card className="col-span-full">
                        <CardContent className="py-8 text-center">
                          <p className="text-gray-500">No books found. Add your first resource!</p>
                        </CardContent>
                      </Card>
                    ) : (
                      books.map((book) => (
                        <Card key={book._id} className="overflow-hidden">
                          <div className="h-48 overflow-hidden">
                            <img 
                              src={book.coverUrl} 
                              alt={book.title}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <CardHeader className="pb-2">
                            <CardTitle className="text-lg">{book.title}</CardTitle>
                            <p className="text-sm text-gray-600">by {book.author}</p>
                          </CardHeader>
                          <CardContent className="pt-0">
                            <p className="text-gray-600 text-sm mb-4">
                              {book.description.length > 100
                                ? `${book.description.substring(0, 100)}...`
                                : book.description}
                            </p>
                            <div className="flex justify-between items-center">
                              <a 
                                href={book.fileUrl} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="text-xs text-blue-600 hover:underline flex items-center"
                              >
                                <Book className="h-3 w-3 mr-1" /> View PDF
                              </a>
                              <div className="flex space-x-2">
                                <Button 
                                  variant="outline" 
                                  size="sm"
                                  onClick={() => handleEditBook(book)}
                                >
                                  <Pencil className="h-4 w-4 mr-1" /> Edit
                                </Button>
                                <Button 
                                  variant="destructive" 
                                  size="sm"
                                  onClick={() => openDeleteDialog(book._id, 'book')}
                                >
                                  <Trash2 className="h-4 w-4 mr-1" /> Delete
                                </Button>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))
                    )}
                  </div>
                )}
              </TabsContent>

              <TabsContent value="create">
                <Card>
                  <CardHeader>
                    <CardTitle>{isEditingBook ? 'Edit Book' : 'Add New Book'}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <form onSubmit={handleBookSubmit} className="space-y-4">
                      <div>
                        <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
                          Book Title
                        </label>
                        <Input
                          id="title"
                          name="title"
                          value={bookForm.title}
                          onChange={handleBookInputChange}
                          placeholder="Enter book title"
                          required
                        />
                      </div>
                      
                      <div>
                        <label htmlFor="author" className="block text-sm font-medium text-gray-700 mb-1">
                          Author
                        </label>
                        <Input
                          id="author"
                          name="author"
                          value={bookForm.author}
                          onChange={handleBookInputChange}
                          placeholder="Author name"
                          required
                        />
                      </div>
                      
                      <div>
                        <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                          Description
                        </label>
                        <Textarea
                          id="description"
                          name="description"
                          value={bookForm.description}
                          onChange={handleBookInputChange}
                          placeholder="Brief description of the book..."
                          rows={3}
                          required
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Book File (PDF)
                        </label>
                        {bookForm.fileUrl && (
                          <div className="mb-2 text-sm">
                            <a 
                              href={bookForm.fileUrl} 
                              target="_blank" 
                              rel="noopener noreferrer" 
                              className="text-blue-600 hover:underline"
                            >
                              View uploaded file
                            </a>
                          </div>
                        )}
                        <div className="flex gap-2">
                          <Input
                            id="bookFile"
                            type="file"
                            onChange={(e) => handleFileChange(e, 'file')}
                            accept=".pdf"
                          />
                          <Button 
                            type="button" 
                            onClick={() => handleFileUpload('file')} 
                            disabled={!selectedFile || uploading}
                          >
                            {uploading ? 'Uploading...' : 'Upload'}
                          </Button>
                        </div>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Cover Image
                        </label>
                        {bookForm.coverUrl && (
                          <div className="mb-2">
                            <img 
                              src={bookForm.coverUrl} 
                              alt="Cover Preview" 
                              className="h-40 object-cover rounded-md"
                            />
                          </div>
                        )}
                        <div className="flex gap-2">
                          <Input
                            id="coverImage"
                            type="file"
                            onChange={(e) => handleFileChange(e, 'cover')}
                            accept="image/*"
                          />
                          <Button 
                            type="button" 
                            onClick={() => handleFileUpload('cover')} 
                            disabled={!selectedCover || uploading}
                          >
                            {uploading ? 'Uploading...' : 'Upload'}
                          </Button>
                        </div>
                      </div>
                      
                      <div className="flex justify-end space-x-2">
                        {isEditingBook && (
                          <Button 
                            type="button" 
                            variant="outline"
                            onClick={resetBookForm}
                          >
                            Cancel
                          </Button>
                        )}
                        <Button type="submit">
                          {isEditingBook ? 'Update' : 'Add Book'}
                        </Button>
                      </div>
                    </form>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </TabsContent>

          <TabsContent value="verses">
          <Tabs value={versesTab} onValueChange={setVersesTab}>
              <TabsList className="mb-6">
                <TabsTrigger value="list">All Bible Verses</TabsTrigger>
                <TabsTrigger value="create">{isEditingVerse ? 'Edit Verse' : 'Add New Verse'}</TabsTrigger>
              </TabsList>   

              <TabsContent value="list">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-medium">Bible Verses</h2>

<Button onClick={() => {
  resetVerseForm();
  setVersesTab('create');
}}>
  <Plus className="h-4 w-4 mr-2" />
  Add New Verse
</Button>
                </div>

                {loading ? (
                  <div className="flex justify-center items-center h-64">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-church-navy"></div>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {verses.length === 0 ? (
                      <Card className="col-span-full">
                        <CardContent className="py-8 text-center">
                          <p className="text-gray-500">No Bible verses found. Add your first verse!</p>
                        </CardContent>
                      </Card>
                    ) : (
                      verses.map((verse) => (
                        <Card key={verse._id} className="overflow-hidden">
                          <CardHeader className="pb-1 bg-gray-50 flex flex-row items-center justify-between">
                            <div>
                              <CardTitle className="text-lg">{verse.reference}</CardTitle>
                              <p className="text-xs text-gray-500">{verse.translation}</p>
                            </div>
                            <BookText className="h-6 w-6 text-church-gold opacity-50" />
                          </CardHeader>
                          <CardContent className="pt-4">
                            <p className="text-gray-700 italic mb-4">
                              "{verse.text}"
                            </p>
                            <div className="flex justify-end space-x-2">
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => handleEditVerse(verse)}
                              >
                                <Pencil className="h-4 w-4 mr-1" /> Edit
                              </Button>
                              <Button 
                                variant="destructive" 
                                size="sm"
                                onClick={() => openDeleteDialog(verse._id, 'verse')}
                              >
                                <Trash2 className="h-4 w-4 mr-1" /> Delete
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                      ))
                    )}
                  </div>
                )}
              </TabsContent>

              <TabsContent value="create">
                <Card>
                  <CardHeader>
                    <CardTitle>{isEditingVerse ? 'Edit Bible Verse' : 'Add New Bible Verse'}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <form onSubmit={handleVerseSubmit} className="space-y-4">
                      <div>
                        <label htmlFor="reference" className="block text-sm font-medium text-gray-700 mb-1">
                          Reference
                        </label>
                        <Input
                          id="reference"
                          name="reference"
                          value={verseForm.reference}
                          onChange={handleVerseInputChange}
                          placeholder="e.g., John 3:16"
                          required
                        />
                      </div>
                      
                      <div>
                        <label htmlFor="text" className="block text-sm font-medium text-gray-700 mb-1">
                          Verse Text
                        </label>
                        <Textarea
                          id="text"
                          name="text"
                          value={verseForm.text}
                          onChange={handleVerseInputChange}
                          placeholder="Enter the Bible verse text..."
                          rows={4}
                          required
                        />
                      </div>
                      
                      <div>
                        <label htmlFor="translation" className="block text-sm font-medium text-gray-700 mb-1">
                          Translation
                        </label>
                        <Select 
                          value={verseForm.translation} 
                          onValueChange={handleVerseTranslationChange}
                        >
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="Select translation" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="NIV">NIV</SelectItem>
                            <SelectItem value="KJV">KJV</SelectItem>
                            <SelectItem value="ESV">ESV</SelectItem>
                            <SelectItem value="NLT">NLT</SelectItem>
                            <SelectItem value="NKJV">NKJV</SelectItem>
                            <SelectItem value="CSB">CSB</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div className="flex justify-end space-x-2">
                        {isEditingVerse && (
                          <Button 
                            type="button" 
                            variant="outline"
                            onClick={resetVerseForm}
                          >
                            Cancel
                          </Button>
                        )}
                        <Button type="submit">
                          {isEditingVerse ? 'Update' : 'Add Verse'}
                        </Button>
                      </div>
                    </form>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </TabsContent>
        </Tabs>
      </main>

      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Deletion</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this {resourceType === 'book' ? 'book' : 'Bible verse'}? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDelete}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminResources;