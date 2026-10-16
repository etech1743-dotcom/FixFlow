import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowRight,
  CalendarDays,
  CheckCircle2,
  ClipboardList,
  Clock3,
  MapPin,
  Navigation,
  Search,
  Settings,
  User,
  Zap,
} from "lucide-react";
import { api } from "../../services/api";
import { useAuth } from "../../context/AuthContext";
import { StatCard } from "../../components/Layout";
import { TicketTable } from "../UserDashboard";
import "./WorkerDashboard.css";

function WorkerDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [jobs, setJobs] = useState([]);
  const [available, setAvailable] = useState([]);
  const [stats, setStats] = useState({});
  const [limit, setLimit] = useState({ used: 0, limit: 5, remaining: 5 });

  const load = () => {
    Promise.all([api.myJobs(), api.availableTickets(), api.myStats(), api.acceptanceLimit()])
      .then(([jobsData, availData, statsData, limitData]) => {
        setJobs(jobsData.tickets || []);
        setAvailable(availData.tickets || []);
        setStats(statsData);
        setLimit(limitData);
      })
      .catch(() => {});
  };

  useEffect(() => {
    load();
  }, []);

  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good Morning" : hour < 18 ? "Good Afternoon" : "Good Evening";
  const pct = limit.limit ? Math.round((limit.used / limit.limit) * 100) : 0;

  return (
    <>
      <section className="welcome-banner">
        <div className="welcome-text">
          <h2>
            👋 {greeting}, {user.name?.split(" ")[0]}!
          </h2>
          <p>Here are your assigned tickets and nearby requests.</p>
          <p>Keep up the great work!</p>
        </div>
        <div className="worker-banner">👷</div>
        <div className="request-limit">
          <div className="limit-title">
            <Navigation size={19} />
            <span>Daily Request Limit</span>
          </div>
          <div className="limit-progress">
            <div className="progress-bar">
              <div className="progress-fill" style={{ width: `${pct}%` }}></div>
            </div>
            <strong>
              {limit.used} / {limit.limit}
            </strong>
          </div>
          <p>You can take {limit.remaining} more requests today.</p>
        </div>
      </section>

      <section className="stats-grid">
        <StatCard icon={<ClipboardList />} title="Assigned Tickets" value={stats.assigned || 0} action="View All" type="blue" onClick={() => navigate("/my-jobs")} />
        <StatCard icon={<MapPin />} title="Nearby Requests" value={available.length} action="Explore Tickets" type="cyan" onClick={() => navigate("/explore-tickets")} />
        <StatCard icon={<Clock3 />} title="In Progress" value={stats.inProgress || 0} action="View" type="orange" onClick={() => navigate("/my-jobs")} />
        <StatCard icon={<CheckCircle2 />} title="Resolved Today" value={stats.resolvedToday || 0} action="View" type="green" onClick={() => navigate("/my-jobs")} />
      </section>

      <section className="dashboard-grid">
        <div className="panel tickets-panel">
          <div className="panel-header">
            <div className="panel-title">
              <ClipboardList size={21} />
              <h3>My Assigned Tickets</h3>
              <span className="count-badge">{jobs.length}</span>
            </div>
            <button className="view-all" onClick={() => navigate("/my-jobs")}>
              View All <ArrowRight size={16} />
            </button>
          </div>
          <TicketTable tickets={jobs.slice(0, 6)} onView={(id) => navigate(`/tickets/${id}`)} />
        </div>

        <div className="panel schedule-panel">
          <div className="panel-header">
            <div className="panel-title">
              <CalendarDays size={21} />
              <h3>Today's Schedule</h3>
            </div>
          </div>
          <div className="timeline">
            {jobs.slice(0, 5).map((item) => (
              <div className="timeline-item" key={item._id}>
                <div className="timeline-dot blue"></div>
                <div className="timeline-time">
                  {new Date(item.updatedAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                </div>
                <div className="timeline-details">
                  <strong>{item.title}</strong>
                  <small>
                    <MapPin size={12} />
                    {item.location?.address}
                  </small>
                </div>
                <span className={`schedule-status ${item.status.toLowerCase().replace(" ", "-")}`}>
                  {item.status}
                </span>
              </div>
            ))}
            {jobs.length === 0 && <p className="empty-state">No assigned jobs yet. Explore nearby tickets.</p>}
          </div>
        </div>
      </section>

      <section className="bottom-grid">
        <div className="bottom-card location-card">
          <div className="bottom-icon">
            <Navigation size={25} />
          </div>
          <div>
            <h4>Specialty</h4>
            <p>
              <MapPin size={14} />
              {user.category || "General"} · {user.serviceArea || user.address || "Area unset"}
            </p>
          </div>
        </div>
        <div className="bottom-card quick-card">
          <div className="bottom-icon green-icon">
            <Zap size={25} />
          </div>
          <div>
            <h4>Quick Actions</h4>
            <p>Access your tools and resources</p>
          </div>
          <ArrowRight size={20} />
        </div>
        <div className="quick-buttons">
          <button onClick={() => navigate("/explore-tickets")}>
            <Search />
            <span>Explore Tickets</span>
          </button>
          <button onClick={() => navigate("/my-jobs")}>
            <CalendarDays />
            <span>My Jobs</span>
          </button>
          <button onClick={() => navigate("/profile")}>
            <User />
            <span>Profile</span>
          </button>
          <button onClick={() => navigate("/profile")}>
            <Settings />
            <span>Settings</span>
          </button>
        </div>
        <div className="quote-card">
          <div className="quote-icon">🏔️</div>
          <div>
            <strong>Small fixes make a big difference!</strong>
            <p>Thank you for keeping our spaces running smoothly.</p>
          </div>
        </div>
      </section>
    </>
  );
}

export default WorkerDashboard;
