
import React from 'react';
import { Link } from 'react-router-dom';
import { Church } from 'lucide-react';

const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className="bg-church-navy text-white">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="col-span-1 md:col-span-1">
            <div className="flex items-center mb-4">
              <Church className="h-6 w-6 text-church-gold" />
              <span className="ml-2 text-xl font-serif font-bold">Campus Church</span>
            </div>
            <p className="text-sm text-gray-300">
              Connecting campus students with faith, community, and purpose.
            </p>
          </div>
          
          <div className="col-span-1">
            <h3 className="text-lg font-serif font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li><Link to="/" className="text-gray-300 hover:text-church-gold transition-colors">Home</Link></li>
              <li><Link to="/about" className="text-gray-300 hover:text-church-gold transition-colors">About Us</Link></li>
              <li><Link to="/announcements" className="text-gray-300 hover:text-church-gold transition-colors">Announcements</Link></li>
              <li><Link to="/gallery" className="text-gray-300 hover:text-church-gold transition-colors">Gallery</Link></li>
            </ul>
          </div>
          
          <div className="col-span-1">
            <h3 className="text-lg font-serif font-semibold mb-4">Connect</h3>
            <ul className="space-y-2">
              <li><Link to="/resources" className="text-gray-300 hover:text-church-gold transition-colors">Resources</Link></li>
              <li><Link to="/leaders" className="text-gray-300 hover:text-church-gold transition-colors">Church Leaders</Link></li>
            </ul>
          </div>
          
          <div className="col-span-1">
            <h3 className="text-lg font-serif font-semibold mb-4">Service Times</h3>
            <p className="text-gray-300 mb-2">Saturday: 9:30 AM - 12:30 PM</p>
            <p className="text-gray-300 mb-2">Bible Study: Wednesday 7:00 PM</p>
            <address className="text-gray-300 not-italic">
              Campus University<br />
              Student Center, Building 3<br />
              Room 101
            </address>
          </div>
        </div>
        
        <div className="border-t border-gray-700 mt-8 pt-8 text-center text-sm text-gray-300">
          <p>&copy; {currentYear} Campus Adventist Church. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
