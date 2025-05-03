
import React, { useEffect, useState } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import PageHeader from '@/components/PageHeader';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Card, CardContent } from '@/components/ui/card';
import axios from 'axios';

interface Leader {
  _id: string;
  name: string;
  position: string;
  bio: string;
  imageUrl: string;
}

const LeadersPage = () => {
  const [leaders, setLeaders] = useState<Leader[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchLeaders = async () => {
      try {
        const response = await axios.get<Leader[]>('/api/leaders');
        setLeaders(response.data);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching leaders:', err);
        setError('Failed to load leadership information. Please try again later.');
        setLoading(false);
      }
    };

    fetchLeaders();
  }, []);

  return (
    <>
      <Header />
      <PageHeader
        title="Church Leadership"
        description="Meet the dedicated team serving our campus church community."
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
            {leaders.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-500 text-lg">Leadership information coming soon.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {leaders.map((leader) => (
                  <Card key={leader._id} className="overflow-hidden hover:shadow-lg transition-shadow duration-300">
                    <CardContent className="p-6 text-center">
                      <Avatar className="h-32 w-32 mx-auto mb-4">
                        <AvatarImage src={leader.imageUrl} alt={leader.name} />
                        <AvatarFallback className="bg-church-navy text-white text-2xl">
                          {leader.name.split(' ').map(n => n[0]).join('')}
                        </AvatarFallback>
                      </Avatar>
                      <h3 className="text-xl font-serif font-semibold mb-1">{leader.name}</h3>
                      <p className="text-church-gold font-medium mb-4">{leader.position}</p>
                      <p className="text-gray-600">{leader.bio}</p>
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

export default LeadersPage;
