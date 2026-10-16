import { useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { api } from "../services/api";
import { TicketTable } from "./UserDashboard";

export default function MyTickets() {
  const [tickets, setTickets] = useState([]);
  const [status, setStatus] = useState("");
  const [category, setCategory] = useState("");
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const q = params.get("q") || "";

  useEffect(() => {
    const query = new URLSearchParams();
    if (status) query.set("status", status);
    if (category) query.set("category", category);
    api.myTickets(query.toString() ? `?${query}` : "").then((data) => setTickets(data.tickets || []));
  }, [status, category]);

  const filtered = useMemo(() => {
    if (!q) return tickets;
    return tickets.filter((t) =>
      `${t.title} ${t.ticketNumber} ${t.location?.address}`.toLowerCase().includes(q.toLowerCase())
    );
  }, [tickets, q]);

  return (
    <div className="list-card">
      <h2>My Tickets</h2>
      <div className="filter-row">
        <select value={status} onChange={(e) => setStatus(e.target.value)}>
          <option value="">All statuses</option>
          {["Open", "Assigned", "In Progress", "Resolved", "Closed", "Reopened"].map((s) => (
            <option key={s}>{s}</option>
          ))}
        </select>
        <select value={category} onChange={(e) => setCategory(e.target.value)}>
          <option value="">All categories</option>
          {["Plumbing", "Electrical", "HVAC", "Carpentry", "Painting", "Appliance", "Cleaning", "General"].map((s) => (
            <option key={s}>{s}</option>
          ))}
        </select>
      </div>
      <TicketTable tickets={filtered} onView={(id) => navigate(`/tickets/${id}`)} />
    </div>
  );
}
