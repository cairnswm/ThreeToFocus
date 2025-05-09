import React from 'react';

function ServicesSection() {
  return (
    <div className="py-12 bg-white max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-3xl font-bold mb-6">Our Services</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="p-6 border rounded-lg shadow-md">
            <h3 className="text-xl font-semibold mb-4">Web Development</h3>
            <p className="text-gray-700">Custom websites tailored to your business needs.</p>
          </div>
          <div className="p-6 border rounded-lg shadow-md">
            <h3 className="text-xl font-semibold mb-4">Mobile Apps</h3>
            <p className="text-gray-700">Innovative mobile solutions for iOS and Android.</p>
          </div>
          <div className="p-6 border rounded-lg shadow-md">
            <h3 className="text-xl font-semibold mb-4">Consulting</h3>
            <p className="text-gray-700">Expert advice to optimize your software strategy.</p>
          </div>
        </div>
      </div>
  );
}

export default ServicesSection;
