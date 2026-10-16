
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../services/api";
import LocationPicker from "../components/LocationPicker";

const CATEGORIES = [
  "Plumbing",
  "Electrical",
  "HVAC",
  "Carpentry",
  "Painting",
  "Appliance",
  "Cleaning",
  "General",
];

const PRIORITIES = ["Low", "Medium", "High", "Urgent"];

export default function ReportIssue() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    title: "",
    description: "",
    category: "Plumbing",
    priority: "Medium",
    address: "",
    latitude: "",
    longitude: "",
  });

  const [files, setFiles] = useState([]);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const onChange = (e) => {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
      ...(name === "address"
        ? { latitude: "", longitude: "" }
        : {}),
    }));
  };

  const handleLocationSelect = (location) => {
    setForm((prev) => ({
      ...prev,
      address: location.address || prev.address,
      latitude: String(location.lat),
      longitude: String(location.lng),
    }));

    setMessage("Location selected successfully.");
  };

  const submit = async (e) => {
    e.preventDefault();
    setMessage("");

    if (form.latitude === "" || form.longitude === "") {
      setMessage(
        "Please select your location on the map or use your current location."
      );
      return;
    }

    setLoading(true);

    try {
      const data = new FormData();

      Object.entries(form).forEach(([key, value]) => {
        data.append(key, value);
      });

      files.forEach((file) => {
        data.append("photos", file);
      });

      const result = await api.createTicket(data);

      setMessage(result.message || "Ticket created successfully.");
      navigate(`/tickets/${result.ticket._id}`);
    } catch (error) {
      setMessage(error.message || "Unable to create ticket.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="form-card">
      <h2>Report an Issue</h2>

      <p style={{ color: "#8ea7c8", margin: "8px 0 20px" }}>
        Create a maintenance ticket. Matching workers in this category
        will be notified.
      </p>

      <form className="form-grid" onSubmit={submit}>
        <div className="field full">
          <label>Title</label>
          <input
            name="title"
            value={form.title}
            onChange={onChange}
            required
            placeholder="Leaking bathroom tap"
          />
        </div>

        <div className="field">
          <label>Category</label>
          <select
            name="category"
            value={form.category}
            onChange={onChange}
          >
            {CATEGORIES.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
        </div>

        <div className="field">
          <label>Priority</label>
          <select
            name="priority"
            value={form.priority}
            onChange={onChange}
          >
            {PRIORITIES.map((priority) => (
              <option key={priority} value={priority}>
                {priority}
              </option>
            ))}
          </select>
        </div>

        <div className="field full">
          <label>Description</label>
          <textarea
            name="description"
            value={form.description}
            onChange={onChange}
            required
          />
        </div>

        <div className="field full">
          <label>Search or select your location</label>

          <LocationPicker
            onLocationSelect={handleLocationSelect}
            initialLocation={
              form.latitude !== "" && form.longitude !== ""
                ? {
                    lat: Number(form.latitude),
                    lng: Number(form.longitude),
                    address: form.address,
                  }
                : null
            }
          />
        </div>

        <div className="field full">
          <label>Selected address</label>
          <input
            name="address"
            value={form.address}
            onChange={onChange}
            required
            placeholder="Select a point on the map"
          />
        </div>

        <div className="field">
          <label>Latitude</label>
          <input value={form.latitude} readOnly placeholder="Select location on map" />
        </div>

        <div className="field">
          <label>Longitude</label>
          <input value={form.longitude} readOnly placeholder="Select location on map" />
        </div>

        <div className="field full">
          <label>Photos (optional)</label>
          <input
            type="file"
            accept="image/*"
            multiple
            onChange={(e) => setFiles(Array.from(e.target.files || []))}
          />
        </div>

        <div className="field full">
          <button className="primary-btn" disabled={loading}>
            {loading ? "Submitting..." : "Submit ticket"}
          </button>

          {message && <p className="alert">{message}</p>}
        </div>
      </form>
    </div>
  );
}
