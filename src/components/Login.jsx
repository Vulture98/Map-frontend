// src/components/Login.jsx
import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const Login = () => {
  const apiUrl = import.meta.env.VITE_API_URL; // Declare apiUrl here
  const loginUrl = `${apiUrl}/api/users/auth`
  console.log(`"apiUrl":`, apiUrl);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null); // State to handle errors
  const navigate = useNavigate(); // Hook for navigation

  const handleLogin = async (e) => {
    e.preventDefault();
    setError(null); // Reset error state on new login attempt

    try {      
      console.log(`"loginUrl":`, loginUrl);      
      const response = await axios.post(loginUrl, { 
        // const response = await axios.post(`http://localhost:5000/api/users/auth`, { 
        email, 
        password 
      }, { withCredentials: true }); // Include credentials to handle cookies

      // Handle successful login (JWT token is handled as a cookie)
      console.log('Login successful:', response.data);
      
      // Redirect to the dashboard
      navigate('/dashboard'); // Change to your dashboard route
    } catch (err) {
      // Handle errors here
      console.error('Login failed:', err);
      setError('Invalid email or password. Please try again.');
    }
  };

  return (
    <div className="flex flex-col items-center justify-center h-screen">
      <h2 className="text-xl mb-4">Login</h2>
      {error && <div className="text-red-600 mb-4">{error}</div>} {/* Display error message */}
      <form className="bg-white p-6 rounded shadow-md w-80" onSubmit={handleLogin}>
        <input
          type="email"
          placeholder="Email"
          className="border mb-4 p-2 w-full"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Password"
          className="border mb-4 p-2 w-full"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <button type="submit" className="bg-blue-600 text-white p-2 w-full">
          Login
        </button>
      </form>
    </div>
  );
};

export default Login;
