import React from "react";
import { Activity, CheckCircle2, CircleAlert, Clock3, Ticket, Users, HardHat, ArrowUpRight, RefreshCw } from "lucide-react";
import { adminApi, objectFrom, rowsFrom } from "../../services/adminApi";
import useAdminResource from "./useAdminResource";
import { PageHeader, StatCard, Panel, Table, StatusBadge, DataState, Button, formatDate, getName } from "../../components/AdminUI";

export default function AdminDashboard() {
  const { data, loading, error, reload } = useAdminResource(adminApi.dashboard, []);
  const d = objectFrom(data); const tickets = rowsFrom(d.recentTickets || d.recent || d.tickets);
  const metrics = d.stats || d.metrics || d;
  const stats = [
    { label: "Total tickets", value: metrics.totalTickets ?? metrics.total ?? "—", helper: "All reported maintenance issues", icon: Ticket, tone: "blue" },
    { label: "Open tickets", value: metrics.openTickets ?? metrics.open ?? "—", helper: "Waiting for action", icon: CircleAlert, tone: "amber" },
    { label: "In progress", value: metrics.inProgress ?? metrics.inProgressTickets ?? "—", helper: "Currently being worked on", icon: Clock3, tone: "purple" },
    { label: "Resolved", value: metrics.resolvedTickets ?? metrics.resolved ?? "—", helper: "Completed maintenance work", icon: CheckCircle2, tone: "green" },
  ];
  const cols = [{key:"ticketId",label:"Ticket" ,render:r=>r.ticketId || r._id || r.id || "—"},{key:"title",label:"Issue",render:r=>r.title || r.description || r.issue || "—"},{key:"category",label:"Category"},{key:"priority",label:"Priority",render:r=><StatusBadge value={r.priority}/>},{key:"status",label:"Status",render:r=><StatusBadge value={r.status}/>},{key:"createdAt",label:"Reported",render:r=>formatDate(r.createdAt || r.created_at)}];
  return <><PageHeader title="Admin overview" subtitle="A clear view of maintenance operations across your workspace." action={<Button variant="secondary" onClick={reload}><RefreshCw size={15}/> Refresh</Button>}/>
    {error && <DataState error={error} loading={false} onRetry={reload}/>}
    <div className="stats-grid">{stats.map(s=><StatCard key={s.label} {...s}/>)}</div>
    <div className="dashboard-grid"><Panel title="Operations snapshot" subtitle="Summary returned by your dashboard API"><DataState loading={loading} error={""} empty={!loading && !error && !data}/>{data && <div className="snapshot-grid"><div className="snapshot-item"><span>Registered users</span><strong>{metrics.totalUsers ?? metrics.users ?? "—"}</strong><small><Users size={14}/> User accounts</small></div><div className="snapshot-item"><span>Registered workers</span><strong>{metrics.totalWorkers ?? metrics.workers ?? "—"}</strong><small><HardHat size={14}/> Service workforce</small></div><div className="snapshot-item"><span>Urgent tickets</span><strong>{metrics.urgentTickets ?? metrics.criticalTickets ?? "—"}</strong><small><CircleAlert size={14}/> Priority attention</small></div><div className="snapshot-item"><span>Resolution rate</span><strong>{metrics.resolutionRate != null ? `${metrics.resolutionRate}%` : "—"}</strong><small><Activity size={14}/> Based on API data</small></div></div>}</Panel>
      <Panel title="Quick actions" subtitle="Jump to common admin tasks"><div className="quick-actions"><button onClick={()=>location.assign("/admin/tickets")}><span className="quick-icon blue"><Ticket size={18}/></span><span><b>Review tickets</b><small>View incoming maintenance issues</small></span><ArrowUpRight size={16}/></button><button onClick={()=>location.assign("/admin/assignments")}><span className="quick-icon purple"><HardHat size={18}/></span><span><b>Manage assignments</b><small>Coordinate tickets and workers</small></span><ArrowUpRight size={16}/></button><button onClick={()=>location.assign("/admin/analytics")}><span className="quick-icon green"><Activity size={18}/></span><span><b>View reports</b><small>Explore performance data</small></span><ArrowUpRight size={16}/></button></div></Panel></div>
    <Panel title="Recent tickets" subtitle="Latest tickets returned by the dashboard endpoint" action={<Button variant="ghost" onClick={()=>location.assign("/admin/tickets")}>View all <ArrowUpRight size={15}/></Button>}><DataState loading={loading} error={error} empty={!loading&&!error&&!tickets.length} onRetry={reload}/>{!loading&&!error&&tickets.length>0&&<Table columns={cols} rows={tickets}/>}</Panel>
  </>;
}
