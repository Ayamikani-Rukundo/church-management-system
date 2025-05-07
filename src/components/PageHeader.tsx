
import React from 'react';

interface PageHeaderProps {
  title: string;
  description?: string;
}

const PageHeader: React.FC<PageHeaderProps> = ({ title, description }) => {
  return (
    <div className="page-header bg-church-navy text-white py-12 mb-8">
      <div className="container mx-auto px-4">
        <h1 className="text-3xl md:text-4xl lg:text-5xl font-serif font-bold mb-3">
          {title}
        </h1>
        {description && (
          <p className="text-lg text-gray-200 max-w-3xl">
            {description}
          </p>
        )}
      </div>
    </div>
  );
};

export default PageHeader;
