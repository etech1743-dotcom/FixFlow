import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { api } from "../services/api";
import { useAuth } from "../context/AuthContext";

export default function TicketDetails() {
  const { id } = useParams();
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [comment, setComment] = useState("");
  const [notes, setNotes] = useState("");
  const [rating, setRating] = useState(5);
  const [feedback, setFeedback] = useState("");
  const [message, setMessage] = useState("");

  const load = () => api.getTicket(id).then(setData).catch((e) => setMessage(e.message));

  useEffect(() => {
    load();
  }, [id]);

  if (!data?.ticket) return <p className="empty-state">{message || "Loading ticket..."}</p>;

  const ticket = data.ticket;
  const isOwner =
    user.role === "user" && String(ticket.createdBy?._id || ticket.createdBy) === String(user._id);
  const isAssignee =
    user.role === "worker" &&
    String(ticket.assignedWorker?._id || ticket.assignedWorker) === String(user._id);

  const run = async (fn) => {
    try {
      setMessage("");
      await fn();
      await load();
    } catch (error) {
      setMessage(error.message);
    }
  };

  return (
    <div className="detail-grid">
      <div className="form-card">
        <h2>{ticket.title}</h2>
        <p style={{ color: "#8ea7c8" }}>{ticket.ticketNumber} · {ticket.category}</p>
        <p style={{ margin: "14px 0" }}>{ticket.description}</p>
        <div className="ticket-actions">
          <span className={`priority ${ticket.priority.toLowerCase()}`}>{ticket.priority}</span>
          <span className={`status ${ticket.status.toLowerCase().replace(" ", "-")}`}>{ticket.status}</span>
        </div>
        {ticket.attachments?.length > 0 && (
          <div style={{ marginTop: 16, display: "flex", gap: 8, flexWrap: "wrap" }}>
            {ticket.attachments.map((file) => (
              <a key={file.url} href={file.url} target="_blank" rel="noreferrer">
                <img src={file.url} alt="" style={{ width: 90, height: 90, objectFit: "cover", borderRadius: 8 }} />
              </a>
            ))}
          </div>
        )}
        {ticket.resolutionNotes && (
          <p style={{ marginTop: 16 }}><strong>Resolution:</strong> {ticket.resolutionNotes}</p>
        )}

        <div className="ticket-actions" style={{ marginTop: 18 }}>
          {isOwner && ticket.status === "Resolved" && (
            <button className="primary-btn" onClick={() => run(() => api.confirm(ticket._id))}>Confirm repair</button>
          )}
          {isOwner && ["Resolved", "Closed"].includes(ticket.status) && (
            <button className="ghost-btn" onClick={() => run(() => api.reopen(ticket._id, "Still not fixed"))}>Reopen</button>
          )}
          {isAssignee && ticket.status === "Assigned" && (
            <button className="primary-btn" onClick={() => run(() => api.startJob(ticket._id))}>Start job</button>
          )}
        </div>

        {isAssignee && ["Assigned", "In Progress"].includes(ticket.status) && (
          <form
            style={{ marginTop: 18 }}
            onSubmit={(e) => {
              e.preventDefault();
              const formData = new FormData();
              formData.append("resolutionNotes", notes);
              run(() => api.resolveJob(ticket._id, formData));
            }}
          >
            <div className="field">
              <label>Resolution notes</label>
              <textarea value={notes} onChange={(e) => setNotes(e.target.value)} required />
            </div>
            <button className="primary-btn" style={{ marginTop: 10 }}>Mark resolved</button>
          </form>
        )}

        {isOwner && ["Resolved", "Closed"].includes(ticket.status) && !data.review && (
          <form
            style={{ marginTop: 18 }}
            onSubmit={(e) => {
              e.preventDefault();
              run(() => api.review(ticket._id, { rating, feedback }));
            }}
          >
            <div className="field">
              <label>Rating</label>
              <select value={rating} onChange={(e) => setRating(Number(e.target.value))}>
                {[1, 2, 3, 4, 5].map((n) => (
                  <option key={n} value={n}>{n} star{n > 1 ? "s" : ""}</option>
                ))}
              </select>
            </div>
            <div className="field">
              <label>Feedback</label>
              <textarea value={feedback} onChange={(e) => setFeedback(e.target.value)} />
            </div>
            <button className="primary-btn" style={{ marginTop: 10 }}>Submit review</button>
          </form>
        )}

        <h3 style={{ marginTop: 28 }}>Comments</h3>
        <div className="comment-list">
          {data.comments.map((c) => (
            <div className="comment-item" key={c._id}>
              <strong>{c.author?.name}</strong>
              <p>{c.body}</p>
            </div>
          ))}
        </div>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            run(async () => {
              await api.comment(ticket._id, comment);
              setComment("");
            });
          }}
        >
          <div className="field">
            <label>Add comment</label>
            <textarea value={comment} onChange={(e) => setComment(e.target.value)} required />
          </div>
          <button className="ghost-btn" style={{ marginTop: 10 }}>Post</button>
        </form>
        {message && <p className="alert">{message}</p>}
      </div>

      <div className="form-card">
        <h3>Details</h3>
        <div className="meta-list" style={{ marginTop: 12 }}>
          <div>Location: {ticket.location?.address}</div>
          <div>Reporter: {ticket.createdBy?.name}</div>
          <div>Worker: {ticket.assignedWorker?.name || "Unassigned"}</div>
          <div>Created: {new Date(ticket.createdAt).toLocaleString()}</div>
          {ticket.acceptedAt && <div>Accepted: {new Date(ticket.acceptedAt).toLocaleString()}</div>}
          {ticket.resolvedAt && <div>Resolved: {new Date(ticket.resolvedAt).toLocaleString()}</div>}
        </div>
        <h3 style={{ marginTop: 24 }}>History</h3>
        <div className="history-list">
          {data.history.map((h) => (
            <div className="history-item" key={h._id}>
              <strong>{h.action}</strong>
              <p>{h.actor?.name} · {h.fromStatus || ""} {h.toStatus ? `→ ${h.toStatus}` : ""}</p>
              <small>{new Date(h.createdAt).toLocaleString()}</small>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
