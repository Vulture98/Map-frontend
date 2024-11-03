import React from "react";
import { FaFacebook, FaTwitter, FaLinkedin } from "react-icons/fa";

const Footer = () => {
  return (
    <footer className="bg-gradient-to-r from-blue-600 to-blue-800 text-white p-3 pb-2 mt-4">
      <div className="container mx-auto flex flex-col items-center">
        <p className="mb-4 flex items-center space-x-4">
          &copy; {new Date().getFullYear()} My App. All rights reserved.
          <span className="flex space-x-4 px-5">
            <a
              href="https://facebook.com"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-blue-300"
            >
              <FaFacebook size={24} />
            </a>
            <a
              href="https://twitter.com"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-blue-300"
            >
              <FaTwitter size={24} />
            </a>
            <a
              href="https://linkedin.com"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-blue-300"
            >
              <FaLinkedin size={24} />
            </a>
          </span>
        </p>
      </div>
    </footer>
  );
};

export default Footer;
