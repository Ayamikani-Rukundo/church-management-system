
import React, { useEffect, useState } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import PageHeader from '@/components/PageHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Book } from 'lucide-react';
import axios from 'axios';

interface Book {
  _id: string;
  title: string;
  author: string;
  description: string;
  imageUrl: string;
  fileUrl?: string;
}

interface Verse {
  _id: string;
  reference: string;
  text: string;
  createdAt: string;
}

const ResourcesPage = () => {
  const [books, setBooks] = useState<Book[]>([]);
  const [verses, setVerses] = useState<Verse[]>([]);
  const [loading, setLoading] = useState({
    books: true,
    verses: true,
  });
  const [error, setError] = useState<{
    books: string | null;
    verses: string | null;
  }>({
    books: null,
    verses: null,
  });

  useEffect(() => {
    const fetchBooks = async () => {
      try {
        const response = await axios.get<Book[]>('/api/books');
        setBooks(response.data);
        setLoading(prev => ({ ...prev, books: false }));
      } catch (err) {
        console.error('Error fetching books:', err);
        setError(prev => ({ ...prev, books: 'Failed to load books. Please try again later.' }));
        setLoading(prev => ({ ...prev, books: false }));
      }
    };

    const fetchVerses = async () => {
      try {
        const response = await axios.get<Verse[]>('/api/verses');
        setVerses(response.data);
        setLoading(prev => ({ ...prev, verses: false }));
      } catch (err) {
        console.error('Error fetching verses:', err);
        setError(prev => ({ ...prev, verses: 'Failed to load verses. Please try again later.' }));
        setLoading(prev => ({ ...prev, verses: false }));
      }
    };

    fetchBooks();
    fetchVerses();
  }, []);

  return (
    <>
      <Header />
      <PageHeader
        title="Spiritual Resources"
        description="Books, Bible verses, and other resources to nurture your spiritual growth."
      />
      <main className="container mx-auto px-4 py-8">
        <Tabs defaultValue="books">
          <TabsList className="mx-auto mb-8 grid w-full max-w-md grid-cols-2">
            <TabsTrigger value="books">Books</TabsTrigger>
            <TabsTrigger value="verses">Bible Verses</TabsTrigger>
          </TabsList>
          
          <TabsContent value="books">
            {loading.books ? (
              <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-church-navy"></div>
              </div>
            ) : error.books ? (
              <div className="text-center text-red-500">{error.books}</div>
            ) : (
              <>
                {books.length === 0 ? (
                  <div className="text-center py-12">
                    <Book className="h-16 w-16 text-church-gold mx-auto mb-4" />
                    <p className="text-gray-500 text-lg">No books available at this time.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {books.map((book) => (
                      <Card key={book._id} className="overflow-hidden hover:shadow-lg transition-shadow duration-300">
                        <div className="h-48 overflow-hidden">
                          <img
                            src={book.imageUrl || '/placeholder.svg'}
                            alt={book.title}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <CardHeader className="pb-2">
                          <CardTitle className="font-serif">{book.title}</CardTitle>
                          <p className="text-sm text-gray-500">by {book.author}</p>
                        </CardHeader>
                        <CardContent>
                          <p className="text-gray-700 mb-4">{book.description}</p>
                          {book.fileUrl && (
                            <a
                              href={book.fileUrl}
                              className="text-church-navy font-medium hover:underline"
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              Download or Read
                            </a>
                          )}
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </>
            )}
          </TabsContent>
          
          <TabsContent value="verses">
            {loading.verses ? (
              <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-church-navy"></div>
              </div>
            ) : error.verses ? (
              <div className="text-center text-red-500">{error.verses}</div>
            ) : (
              <>
                {verses.length === 0 ? (
                  <div className="text-center py-12">
                    <Book className="h-16 w-16 text-church-gold mx-auto mb-4" />
                    <p className="text-gray-500 text-lg">No verses available at this time.</p>
                  </div>
                ) : (
                  <div className="max-w-3xl mx-auto space-y-6">
                    {verses.map((verse) => (
                      <Card key={verse._id} className="hover:shadow-md transition-shadow">
                        <CardContent className="p-6">
                          <blockquote className="border-l-4 border-church-gold pl-4 italic text-gray-700 mb-4">
                            "{verse.text}"
                          </blockquote>
                          <p className="text-right font-serif text-church-navy font-medium">
                            {verse.reference}
                          </p>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </>
            )}
          </TabsContent>
        </Tabs>
      </main>
      <Footer />
    </>
  );
};

export default ResourcesPage;
