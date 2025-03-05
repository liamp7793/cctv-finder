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
  const [markers, setMarkers] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [newMarker, setNewMarker] = useState({ name: "", location: "", viewingAngle: "", position: null });

  const handleSearch = async () => {
    if (!searchQuery) return;
    const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${searchQuery}`);
    const data = await response.json();
    if (data.length > 0) {
      setNewMarker({ ...newMarker, position: [data[0].lat, data[0].lon], location: searchQuery });
    }
  };

  const addMarker = () => {
    if (newMarker.position) {
      setMarkers([...markers, { ...newMarker, id: Date.now() }]);
      setNewMarker({ name: "", location: "", viewingAngle: "", position: null });
    }
  };

  return (
    <div className="h-screen w-full relative">
      <h1 className="text-2xl font-bold text-center p-4 bg-gray-800 text-white">CCTV Finder</h1>
      <div className="absolute top-16 left-4 z-10 flex space-x-2">
        <input
          type="text"
          placeholder="Search address..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="p-2 border rounded-md w-72"
        />
        <button onClick={handleSearch} className="p-2 bg-blue-500 text-white rounded">Search</button>
      </div>
      <MapContainer
        center={[51.505, -0.09]}
        zoom={13}
        style={{ height: "100vh", width: "100%" }}
      >
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
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
      <div className="absolute top-16 right-4 flex flex-col space-y-2 bg-white p-4 shadow-md rounded-md w-48">
        <button className="bg-green-500 text-white p-2 rounded" onClick={() => document.getElementById('addPinpointForm').classList.toggle('hidden')}>Add Pinpoint</button>
        <button className="bg-yellow-500 text-white p-2 rounded">Edit Pinpoint</button>
        <div id="addPinpointForm" className="hidden flex flex-col space-y-2 p-2 border rounded-md bg-gray-100">
          <input
            type="text"
            placeholder="Camera Name"
            value={newMarker.name}
            onChange={(e) => setNewMarker({ ...newMarker, name: e.target.value })}
            className="p-2 border rounded"
          />
          <input
            type="text"
            placeholder="Viewing Angle"
            value={newMarker.viewingAngle}
            onChange={(e) => setNewMarker({ ...newMarker, viewingAngle: e.target.value })}
            className="p-2 border rounded"
          />
          <button onClick={addMarker} className="bg-blue-500 text-white p-2 rounded">Add to Map</button>
        </div>
      </div>
    </div>
  );
};

export default CCTVFinder;
