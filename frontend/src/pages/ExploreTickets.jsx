import { useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { api } from "../services/api";
import { TicketTable } from "./UserDashboard";

export default function ExploreTickets() {
  const [tickets, setTickets] = useState([]);
  const [message, setMessage] = useState("");
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const q = params.get("q") || "";

  const load = () => api.availableTickets().then((data) => setTickets(data.tickets || []));

  useEffect(() => {
    load();
  }, []);

  const filtered = useMemo(() => {
    if (!q) return tickets;
    return tickets.filter((t) =>
      `${t.title} ${t.category} ${t.location?.address}`.toLowerCase().includes(q.toLowerCase())
    );
  }, [tickets, q]);

  const accept = async (id) => {
    try {
      await api.acceptTicket(id);
      navigate(`/tickets/${id}`);
    } catch (error) {
      setMessage(error.message);
    }
  };

  const ignore = async (id) => {
    await api.ignoreTicket(id);
    load();
  };

  return (
    <div className="list-card">
      <h2>Explore Tickets</h2>
      <p style={{ color: "#8ea7c8", marginBottom: 16 }}>
        Jobs matched to your category and service area. Acceptance is race-safe — only one worker can claim a ticket.
      </p>
      {message && <p className="alert error">{message}</p>}
      <TicketTable
        tickets={filtered}
        onView={(id) => navigate(`/tickets/${id}`)}
        extra={(ticket) => (
          <>
            <button className="ticket-view" onClick={() => accept(ticket._id)}>Accept</button>
            <button className="ghost-btn" onClick={() => ignore(ticket._id)}>Ignore</button>
          </>
        )}
      />
    </div>
  );
}
