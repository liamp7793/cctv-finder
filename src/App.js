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
  const [newMarker, setNewMarker] = useState({ name: "", location: "", viewingAngle: "", position: null });
  const [mapCenter, setMapCenter] = useState([51.505, -0.09]);
  const [mapZoom, setMapZoom] = useState(18);
  const [searchLocation, setSearchLocation] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [showMenu, setShowMenu] = useState(false);

  const handleSearch = async () => {
    if (!searchQuery) return;
    const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${searchQuery}`);
    const data = await response.json();
    if (data.length > 0) {
      const position = [parseFloat(data[0].lat), parseFloat(data[0].lon)];
      setNewMarker({ ...newMarker, position, location: searchQuery });
      setMapCenter(position);
      setMapZoom(18);
      setSearchLocation(position);
    }
  };

  const addMarker = () => {
    if (newMarker.position) {
      setMarkers([...markers, { ...newMarker, id: Date.now() }]);
      setNewMarker({ name: "", location: "", viewingAngle: "", position: null });
      setShowForm(false);
    }
  };

  return (
    <div className="h-screen w-full flex flex-col items-center bg-gray-100">
      <header className="w-full bg-gray-900 text-white text-center p-4 shadow-md flex flex-col items-center justify-center">
        <img src="https://i.ibb.co/1frLh2fc/DALL-E-2025-03-05-21-30-02-A-sleek-modern-logo-representing-CCTV-surveillance-and-searching-The-desi.webp[/img" alt="CCTV Finder Logo" className="w-full max-w-5xl" />
        <h1 className="text-3xl font-semibold mt-2">CCTV Finder</h1>
      </header>
      <div className="flex space-x-2 p-4 bg-white shadow-md rounded-md w-full max-w-5xl mt-4">
        <input
          type="text"
          placeholder="Search address..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="p-2 border rounded-md w-72"
        />
        <button onClick={handleSearch} className="p-2 bg-blue-600 text-white rounded">Search</button>
      </div>
      <div className="border-4 border-gray-400 w-full max-w-5xl relative bg-white shadow-lg rounded-md overflow-hidden mt-4" style={{ height: "75vh" }}>
        <MapContainer center={mapCenter} zoom={mapZoom} style={{ height: "100%", width: "100%" }}>
          <ChangeView center={mapCenter} zoom={mapZoom} />
          <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
          {searchLocation && (
            <CircleMarker center={searchLocation} radius={10} color="blue" />
          )}
          {markers.map((marker) => (
            <Marker key={marker.id} position={marker.position} icon={customIcon}>
              <Popup>
                <div>
                  <p><strong>Name:</strong> {marker.name}</p>
                  <p><strong>Location:</strong> {marker.location}</p>
                  <p><strong>Viewing Angle:</strong> {marker.viewingAngle}</p>
                  <button className="mt-2 bg-blue-500 text-white p-2 rounded">Request Footage</button>
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>
      <footer className="w-full bg-gray-900 text-white text-center p-3 mt-4 shadow-md">© 2025 CCTV Finder | All Rights Reserved</footer>
    </div>
  );
};

export default CCTVFinder;
