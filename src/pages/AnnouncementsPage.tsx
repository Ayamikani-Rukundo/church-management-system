
import React, { useEffect, useState } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import PageHeader from '@/components/PageHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Bell } from 'lucide-react';
import axios from 'axios';

interface Announcement {
  _id: string;
  title: string;
  content: string;
  date: string;
}

const AnnouncementsPage = () => {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAnnouncements = async () => {
      try {
        console.log('Fetching announcements...');
        const response = await axios.get('http://localhost:5000/api/Announcements');
        console.log('Raw API response:', response);
        console.log('Announcements data type:', typeof response.data);
        console.log('Is array?', Array.isArray(response.data));
        
        // Handle different response formats
        if (Array.isArray(response.data)) {
          // Direct array response
          setAnnouncements(response.data);
        } else if (response.data && typeof response.data === 'object') {
          // Check if the data might be nested in a property
          const possibleArrays = Object.values(response.data).filter(val => Array.isArray(val));
          if (possibleArrays.length > 0) {
            console.log('Found array in response object:', possibleArrays[0]);
            setAnnouncements(possibleArrays[0] as Announcement[]);
          } else {
            // If we can't find an array, set empty array and show error
            console.error('Could not find an array in response:', response.data);
            setError('Received invalid data format from server.');
            setAnnouncements([]);
          }
        } else {
          // Fallback for any other format
          console.error('Expected array but got:', response.data);
          setError('Received invalid data format from server.');
          setAnnouncements([]);
        }
        setLoading(false);
      } catch (err) {
        console.error('Error fetching announcements:', err);
        setError('Failed to load announcements. Please try again later.');
        setAnnouncements([]);
        setLoading(false);
      }
    };

    fetchAnnouncements();
  }, []);

  return (
    <>
      <Header />
      <PageHeader
        title="Announcements"
        description="Stay updated with the latest news and events from our church community."
      />
      <main className="container mx-auto px-4 py-8">
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-church-navy"></div>
          </div>
        ) : error ? (
          <div className="text-center text-red-500">{error}</div>
        ) : (
          <>
            {announcements.length === 0 ? (
              <div className="text-center py-12">
                <Bell className="h-16 w-16 text-church-gold mx-auto mb-4" />
                <p className="text-gray-500 text-lg">No announcements available at this time.</p>
              </div>
            ) : (
              <div className="space-y-6">
                {announcements.map((announcement) => (
                  <Card key={announcement._id || Math.random()} className="hover:shadow-md transition-shadow">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-xl font-serif">{announcement.title}</CardTitle>
                      <p className="text-sm text-gray-500">
                        {new Date(announcement.date).toLocaleDateString()}
                      </p>
                    </CardHeader>
                    <CardContent>
                      <div className="text-gray-700 whitespace-pre-line">
                        {announcement.content}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </>
        )}
      </main>
      <Footer />
    </>
  );
};

export default AnnouncementsPage;
