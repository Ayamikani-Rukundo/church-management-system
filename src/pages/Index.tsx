
import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Church, Book, Users, Image, Bell } from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

const Index = () => {
  const features = [
    {
      icon: <Image className="h-10 w-10 text-church-gold" />,
      title: "Photo Gallery",
      description: "View photos from our recent events and gatherings.",
      link: "/gallery",
    },
    {
      icon: <Users className="h-10 w-10 text-church-gold" />,
      title: "Church Leaders",
      description: "Meet the dedicated leaders serving our church community.",
      link: "/leaders",
    },
    {
      icon: <Bell className="h-10 w-10 text-church-gold" />,
      title: "Announcements",
      description: "Stay updated with the latest news and events.",
      link: "/announcements",
    },
    {
      icon: <Book className="h-10 w-10 text-church-gold" />,
      title: "Resources",
      description: "Access spiritual resources and Bible verses.",
      link: "/resources",
    },
  ];

  return (
    <>
      <Header />
      <main>
        {/* Hero Section with softer overlay and increased side padding */}
        <section className="hero relative min-h-[70vh] flex items-center">
          <div className="absolute inset-0 bg-black bg-opacity-40"></div>
          <div className="container mx-auto px-6 md:px-8 lg:px-12 relative z-10 text-white">
            <div className="max-w-3xl">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-serif font-bold mb-4">
                Welcome to Campus Adventist Church
              </h1>
              <p className="text-xl mb-8">
                A place for students to grow in faith, find community, and serve others.
              </p>
              <div className="flex flex-wrap gap-4">
                <Link to="/about">
                  <Button className="bg-church-gold/90 hover:bg-yellow-600 text-black">
                    Learn More
                  </Button>
                </Link>
                <Link to="/announcements">
                  <Button variant="outline" className="bg-transparent border-white text-white hover:bg-white/20 hover:text-white">
                    Upcoming Events
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Welcome Section with softer colors */}
        <section className="py-16 bg-gray-50">
          <div className="container mx-auto px-6 md:px-8 lg:px-12">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-serif font-bold text-church-navy mb-4">Our Community</h2>
              <p className="text-gray-600 max-w-2xl mx-auto">
                Join us for worship, fellowship, and spiritual growth in our campus community.
                We welcome students of all backgrounds to experience the love of Christ.
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {features.map((feature, index) => (
                <Link to={feature.link} key={index}>
                  <Card className="h-full hover:shadow-md transition-shadow duration-300 bg-white border border-gray-100">
                    <CardContent className="pt-6 text-center">
                      <div className="mb-4 flex justify-center">
                        {feature.icon}
                      </div>
                      <h3 className="text-xl font-serif font-semibold mb-2 text-church-navy">
                        {feature.title}
                      </h3>
                      <p className="text-gray-600">
                        {feature.description}
                      </p>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* Service Times with softer background */}
        <section className="py-16 bg-gray-100">
          <div className="container mx-auto px-6 md:px-8 lg:px-12">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
              <div>
                <h2 className="text-3xl font-serif font-bold text-church-navy mb-4">
                  Join Us This Weekend
                </h2>
                <p className="text-gray-600 mb-6">
                  We gather every Saturday for worship, Bible study, and fellowship. 
                  Our services are designed to inspire faith and build community among students.
                </p>
                <div className="space-y-4">
                  <div className="flex items-start">
                    <div className="mr-4 mt-1">
                      <Church className="h-6 w-6 text-church-gold" />
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-900">Main Service</h3>
                      <p className="text-gray-600">Saturday, 9:30 AM - 12:30 PM</p>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <div className="mr-4 mt-1">
                      <Book className="h-6 w-6 text-church-gold" />
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-900">Bible Study</h3>
                      <p className="text-gray-600">Wednesday, 7:00 PM</p>
                    </div>
                  </div>
                </div>
                <div className="mt-8">
                  <Link to="/about">
                    <Button className="bg-church-navy/90 hover:bg-blue-900">
                      Learn More About Us
                    </Button>
                  </Link>
                </div>
              </div>
              <div className="rounded-lg overflow-hidden shadow-md">
                <img 
                  src="/worship-service.jpg" 
                  alt="Worship Service" 
                  className="w-full h-auto object-cover"
                />
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
};

export default Index;
