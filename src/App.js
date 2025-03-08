import React, { useState, useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap, CircleMarker } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

const customIcon = new L.Icon({
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

const ChangeView = ({ center, zoom }) => {
  const map = useMap();
  useEffect(() => {
    map.setView(center, zoom);
  }, [center, zoom]);
  return null;
};

const CCTVFinder = () => {
  const [markers, setMarkers] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [newMarker, setNewMarker] = useState({ name: "", location: "", viewingAngle: "", position: null, createdBy: null });
  const [mapCenter, setMapCenter] = useState([51.505, -0.09]);
  const [mapZoom, setMapZoom] = useState(18);
  const [searchLocation, setSearchLocation] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [user, setUser] = useState(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");

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
        body: JSON.stringify({ action: "login", email, password }),
      });

      const data = await response.json();
      if (data.success) {
        setUser(data.user);
        localStorage.setItem("cctvUser", JSON.stringify(data.user));
        alert("Login successful!");
        fetchPinpoints(); // Fetch pinpoints after login
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
        body: JSON.stringify({ action: "signup", email, password, name }),
      });

      const data = await response.json();

      if (data.success) {
        setUser(data.user);
        localStorage.setItem("cctvUser", JSON.stringify(data.user));
        alert("Signup successful! You can now log in.");
        fetchPinpoints(); // Fetch pinpoints after signup
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

  return (
    <div className="h-screen w-full flex flex-col items-center bg-gray-100">
      {!user ? (
        <div className="flex flex-col items-center mt-20 bg-white p-6 shadow-lg rounded-lg">
          <h2 className="text-2xl font-semibold">Login</h2>
          <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} className="mt-2 p-2 border rounded" />
          <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} className="mt-2 p-2 border rounded" />
          <button onClick={handleLogin} className="mt-2 bg-blue-500 text-white p-2 rounded">Login</button>
          <h2 className="text-2xl font-semibold mt-4">Sign Up</h2>
          <input type="text" placeholder="Name" value={name} onChange={(e) => setName(e.target.value)} className="mt-2 p-2 border rounded" />
          <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} className="mt-2 p-2 border rounded" />
          <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} className="mt-2 p-2 border rounded" />
          <button onClick={handleSignup} className="mt-2 bg-green-500 text-white p-2 rounded">Sign Up</button>
        </div>
      ) : (
        <>
          <header className="w-full bg-gray-900 text-white text-center shadow-md">
            <img src="https://i.ibb.co/Rp4vtYh/DALL-E-2025-03-05-21-35-01-A-sleek-modern-logo-representing-CCTV-surveillance-and-searching-featurin.webp" alt="CCTV Finder Logo" className="w-full object-cover" />
          </header>
          <div className="relative w-full max-w-5xl flex flex-col items-center mt-4">
            <button
              className="mt-4 bg-green-600 text-white p-4 rounded-full shadow-lg flex items-center justify-center"
              onClick={handleSavePinpoint}
            >
              ➕ Save Pinpoint
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default CCTVFinder;
