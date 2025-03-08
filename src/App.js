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
        setMarkers(data.pinpoints);
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

  const handleRequestFootage = (marker) => {
    const emailBody = `Request for CCTV footage:\n\nLocation: ${marker.name}\nOwner: ${marker.userName}\nTime and Date: {INSERT DATE/TIME}\nAdditional Info: {INSERT INFO}`;
    window.location.href = `mailto:${marker.email}?subject=Request for CCTV Footage&body=${encodeURIComponent(emailBody)}`;
  };

  const handleSignOut = () => {
    localStorage.removeItem("cctvUser");
    setUser(null);
    setMarkers([]);
    alert("You have been signed out.");
  };

  return (
    <div className="h-screen w-full bg-gray-100">
      <header className="text-center py-4 bg-gray-800 text-white text-2xl font-bold">
        CCTV Finder
      </header>

      {!user ? (
        <div className="h-full flex items-center justify-center">
          <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md">
            <h2 className="text-2xl font-semibold text-center mb-4">{isSignUp ? "Create an Account" : "Welcome Back"}</h2>
            {isSignUp ? (
              <input type="text" placeholder="Full Name" className="w-full p-2 border rounded mb-2" />
            ) : null}
            <input type="email" placeholder="Email" className="w-full p-2 border rounded mb-2" />
            <input type="password" placeholder="Password" className="w-full p-2 border rounded mb-2" />
            <button onClick={isSignUp ? handleSignup : handleLogin} className="w-full bg-blue-500 text-white p-2 rounded">
              {isSignUp ? "Sign Up" : "Log In"}
            </button>
          </div>
        </div>
      ) : (
        <>
          <MapContainer center={mapCenter} zoom={13} className="h-[500px] w-full rounded-lg border">
            <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
            {markers.map((marker) => (
              <Marker key={marker.id} position={[marker.lat, marker.lng]} icon={customIcon}>
                <Popup>
                  <div>
                    <strong>{marker.name}</strong>
                    <p>Owner: {marker.userName}</p>
                    <p>Viewing Angle: {marker.viewingAngle}</p>
                    <button onClick={() => handleRequestFootage(marker)} className="bg-green-500 text-white p-2 rounded mt-2">
                      Request Footage
                    </button>
                  </div>
                </Popup>
              </Marker>
            ))}
          </MapContainer>

          <div className="fixed right-4 top-1/2 transform -translate-y-1/2 flex flex-col gap-4">
            <button onClick={fetchPinpoints} className="bg-blue-500 text-white p-4 rounded-full shadow-lg">➕</button>
            <button onClick={handleSignOut} className="bg-red-500 text-white p-4 rounded-full shadow-lg">🚪</button>
          </div>
        </>
      )}
    </div>
  );
};

export default CCTVFinder;
