import React from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  Mail,
  Phone,
  MapPin,
  Ticket,
} from "lucide-react";

import {
  adminApi,
  objectFrom,
  rowsFrom,
} from "../../services/adminApi";

import useAdminResource from "./useAdminResource";

import {
  PageHeader,
  Panel,
  Button,
  DataState,
  StatusBadge,
  Table,
  formatDate,
} from "../../components/AdminUI";

export default function AdminUserDetails() {
  const { id } = useParams();
  const nav = useNavigate();

  const r = useAdminResource(() => adminApi.user(id), [id]);

  // Handle API responses such as { user: {...} } or { data: { user: {...} } }
  const response = r.data;
  const extracted = objectFrom(response);

  const u =
    response?.user ||
    response?.data?.user ||
    extracted?.user ||
    extracted ||
    {};

  // The backend may return a ticket array OR just a numeric count.
  const tickets = rowsFrom(u.tickets);
  const ticketCount =
    u.ticketCount ??
    (typeof u.reportedTickets === "number"
      ? u.reportedTickets
      : tickets.length);

  const address =
    typeof u.address === "string"
      ? u.address
      : u.address?.formattedAddress ||
        u.address?.address ||
        u.location?.address ||
        (typeof u.location === "string" ? u.location : "");

  return (
    <>
      <PageHeader
        title="User details"
        subtitle={`User reference: ${id}`}
        action={
          <Button variant="secondary" onClick={() => nav(-1)}>
            <ArrowLeft size={15} />
            Back
          </Button>
        }
      />

      <DataState
        loading={r.loading}
        error={r.error}
        empty={!r.loading && !r.error && !r.data}
        onRetry={r.reload}
      />

      {r.data && (
        <>
          <Panel
            title={u.name || u.fullName || u.email || "User profile"}
            subtitle="Profile information returned by the user API"
          >
            <div className="profile-detail-grid">
              <div>
                <Mail size={17} />
                <span>{u.email || "No email"}</span>
              </div>

              <div>
                <Phone size={17} />
                <span>{u.phone || u.number || "No phone"}</span>
              </div>

              <div>
                <MapPin size={17} />
                <span>{address || "No address"}</span>
              </div>

              <div>
                <Ticket size={17} />
                <span>{ticketCount} reported tickets</span>
              </div>
            </div>

            <div className="detail-badges">
              <StatusBadge
                value={
                  u.status ||
                  (u.isActive === false ? "inactive" : "active")
                }
              />

              <StatusBadge value={u.role || "user"} />
            </div>

            <p className="muted-text">
              Joined {formatDate(u.createdAt || u.created_at)}
            </p>
          </Panel>

          <Panel
            title="Reported tickets"
            subtitle="Tickets included in this user response"
          >
            <DataState
              loading={false}
              error=""
              empty={!tickets.length}
            />

            {tickets.length > 0 && (
              <Table
                rows={tickets}
                columns={[
                  {
                    key: "ticketId",
                    label: "Ticket",
                    render: (t) => t.ticketId || t._id || t.id || "—",
                  },
                  {
                    key: "title",
                    label: "Issue",
                    render: (t) => t.title || t.description || "—",
                  },
                  {
                    key: "status",
                    label: "Status",
                    render: (t) => <StatusBadge value={t.status} />,
                  },
                  {
                    key: "createdAt",
                    label: "Created",
                    render: (t) => formatDate(t.createdAt),
                  },
                ]}
              />
            )}
          </Panel>
        </>
      )}
    </>
  );
}