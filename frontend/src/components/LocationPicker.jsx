import { useEffect, useState } from "react";
import {
  MapContainer,
  TileLayer,
  CircleMarker,
  useMap,
  useMapEvents,
} from "react-leaflet";
import "./LocationPicker.css";

const DEFAULT_CENTER = [30.1, 77.3];


function MapController({ position, onSelect }) {
  const map = useMap();

  useEffect(() => {
    if (position) {
      map.setView(position, 16);
    }
  }, [map, position]);

  useMapEvents({
    click(event) {
      onSelect(event.latlng.lat, event.latlng.lng);
    },
  });

  return null;
}


export default function LocationPicker({
  onLocationSelect,
  initialLocation = null,
}) {
  const [addressQuery, setAddressQuery] = useState("");
  const [position, setPosition] = useState(
    initialLocation?.lat != null && initialLocation?.lng != null
      ? [initialLocation.lat, initialLocation.lng]
      : null
  );
  const [selectedAddress, setSelectedAddress] = useState(
    initialLocation?.address || ""
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function reverseGeocode(lat, lng) {
    setLoading(true);
    setError("");

    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}`
      );

      if (!response.ok) {
        throw new Error("Address lookup failed. Please try again.");
      }

      const data = await response.json();
      const address = data.display_name || `${lat}, ${lng}`;

      setPosition([lat, lng]);
      setSelectedAddress(address);

      onLocationSelect?.({
        address,
        lat,
        lng,
        geo: {
          type: "Point",
          coordinates: [lng, lat],
        },
      });
    } catch (err) {
      setPosition([lat, lng]);
      setError(
        "Coordinates selected, but address lookup failed. Try again or search an address."
      );

      onLocationSelect?.({
        address: "",
        lat,
        lng,
        geo: {
          type: "Point",
          coordinates: [lng, lat],
        },
      });
    } finally {
      setLoading(false);
    }
  }

  async function searchAddress(event) {
    event.preventDefault();

    const query = addressQuery.trim();
    if (!query) {
      setError("Please enter an address to search.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const url = new URL(
        "https://nominatim.openstreetmap.org/search"
      );
      url.searchParams.set("format", "jsonv2");
      url.searchParams.set("limit", "1");
      url.searchParams.set("q", query);

      const response = await fetch(url);

      if (!response.ok) {
        throw new Error("Address search failed.");
      }

      const results = await response.json();

      if (!results.length) {
        setError("Address not found. Try a more specific address.");
        return;
      }

      const result = results[0];
      const lat = Number(result.lat);
      const lng = Number(result.lon);

      setPosition([lat, lng]);
      setSelectedAddress(result.display_name);

      onLocationSelect?.({
        address: result.display_name,
        lat,
        lng,
        geo: {
          type: "Point",
          coordinates: [lng, lat],
        },
      });
    } catch {
      setError("Could not search this address. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  function useCurrentLocation() {
    setError("");

    if (!navigator.geolocation) {
      setError("Your browser does not support location access.");
      return;
    }

    setLoading(true);

    navigator.geolocation.getCurrentPosition(
      ({ coords }) => {
        reverseGeocode(coords.latitude, coords.longitude);
      },
      (err) => {
        setLoading(false);
        setError(
          err.code === 1
            ? "Please allow location permission in your browser."
            : "Could not get your location. Search for an address instead."
        );
      },
      { enableHighAccuracy: true, timeout: 15000 }
    );
  }

  return (
    <div className="location-picker">
      <form className="location-search" onSubmit={searchAddress}>
        <input
          value={addressQuery}
          onChange={(event) => setAddressQuery(event.target.value)}
          placeholder="Search address or place"
          aria-label="Search address"
        />
        <button type="submit" disabled={loading}>
          Search
        </button>
      </form>

      <button
        type="button"
        className="current-location-button"
        onClick={useCurrentLocation}
        disabled={loading}
      >
        Use my current location
      </button>

      <p className="location-hint">
        Search for a place or click directly on the map to select a point.
      </p>

      <div className="location-map">
        <MapContainer
          center={position || DEFAULT_CENTER}
          zoom={position ? 16 : 7}
          scrollWheelZoom
          style={{ height: "100%", width: "100%" }}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          <MapController
            position={position}
            onSelect={reverseGeocode}
          />

          {position && (
            <CircleMarker
              center={position}
              radius={9}
              pathOptions={{
                color: "#ffffff",
                weight: 3,
                fillColor: "#2563eb",
                fillOpacity: 1,
              }}
            />
          )}
        </MapContainer>
      </div>

      {loading && <p>Finding location...</p>}

      {error && <p className="location-error">{error}</p>}

      {selectedAddress && (
        <div className="selected-location">
          <strong>Selected address</strong>
          <p>{selectedAddress}</p>
          {position && (
            <small>
              Latitude: {position[0].toFixed(6)}, Longitude:{" "}
              {position[1].toFixed(6)}
            </small>
          )}
        </div>
      )}
    </div>
  );
}
