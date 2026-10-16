
import { useState } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
} from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { api } from "../services/api"
import "./TicketNavigation.css";

const destinationIcon = L.divIcon({
  className: "fixflow-destination-marker",
  html: "📍",
  iconSize: [36, 36],
  iconAnchor: [18, 34],
});

export default function TicketNavigation({ ticket, onStarted }) {
  const [starting, setStarting] = useState(false);
  const [error, setError] = useState("");

  const coordinates = ticket?.location?.geo?.coordinates;
  const validCoordinates =
    Array.isArray(coordinates) &&
    coordinates.length === 2 &&
    Number.isFinite(coordinates[0]) &&
    Number.isFinite(coordinates[1]) &&
    coordinates[0] >= -180 &&
    coordinates[0] <= 180 &&
    coordinates[1] >= -90 &&
    coordinates[1] <= 90;

  if (!validCoordinates) {
    return (
      <div className="ticket-navigation-error">
        Destination coordinates are missing for this ticket.
        Please update the customer's location before navigating.
      </div>
    );
  }

  // GeoJSON coordinates are [longitude, latitude].
  const [longitude, latitude] = coordinates;

  const openNavigation = () => {
    const params = new URLSearchParams({
      api: "1",
      destination: `${latitude},${longitude}`,
      travelmode: "driving",
      dir_action: "navigate",
    });

    window.open(
      `https://www.google.com/maps/dir/?${params.toString()}`,
      "_blank",
      "noopener,noreferrer"
    );
  };

  const handleStartJob = async () => {
    if (starting) return;

    setError("");
    setStarting(true);

    // Open a tab synchronously to avoid popup blocking after the API call.
    const navigationTab = window.open("about:blank", "_blank");

    try {
      await api.startJob(ticket._id);

      if (navigationTab) {
        const params = new URLSearchParams({
          api: "1",
          destination: `${latitude},${longitude}`,
          travelmode: "driving",
          dir_action: "navigate",
        });

        navigationTab.location.href =
          `https://www.google.com/maps/dir/?${params.toString()}`;
      } else {
        openNavigation();
      }

      onStarted?.();
    } catch (err) {
      if (navigationTab) navigationTab.close();
      setError(err.message || "Unable to start this job.");
    } finally {
      setStarting(false);
    }
  };

  return (
    <section className="ticket-navigation">
      <div className="ticket-navigation-heading">
        <div>
          <h3>Navigate to Customer</h3>
          <p>{ticket.location?.address}</p>
        </div>
        <span className="navigation-badge">
          {ticket.status}
        </span>
      </div>

      <div className="ticket-map">
        <MapContainer
          center={[latitude, longitude]}
          zoom={15}
          scrollWheelZoom
          style={{ height: "100%", width: "100%" }}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <Marker
            position={[latitude, longitude]}
            icon={destinationIcon}
          >
            <Popup>
              <strong>Customer destination</strong>
              <br />
              {ticket.location?.address}
            </Popup>
          </Marker>
        </MapContainer>
      </div>

      {error && (
        <p className="ticket-navigation-error">{error}</p>
      )}

      <div className="ticket-navigation-actions">
        <button
          type="button"
          className="ticket-route-button"
          onClick={openNavigation}
        >
          View Route
        </button>

        {ticket.status !== "In Progress" ? (
          <button
            type="button"
            className="ticket-start-button"
            onClick={handleStartJob}
            disabled={starting}
          >
            {starting ? "Starting Job..." : "Start Job & Navigate"}
          </button>
        ) : (
          <button
            type="button"
            className="ticket-start-button"
            onClick={openNavigation}
          >
            Resume Navigation
          </button>
        )}
      </div>
    </section>
  );
}
