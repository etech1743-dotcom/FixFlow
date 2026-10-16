import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { api } from "../services/api";
import { TicketTable } from "./UserDashboard";

export default function AdminTickets() {
  const [tickets, setTickets] = useState([]);
  const [workers, setWorkers] = useState([]);
  const [status, setStatus] = useState("");
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const q = params.get("q") || "";

  const load = () => {
    const query = new URLSearchParams();
    if (status) query.set("status", status);
    if (q) query.set("q", q);
    api.adminTickets(`?${query}`).then((data) => setTickets(data.tickets || []));
  };

  useEffect(() => {
    load();
    api.adminWorkers().then((data) => setWorkers(data.workers || []));
  }, [status, q]);

  return (
    <div className="list-card">
      <h2>All tickets</h2>
      <div className="filter-row">
        <select value={status} onChange={(e) => setStatus(e.target.value)}>
          <option value="">All statuses</option>
          {["Open", "Assigned", "In Progress", "Resolved", "Closed", "Reopened"].map((s) => (
            <option key={s}>{s}</option>
          ))}
        </select>
      </div>
      <TicketTable
        tickets={tickets}
        onView={(id) => navigate(`/tickets/${id}`)}
        extra={(ticket) => (
          <select
            defaultValue=""
            onChange={async (e) => {
              if (!e.target.value) return;
              await api.assignWorker(ticket._id, e.target.value);
              load();
            }}
          >
            <option value="">Assign worker</option>
            {workers
              .filter((w) => w.isActive && w.isApproved)
              .map((w) => (
                <option key={w._id} value={w._id}>
                  {w.name} ({w.category})
                </option>
              ))}
          </select>
        )}
      />
    </div>
  );
}
