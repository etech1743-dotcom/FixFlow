import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../services/api";

export default function Notifications() {
  const [items, setItems] = useState([]);
  const navigate = useNavigate();

  const load = () => api.notifications().then((d) => setItems(d.notifications || []));

  useEffect(() => {
    load();
  }, []);

  return (
    <div className="list-card">
      <div className="panel-header" style={{ padding: 0, marginBottom: 12 }}>
        <h2>Notifications</h2>
        <button className="ghost-btn" onClick={async () => { await api.markAllRead(); load(); }}>
          Mark all read
        </button>
      </div>
      {items.length === 0 && <p className="empty-state">You are all caught up.</p>}
      {items.map((item) => (
        <div className={`notif-item ${item.read ? "" : "unread"}`} key={item._id}>
          <div>
            <strong>{item.message}</strong>
            <p style={{ color: "#8ea7c8", marginTop: 6 }}>{new Date(item.createdAt).toLocaleString()}</p>
          </div>
          <div className="ticket-actions">
            {!item.read && (
              <button className="ghost-btn" onClick={async () => { await api.markRead(item._id); load(); }}>
                Read
              </button>
            )}
            {item.ticket && (
              <button className="ticket-view" onClick={() => navigate(`/tickets/${item.ticket._id || item.ticket}`)}>
                Open
              </button>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
