import React, { useEffect, useState } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import PageHeader from '@/components/PageHeader';
import { Card, CardContent } from '@/components/ui/card';
import axios from 'axios';

interface GalleryItem {
  _id: string;
  title: string;
  description: string;
  imageUrl: string;
  createdAt: string;
}

const GalleryPage = () => {
  const [galleryItems, setGalleryItems] = useState<GalleryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchGalleryItems = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/gallery');
        
        if (Array.isArray(response.data)) {
          // Validate items before setting state
          const validItems = response.data.filter(item => 
            item._id && item.title && item.imageUrl && item.createdAt
          );
          setGalleryItems(validItems);
        } else {
          throw new Error('Invalid data format received');
        }
      } catch (err) {
        console.error('Gallery fetch error:', err);
        setError(err.message || 'Failed to load gallery items');
        setGalleryItems([]);
      } finally {
        setLoading(false);
      }
    };

    fetchGalleryItems();
  }, []);

  return (
    <>
      <Header />
      <PageHeader
        title="Photo Gallery"
        description="Moments captured from our church events, gatherings, and special occasions."
      />
      <main className="container mx-auto px-4 py-8">
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-church-navy" />
          </div>
        ) : error ? (
          <div className="text-center text-red-500 p-4">{error}</div>
        ) : galleryItems.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">No gallery items available yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {galleryItems.map((item) => (
              <Card 
                key={item._id} 
                className="overflow-hidden hover:shadow-lg transition-shadow duration-300"
              >
                <div className="aspect-w-16 aspect-h-9">
                  <img
                    src={item.imageUrl}
                    alt={item.title || 'Gallery image'}
                    className="w-full h-64 object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = '/fallback-image.jpg';
                    }}
                  />
                </div>
                <CardContent className="p-4">
                  <h3 className="text-xl font-serif font-semibold mb-2">
                    {item.title || 'Untitled'}
                  </h3>
                  <p className="text-gray-600">
                    {item.description || 'No description available'}
                  </p>
                  <p className="text-sm text-gray-400 mt-2">
                    {item.createdAt ? 
                      new Date(item.createdAt).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      }) : 
                      'Date unavailable'}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>
      <Footer />
    </>
  );
};

export default GalleryPage;