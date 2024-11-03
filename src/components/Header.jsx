import React, { useState } from "react";
import { Menu, X } from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";

const Header = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const isDashboard = location.pathname === "/dashboard";
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await axios.post(
        `${import.meta.env.VITE_API_URL}/api/users/logout`,
        {},
        { withCredentials: true }
      );
      toast.success("Logout successful!");
      navigate("/");
    } catch (err) {
      toast.error("Error logging out");
    }
  };

  const toggleMobileDrawer = () => {
    // Function to toggle mobile drawer
    setMobileDrawerOpen(!mobileDrawerOpen);
  };

  return (
    <header className="bg-gradient-to-r from-blue-600 to-blue-800 text-white shadow-lg">
      <div className="container mx-auto px-4 py-5">
        <div className="flex justify-between items-center">
          {/* Logo/Brand */}
          <div className="flex items-center space-x-2">
            <svg
              className="w-8 h-8 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"
              />
            </svg>
            <Link
              to={isDashboard ? "/dashboard" : "/"}
              className="text-2xl font-bold tracking-wider hover:text-blue-100 transition-colors"
            >
              Map-B
            </Link>
          </div>

          {/* Navigation */}
          <nav className="md:flex items-center space-x-6">
            {isDashboard ? (
              // Show logout when in dashboard
              <button
                onClick={handleLogout}
                className="px-4 py-2 rounded-lg bg-white text-blue-600 hover:bg-blue-50 transition-colors font-medium"
              >
                Logout
              </button>
            ) : (
              // Show login/register when not in dashboard
              <>
                <Link
                  to="/"
                  className="text-white hover:text-blue-100 transition-colors font-medium"
                >
                  {/* Login */}
                </Link>
                <Link
                  to="/register"
                  className="px-4 py-2 rounded-lg bg-white text-blue-600 hover:bg-blue-50 transition-colors font-medium"
                >
                  Get Started
                </Link>
              </>
            )}
          </nav>
        </div>
      </div>
    </header>
  );
};

export default Header;
