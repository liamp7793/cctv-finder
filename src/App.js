import React, { useState, useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

// Custom Leaflet Icon
const customIcon = new L.Icon({
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

const CCTVFinder = () => {
  const [user, setUser] = useState(null);
  const [isSignUp, setIsSignUp] = useState(false);
  const [markers, setMarkers] = useState([]);
  
  // Separate state for login and signup to prevent shared state issues
  const [loginData, setLoginData] = useState({ email: "", password: "" });
  const [signupData, setSignupData] = useState({ name: "", email: "", password: "" });

  useEffect(() => {
    const savedUser = localStorage.getItem("cctvUser");
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
  }, []);

  useEffect(() => {
    if (user) {
      fetchPinpoints(); // Load pinpoints when user logs in
    }
  }, [user]);

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
        fetchPinpoints();
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
        fetchPinpoints();
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
        fetchPinpoints(); // Refresh pinpoints after saving
      } else {
        alert(`Failed to save pinpoint: ${result.message}`);
      }
    } catch (error) {
      console.error("❌ Error saving pinpoint:", error.message);
      alert(`Failed to save pinpoint: ${error.message}`);
    }
  };

  // ✅ Fetch Pinpoints Handler
  const fetchPinpoints = async () => {
    if (!user || !user.uid) return;

    try {
      const response = await fetch('/api/auth', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ action: 'getPinpoints', userId: user.uid }),
      });

      const result = await response.json();
      if (result.success) {
        setMarkers(result.pinpoints);
      } else {
        alert(`Failed to fetch pinpoints: ${result.message}`);
      }
    } catch (error) {
      console.error("❌ Error fetching pinpoints:", error.message);
    }
  };

  // ✅ Sign Out Handler
  const handleSignOut = () => {
    localStorage.removeItem("cctvUser");
    setUser(null);
    setMarkers([]);
    alert("You have been signed out.");
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
           
