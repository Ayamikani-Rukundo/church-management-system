
import React from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import PageHeader from '@/components/PageHeader';

const AboutPage = () => {
  return (
    <>
      <Header />
      <PageHeader
        title="About Our Church"
        description="Learn about our mission, values, and history on campus."
      />
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Mission Section */}
          <section className="mb-12">
            <h2 className="text-2xl font-serif font-bold mb-4 text-church-navy">Our Mission</h2>
            <p className="text-gray-700 mb-4">
              The Campus Adventist Church exists to create a vibrant community where students can grow 
              in their relationship with Jesus Christ, deepen their understanding of Scripture, 
              and develop lifelong connections with fellow believers.
            </p>
            <p className="text-gray-700 mb-4">
              We are committed to providing a welcoming environment for spiritual growth, 
              meaningful worship experiences, and opportunities to serve others on campus 
              and in the surrounding community.
            </p>
          </section>

          {/* What We Believe Section */}
          <section className="mb-12">
            <h2 className="text-2xl font-serif font-bold mb-4 text-church-navy">What We Believe</h2>
            <p className="text-gray-700 mb-4">
              As a Seventh-day Adventist congregation, we believe in:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-gray-700">
              <li>The Trinity: Father, Son, and Holy Spirit</li>
              <li>Salvation by grace through faith in Jesus Christ</li>
              <li>The Bible as the inspired Word of God</li>
              <li>The Ten Commandments as a reflection of God's character</li>
              <li>The Sabbath as a day of rest and worship</li>
              <li>Christ's soon return to earth</li>
              <li>Whole-person wellness: mind, body, and spirit</li>
              <li>Service to others as an expression of God's love</li>
            </ul>
          </section>

          {/* History Section */}
          <section className="mb-12">
            <h2 className="text-2xl font-serif font-bold mb-4 text-church-navy">Our History</h2>
            <p className="text-gray-700 mb-4">
              The Campus Adventist Church began in 2010 as a small group of students meeting in a dorm room 
              for Bible study and prayer. As more students joined, we outgrew the dorm and moved to 
              various locations on campus before settling in our current location at the Student Center.
            </p>
            <p className="text-gray-700">
              Over the years, we've grown into a thriving community with active student leadership, 
              regular worship services, and various ministry opportunities. Our church continues to 
              be a spiritual home for students from diverse backgrounds, providing fellowship and 
              spiritual guidance throughout their academic journey.
            </p>
          </section>

          {/* Join Us Section */}
          <section className="mb-12">
            <h2 className="text-2xl font-serif font-bold mb-4 text-church-navy">Join Us</h2>
            <p className="text-gray-700 mb-4">
              We invite you to join our church family, whether you're a student, faculty member, 
              or part of the local community. Our doors are open to people from all backgrounds 
              who want to learn more about God and grow in their faith journey.
            </p>
            <div className="bg-church-light p-6 rounded-lg border border-gray-200">
              <h3 className="text-lg font-medium mb-2">Service Times</h3>
              <p className="mb-2">
                <span className="font-semibold">Saturday Worship:</span> 9:30 AM - 12:30 PM
              </p>
              <p className="mb-2">
                <span className="font-semibold">Bible Study:</span> Wednesday, 7:00 PM
              </p>
              <p>
                <span className="font-semibold">Location:</span> Student Center, Building 3, Room 101
              </p>
            </div>
          </section>
        </div>
      </main>
      <Footer />
    </>
  );
};

export default AboutPage;
