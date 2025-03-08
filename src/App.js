import React, { useState, useEffect } from "react";

const CCTVFinder = () => {
  const [user, setUser] = useState(null);
  const [isSignUp, setIsSignUp] = useState(false);

  // Separate state for login and signup to prevent shared state issues
  const [loginData, setLoginData] = useState({ email: "", password: "" });
  const [signupData, setSignupData] = useState({ name: "", email: "", password: "" });

  useEffect(() => {
    const savedUser = localStorage.getItem("cctvUser");
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
  }, []);

  const API_URL = "/api/auth";

  // ✅ Login Handler
  const handleLogin = async () => {
    try {
      const response = await fetch(API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ action: "login", ...loginData }),
      });

      const data = await response.json();
      if (data.success) {
        setUser(data.user);
        localStorage.setItem("cctvUser", JSON.stringify(data.user));
        alert("Login successful!");
      } else {
        alert("Login failed: " + data.message);
      }
    } catch (error) {
      console.error("Error logging in:", error);
      alert("Login request failed.");
    }
  };

  // ✅ Signup Handler
  const handleSignup = async () => {
    try {
      const response = await fetch(API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ action: "signup", ...signupData }),
      });

      const data = await response.json();
      if (data.success) {
        setUser(data.user);
        localStorage.setItem("cctvUser", JSON.stringify(data.user));
        alert("Signup successful! You can now log in.");
      } else {
        alert(`Signup failed: ${data.message}`);
      }
    } catch (error) {
      console.error("Error signing up:", error);
      alert("Signup request failed.");
    }
  };

  // ✅ Save Pinpoint Handler
  const handleSavePinpoint = async () => {
    const data = {
      name: 'Pinpoint 1',
      lat: 51.505,
      lng: -0.09,
    };

    if (!user || !user.uid) {
      alert('You must be logged in to save a pinpoint');
      return;
    }

    try {
      const response = await fetch('/api/auth', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ action: 'savePinpoint', userId: user.uid, data }),
      });

      const result = await response.json();

      if (result.success) {
        alert('Pinpoint saved!');
      } else {
        alert(`Failed to save pinpoint: ${result.message}`);
      }
    } catch (error) {
      console.error("❌ Error saving pinpoint:", error.message);
      alert(`Failed to save pinpoint: ${error.message}`);
    }
  };

  return (
    <div className="h-screen w-full flex justify-center items-center bg-gray-100">
      {!user ? (
        <div className="bg-white p-10 rounded-lg shadow-xl w-full max-w-md">
          <h1 className="text-3xl font-semibold text-center mb-6 text-gray-800">
            {isSignUp ? "Create an Account" : "Welcome Back"}
          </h1>
          {isSignUp ? (
            <>
              <input
                type="text"
                placeholder="Full Name"
                value={signupData.name}
                onChange={(e) => setSignupData({ ...signupData, name: e.target.value })}
                className="w-full p-3 border rounded mb-4"
              />
              <input
                type="email"
                placeholder="Email"
                value={signupData.email}
                onChange={(e) => setSignupData({ ...signupData, email: e.target.value })}
                className="w-full p-3 border rounded mb-4"
              />
              <input
                type="password"
                placeholder="Password"
                value={signupData.password}
                onChange={(e) => setSignupData({ ...signupData, password: e.target.value })}
                className="w-full p-3 border rounded mb-4"
              />
              <button
                onClick={handleSignup}
                className="w-full bg-green-500 text-white p-3 rounded hover:bg-green-600 transition duration-300"
              >
                Sign Up
              </button>
            </>
          ) : (
            <>
              <input
                type="email"
                placeholder="Email"
                value={loginData.email}
                onChange={(e) => setLoginData({ ...loginData, email: e.target.value })}
                className="w-full p-3 border rounded mb-4"
              />
              <input
                type="password"
                placeholder="Password"
                value={loginData.password}
                onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                className="w-full p-3 border rounded mb-4"
              />
              <button
                onClick={handleLogin}
                className="w-full bg-blue-500 text-white p-3 rounded hover:bg-blue-600 transition duration-300"
              >
                Log In
              </button>
            </>
          )}

          {/* Switch between Login and Signup */}
          <p className="mt-4 text-center text-gray-500">
            {isSignUp ? "Already have an account?" : "Don't have an account?"}
            <span
              className="text-blue-500 cursor-pointer ml-1 hover:underline"
              onClick={() => setIsSignUp(!isSignUp)}
            >
              {isSignUp ? "Log in" : "Sign up"}
            </span>
          </p>
        </div>
      ) : (
        <div className="text-center">
          <h1 className="text-4xl font-semibold text-gray-800">Welcome, {user.email}!</h1>
          <button
            className="mt-6 bg-green-500 text-white p-3 rounded hover:bg-green-600"
            onClick={handleSavePinpoint}
          >
            ➕ Save Pinpoint
          </button>
        </div>
      )}
    </div>
  );
};

export default CCTVFinder;
