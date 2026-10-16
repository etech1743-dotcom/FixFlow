import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowRight,
  CheckCircle2,
  ClipboardList,
  Clock3,
  MapPin,
  PlusCircle,
  Zap,
} from "lucide-react";
import { api } from "../services/api";
import { useAuth } from "../context/AuthContext";
import { StatCard } from "../components/Layout";

export default function UserDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [tickets, setTickets] = useState([]);
  const [stats, setStats] = useState({});
  const [error, setError] = useState("");

  useEffect(() => {
    api
      .myTickets()
      .then((data) => {
        setTickets(data.tickets || []);
        setStats(data.stats || {});
      })
      .catch((err) => setError(err.message));
  }, []);

  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good Morning" : hour < 18 ? "Good Afternoon" : "Good Evening";

  return (
    <>
      <section className="welcome-banner">
        <div className="welcome-text">
          <h2>
            👋 {greeting}, {user.name?.split(" ")[0]}!
          </h2>
          <p>Report issues, track repairs, and confirm when the work is done.</p>
          <button className="primary-btn" style={{ marginTop: 16 }} onClick={() => navigate("/report-issue")}>
            <PlusCircle size={16} /> Report an Issue
          </button>
        </div>
      </section>

      <section className="stats-grid">
        <StatCard icon={<ClipboardList />} title="Open" value={stats.open || 0} action="View" type="blue" onClick={() => navigate("/my-tickets")} />
        <StatCard icon={<Clock3 />} title="In Progress" value={stats.inProgress || 0} action="Track" type="orange" onClick={() => navigate("/my-tickets")} />
        <StatCard icon={<CheckCircle2 />} title="Resolved" value={stats.resolved || 0} action="Confirm" type="green" onClick={() => navigate("/my-tickets")} />
        <StatCard icon={<Zap />} title="Urgent / High" value={stats.urgent || 0} action="View" type="cyan" onClick={() => navigate("/my-tickets")} />
      </section>

      <section className="dashboard-grid">
        <div className="panel tickets-panel">
          <div className="panel-header">
            <div className="panel-title">
              <ClipboardList size={21} />
              <h3>My Tickets</h3>
              <span className="count-badge">{tickets.length}</span>
            </div>
            <button className="view-all" onClick={() => navigate("/my-tickets")}>
              View All <ArrowRight size={16} />
            </button>
          </div>
          {error && <p className="alert error">{error}</p>}
          <TicketTable tickets={tickets.slice(0, 6)} onView={(id) => navigate(`/tickets/${id}`)} />
        </div>
        <div className="panel">
          <div className="panel-header">
            <div className="panel-title">
              <MapPin size={21} />
              <h3>Recent activity</h3>
            </div>
          </div>
          <div className="timeline">
            {tickets.slice(0, 5).map((ticket) => (
              <div className="timeline-item" key={ticket._id}>
                <div className="timeline-dot blue"></div>
                <div className="timeline-time">{new Date(ticket.updatedAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</div>
                <div className="timeline-details">
                  <strong>{ticket.title}</strong>
                  <small>{ticket.location?.address}</small>
                </div>
                <span className={`schedule-status ${ticket.status.toLowerCase().replace(" ", "-")}`}>
                  {ticket.status}
                </span>
              </div>
            ))}
            {tickets.length === 0 && <p className="empty-state">No tickets yet. Report your first issue.</p>}
          </div>
        </div>
      </section>
    </>
  );
}

export function TicketTable({ tickets, onView, extra }) {
  if (!tickets.length) {
    return <p className="empty-state">No tickets to show.</p>;
  }
  return (
    <div className="table-wrapper">
      <table>
        <thead>
          <tr>
            <th>ID</th>
            <th>Issue</th>
            <th>Location</th>
            <th>Priority</th>
            <th>Status</th>
            <th>Updated</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {tickets.map((ticket) => (
            <tr key={ticket._id}>
              <td>
                <div className={`ticket-dot ${ticket.priority === "High" || ticket.priority === "Urgent" ? "red" : ticket.priority === "Medium" ? "yellow" : "green"}`}></div>
                <strong>{ticket.ticketNumber}</strong>
              </td>
              <td>{ticket.title}</td>
              <td>{ticket.location?.address}</td>
              <td>
                <span className={`priority ${ticket.priority.toLowerCase()}`}>{ticket.priority}</span>
              </td>
              <td>
                <span className={`status ${ticket.status.toLowerCase().replace(" ", "-")}`}>{ticket.status}</span>
              </td>
              <td>{new Date(ticket.updatedAt).toLocaleString()}</td>
              <td>
                <div className="ticket-actions">
                  <button className="ticket-view" onClick={() => onView(ticket._id)}>View</button>
                  {extra?.(ticket)}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
