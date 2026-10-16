import React from "react";
import { Search, RefreshCw, AlertCircle, Inbox, ChevronRight } from "lucide-react";

export function PageHeader({ eyebrow = "FIXFLOW ADMIN", title, subtitle, action }) {
  return <div className="admin-page-header"><div><div className="eyebrow">{eyebrow}</div><h1>{title}</h1>{subtitle && <p>{subtitle}</p>}</div>{action && <div className="page-header-action">{action}</div>}</div>;
}
export function Button({ children, variant = "primary", className = "", ...props }) {
  return <button className={`admin-btn ${variant} ${className}`} {...props}>{children}</button>;
}
export function StatCard({ label, value, helper, icon: Icon, tone = "blue" }) {
  return <div className="stat-card"><div className={`stat-icon ${tone}`}>{Icon && <Icon size={19}/>}</div><div className="stat-label">{label}</div><div className="stat-value">{value ?? "—"}</div><div className="stat-helper">{helper || "Live backend data"}</div></div>;
}
export function SearchBox({ value, onChange, placeholder = "Search..." }) {
  return <label className="search-box"><Search size={17}/><input value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder}/></label>;
}
export function StatusBadge({ value }) {
  const text = value == null || value === "" ? "Unknown" : String(value).replace(/[_-]/g, " ");
  const normalized = text.toLowerCase();
  const tone = /resolved|completed|active|approved|read|success/.test(normalized) ? "green" : /critical|urgent|blocked|rejected|failed|overdue/.test(normalized) ? "red" : /progress|assigned|pending|review|unread/.test(normalized) ? "amber" : "slate";
  return <span className={`status-badge ${tone}`}>{text}</span>;
}
export function DataState({ loading, error, empty, onRetry }) {
  if (loading) return <div className="data-state"><RefreshCw className="spin" size={22}/><strong>Loading data</strong><span>Contacting the FixFlow API…</span></div>;
  if (error) return <div className="data-state error-state"><AlertCircle size={24}/><strong>Could not load this section</strong><span>{error}</span>{onRetry && <Button variant="secondary" onClick={onRetry}><RefreshCw size={15}/> Retry</Button>}</div>;
  if (empty) return <div className="data-state"><Inbox size={25}/><strong>No records to show</strong><span>When your backend returns records, they will appear here.</span></div>;
  return null;
}
export function Panel({ title, subtitle, action, children, className = "" }) {
  return <section className={`admin-panel ${className}`}><div className="panel-heading"><div><h2>{title}</h2>{subtitle && <p>{subtitle}</p>}</div>{action}</div>{children}</section>;
}
export function Table({ columns, rows, getKey, onRowClick }) {
  if (!rows?.length) return null;
  return <div className="table-scroll"><table className="admin-table"><thead><tr>{columns.map(c => <th key={c.key}>{c.label}</th>)}</tr></thead><tbody>{rows.map((row, i) => <tr key={getKey ? getKey(row, i) : row._id || row.id || i} onClick={() => onRowClick?.(row)} className={onRowClick ? "clickable-row" : ""}>{columns.map(c => <td key={c.key}>{c.render ? c.render(row) : (row[c.key] ?? "—")}</td>)}</tr>)}</tbody></table></div>;
}
export function DetailLink({ children, onClick }) { return <button className="text-link" onClick={onClick}>{children}<ChevronRight size={14}/></button>; }
export function Field({ label, children }) { return <label className="admin-field"><span>{label}</span>{children}</label>; }
export function formatDate(value) { if (!value) return "—"; const d = new Date(value); return Number.isNaN(d.getTime()) ? String(value) : d.toLocaleString(); }
export function getName(row) { return row?.name || row?.fullName || row?.title || row?.email || row?._id || row?.id || "—"; }
export function getId(row) { return row?._id || row?.id || row?.ticketId || ""; }
