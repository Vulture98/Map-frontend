// src/App.jsx
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import Footer from './components/Footer';
import Login from './components/Login';
import Register from './components/Register';
import Dashboard from './components/Dashboard';
import { ToastContainer } from 'react-toastify'; // For toast notifications
import "react-toastify/dist/ReactToastify.css";

const App = () => {
  return (
    <Router>
      <div className="flex flex-col min-h-screen"> {/* Full height and flex column */}
        <Header />
        <main className="flex-grow"> {/* Main area grows to fill space */}
          <Routes>
            <Route path="/" element={<Login />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/register" element={<Register />} />
          </Routes>
        </main>
        <Footer />
        <ToastContainer /> 
      </div>
    </Router>
  );
};

export default App;
