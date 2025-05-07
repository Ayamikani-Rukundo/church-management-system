
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Pencil, Trash2, ArrowLeft, Plus } from 'lucide-react';
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

interface Announcement {
  _id: string;
  title: string;
  content: string;
  date: string;
}

const AdminAnnouncements = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    date: new Date().toISOString().split('T')[0],
  });
  const [isEditing, setIsEditing] = useState(false);
  const [currentId, setCurrentId] = useState<string | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [announcementToDelete, setAnnouncementToDelete] = useState<string | null>(null);

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

    fetchAnnouncements();
  }, [navigate, toast]);

  const fetchAnnouncements = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await axios.get('/api/announcements', {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      if (Array.isArray(response.data)) {
        setAnnouncements(response.data);
      } else if (response.data && typeof response.data === 'object') {
        const possibleArrays = Object.values(response.data).filter(val => Array.isArray(val));
        if (possibleArrays.length > 0) {
          setAnnouncements(possibleArrays[0] as Announcement[]);
        } else {
          setAnnouncements([]);
          toast({
            title: 'Data Error',
            description: 'Received invalid data format from server.',
            variant: 'destructive',
          });
        }
      } else {
        setAnnouncements([]);
      }
    } catch (error) {
      console.error('Error fetching announcements:', error);
      toast({
        title: 'Error',
        description: 'Failed to load announcements. Please try again.',
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      
      if (isEditing && currentId) {
        await axios.put(`/api/announcements/${currentId}`, formData, {
          headers: { Authorization: `Bearer ${token}` },
        });
        
        toast({
          title: 'Success',
          description: 'Announcement updated successfully!',
        });
      } else {
        await axios.post('/api/announcements', formData, {
          headers: { Authorization: `Bearer ${token}` },
        });
        
        toast({
          title: 'Success',
          description: 'Announcement created successfully!',
        });
      }
      
      // Reset form and fetch updated list
      setFormData({
        title: '',
        content: '',
        date: new Date().toISOString().split('T')[0],
      });
      setIsEditing(false);
      setCurrentId(null);
      fetchAnnouncements();
    } catch (error) {
      console.error('Error saving announcement:', error);
      toast({
        title: 'Error',
        description: 'Failed to save announcement. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const handleEdit = (announcement: Announcement) => {
    setFormData({
      title: announcement.title,
      content: announcement.content,
      date: new Date(announcement.date).toISOString().split('T')[0],
    });
    setIsEditing(true);
    setCurrentId(announcement._id);
  };

  const openDeleteDialog = (id: string) => {
    setAnnouncementToDelete(id);
    setDeleteDialogOpen(true);
  };

  const handleDelete = async () => {
    if (!announcementToDelete) return;
    
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`/api/announcements/${announcementToDelete}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      toast({
        title: 'Success',
        description: 'Announcement deleted successfully!',
      });
      
      fetchAnnouncements();
    } catch (error) {
      console.error('Error deleting announcement:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete announcement. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setDeleteDialogOpen(false);
      setAnnouncementToDelete(null);
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      content: '',
      date: new Date().toISOString().split('T')[0],
    });
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
          <h1 className="text-2xl font-serif font-bold">Manage Announcements</h1>
        </div>

        <Tabs defaultValue="list">
          <TabsList className="mb-6">
            <TabsTrigger value="list">All Announcements</TabsTrigger>
            <TabsTrigger value="create">{isEditing ? 'Edit Announcement' : 'Create New'}</TabsTrigger>
          </TabsList>

          <TabsContent value="list">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-medium">All Announcements</h2>
              <Button onClick={() => resetForm()}>
                <Plus className="h-4 w-4 mr-2" />
                Add New
              </Button>
            </div>

            {loading ? (
              <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-church-navy"></div>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4">
                {announcements.length === 0 ? (
                  <Card>
                    <CardContent className="py-8 text-center">
                      <p className="text-gray-500">No announcements found. Create your first announcement!</p>
                    </CardContent>
                  </Card>
                ) : (
                  announcements.map((announcement) => (
                    <Card key={announcement._id} className="overflow-hidden">
                      <CardHeader className="pb-2 bg-gray-50">
                        <CardTitle className="text-xl font-serif">
                          {announcement.title}
                        </CardTitle>
                        <p className="text-sm text-gray-500">
                          {new Date(announcement.date).toLocaleDateString()}
                        </p>
                      </CardHeader>
                      <CardContent className="pt-4">
                        <p className="text-gray-700 whitespace-pre-line mb-4">
                          {announcement.content.length > 200
                            ? `${announcement.content.substring(0, 200)}...`
                            : announcement.content}
                        </p>
                        <div className="flex justify-end space-x-2">
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => handleEdit(announcement)}
                          >
                            <Pencil className="h-4 w-4 mr-1" /> Edit
                          </Button>
                          <Button 
                            variant="destructive" 
                            size="sm"
                            onClick={() => openDeleteDialog(announcement._id)}
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
                <CardTitle>{isEditing ? 'Edit Announcement' : 'Create New Announcement'}</CardTitle>
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
                      placeholder="Announcement title"
                      required
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-1">
                      Date
                    </label>
                    <Input
                      id="date"
                      name="date"
                      type="date"
                      value={formData.date}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="content" className="block text-sm font-medium text-gray-700 mb-1">
                      Content
                    </label>
                    <Textarea
                      id="content"
                      name="content"
                      value={formData.content}
                      onChange={handleInputChange}
                      placeholder="Write announcement content here..."
                      rows={6}
                      required
                    />
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
                      {isEditing ? 'Update' : 'Create'} Announcement
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
              Are you sure you want to delete this announcement? This action cannot be undone.
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

export default AdminAnnouncements;
