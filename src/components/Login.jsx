// src/components/Login.jsx
import React, { useState } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom"; // Import Link for navigation
import { toast } from "react-toastify"; // Import toast
import GoogleLoginComponent from "./GoogleLoginComponent";

const Login = () => {
  const apiUrl = import.meta.env.VITE_API_URL; // Declare apiUrl here
  const loginUrl = `${apiUrl}/api/users/auth`;
  const [email, setEmail] = useState("banana@example.com");
  const [password, setPassword] = useState("banana");
  const [error, setError] = useState(null); // State to handle errors
  const navigate = useNavigate(); // Hook for navigation

  const handleLogin = async (e) => {
    e.preventDefault();
    setError(null); // Reset error state on new login attempt

    try {
      const response = await axios.post(
        loginUrl,
        {
          email,
          password,
        },
        { withCredentials: true }
      ); // Include credentials to handle cookies

      // Handle successful login (JWT token is handled as a cookie)
      toast.success("Login successful!"); // Show success message
      navigate("/dashboard"); // Change to your dashboard route
    } catch (err) {
      // Handle errors here
      setError("Invalid email or password. Please try again.");
      toast.error("Login failed. Please check your credentials."); // Show error message
    }
  };

  // return (
  //   <div className="flex flex-col items-center justify-center h-screen bg-gray-100">
  //     <h2 className="text-2xl font-bold mb-6">Login</h2>
  //     {error && <div className="text-red-600 mb-4">{error}</div>} {/* Display error message */}
  //     <form className="bg-white p-6 rounded shadow-md w-80" onSubmit={handleLogin}>
  //       <input
  //         type="email"
  //         placeholder="Email"
  //         className="border mb-4 p-2 w-full rounded"
  //         value={email}
  //         onChange={(e) => setEmail(e.target.value)}
  //         required
  //       />
  //       <input
  //         type="password"
  //         placeholder="Password"
  //         className="border mb-4 p-2 w-full rounded"
  //         value={password}
  //         onChange={(e) => setPassword(e.target.value)}
  //         required
  //       />
  //       <button type="submit" className="bg-blue-600 text-white p-2 w-full rounded hover:bg-blue-700 transition">
  //         Login
  //       </button>
  //     </form>
  //     <div className="bg-blue-400">
  //       <GoogleLoginComponent
  //         // style={{ marginTop: '20px' }} // Optional: customize margin
  //       />
  //     </div>
  //     <p className="mt-4 text-gray-600">
  //       Not a user?{' '}
  //       <Link to="/register" className="text-blue-600 hover:underline">Register</Link>
  //     </p>
  //   </div>
  // );

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gray-100">
      <h2 className="text-3xl font-bold mb-6">Login</h2>
      {error && <div className="text-red-600 mb-4">{error}</div>}{" "}
      {/* Display error message */}
      <form
        className="bg-white p-8 rounded shadow-md w-96"
        onSubmit={handleLogin}
      >
        <input
          type="email"
          placeholder="Email"
          className="border mb-4 p-3 w-full rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Password"
          className="border mb-4 p-3 w-full rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <button
          type="submit"
          className="bg-blue-600 text-white p-3 w-full rounded-lg hover:bg-blue-700 transition"
        >
          Login
        </button>
      </form>
      <div className="mt-4">
        <GoogleLoginComponent />
      </div>
      <p className="mt-4 text-gray-600">
        Not a user?{" "}
        <Link to="/register" className="text-blue-600 hover:underline">
          Register
        </Link>
      </p>
    </div>
  );
};

export default Login;
