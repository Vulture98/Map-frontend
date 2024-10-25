// src/components/Footer.jsx
import React from 'react';

const Footer = () => {
  return (
    <footer className="bg-blue-600 text-white p-4 mt-4">
      <div className="container mx-auto text-center">
        <p>&copy; {new Date().getFullYear()} My App. All rights reserved.</p>
      </div>
    </footer>
  );
};

export default Footer;
