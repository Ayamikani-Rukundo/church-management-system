import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Pencil, Trash2, ArrowLeft, Plus, Upload, Loader2 } from 'lucide-react';
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

interface Leader {
  _id: string;
  name: string;
  position: string;
  bio: string;
  imageUrl: string;
}

const API_BASE_URL = 'http://localhost:5000';

const AdminLeaders = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [leaders, setLeaders] = useState<Leader[]>([]);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    name: '',
    position: '',
    bio: '',
    imageUrl: '',
  });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [currentId, setCurrentId] = useState<string | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [leaderToDelete, setLeaderToDelete] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [activeTab, setActiveTab] = useState<string>("list");

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
    fetchLeaders();
  }, [navigate, toast]);

  const fetchLeaders = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_BASE_URL}/api/leaders`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      if (Array.isArray(response.data)) {
        setLeaders(response.data);
      } else {
        setLeaders([]);
        toast({
          title: 'Data Error',
          description: 'Received invalid data format from server.',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Error fetching leaders:', error);
      toast({
        title: 'Error',
        description: 'Failed to load leaders. Please try again.',
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
      toast({
        title: 'No File Selected',
        description: 'Please select an image file first',
        variant: 'destructive'
      });
      return;
    }
  
    try {
      setUploading(true);
      
      const formData = new FormData();
      formData.append('image', selectedFile);
  
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
  
      if (!response.data.success || !response.data.data?.url) {
        throw new Error(response.data.message || 'Invalid server response');
      }
  
      setFormData(prev => ({
        ...prev,
        imageUrl: response.data.data.url
      }));
  
      toast({
        title: 'Success',
        description: 'Image uploaded successfully!',
      });
  
    } catch (error) {
      console.error('Upload error:', error);
      toast({
        title: 'Upload Failed',
        description: error.response?.data?.message || error.message || 'Failed to upload image',
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
      if (!token) {
        navigate('/admin/login');
        return;
      }
  
      // Use the default church ID you created
      const defaultChurchId = "000000000000000000000001";
      
      // Prepare submission data
      const submissionData = {
        name: formData.name.trim(),
        position: formData.position.trim(),
        bio: formData.bio.trim(),
        imageUrl: formData.imageUrl,
        church: defaultChurchId // Using your default church ID
      };
  
      const url = isEditing && currentId
        ? `${API_BASE_URL}/api/leaders/${currentId}`
        : `${API_BASE_URL}/api/leaders`;
  
      const method = isEditing ? 'put' : 'post';
  
      const response = await axios[method](url, submissionData, {
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
  
      toast({
        title: 'Success',
        description: `Leader ${isEditing ? 'updated' : 'added'} successfully!`,
      });
  
      resetForm();
      setActiveTab("list");
      fetchLeaders();
  
    } catch (error) {
      console.error('Submission error:', error);
      
      let errorMessage = 'Failed to save leader. Please try again.';
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      }
  
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive'
      });
    }
  };

  const handleEdit = (leader: Leader) => {
    setFormData({
      name: leader.name,
      position: leader.position,
      bio: leader.bio,
      imageUrl: leader.imageUrl,
    });
    setIsEditing(true);
    setCurrentId(leader._id);
    setActiveTab("create");
  };

  const openDeleteDialog = (id: string) => {
    setLeaderToDelete(id);
    setDeleteDialogOpen(true);
  };

  const handleDelete = async () => {
    if (!leaderToDelete) return;
    
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`${API_BASE_URL}/api/leaders/${leaderToDelete}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      toast({
        title: 'Success',
        description: 'Leader deleted successfully!',
      });
      
      fetchLeaders();
    } catch (error) {
      console.error('Error deleting leader:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete leader. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setDeleteDialogOpen(false);
      setLeaderToDelete(null);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      position: '',
      bio: '',
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
          <h1 className="text-2xl font-serif font-bold">Manage Church Leaders</h1>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-6">
            <TabsTrigger value="list">All Leaders</TabsTrigger>
            <TabsTrigger value="create">{isEditing ? 'Edit Leader' : 'Add New Leader'}</TabsTrigger>
          </TabsList>

          <TabsContent value="list">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-medium">Church Leadership</h2>
              <Button onClick={() => { resetForm(); setActiveTab("create"); }}>
                <Plus className="h-4 w-4 mr-2" />
                Add New Leader
              </Button>
            </div>

            {loading ? (
              <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-church-navy"></div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {leaders.length === 0 ? (
                  <Card className="col-span-full">
                    <CardContent className="py-8 text-center">
                      <p className="text-gray-500">No leaders found. Add your first leader profile!</p>
                    </CardContent>
                  </Card>
                ) : (
                  leaders.map((leader) => (
                    <Card key={leader._id} className="overflow-hidden flex flex-col md:flex-row">
                      <div className="w-full md:w-1/3 aspect-square">
                        <img 
                          src={leader.imageUrl} 
                          alt={leader.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="flex-1 flex flex-col">
                        <CardHeader className="pb-2">
                          <CardTitle className="text-xl">{leader.name}</CardTitle>
                          <p className="text-sm font-medium text-church-gold">{leader.position}</p>
                        </CardHeader>
                        <CardContent className="flex-1 pt-0">
                          <p className="text-gray-600 text-sm">
                            {leader.bio.length > 150 
                              ? `${leader.bio.substring(0, 150)}...` 
                              : leader.bio}
                          </p>
                        </CardContent>
                        <CardContent className="pt-0 flex justify-end space-x-2">
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => handleEdit(leader)}
                          >
                            <Pencil className="h-4 w-4 mr-1" /> Edit
                          </Button>
                          <Button 
                            variant="destructive" 
                            size="sm"
                            onClick={() => openDeleteDialog(leader._id)}
                          >
                            <Trash2 className="h-4 w-4 mr-1" /> Delete
                          </Button>
                        </CardContent>
                      </div>
                    </Card>
                  ))
                )}
              </div>
            )}
          </TabsContent>

          <TabsContent value="create">
            <Card>
              <CardHeader>
                <CardTitle>{isEditing ? 'Edit Leader Profile' : 'Add New Leader'}</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                      Full Name
                    </label>
                    <Input
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      placeholder="Full name"
                      required
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="position" className="block text-sm font-medium text-gray-700 mb-1">
                      Position / Role
                    </label>
                    <Input
                      id="position"
                      name="position"
                      value={formData.position}
                      onChange={handleInputChange}
                      placeholder="e.g., Pastor, Elder, Youth Minister"
                      required
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="bio" className="block text-sm font-medium text-gray-700 mb-1">
                      Biography
                    </label>
                    <Textarea
                      id="bio"
                      name="bio"
                      value={formData.bio}
                      onChange={handleInputChange}
                      placeholder="Brief biography or introduction..."
                      rows={4}
                    />
                  </div>
                  
                  <div className="space-y-4">
  <div>
    <label className="block text-sm font-medium text-gray-700 mb-2">
      Profile Image
    </label>
    
    {formData.imageUrl ? (
      <div className="mb-3">
        <img
          src={formData.imageUrl}
          alt="Preview"
          className="h-32 w-32 object-cover rounded-md border"
        />
        <p className="text-sm text-green-600 mt-1">Image uploaded successfully</p>
      </div>
    ) : (
      <div className="flex items-center gap-3">
        <label className="flex-1 border rounded-md p-4 flex flex-col items-center cursor-pointer hover:bg-gray-50">
          <Upload className="h-6 w-6 text-gray-400 mb-2" />
          <span className="text-sm">
            {selectedFile ? selectedFile.name : 'Click to select image'}
          </span>
          <input
            type="file"
            className="hidden"
            onChange={handleFileChange}
            accept="image/*"
          />
        </label>
        
        <Button
          type="button"
          onClick={handleUpload}
          disabled={!selectedFile || uploading}
        >
          {uploading ? (
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          ) : null}
          {uploading ? 'Uploading...' : 'Upload'}
        </Button>
      </div>
    )}
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
                    <Button type="submit" disabled={!formData.imageUrl}>
                      {isEditing ? 'Update' : 'Add Leader'}
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
              Are you sure you want to delete this leader profile? This action cannot be undone.
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

export default AdminLeaders;