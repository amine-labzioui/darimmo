import { useEffect } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  useMapEvents,
} from "react-leaflet";

import L from "leaflet";

delete L.Icon.Default.prototype._getIconUrl;

L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

function LocationMarker({
  position,
  setPosition,
}) {
  useMapEvents({
    click(e) {
      setPosition({
        lat: e.latlng.lat,
        lng: e.latlng.lng,
      });
    },
  });

  if (!position) return null;

  return <Marker position={position} />;
}

function ChangeView({ position }) {
  const map = useMapEvents({});

  useEffect(() => {
    if (position) {
      map.setView(position, 15);
    }
  }, [position, map]);

  return null;
}

export default function MapPicker({
  position,
  setPosition,
}) {
  return (
    <MapContainer
      center={position || { lat: 31.6295, lng: -7.9811 }}
      zoom={13}
      style={{
        height: "420px",
        width: "100%",
        borderRadius: "20px",
      }}
    >
      <TileLayer
        attribution="© OpenStreetMap"
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      <ChangeView position={position} />

      <LocationMarker
        position={position}
        setPosition={setPosition}
      />
    </MapContainer>
  );
}