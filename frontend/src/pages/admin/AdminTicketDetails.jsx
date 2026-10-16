import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  Save,
  MapPin,
  CalendarClock,
  UserRound,
  Image as ImageIcon,
} from "lucide-react";

import {
  adminApi,
  objectFrom,
} from "../../services/adminApi";

import useAdminResource from "./useAdminResource";

import {
  PageHeader,
  Panel,
  DataState,
  Button,
  Field,
  StatusBadge,
  formatDate,
} from "../../components/AdminUI";

export default function AdminTicketDetails() {
  const { id } = useParams();
  const nav = useNavigate();

  const r = useAdminResource(() => adminApi.ticket(id), [id]);

  // Normalize the response: { ticket: {...} } or direct ticket object.
  const t = objectFrom(r.data);

  const [status, setStatus] = useState("");
  const [priority, setPriority] = useState("");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  // Reset selections when the ticket changes or reloads.
  useEffect(() => {
    setStatus("");
    setPriority("");
    setMessage("");
  }, [id, r.data]);

  const currentStatus = status || t.status || "";
  const currentPriority = priority || t.priority || "";

  const location =
    typeof t.location === "string"
      ? t.location
      : t.location?.address ||
        t.location?.formattedAddress ||
        t.address ||
        "Location not provided";

  const reporter =
    t.createdBy?.name ||
    t.reportedBy?.name ||
    t.user?.name ||
    t.userName ||
    t.createdBy?.email ||
    t.reportedBy?.email ||
    t.user?.email ||
    "Reporter not provided";

  const attachments = Array.isArray(t.images)
    ? t.images
    : Array.isArray(t.attachments)
      ? t.attachments
      : [];

  // Save ticket status and priority.

const save = async () => {
  if (!id) {
    setMessage("Ticket ID is missing.");
    return;
  }

  setSaving(true);
  setMessage("");

  try {
    await Promise.all([
      adminApi.updateTicketStatus(id, currentStatus),
      adminApi.updatePriority(id, currentPriority),
    ]);

    setMessage("Ticket updated successfully!");
    await r.reload();
  } catch (error) {
    console.error("Admin ticket update failed:", error);
    setMessage(error.message || "Failed to update ticket.");
  } finally {
    setSaving(false);
  }
};
  return (
    <>
      <PageHeader
        title="Ticket details"
        subtitle={`Ticket reference: ${id}`}
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
        <div className="detail-grid">
          <Panel
            title={
              t.title ||
              t.issue ||
              t.description ||
              "Maintenance issue"
            }
            subtitle={`Created ${formatDate(
              t.createdAt || t.created_at
            )}`}
          >
            <div className="detail-badges">
              <StatusBadge value={t.status || "unknown"} />
              <StatusBadge value={t.priority || "unknown"} />
              <StatusBadge value={t.category || "uncategorized"} />
            </div>

            <p className="detail-description">
              {t.description ||
                t.details ||
                t.issueDescription ||
                "No description returned by the API."}
            </p>

            <div className="detail-meta">
              <span>
                <MapPin size={16} />
                {location}
              </span>

              <span>
                <CalendarClock size={16} />
                {formatDate(
                  t.updatedAt ||
                    t.updated_at ||
                    t.createdAt ||
                    t.created_at
                )}
              </span>

              <span>
                <UserRound size={16} />
                {reporter}
              </span>
            </div>

            {attachments.length > 0 && (
              <div className="attachment-list">
                <h3>
                  <ImageIcon size={16} />
                  Attachments
                </h3>

                {attachments.map((item, index) => {
                  const url =
                    typeof item === "string"
                      ? item
                      : item?.url || item?.path || "";

                  const name =
                    typeof item === "string"
                      ? item.split("/").pop()
                      : item?.name ||
                        item?.originalName ||
                        `Attachment ${index + 1}`;

                  if (!url) {
                    return <p key={index}>{name}</p>;
                  }

                  return (
                    <a
                      key={`${url}-${index}`}
                      href={url}
                      target="_blank"
                      rel="noreferrer"
                    >
                      {name}
                    </a>
                  );
                })}
              </div>
            )}
          </Panel>

          <Panel
            title="Admin update"
            subtitle="Update the ticket status or priority"
          >
            <div className="form-stack">
              <Field label="Status">
                <select
                  value={currentStatus}
                  onChange={(event) => {
                    setStatus(event.target.value);
                    setMessage("");
                  }}
                >
                  <option value="Open">Open</option>
                  <option value="Assigned">Assigned</option>
                  <option value="In Progress">In progress</option>
                  <option value="Resolved">Resolved</option>
                  <option value="Closed">Closed</option>
                  <option value="Cancelled">Cancelled</option>
                </select>
              </Field>

              <Field label="Priority">
                <select
                  value={currentPriority}
                  onChange={(event) => {
                    setPriority(event.target.value);
                    setMessage("");
                  }}
                >
                  <option value="Low">Low</option>
                  <option value="Medium">Medium</option>
                  <option value="High">High</option>
                  <option value="Critical">Critical</option>
                </select>
              </Field>

              <Button
                onClick={save}
                disabled={saving || r.loading}
              >
                <Save size={15} />
                {saving ? "Saving..." : "Save changes"}
              </Button>

              {message && (
                <p className="inline-message" role="status">
                  {message}
                </p>
              )}
            </div>
          </Panel>
        </div>
      )}
    </>
  );
}