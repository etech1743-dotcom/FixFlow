import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { BarChart3, CheckCircle2, ClipboardList, Clock3, Users } from "lucide-react";
import { api } from "../services/api";
import { StatCard } from "../components/Layout";
import { TicketTable } from "./UserDashboard";

export default function AdminDashboard() {
  const [data, setData] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    api.adminDashboard().then(setData).catch(() => {});
  }, []);

  if (!data) return <p className="empty-state">Loading operations dashboard...</p>;

  return (
    <>
      <section className="welcome-banner">
        <div className="welcome-text">
          <h2>Administrator overview</h2>
          <p>Monitor tickets, assignments, SLA risk, and workforce performance.</p>
        </div>
      </section>
      <section className="stats-grid">
        <StatCard icon={<ClipboardList />} title="Open" value={data.counts.open} type="blue" action="Tickets" onClick={() => navigate("/admin/tickets")} />
        <StatCard icon={<Clock3 />} title="In progress" value={data.counts.inProgress} type="orange" />
        <StatCard icon={<CheckCircle2 />} title="Resolved" value={data.counts.resolved} type="green" />
        <StatCard icon={<Users />} title="Overdue" value={data.counts.overdue} type="cyan" />
      </section>
      <section className="stats-grid">
        <StatCard icon={<BarChart3 />} title="Avg assign (hrs)" value={data.avgAssignHours} type="blue" />
        <StatCard icon={<BarChart3 />} title="Avg resolve (hrs)" value={data.avgResolutionHours} type="green" />
        <StatCard icon={<BarChart3 />} title="SLA compliance" value={`${data.slaCompliance}%`} type="cyan" />
        <StatCard icon={<BarChart3 />} title="Avg rating" value={data.avgRating} type="orange" />
      </section>
      <div className="panel" style={{ marginTop: 16 }}>
        <div className="panel-header">
          <div className="panel-title">
            <h3>Recent tickets</h3>
          </div>
        </div>
        <TicketTable tickets={data.recent || []} onView={(id) => navigate(`/tickets/${id}`)} />
      </div>
    </>
  );
}
