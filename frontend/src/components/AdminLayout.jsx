import React, { useState } from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { LayoutDashboard, Ticket, Users, HardHat, GitBranch, ChartNoAxesCombined, Bell, History, Settings, Wrench, Menu, Search, LogOut, ChevronLeft, ShieldCheck } from "lucide-react";
import "../styles/admin.css"

const groups = [
  { title: "WORKSPACE", items: [
    { to: "/admin", label: "Overview", icon: LayoutDashboard, end: true },
    { to: "/admin/tickets", label: "All tickets", icon: Ticket },
    { to: "/admin/assignments", label: "Assignments", icon: GitBranch },
  ]},
  { title: "PEOPLE", items: [
    { to: "/admin/users", label: "Users", icon: Users },
    { to: "/admin/workers", label: "Workers", icon: HardHat },
  ]},
  { title: "INSIGHTS", items: [
    { to: "/admin/analytics", label: "Analytics & reports", icon: ChartNoAxesCombined },
    { to: "/admin/notifications", label: "Notifications", icon: Bell },
    { to: "/admin/activity-logs", label: "Activity logs", icon: History },
  ]},
  { title: "SYSTEM", items: [{ to: "/admin/settings", label: "Settings", icon: Settings }] },
];

export default function AdminLayout() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const navigate = useNavigate();
  let user = {};
  try { user = JSON.parse(localStorage.getItem("user") || "{}"); } catch { user = {}; }
  const logout = () => { localStorage.removeItem("token"); localStorage.removeItem("user"); navigate("/", { replace: true }); };
  return <div className="admin-shell">
    {mobileOpen && <button className="sidebar-backdrop" aria-label="Close menu" onClick={() => setMobileOpen(false)}/>}
    <aside className={`admin-sidebar ${mobileOpen ? "mobile-open" : ""}`}>
      <div className="brand-row"><div className="brand-mark"><Wrench size={20}/></div><div className="brand-name">FixFlow<span>OPERATIONS</span></div><button className="collapse-btn" aria-label="Close navigation" onClick={() => setMobileOpen(false)}><ChevronLeft size={17}/></button></div>
      <div className="workspace-chip"><div className="workspace-icon"><ShieldCheck size={17}/></div><div><strong>Admin workspace</strong><span>Maintenance control</span></div><span className="online-dot"/></div>
      <nav className="admin-nav">{groups.map(group => <div className="nav-group" key={group.title}><div className="nav-group-title">{group.title}</div>{group.items.map(item => { const Icon = item.icon; return <NavLink key={item.to} to={item.to} end={item.end} onClick={() => setMobileOpen(false)} className={({ isActive }) => `nav-link ${isActive ? "active" : ""}`}><Icon size={18}/><span>{item.label}</span></NavLink>; })}</div>)}</nav>
      <div className="sidebar-bottom"><div className="sidebar-help"><div className="help-bubble">?</div><div><strong>Need a hand?</strong><span>Admin support</span></div></div><div className="admin-profile"><div className="avatar">{(user.name || user.fullName || "A").slice(0,1).toUpperCase()}</div><div className="profile-copy"><strong>{user.name || user.fullName || "System Admin"}</strong><span>{user.email || "Administrator"}</span></div><button title="Log out" onClick={logout} className="icon-btn"><LogOut size={17}/></button></div></div>
    </aside>
    <main className="admin-main"><header className="admin-topbar"><button className="mobile-menu icon-btn" onClick={() => setMobileOpen(true)} aria-label="Open navigation"><Menu size={20}/></button><div className="breadcrumb"><span>Workspace</span><b>/</b><strong>Admin console</strong></div><div className="topbar-right"><div className="secure-label"><ShieldCheck size={15}/> Secure workspace</div><div className="topbar-divider"/><button className="topbar-search" onClick={() => navigate("/admin/tickets")}><Search size={16}/><span>Find anything</span><kbd>/</kbd></button><button className="notification-top icon-btn" aria-label="Notifications" onClick={() => navigate("/admin/notifications")}><Bell size={18}/><i/></button><div className="topbar-avatar">{(user.name || "A").slice(0,1).toUpperCase()}</div></div></header><div className="admin-content"><Outlet/></div><footer className="admin-footer"><span>© {new Date().getFullYear()} FixFlow Operations</span><span><span className="online-dot"/> Admin console</span></footer></main>
  </div>;
}
