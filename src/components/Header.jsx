// src/components/Header.jsx
import React from 'react';
import { Link } from 'react-router-dom';

const Header = () => {
  return (
    <header className="bg-blue-600 text-white p-4">
      <div className="container mx-auto flex justify-between items-center">
        <h1 className="text-xl font-bold">Map-B</h1>
        <nav>
          {/* <Link to="/" className="text-white hover:underline mx-2">Login</Link> */}
          {/* <Link to="/register" className="text-white hover:underline mx-2">Register</Link> */}
        </nav>
      </div>
    </header>
  );
};

export default Header;
