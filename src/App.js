import React, { useState, useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

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

  const [loginData, setLoginData] = useState({ email: "", password: "" });
  const [signupData, setSignupData] = useState({ name: "", email: "", password: "" });

  const API_URL = "/api/auth";

  useEffect(() => {
    const savedUser = localStorage.getItem("cctvUser");
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
  }, []);

  useEffect(() => {
    if (user) {
      fetchPinpoints();
    }
  }, [user]);

  const fetchPinpoints = async () => {
    try {
      const response = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "getAllPinpoints" })
      });

      const data = await response.json();

      if (data.success) {
        setMarkers(data.pinpoints || []);
      } else {
        console.error("❌ Failed to fetch pinpoints:", data.message);
      }
    } catch (error) {
      console.error("❌ Error fetching pinpoints:", error);
    }
  };

  const handleLogin = async () => {
    try {
      const response = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "login", ...loginData })
      });

      const data = await response.json();

      if (data.success) {
        setUser(data.user);
        localStorage.setItem("cctvUser", JSON.stringify(data.user));
        fetchPinpoints();
      } else {
        alert(`Login failed: ${data.message}`);
      }
    } catch (error) {
      console.error("❌ Login failed:", error);
    }
  };

  const handleSignup = async () => {
    try {
      const response = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "signup", ...signupData })
      });

      const data = await response.json();

      if (data.success) {
        setUser(data.user);
        localStorage.setItem("cctvUser", JSON.stringify(data.user));
        fetchPinpoints();
      } else {
        alert(`Signup failed: ${data.message}`);
      }
    } catch (error) {
      console.error("❌ Signup failed:", error);
    }
  };

  const handleSignOut = () => {
    localStorage.removeItem("cctvUser");
    setUser(null);
    setMarkers([]);
  };

  const handleAddPinpoint = () => {
    alert("Feature to add pinpoint coming soon!");
  };

  return (
    <div className="h-screen w-full bg-gray-100">
      {/* ✅ Logo */}
      <header className="w-full bg-gray-900 text-white text-center p-4">
        CCTV Finder
      </header>

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
          </div>
        </div>
      ) : (
        <MapContainer center={[51.505, -0.09]} zoom={13} className="h-[600px] w-full">
          <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        </MapContainer>
      )}
    </div>
  );
};

export default CCTVFinder;
