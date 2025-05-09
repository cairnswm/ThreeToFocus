import React from 'react';

function ContactUsSection() {
  return (
    <div className="py-12 bg-white max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-3xl font-bold mb-6">Contact Us</h2>
        <p className="text-lg text-gray-700 mb-6">
          Have a project in mind? We'd love to hear from you!
        </p>
        <a
          href="mailto:info@softwaredev.com"
          className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Get in Touch
        </a>
      </div>
  );
}

export default ContactUsSection;
