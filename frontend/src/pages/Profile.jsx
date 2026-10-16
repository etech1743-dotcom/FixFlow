import { useState } from "react";
import { api } from "../services/api";
import { useAuth } from "../context/AuthContext";

export default function Profile() {
  const { user, setUser } = useAuth();
  const [form, setForm] = useState({
    name: user.name || "",
    phone: user.phone || "",
    address: user.address || "",
    serviceArea: user.serviceArea || "",
    category: user.category || "",
    skills: (user.skills || []).join(", "),
  });
  const [passwords, setPasswords] = useState({ currentPassword: "", newPassword: "" });
  const [message, setMessage] = useState("");

  const save = async (e) => {
    e.preventDefault();
    try {
      const data = await api.updateProfile(form);
      setUser(data.user);
      localStorage.setItem("user", JSON.stringify(data.user));
      setMessage("Profile updated");
    } catch (error) {
      setMessage(error.message);
    }
  };

  const changePassword = async (e) => {
    e.preventDefault();
    try {
      const data = await api.changePassword(passwords);
      setMessage(data.message);
    } catch (error) {
      setMessage(error.message);
    }
  };

  return (
    <div className="detail-grid">
      <form className="form-card form-grid" onSubmit={save}>
        <h2 className="field full">Profile</h2>
        <div className="field">
          <label>Name</label>
          <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
        </div>
        <div className="field">
          <label>Phone</label>
          <input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
        </div>
        <div className="field full">
          <label>Address</label>
          <input value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} />
        </div>
        {user.role === "worker" && (
          <>
            <div className="field">
              <label>Service area</label>
              <input value={form.serviceArea} onChange={(e) => setForm({ ...form, serviceArea: e.target.value })} />
            </div>
            <div className="field">
              <label>Category</label>
              <input value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} />
            </div>
            <div className="field full">
              <label>Skills</label>
              <input value={form.skills} onChange={(e) => setForm({ ...form, skills: e.target.value })} />
            </div>
          </>
        )}
        <div className="field full">
          <button className="primary-btn">Save profile</button>
        </div>
      </form>
      <form className="form-card" onSubmit={changePassword}>
        <h3>Change password</h3>
        <div className="field" style={{ marginTop: 12 }}>
          <label>Current password</label>
          <input type="password" value={passwords.currentPassword} onChange={(e) => setPasswords({ ...passwords, currentPassword: e.target.value })} />
        </div>
        <div className="field" style={{ marginTop: 12 }}>
          <label>New password</label>
          <input type="password" value={passwords.newPassword} onChange={(e) => setPasswords({ ...passwords, newPassword: e.target.value })} />
        </div>
        <button className="ghost-btn" style={{ marginTop: 16 }}>Update password</button>
        {message && <p className="alert">{message}</p>}
      </form>
    </div>
  );
}
