import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import axios from 'axios';
import Header from './components/Header';
import Footer from './components/Footer';
import Login from './components/Login';
import Register from './components/Register';
import Dashboard from './components/Dashboard';
import { ToastContainer } from 'react-toastify';
import "react-toastify/dist/ReactToastify.css";
import AdminLoginMe from './components/admin2/AdminLoginMe';
import AdminDashboardMe from './components/admin2/AdminDashboardMe';

// PrivateRoute component to check authentication
const PrivateRoute = ({ children, role }) => {  
  const [isAuthenticated, setIsAuthenticated] = useState(null);

  useEffect(() => {
    const verifyAuth = async () => {
      try {
        const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/${role}/verify`, {
          withCredentials: true
        });
        console.log(`response:`, response);
        setIsAuthenticated(response.data.isAuthenticated);
      } catch (error) {
        console.error('Auth verification failed:', error);
        setIsAuthenticated(false);
      }
    };

    verifyAuth();
  }, [role]);

  if (isAuthenticated === null) {
    // Still checking authentication
    return <div>Loading...</div>;
  }

  if(role === 'admin'){
    return isAuthenticated ? children : <Navigate to="/admin/loginMe" />;
  } else if(role === 'user'){
    return isAuthenticated ? children : <Navigate to={`/`} />;
  }
  // return isAuthenticated ? children : <Navigate to={`/${role}/loginMe`} />;
};

const App = () => {
  return (
    <Router>
      <div className="flex flex-col min-h-screen">
        <Header />
        <main className="flex-grow">
          <Routes>
            <Route path="/" element={<Login />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route
              path="/dashboard"
              // element={<PrivateRoute role = "users"><Dashboard /></PrivateRoute>}
            />
            <Route path="/register" element={<Register />} />
            <Route path="/admin/loginMe" element={<AdminLoginMe />} />
            <Route
              path="/admin/dashboardMe"
              element={<PrivateRoute role = "admin"><AdminDashboardMe /></PrivateRoute>}
            />
          </Routes>
        </main>
        <Footer />
        <ToastContainer />
      </div>
    </Router>
  );
};

export default App;
