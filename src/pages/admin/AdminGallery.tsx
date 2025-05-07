
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

  useEffect(() => {
    // Check if user is authenticated
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

    fetchGallery();
  }, [navigate, toast]);

  const fetchGallery = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_BASE_URL}/api/gallery`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      // Ensure response.data is always an array
      const data = Array.isArray(response.data) ? response.data : [];
      setGallery(data);
      
    } catch (error) {
      console.error('Error:', error);
      setGallery([]); // Reset to empty array on error
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
      formData.append('image', selectedFile); // Changed from 'file' to 'image'
  
      const response = await axios.post(
        `${API_BASE_URL}/api/upload`,
        formData,
        {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
            'Content-Type': 'multipart/form-data'
          }
        }
      );
  
      setFormData(prev => ({
        ...prev,
        imageUrl: response.data.fileUrl
      }));
      
      toast({ title: 'Success', description: 'Image uploaded!' });
    } catch (error) {
      console.error('Upload failed:', error);
      toast({
        title: 'Upload Error',
        description: error.response?.data?.message || 'Upload failed',
        variant: 'destructive'
      });
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const token = localStorage.getItem('token');
      const data = new FormData(); // Renamed to avoid conflict
      data.append('title', formData.title);
      data.append('description', formData.description);
      
      // Only append image if new file was selected
      if (selectedFile) {
        data.append('image', selectedFile);
      } else if (formData.imageUrl) {
        // For edits when keeping existing image
        data.append('imageUrl', formData.imageUrl);
      }
  
      const url = isEditing && currentId 
        ? `${API_BASE_URL}/api/gallery/${currentId}`
        : `${API_BASE_URL}/api/gallery`;
  
      const method = isEditing ? 'put' : 'post';
      
      await axios[method](url, data, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      });
  
      toast({ title: 'Success', description: `Item ${isEditing ? 'updated' : 'added'}!` });
      resetForm();
      fetchGallery();
    } catch (error) {
      console.error('Save error:', error);
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to save',
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
  };

  const openDeleteDialog = (id: string) => {
    setItemToDelete(id);
    setDeleteDialogOpen(true);
  };

  const handleDelete = async () => {
    if (!itemToDelete) return;
    
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`${API_BASE_URL}/api/gallery/${itemToDelete}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      toast({
        title: 'Success',
        description: 'Gallery item deleted successfully!',
      });
      
      fetchGallery();
    } catch (error) {
      console.error('Error deleting gallery item:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete gallery item. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setDeleteDialogOpen(false);
      setItemToDelete(null);
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

        <Tabs defaultValue="list">
          <TabsList className="mb-6">
            <TabsTrigger value="list">All Photos</TabsTrigger>
            <TabsTrigger value="create">{isEditing ? 'Edit Photo' : 'Add New Photo'}</TabsTrigger>
          </TabsList>

          <TabsContent value="list">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-medium">Gallery Photos</h2>
              <Button onClick={() => resetForm()}>
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
  {/* First check if gallery exists, then check length */}
  {!gallery || gallery.length === 0 ? (
    <Card className="col-span-full">
      <CardContent className="py-8 text-center">
        <p className="text-gray-500">No gallery items found. Add your first photo!</p>
      </CardContent>
    </Card>
  ) : (
    gallery.map((item) => (
      <Card key={item._id} className="overflow-hidden">
        <div className="aspect-square overflow-hidden">
          <img 
            src={item.imageUrl} 
            alt={item.title}
            className="w-full h-full object-cover transition-transform hover:scale-105"
            onError={(e) => {
              (e.target as HTMLImageElement).src = '/fallback-image.jpg';
            }}
          />
        </div>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg">{item.title || 'Untitled'}</CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <p className="text-gray-600 text-sm">
            {item.description?.substring(0, 100) || 'No description'}
          </p>
        </CardContent>
          <CardFooter className="flex justify-end space-x-2 pt-2">
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
                          onClick={() => openDeleteDialog(item._id)}
                        >
                          <Trash2 className="h-4 w-4 mr-1" /> Delete
                        </Button>
          </CardFooter>
      </Card>
    ))
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
                      Title
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
                      Description
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
                      Image
                    </label>
                    {formData.imageUrl && (
                      <div className="mb-2">
                        <img 
                          src={formData.imageUrl} 
                          alt="Preview" 
                          className="w-full max-h-60 object-cover rounded-md"
                        />
                      </div>
                    )}
                    <div className="flex gap-2">
                      <Input
                        id="image"
                        type="file"
                        onChange={handleFileChange}
                        accept="image/*"
                      />
                      <Button 
                        type="button" 
                        onClick={handleUpload} 
                        disabled={!selectedFile || uploading}
                      >
                        {uploading ? (
                          <div className="flex items-center">
                            <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2"></div>
                            Uploading...
                          </div>
                        ) : (
                          <>
                            <Upload className="h-4 w-4 mr-1" /> Upload
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                  
                  <div className="flex justify-end space-x-2">
                    {isEditing && (
                      <Button 
                        type="button" 
                        variant="outline"
                        onClick={resetForm}
                      >
                        Cancel
                      </Button>
                    )}
                    <Button type="submit">
                      {isEditing ? 'Update' : 'Add to Gallery'}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>

      {/* Delete confirmation dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Deletion</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this gallery item? This action cannot be undone.
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

export default AdminGallery;
