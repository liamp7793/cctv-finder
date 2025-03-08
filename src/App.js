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

  const [loginData, setLoginData] = useState({ email: "", password: "" });
  const [signupData, setSignupData] = useState({ name: "", email: "", password: "" });
  const [newMarker, setNewMarker] = useState({ name: "", lat: null, lng: null });

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

  // ✅ Fetch Pinpoints after User Logs In
  useEffect(() => {
    console.log("👀 User state:", user);

    if (user && (user.uid || user.id)) {
      console.log("✅ User logged in, fetching pinpoints...");
      fetchPinpoints();
    }
  }, [user]);

  // ✅ Login Handler
  const handleLogin = async () => {
    try {
      console.log("🔎 Attempting login...");
      const response = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "login", ...loginData }),
      });

      const data = await response.json();
      console.log("✅ Login Response:", data);

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
      console.log("🔎 Attempting signup...");
      const response = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "signup", ...signupData }),
      });

      const data = await response.json();
      console.log("✅ Signup Response:", data);

      if (data.success) {
        setUser(data.user);
        localStorage.setItem("cctvUser", JSON.stringify(data.user));
        fetchPinpoints(); // Load pinpoints after signup
      } else {
        alert(`Signup failed: ${data.message}`);
      }
    } catch (error) {
      console.error("❌ Signup failed:", error);
      alert("Signup request failed.");
    }
  };

  // ✅ Save Pinpoint
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
      console.log("📍 Saving pinpoint:", newMarker);
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

  // ✅ Fetch Pinpoints
  const fetchPinpoints = async () => {
    if (!user || !(user.uid || user.id)) return;

    try {
      console.log("🔎 Fetching pinpoints...");
      const response = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "getPinpoints", userId: user.uid || user.id }),
      });

      const data = await response.json();
      console.log("📍 Pinpoints fetched:", data);

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
        <MapContainer center={[51.505, -0.09]} zoom={13} className="h-screen w-full">
          <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
          {markers.map((marker) => (
            <Marker key={marker.id} position={[marker.lat, marker.lng]} icon={customIcon}>
              <Popup>{marker.name}</Popup>
            </Marker>
          ))}
        </MapContainer>
      )}
    </div>
  );
};

export default CCTVFinder;
