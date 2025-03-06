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
  }, [center, zoom, map]);
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
    const savedMarkers = localStorage.getItem("cctvMarkers");
    if (savedMarkers) {
      setMarkers(JSON.parse(savedMarkers));
    }
    const savedUser = localStorage.getItem("cctvUser");
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("cctvMarkers", JSON.stringify(markers));
  }, [markers]);

  const handleSearch = async () => {
    if (!searchQuery) return;
    const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${searchQuery}`);
    const data = await response.json();
    if (data.length > 0) {
      const position = [parseFloat(data[0].lat), parseFloat(data[0].lon)];
      setNewMarker({ ...newMarker, position, location: searchQuery, createdBy: user?.id });
      setMapCenter(position);
      setMapZoom(18);
      setSearchLocation(position);
    }
  };

  const addMarker = () => {
    if (newMarker.position) {
      setMarkers([...markers, { ...newMarker, id: Date.now() }]);
      setNewMarker({ name: "", location: "", viewingAngle: "", position: null, createdBy: null });
      setShowForm(false);
    }
  };

  const handleLogin = async () => {
    const response = await fetch("https://script.google.com/macros/s/AKfycbw-RBBpcjYT75blb_E85m-Vv9catNNYeNWY7gZvsm2zaHhOpNay8cGJnf6UGVBNbOqs/exec", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "login", email, password })
    });
    const data = await response.json();
    if (data.success) {
      setUser(data.user);
      localStorage.setItem("cctvUser", JSON.stringify(data.user));
    } else {
      alert("Login failed: " + data.error);
    }
  };

  const handleSignup = async () => {
    const response = await fetch("https://script.google.com/macros/s/AKfycbw-RBBpcjYT75blb_E85m-Vv9catNNYeNWY7gZvsm2zaHhOpNay8cGJnf6UGVBNbOqs/exec", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "signup", email, password, name })
    });
    const data = await response.json();
    if (data.success) {
      setUser(data.user);
      localStorage.setItem("cctvUser", JSON.stringify(data.user));
    } else {
      alert("Signup failed.");
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
              onClick={() => setShowForm(!showForm)}
            >
              ➕
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default CCTVFinder;
