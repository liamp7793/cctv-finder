import React, { useState, useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
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
  const [mapCenter, setMapCenter] = useState([51.505, -0.09]);
  const [searchQuery, setSearchQuery] = useState("");

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
      console.log("📍 Pinpoints fetched:", data.pinpoints);
      if (data.success) {
        setMarkers(data.pinpoints);
        if (data.pinpoints.length > 0) {
          setMapCenter([data.pinpoints[0].lat, data.pinpoints[0].lng]);
        }
      }
    } catch (error) {
      console.error("Error fetching pinpoints:", error);
    }
  };

  const handleLogin = async () => {
    try {
      const response = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "login", email: loginData.email, password: loginData.password })
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
        body: JSON.stringify({ action: "signup", email: signupData.email, password: signupData.password, name: signupData.name })
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
    alert("You have been signed out.");
  };

  const handleAddPinpoint = () => {
    alert("Feature to add pinpoint coming soon!");
  };

  const handleSearch = async () => {
    if (!searchQuery) return;
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${searchQuery}`
      );
      const data = await response.json();
      if (data.length > 0) {
        setMapCenter([data[0].lat, data[0].lon]);
      }
    } catch (error) {
      console.error("Error searching location:", error);
    }
  };

  return (
    <div className="h-screen w-full bg-gray-100 relative">
      <header className="text-center py-4 bg-gray-800 text-white text-2xl font-bold">
        CCTV Finder
      </header>

      {/* ✅ Search Bar */}
      {user && (
        <div className="absolute top-16 left-1/2 transform -translate-x-1/2 z-10 w-full max-w-lg">
          <input
            type="text"
            placeholder="Search location..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full p-2 border rounded"
          />
          <button
            onClick={handleSearch}
            className="mt-2 bg-blue-500 text-white p-2 rounded w-full"
          >
            Search
          </button>
        </div>
      )}

      {/* ✅ Floating Buttons */}
      {user && (
        <div className="absolute top-20 right-4 z-10 flex flex-col gap-4">
          <button
            onClick={handleAddPinpoint}
            className="bg-green-500 text-white p-3 rounded-full shadow-lg"
          >
            ➕
          </button>
          <button
            onClick={handleSignOut}
            className="bg-red-500 text-white p-3 rounded-full shadow-lg"
          >
            🚪
          </button>
        </div>
      )}

      {user && (
        <MapContainer center={mapCenter} zoom={13} style={{ height: "100vh", width: "100%" }}>
          <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
          {markers.map((marker) => (
            <Marker key={marker.id} position={[marker.lat, marker.lng]} icon={customIcon}>
              <Popup>
                <div>
                  <strong>{marker.name}</strong>
                  <p>Owner: {marker.userName}</p>
                  <button
                    onClick={() => alert("Request feature coming soon!")}
                    className="mt-2 bg-blue-500 text-white p-2 rounded"
                  >
                    Request Footage
                  </button>
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
