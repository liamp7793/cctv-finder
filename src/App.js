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
  const [markers, setMarkers] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [map, setMap] = useState(null);

  const handleMapClick = (e) => {
    const newMarker = {
      id: Date.now(),
      position: e.latlng,
      name: "New CCTV",
      location: "Unknown",
      viewingAngle: "Unknown",
    };
    setMarkers((prevMarkers) => [...prevMarkers, newMarker]);
  };

  useEffect(() => {
    if (map) {
      map.on("click", handleMapClick);
    }
  }, [map]);

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  return (
    <div className="h-screen w-full relative">
      <h1 className="text-2xl font-bold text-center p-4 bg-gray-800 text-white">CCTV Finder</h1>
      <div className="absolute top-16 left-4 z-10">
        <input
          type="text"
          placeholder="Search address..."
          value={searchQuery}
          onChange={handleSearchChange}
          className="p-2 border rounded-md w-72"
        />
      </div>
      <MapContainer
        center={[51.505, -0.09]}
        zoom={13}
        className="h-full w-full"
        whenCreated={setMap}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
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
      <div className="absolute top-16 right-4 flex flex-col space-y-2 bg-white p-4 shadow-md rounded-md">
        <button onClick={() => alert("Click on the map to add a pinpoint.")} className="bg-green-500 text-white p-2 rounded">Add Pinpoint</button>
        <button onClick={() => alert("Edit Pinpoint Feature Coming Soon")} className="bg-yellow-500 text-white p-2 rounded">Edit Pinpoint</button>
      </div>
    </div>
  );
};

export default CCTVFinder;
