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
  const [newMarker, setNewMarker] = useState({ name: "", lat: null, lng: null });

  // Separate state for login and signup to prevent shared state issues
  const [loginData, setLoginData] = useState({ email: "", password: "" });
  const [signupData, setSignupData] = useState({ name: "", email: "", password: "" });

  useEffect(() => {
    const savedUser = localStorage.getItem("cctvUser");
    if (savedUser) {
      setUser(JSON.parse(savedUser));
      console.log("✅ Loaded user from local storage:", JSON.parse(savedUser));
    }
  }, []);

  useEffect(() => {
    if (user) {
      console.log("✅ User logged in:", user);
      fetchPinpoints();
    }
  }, [user]);

  const API_URL = "/api/auth";

  // ✅ Login Handler
  const handleLogin = async () => {
    try {
      const response = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "login", ...loginData }),
      });

      const data = await response.json();
      if (data.success) {
        console.log("✅ Login successful:", data.user);
        setUser(data.user);
        localStorage.setItem("cctvUser", JSON.stringify(data.user));
        fetchPinpoints(); // Load pinpoints after login
      } else {
        alert(`Login failed: ${data.message}`);
      }
    } catch (error) {
      console.error("❌ Login failed:", error);
      alert("Login request failed.");
    }
  };

  // ✅ Signup Handler
  const handleSignup = async () => {
    try {
      const response = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "signup", ...signupData }),
      });

      const data = await response.json();
      if (data.success) {
        console.log("✅ Signup successful:", data.user);
        setUser(data.user);
        localStorage.setItem("cctvUser", JSON.stringify(data.user));
        fetchPinpoints();
      } else {
        alert(`Signup failed: ${data.message}`);
      }
    } catch (error) {
      console.error("❌ Signup failed:", error);
      alert("Signup request failed.");
    }
  };

  // ✅ Save Pinpoint Handler
  const handleSavePinpoint = async () => {
    if (!newMarker.name || !newMarker.lat || !newMarker.lng) {
      alert("Please provide a valid name and location.");
      return;
    }

    try {
      const response = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          action: "savePinpoint", 
          userId: user.uid, 
          data: newMarker 
        }),
      });

      const data = await response.json();
      if (data.success) {
        alert("Pinpoint saved!");
        fetchPinpoints();
      } else {
        alert(`Failed to save pinpoint: ${data.message}`);
      }
    } catch (error) {
      console.error("❌ Error saving pinpoint:", error);
    }
  };

  // ✅ Fetch Pinpoints Handler
  const fetchPinpoints = async () => {
    try {
      const response = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "getPinpoints", userId: user.uid }),
      });

      const data = await response.json();
      if (data.success) {
        console.log("📍 Pinpoints fetched:", data.pinpoints);
        setMarkers(data.pinpoints);
      } else {
        alert(`Failed to fetch pinpoints: ${data.message}`);
      }
    } catch (error) {
      console.error("❌ Error fetching pinpoints:", error);
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
    <div className="h-screen w-full bg-gray-100">
      {!user ? (
        <div className="h-full flex items-center justify-center">
          <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md">
            <h2 className="text-2xl font-semibold text-center mb-4">
              {isSignUp ? "Create an Account" : "Welcome Back"}
            </h2>

            {isSignUp ? (
              <>
                <input
                  type="text"
                  placeholder="Full Name"
                  value={signupData.name}
                  onChange={(e) => setSignupData({ ...signupData, name: e.target.value })}
                  className="w-full p-2 border rounded mb-2"
                />
                <input
                  type="email"
                  placeholder="Email"
                  value={signupData.email}
                  onChange={(e) => setSignupData({ ...signupData, email: e.target.value })}
                  className="w-full p-2 border rounded mb-2"
                />
                <input
                  type="password"
                  placeholder="Password"
                  value={signupData.password}
                  onChange={(e) => setSignupData({ ...signupData, password: e.target.value })}
                  className="w-full p-2 border rounded mb-2"
                />
                <button onClick={handleSignup} className="w-full bg-green-500 text-white py-2 rounded">
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
                  className="w-full p-2 border rounded mb-2"
                />
                <input
                  type="password"
                  placeholder="Password"
                  value={loginData.password}
                  onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                  className="w-full p-2 border rounded mb-2"
                />
                <button onClick={handleLogin} className="w-full bg-blue-500 text-white py-2 rounded">
                  Log In
                </button>
              </>
            )}
            <p
              className="text-blue-500 mt-4 cursor-pointer text-center"
              onClick={() => setIsSignUp(!isSignUp)}
            >
              {isSignUp ? "Already have an account? Log in" : "Don't have an account? Sign up"}
            </p>
          </div>
        </div>
      ) : (
        <>
          <MapContainer center={[51.505, -0.09]} zoom={13} className="h-full w-full">
            <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
          </MapContainer>
        </>
      )}
    </div>
  );
};

export default CCTVFinder;
