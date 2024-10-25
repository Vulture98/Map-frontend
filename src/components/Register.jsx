// src/components/Register.jsx
import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css'; // Import the CSS for Toastify

const Register = () => {
  const apiUrl = import.meta.env.VITE_API_URL; // Declare apiUrl here
  const registerUrl = `${apiUrl}/api/users/`; // Registration API endpoint
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState(''); // State for confirming password
  const navigate = useNavigate(); // Hook for navigation

  const handleRegister = async (e) => {
    e.preventDefault();

    // Check if passwords match
    if (password !== confirmPassword) {
      toast.error("Passwords do not match."); // Show error toast
      return;
    }

    // Check if password length is less than 4
    if (password.length < 4) {
      toast.error("Password must be at least 4 characters long."); // Show error toast
      return;
    }

    try {
      const response = await axios.post(registerUrl, { 
        email, 
        password 
      });

      // Handle successful registration
      console.log('Registration successful:', response.data);
      toast.success('Registration successful! You can now log in.'); // Show success toast
      
      // Delay navigation to allow toast to display
      setTimeout(() => {
        navigate('/'); // Redirect to login page after toast displays
      }, 3000); // Adjust the timeout duration as needed (3000ms = 3 seconds)
      
    } catch (error) {
      // Improved error handling
      let errorMessage = 'An unexpected error occurred. Please try again.';
      
      if (error.response) {
        // Check if there's a specific error message from the backend
        if (error.response.status === 400) {
          errorMessage = error.response.data.message || errorMessage; // Use backend message or fallback
        } else if (error.response.status === 500) {
          errorMessage = 'Server error. Please try again later.'; // Handle server error
        }
      } else if (error.request) {
        errorMessage = 'No response from server. Please check your network connection.'; // Handle no response
      }

      // Show the error message in a toast
      toast.error(errorMessage);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center h-screen">
      <h2 className="text-xl mb-4">Register</h2>
      <form className="bg-white p-6 rounded shadow-md w-80" onSubmit={handleRegister}>
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
        <input
          type="password"
          placeholder="Confirm Password"
          className="border mb-4 p-2 w-full"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          required
        />
        <button type="submit" className="bg-blue-600 text-white p-2 w-full">
          Register
        </button>
      </form>
      <ToastContainer /> {/* Toast Container to display notifications */}
    </div>
  );
};

export default Register;
