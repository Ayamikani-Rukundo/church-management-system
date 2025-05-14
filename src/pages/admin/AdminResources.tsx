import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Pencil, Trash2, ArrowLeft, Plus, Book, BookText } from 'lucide-react';
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
import { Upload, Loader2, File, Image } from 'lucide-react';

const API_BASE_URL = 'http://localhost:5000/api';

interface BookResource {
  _id: string;
  title: string;
  author: string;
  description: string;
  fileUrl: string;
  coverImage: string;
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
    coverImage: '',
    pendingFile: null as File | null, // Add this line
    pendingCover: null as File | null // Add for cover image too
  });

  const [verseForm, setVerseForm] = useState({
    reference: '',
    text: '',
    translation: 'NIV'
  });

  const [isEditingBook, setIsEditingBook] = useState(false);
  const [isEditingVerse, setIsEditingVerse] = useState(false);
  const [currentBookId, setCurrentBookId] = useState<string | null>(null);
  const [currentVerseId, setCurrentVerseId] = useState<string | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [resourceToDelete, setResourceToDelete] = useState<string | null>(null);
  const [resourceType, setResourceType] = useState<'book' | 'verse'>('book');
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [booksTab, setBooksTab] = useState('list');
  const [versesTab, setVersesTab] = useState('list');

  const bookFileInputRef = useRef<HTMLInputElement>(null);
  const coverImageInputRef = useRef<HTMLInputElement>(null);

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

    // Handle both response formats for backward compatibility
    const booksData = Array.isArray(response.data) 
      ? response.data 
      : response.data.data || [];
    
    setBooks(booksData);
  } catch (error) {
    console.error('Error fetching books:', error);
    toast({
      title: 'Error',
      description: 'Failed to load books. Please try again.',
      variant: 'destructive',
    });
    setBooks([]);
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

  const handleFileUpload = async (type: 'book' | 'cover') => {
    const fileInput = type === 'book' ? bookFileInputRef.current : coverImageInputRef.current;
    const file = fileInput?.files?.[0];

    if (!file) {
      toast({
        title: 'Error',
        description: 'Please select a file first',
        variant: 'destructive'
      });
      return;
    }

    // Validate file type
    const allowedTypes = type === 'book' 
      ? ['application/pdf'] 
      : ['image/jpeg', 'image/png'];
    
    if (!allowedTypes.includes(file.type)) {
      toast({
        title: 'Invalid File',
        description: type === 'book' 
          ? 'Only PDF files are allowed for books' 
          : 'Only JPG and PNG images are allowed for covers',
        variant: 'destructive'
      });
      return;
    }

    const formData = new FormData();
    formData.append('file', file);

    try {
      setIsUploading(true);
      setUploadProgress(0);

      const res = await axios.post(`${API_BASE_URL}/books/upload-file`, formData, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'multipart/form-data'
        },
        onUploadProgress: (progressEvent) => {
          const percent = Math.round(
            (progressEvent.loaded * 100) / (progressEvent.total || 100)
          );
          setUploadProgress(percent);
        }
      });

      setBookForm(prev => ({
        ...prev,
        [type === 'book' ? 'fileUrl' : 'coverImage']: res.data.url
      }));

      toast({
        title: 'Success',
        description: `${type === 'book' ? 'Book file' : 'Cover image'} uploaded!`,
      });

    } catch (error) {
      toast({
        title: 'Upload Failed',
        description: error.response?.data?.message || 'Failed to upload file',
        variant: 'destructive'
      });
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  const handleBookSubmit = async (e: React.FormEvent) => {
  e.preventDefault();

  // Only show error if either one of the files is missing
  if (!bookForm.fileUrl?.trim() || !bookForm.coverImage?.trim()) {
    toast({
      title: 'Required',
      description: 'Please upload both a book file and cover image.',
      variant: 'destructive',
    });
    return;
  }

  try {
    setIsSubmitting(true);

    const endpoint = isEditingBook && currentBookId
      ? `http://localhost:5000/api/books/${currentBookId}`
      : `http://localhost:5000/api/books`;

    const method = isEditingBook ? 'put' : 'post';

    const bookData = {
      title: bookForm.title,
      author: bookForm.author,
      description: bookForm.description,
      fileUrl: bookForm.fileUrl,
      coverImage: bookForm.coverImage,
      category: bookForm.category || 'general', // Default category
    };

    const response = await axios({
      method,
      url: endpoint,
      data: bookData,
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
        'Content-Type': 'application/json',
      },
    });

    toast({
      title: 'Success',
      description: `Book ${isEditingBook ? 'updated' : 'added'} successfully!`,
    });

    resetBookForm();
    fetchBooks();
    setBooksTab('list');
  } catch (error: any) {
    console.error('Error saving book:', error);
    toast({
      title: 'Error',
      description: error.response?.data?.message || 'Failed to save book.',
      variant: 'destructive',
    });
  } finally {
    setIsSubmitting(false);
  }
};


  const handleVerseSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const endpoint = isEditingVerse && currentVerseId
        ? `${API_BASE_URL}/verses/${currentVerseId}`
        : `${API_BASE_URL}/verses`;

      const method = isEditingVerse ? 'put' : 'post';

      const response = await axios({
        method,
        url: endpoint,
        data: {
          reference: verseForm.reference,
          text: verseForm.text,
          translation: verseForm.translation
        },
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      });

      toast({
        title: 'Success',
        description: `Verse ${isEditingVerse ? 'updated' : 'added'} successfully!`
      });
      
      resetVerseForm();
      fetchVerses();
      setVersesTab('list');

    } catch (error) {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to save verse',
        variant: 'destructive'
      });
    }
  };

  const handleEditBook = (book: BookResource) => {
    setBookForm({
      title: book.title,
      author: book.author,
      description: book.description,
      fileUrl: book.fileUrl,
      coverImage: book.coverImage
    });
    setIsEditingBook(true);
    setCurrentBookId(book._id);
    setBooksTab('create');
  };

  const handleEditVerse = (verse: BibleVerse) => {
    setVerseForm({
      reference: verse.reference,
      text: verse.text,
      translation: verse.translation,
    });
    setIsEditingVerse(true);
    setCurrentVerseId(verse._id);
    setVersesTab('create');
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
      coverImage: '',
    });
    if (bookFileInputRef.current) bookFileInputRef.current.value = '';
    if (coverImageInputRef.current) coverImageInputRef.current.value = '';
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
                              src={book.coverImage} 
                              alt={book.title}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                (e.target as HTMLImageElement).src = '/placeholder-cover.jpg';
                              }}
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
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Book File (PDF)
                        </label>
  <div className="flex items-center gap-2">
  <input
    type="file"
    ref={bookFileInputRef}
    accept=".pdf"
    className="hidden"
    onChange={(e) => {
      // Just store the file, don't upload yet
      if (e.target.files?.[0]) {
        setBookForm(prev => ({
          ...prev,
          pendingFile: e.target.files?.[0] // Store the file object
        }));
      }
    }}
  />
  
  <Button
    variant="outline"
    onClick={() => bookFileInputRef.current?.click()}
    disabled={isUploading}
  >
    {bookForm.fileUrl ? 'Change PDF' : 'Select PDF'}
  </Button>

  {/* Upload button appears only after file selection */}
  {bookForm.pendingFile && !bookForm.fileUrl && (
    <Button
      onClick={() => handleFileUpload('book')}
      disabled={isUploading}
    >
      {isUploading ? (
        <>
          <Loader2 className="h-4 w-4 animate-spin mr-2" />
          {uploadProgress}%
        </>
      ) : 'Upload PDF'}
    </Button>
  )}

  {/* Success indicator */}
  {bookForm.fileUrl && !isUploading && (
    <div className="flex items-center text-sm text-green-600">
      <File className="h-4 w-4 mr-1" />
      <span>PDF Ready</span>
    </div>
  )}
</div>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Cover Image
                        </label>
                        {bookForm.coverImage && (
                          <div className="mb-2">
                            <img 
                              src={bookForm.coverImage} 
                              alt="Cover Preview" 
                              className="h-40 object-cover rounded-md"
                              onError={(e) => {
                                (e.target as HTMLImageElement).src = '/placeholder-cover.jpg';
                              }}
                            />
                          </div>
                        )}
                        <div className="flex items-center gap-2">
                          <input
                            type="file"
                            ref={coverImageInputRef}
                            accept="image/*"
                            className="hidden"
                          />
                          <Button
                            variant="outline"
                            onClick={() => coverImageInputRef.current?.click()}
                          >
                            {bookForm.coverImage ? 'Change Image' : 'Select Image'}
                          </Button>
                          {bookForm.coverImage ? (
                            <div className="flex items-center text-sm text-green-600">
                              <Image className="h-4 w-4 mr-1" />
                              <span>Image Uploaded</span>
                            </div>
                          ) : (
                            <Button
                              type="button"
                              onClick={() => handleFileUpload('cover')}
                              disabled={!coverImageInputRef.current?.files?.length || isUploading}
                            >
                              {isUploading ? (
                                <>
                                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                  {uploadProgress}%
                                </>
                              ) : 'Upload'}
                            </Button>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex justify-end space-x-2">
                        <Button 
                          type="button" 
                          variant="outline"
                          onClick={() => {
                            resetBookForm();
                            setBooksTab('list');
                          }}
                        >
                          Cancel
                        </Button>
                        <Button 
                          type="submit" 
                          disabled={isSubmitting || !bookForm.fileUrl || !bookForm.coverImage}
                        >
                          {isSubmitting ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              Processing...
                            </>
                          ) : isEditingBook ? 'Update Book' : 'Add Book'}
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
                        <Button 
                          type="button" 
                          variant="outline"
                          onClick={() => {
                            resetVerseForm();
                            setVersesTab('list');
                          }}
                        >
                          Cancel
                        </Button>
                        <Button type="submit" disabled={isSubmitting}>
                          {isSubmitting ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              Processing...
                            </>
                          ) : isEditingVerse ? 'Update Verse' : 'Add Verse'}
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