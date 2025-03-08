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

  // Separate state for login and signup
  const [loginData, setLoginData] = useState({ email: "", password: "" });
  const [signupData, setSignupData] = useState({ name: "", email: "", password: "" });

  const API_URL = "/api/auth";

  // ✅ Load User from Local Storage
  useEffect(() => {
    const savedUser = localStorage.getItem("cctvUser");
    if (savedUser) {
      const parsedUser = JSON.parse(savedUser);
      console.log("✅ Loaded user from local storage:", parsedUser);
      setUser(parsedUser);
    }
  }, []);

  // ✅ Fetch Pinpoints After Login
  useEffect(() => {
    if (user) {
      console.log("✅ User logged in, fetching pinpoints...");
      fetchPinpoints();
    }
  }, [user]);

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

    if (!user || !(user.uid || user.id)) {
      alert("You must be logged in to save a pinpoint.");
      return;
    }

    try {
      const response = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "savePinpoint",
          userId: user.uid || user.id,
          data: newMarker,
        }),
      });

      const data = await response.json();
      if (data.success) {
        alert("Pinpoint saved!");
        fetchPinpoints(); // Refresh pinpoints
      } else {
        alert(`Failed to save pinpoint: ${data.message}`);
      }
    } catch (error) {
      console.error("❌ Error saving pinpoint:", error);
    }
  };

  // ✅ Fetch All Pinpoints (Show All Users’ Pinpoints)
  const fetchPinpoints = async () => {
    try {
      const response = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "getAllPinpoints" }),
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

  // ✅ Sign Out
  const handleSignOut = () => {
    localStorage.removeItem("cctvUser");
    setUser(null);
    setMarkers([]);
    alert("You have been signed out.");
  };

  return (
    <div className="h-screen w-full bg-gray-100">
      {/* ✅ Logo */}
      <header className="w-full bg-gray-900 text-white text-center p-4">
        <img 
          src="/logo.png" 
          alt="CCTV Finder Logo" 
          className="mx-auto w-48 h-16 object-contain" 
        />
      </header>

      {!user ? (
        // ✅ Login & Signup Form
        <div className="h-full flex items-center justify-center">
          <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md">
            <h2 className="text-2xl font-semibold text-center mb-4">
              {isSignUp ? "Create an Account" : "Welcome Back"}
            </h2>

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
          </div>
        </div>
      ) : (
        <MapContainer
          center={[51.505, -0.09]}
          zoom={13}
          className="h-[600px] w-full"
        >
          <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
          {markers.map((marker) => (
            <Marker key={marker.id} position={[marker.lat, marker.lng]} icon={customIcon}>
              <Popup>
                <div>
                  <strong>{marker.name}</strong>
                  <p>Added by: {marker.userName}</p>
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      )}
    </div>
  );
};

export default CCTVFinder;
