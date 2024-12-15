import React, { useState } from "react";
import { GoogleLogin } from "@react-oauth/google";
import { toast } from "react-toastify"; // Import toast
import { useNavigate, Link } from "react-router-dom"; // Import Link for navigation

const GoogleLoginComponent = () => {
  const [tasks, setTasks] = useState([]);
  const navigate = useNavigate(); // Hook for navigation

  const onSuccess = async (credentialResponse) => {
    // console.log(`onSuccess:`, credentialResponse);
    const token = credentialResponse.credential; // Get the token
    // console.log("Google Token:", token); // Print the token to the console

    // Send token to backend
    try {
      // console.log(
      //   `"import.meta.env.VITE_API_URL":`,
      //   import.meta.env.VITE_API_URL
      // );
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/auth/google`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ token }), // Send the token in the body
          credentials: "include", // Include credentials (cookies)
        }
      );

      const data = await response.json();
      // console.log("Response from backend:", data);
      if (!data.success) {
        toast.error(data.message); // Show error message
        return;
      }
      if (data.success) {
        toast.success("Login successful!"); // Show success message
        navigate("/dashboard"); // Change to your dashboard route
        // Fetch user tasks after successful authentication
        // fetchUserTasks(data.userId);
      }
    } catch (error) {
      console.error("Error sending token to backend:", error);
    }
  };

  const fetchUserTasks = async (userId) => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/user/task/${userId}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            // Include any additional headers you need, e.g., Authorization
          },
          credentials: "include", // This line is essential for sending cookies with the request
        }
      );

      const data = await response.json();
      // console.log("User Tasks:", data);
      if (data.success) {
        setTasks(data.tasks); // Store tasks in state
      }

      toast.success("Login successful!"); // Show success message
      navigate("/dashboard"); // Change to your dashboard route
    } catch (error) {
      console.error("Error fetching user tasks:", error);
    }
  };

  const onFailure = (error) => {
    console.log(`onFailure:`, error);
    console.error("Login Failed:", error); // Handle login failure
  };

  //   working stuff
  //   return (
  //     <div className="flex justify-center items-center">
  //       <GoogleLogin
  //         onSuccess={onSuccess}
  //         onFailure={onFailure}
  //         style={{ marginTop: "100px" }}
  //       />
  //       {/* <div>
  //         <h2>Your Tasks:</h2>
  //         <ul>
  //           {tasks.map((task, index) => (
  //             <li key={index}>{task.title}</li> // Adjust according to your task structure
  //           ))}
  //         </ul>
  //       </div> */}
  //     </div>
  //   );
  return (
    <div className="flex justify-center items-center mt-1">
      <GoogleLogin
        onSuccess={onSuccess}
        onFailure={onFailure}
        className="border border-gray-300 rounded-lg shadow-lg p-2 flex items-center justify-center"
      >
        <span className="text-lg font-semibold">Sign in with Google</span>
      </GoogleLogin>
    </div>
  );
};

export default GoogleLoginComponent;
