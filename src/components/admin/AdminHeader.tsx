
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

const AdminHeader = () => {
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleLogout = () => {
    localStorage.removeItem('token');
    toast({
      title: 'Logged Out',
      description: 'You have been logged out successfully.',
    });
    navigate('/admin/login');
  };

  return (
    <header className="bg-church-navy text-white p-4">
      <div className="container mx-auto flex justify-between items-center">
        <div className="flex items-center gap-2">
          <h1 className="text-xl font-serif">Admin Dashboard</h1>
        </div>
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
  );
};

export default AdminHeader;
