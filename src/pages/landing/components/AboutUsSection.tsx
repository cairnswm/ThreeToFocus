import React from 'react';
import { PersonCircle } from '../../../icons';

function AboutUsSection() {
  return (
    <div className="py-12 bg-white max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col lg:flex-row items-center">
          <div className="lg:w-1/2 mb-10 lg:mb-0">
            <h2 className="text-4xl font-extrabold text-gray-800 mb-6">
              About Us
            </h2>
            <p className="text-lg text-gray-600 leading-relaxed">
              We are a passionate team of software developers dedicated to
              building innovative solutions for businesses of all sizes. Our
              mission is to empower companies with cutting-edge technology and
              exceptional service.
            </p>
          </div>
          <div className="lg:w-1/2">
            <PersonCircle className="h-64 w-64 mx-auto text-primary" />
          </div>
        </div>
      </div>
  );
}

export default AboutUsSection;
