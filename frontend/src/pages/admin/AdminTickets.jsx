import React from "react";
import { useNavigate } from "react-router-dom";
import { adminApi } from "../../services/adminApi";
import ResourceTablePage from "./ResourceTablePage";
import { StatusBadge, formatDate } from "../../components/AdminUI";
export default function AdminTickets(){const navigate=useNavigate();return <ResourceTablePage title="All tickets" subtitle="Review, prioritize and track every reported maintenance issue." loader={adminApi.tickets} detailBase="/admin/tickets" searchFields={["ticketId","title","description","category","location","status","priority"]} columns={[{key:"ticketId",label:"Ticket ID",render:r=>r.ticketId||r._id||r.id||"—"},{key:"title",label:"Issue",render:r=>r.title||r.description||r.issue||"—"},{key:"category",label:"Category"},{key:"priority",label:"Priority",render:r=><StatusBadge value={r.priority}/>},{key:"status",label:"Status",render:r=><StatusBadge value={r.status}/>},{key:"createdAt",label:"Created",render:r=>formatDate(r.createdAt||r.created_at)},{key:"assignedWorker",label:"Assigned worker",render:r=>r.assignedWorker?.name||r.worker?.name||r.assignedTo?.name||r.assignedWorkerName||"Unassigned"}]}/>}
