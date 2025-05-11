import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Pencil, Trash2, ArrowLeft, Plus, Upload } from 'lucide-react';
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

const API_BASE_URL = 'http://localhost:5000';

interface GalleryItem {
  _id: string;
  title: string;
  description: string;
  imageUrl: string;
}

const AdminGallery = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [gallery, setGallery] = useState<GalleryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    imageUrl: '',
  });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [currentId, setCurrentId] = useState<string | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('list'); 

  // Get auth headers with proper error handling
  const getAuthHeaders = () => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/admin/login');
      throw new Error('No authentication token');
    }
    return {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'multipart/form-data'
      }
    };
  };

  useEffect(() => {
    fetchGallery();
  }, []);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/admin/login');
      return;
    }
    fetchGallery();
  }, [navigate]);

  const fetchGallery = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_BASE_URL}/api/gallery`, getAuthHeaders());
      setGallery(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.error('Error:', error);
      if (error.response?.status === 401) {
        navigate('/admin/login');
      }
      toast({
        title: 'Error',
        description: 'Failed to load gallery',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      toast({ title: 'Error', description: 'No file selected', variant: 'destructive' });
      return;
    }
  
    try {
      setUploading(true);
      const formData = new FormData();
      formData.append('image', selectedFile);

      const response = await axios.post(
        `${API_BASE_URL}/api/upload`,
        formData,
        getAuthHeaders()
      );
  
      setFormData(prev => ({
        ...prev,
        imageUrl: response.data.fileUrl
      }));
      
      toast({ title: 'Success', description: 'Image uploaded successfully!' });
    } catch (error) {
      console.error('Upload failed:', error);
      toast({
        title: 'Upload Error',
        description: error.response?.data?.message || 'Failed to upload image',
        variant: 'destructive'
      });
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const formPayload = new FormData();
      formPayload.append('title', formData.title);
      formPayload.append('description', formData.description);
      
      if (selectedFile) {
        formPayload.append('image', selectedFile);
      } else if (formData.imageUrl) {
        formPayload.append('imageUrl', formData.imageUrl);
      }

      const url = isEditing && currentId 
        ? `${API_BASE_URL}/api/gallery/${currentId}`
        : `${API_BASE_URL}/api/gallery`;

      const method = isEditing ? 'put' : 'post';
      
      await axios[method](url, formPayload, getAuthHeaders());

      toast({ 
        title: 'Success', 
        description: `Item ${isEditing ? 'updated' : 'added'} successfully!` 
      });
      
      resetForm();
      fetchGallery();
      setActiveTab('list');
    } catch (error) {
      console.error('Save error:', error);
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to save changes',
        variant: 'destructive'
      });
    }
  };

  const handleEdit = (item: GalleryItem) => {
    setFormData({
      title: item.title,
      description: item.description,
      imageUrl: item.imageUrl,
    });
    setIsEditing(true);
    setCurrentId(item._id);
    setActiveTab('create');
    setSelectedFile(null);
  };

  const handleDelete = async () => {
    if (!itemToDelete) return;
    
    try {
      setDeleteLoading(true);
      await axios.delete(`${API_BASE_URL}/api/gallery/${itemToDelete}`, getAuthHeaders());
      
      toast({
        title: 'Success',
        description: 'Gallery item deleted successfully!',
      });
      
      fetchGallery();
    } catch (error) {
      console.error('Delete error:', error);
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to delete item',
        variant: 'destructive',
      });
    } finally {
      setDeleteDialogOpen(false);
      setItemToDelete(null);
      setDeleteLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      imageUrl: '',
    });
    setSelectedFile(null);
    setIsEditing(false);
    setCurrentId(null);
  };

  const handleAddNewClick = () => {
    resetForm();
    setActiveTab('create');
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
          <h1 className="text-2xl font-serif font-bold">Manage Gallery</h1>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-6">
            <TabsTrigger value="list">All Photos</TabsTrigger>
            <TabsTrigger value="create">{isEditing ? 'Edit Photo' : 'Add New Photo'}</TabsTrigger>
          </TabsList>

          <TabsContent value="list">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-medium">Gallery Photos</h2>
              <Button onClick={handleAddNewClick}>
                <Plus className="h-4 w-4 mr-2" />
                Add New Photo
              </Button>
            </div>

            {loading ? (
              <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-church-navy"></div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {gallery.length > 0 ? (
                  gallery.map((item) => (
                    <Card key={item._id} className="overflow-hidden group">
                      <div className="aspect-square overflow-hidden relative">
                        <img 
                          src={item.imageUrl} 
                          alt={item.title}
                          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = '/fallback-image.jpg';
                          }}
                        />
                      </div>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-lg">{item.title || 'Untitled'}</CardTitle>
                      </CardHeader>
                      <CardContent className="pt-0">
                        <p className="text-gray-600 text-sm line-clamp-2">
                          {item.description || 'No description'}
                        </p>
                      </CardContent>
                      <CardFooter className="flex justify-end gap-2 pt-2">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleEdit(item)}
                        >
                          <Pencil className="h-4 w-4 mr-1" /> Edit
                        </Button>
                        <Button 
                          variant="destructive" 
                          size="sm"
                          onClick={() => {
                            setItemToDelete(item._id);
                            setDeleteDialogOpen(true);
                          }}
                        >
                          <Trash2 className="h-4 w-4 mr-1" /> Delete
                        </Button>
                      </CardFooter>
                    </Card>
                  ))
                ) : (
                  <Card className="col-span-full">
                    <CardContent className="py-8 text-center">
                      <p className="text-gray-500">No gallery items found. Add your first photo!</p>
                    </CardContent>
                  </Card>
                )}
              </div>
            )}
          </TabsContent>

          <TabsContent value="create">
            <Card>
              <CardHeader>
                <CardTitle>{isEditing ? 'Edit Gallery Item' : 'Add New Gallery Item'}</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
                      Title *
                    </label>
                    <Input
                      id="title"
                      name="title"
                      value={formData.title}
                      onChange={handleInputChange}
                      placeholder="Photo title"
                      required
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                      Description *
                    </label>
                    <Textarea
                      id="description"
                      name="description"
                      value={formData.description}
                      onChange={handleInputChange}
                      placeholder="Brief description of the photo..."
                      rows={3}
                      required
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="image" className="block text-sm font-medium text-gray-700 mb-1">
                      Image *
                    </label>
                    {formData.imageUrl ? (
                      <div className="mb-4">
                        <img 
                          src={formData.imageUrl} 
                          alt="Current preview" 
                          className="w-full max-h-60 object-contain rounded-md border"
                        />
                        <p className="text-xs text-muted-foreground mt-1">
                          Current image (upload new one to replace)
                        </p>
                      </div>
                    ) : null}
                    <div className="flex gap-2">
                      <Input
                        id="image"
                        type="file"
                        onChange={handleFileChange}
                        accept="image/*"
                        className="cursor-pointer"
                      />
                      <Button 
                        type="button" 
                        onClick={handleUpload} 
                        disabled={!selectedFile || uploading}
                        className="min-w-[100px]"
                      >
                        {uploading ? (
                          <>
                            <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2"></div>
                            Uploading
                          </>
                        ) : (
                          <>
                            <Upload className="h-4 w-4 mr-1" /> Upload
                          </>
                        )}
                      </Button>
                    </div>
                    {!formData.imageUrl && (
                      <p className="text-xs text-muted-foreground mt-1">
                        Please upload an image before submitting
                      </p>
                    )}
                  </div>
                  
                  <div className="flex justify-end gap-2 pt-4">
                    <Button 
                      type="button" 
                      variant="outline"
                      onClick={() => {
                        resetForm();
                        setActiveTab('list');
                      }}
                    >
                      Cancel
                    </Button>
                    <Button 
                      type="submit"
                      disabled={
                        !formData.title || 
                        !formData.description || 
                        (!formData.imageUrl && !selectedFile)
                      }
                    >
                      {isEditing ? 'Update Gallery Item' : 'Add to Gallery'}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>

      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Deletion</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this gallery item? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setDeleteDialogOpen(false)}
              disabled={deleteLoading}
            >
              Cancel
            </Button>
            <Button 
              variant="destructive" 
              onClick={handleDelete}
              disabled={deleteLoading}
            >
              {deleteLoading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2"></div>
                  Deleting...
                </>
              ) : (
                'Delete Permanently'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminGallery;