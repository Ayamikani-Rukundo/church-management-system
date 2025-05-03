import React, { useEffect, useState, useRef } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import PageHeader from '@/components/PageHeader';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import axios from 'axios';

interface GalleryItem {
  _id: string;
  title: string;
  description: string;
  imageUrl: string;
  createdAt: string;
}

interface Pagination {
  currentPage: number;
  totalPages: number;
  totalItems: number;
}

const GalleryPage = () => {
  const [galleryItems, setGalleryItems] = useState<GalleryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [pagination, setPagination] = useState<Pagination>({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0
  });
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchGalleryItems = async (page = 1) => {
    try {
      setLoading(true);
      const response = await axios.get<{
        items: GalleryItem[];
        pagination: Pagination;
      }>(`http://localhost:5000/api/gallery?page=${page}`);
      
      const itemsWithCorrectUrls = response.data.items.map(item => ({
        ...item,
        imageUrl: item.imageUrl.startsWith('server/') 
          ? item.imageUrl.replace('server/', '/') 
          : item.imageUrl
      }));
      
      setGalleryItems(itemsWithCorrectUrls);
      setPagination(response.data.pagination);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching gallery items:', err);
      setError('Failed to load gallery items. Please try again later.');
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGalleryItems();
  }, []);

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    const files = fileInputRef.current?.files;
    if (!files || files.length === 0) return;

    setUploading(true);
    setUploadError(null);

    const formData = new FormData();
    formData.append('file', files[0]);
    formData.append('title', `Image ${new Date().toLocaleDateString()}`);
    formData.append('description', 'Uploaded via gallery page');

    try {
      await axios.post('http://localhost:5000/api/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      fetchGalleryItems(pagination.currentPage); // Refresh current page
    } catch (err) {
      console.error('Upload failed:', err);
      setUploadError('Failed to upload image. Please try again.');
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= pagination.totalPages) {
      fetchGalleryItems(newPage);
    }
  };

  return (
    <>
      <Header />
      <PageHeader
        title="Photo Gallery"
        description="Moments captured from our church events, gatherings, and special occasions."
      />
      
      <main className="container mx-auto px-4 py-8">
        {/* Upload Section (Admin-only in real implementation) */}
        <div className="mb-8 p-4 bg-gray-50 rounded-lg">
          <h2 className="text-xl font-semibold mb-4">Upload New Image</h2>
          <form onSubmit={handleUpload} className="flex flex-col sm:flex-row gap-4">
            <Input
              type="file"
              ref={fileInputRef}
              accept="image/*"
              className="flex-1"
            />
            <Button 
              type="submit" 
              disabled={uploading}
              className="bg-church-navy hover:bg-church-navy-dark"
            >
              {uploading ? 'Uploading...' : 'Upload'}
            </Button>
          </form>
          {uploadError && <p className="mt-2 text-red-500">{uploadError}</p>}
        </div>

        {/* Gallery Content */}
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-church-navy"></div>
          </div>
        ) : error ? (
          <div className="text-center text-red-500">{error}</div>
        ) : (
          <>
            {galleryItems.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-500 text-lg">No gallery items available yet.</p>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {galleryItems.map((item) => (
                    <Card key={item._id} className="overflow-hidden hover:shadow-lg transition-shadow duration-300">
                      <div className="aspect-w-16 aspect-h-9">
                        <img
                          src={`http://localhost:5000${item.imageUrl}`}
                          alt={item.title}
                          className="w-full h-64 object-cover"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = '/placeholder-image.jpg';
                          }}
                        />
                      </div>
                      <CardContent className="p-4">
                        <h3 className="text-xl font-serif font-semibold mb-2">{item.title}</h3>
                        <p className="text-gray-600">{item.description}</p>
                        <p className="text-sm text-gray-400 mt-2">
                          {new Date(item.createdAt).toLocaleDateString()}
                        </p>
                      </CardContent>
                    </Card>
                  ))}
                </div>

                {/* Pagination Controls */}
                {pagination.totalPages > 1 && (
                  <div className="flex justify-center mt-8 gap-2">
                    <Button
                      variant="outline"
                      disabled={pagination.currentPage === 1}
                      onClick={() => handlePageChange(pagination.currentPage - 1)}
                    >
                      Previous
                    </Button>
                    <div className="flex items-center px-4">
                      Page {pagination.currentPage} of {pagination.totalPages}
                    </div>
                    <Button
                      variant="outline"
                      disabled={pagination.currentPage === pagination.totalPages}
                      onClick={() => handlePageChange(pagination.currentPage + 1)}
                    >
                      Next
                    </Button>
                  </div>
                )}
              </>
            )}
          </>
        )}
      </main>
      <Footer />
    </>
  );
};

export default GalleryPage;