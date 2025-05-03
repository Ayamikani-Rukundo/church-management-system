
import React, { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Image as Gallery, Users, Bell, Book } from 'lucide-react';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { toast } = useToast();

  // Check if user is authenticated
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      toast({
        title: 'Authentication Error',
        description: 'Please login to access the admin dashboard.',
        variant: 'destructive',
      });
      navigate('/admin/login');
    }
  }, [navigate, toast]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    toast({
      title: 'Logged Out',
      description: 'You have been logged out successfully.',
    });
    navigate('/admin/login');
  };

  const adminFeatures = [
    {
      title: 'Manage Gallery',
      description: 'Upload, edit, or delete photos in the gallery.',
      icon: <Gallery className="h-10 w-10 text-church-gold" />,
      link: '/admin/gallery',
    },
    {
      title: 'Manage Leaders',
      description: 'Add, edit, or remove church leadership profiles.',
      icon: <Users className="h-10 w-10 text-church-gold" />,
      link: '/admin/leaders',
    },
    {
      title: 'Manage Announcements',
      description: 'Create and update church announcements.',
      icon: <Bell className="h-10 w-10 text-church-gold" />,
      link: '/admin/announcements',
    },
    {
      title: 'Manage Resources',
      description: 'Upload books and add Bible verses.',
      icon: <Book className="h-10 w-10 text-church-gold" />,
      link: '/admin/resources',
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-church-navy text-white p-4">
        <div className="container mx-auto flex justify-between items-center">
          <h1 className="text-xl font-serif">Admin Dashboard</h1>
          <div className="flex gap-4">
            <Link to="/">
              <Button variant="outline" className="bg-transparent text-white border-white hover:bg-white hover:text-church-navy">
                View Site
              </Button>
            </Link>
            <Button variant="ghost" onClick={handleLogout} className="text-white hover:bg-church-navy hover:text-church-gold">
              Logout
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <h2 className="text-2xl font-serif font-bold mb-8 text-church-navy">
          Welcome to the Admin Dashboard
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {adminFeatures.map((feature, index) => (
            <Link key={index} to={feature.link}>
              <Card className="h-full hover:shadow-lg transition-shadow duration-300">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-church-navy">
                    {feature.icon}
                    <span>{feature.title}</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600">{feature.description}</p>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </main>
    </div>
  );
};

export default AdminDashboard;
