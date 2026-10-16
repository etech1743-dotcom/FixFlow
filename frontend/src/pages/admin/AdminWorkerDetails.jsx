import React from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  Mail,
  Phone,
  MapPin,
  Wrench,
  ClipboardCheck,
  Star,
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

export default function AdminWorkerDetails() {
  const { id } = useParams();
  const nav = useNavigate();

  const r = useAdminResource(() => adminApi.worker(id), [id]);

  const response = r.data;
  const extracted = objectFrom(response);

  const w =
    response?.worker ||
    response?.data?.worker ||
    extracted?.worker ||
    extracted ||
    {};

  const jobs = rowsFrom(w.tickets || w.jobs || w.assignments);

  const location =
    typeof w.address === "string"
      ? w.address
      : w.address?.formattedAddress ||
        w.address?.address ||
        w.location?.address ||
        w.city ||
        (typeof w.location === "string" ? w.location : "");

  const specialty =
    w.speciality ||
    w.specialty ||
    w.category ||
    (Array.isArray(w.skills) ? w.skills.join(", ") : "");

  const completedJobs =
    w.completedJobs ??
    w.completedCount ??
    jobs.filter((job) => job.status === "resolved" || job.status === "completed").length;

  return (
    <>
      <PageHeader
        title="Worker details"
        subtitle={`Worker reference: ${id}`}
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
            title={w.name || w.fullName || w.email || "Worker profile"}
            subtitle="Worker information returned by the backend"
          >
            <div className="profile-detail-grid">
              <div>
                <Mail size={17} />
                <span>{w.email || "No email"}</span>
              </div>

              <div>
                <Phone size={17} />
                <span>{w.phone || w.number || "No phone"}</span>
              </div>

              <div>
                <MapPin size={17} />
                <span>{location || "No location"}</span>
              </div>

              <div>
                <Wrench size={17} />
                <span>{specialty || "No specialty returned"}</span>
              </div>

              <div>
                <ClipboardCheck size={17} />
                <span>{completedJobs} completed jobs</span>
              </div>

              <div>
                <Star size={17} />
                <span>{w.rating ?? "—"} rating</span>
              </div>
            </div>

            <div className="detail-badges">
              <StatusBadge
                value={
                  w.status ||
                  (w.isActive === false ? "inactive" : "active")
                }
              />

              <StatusBadge
                value={
                  w.approvalStatus ||
                  w.verificationStatus ||
                  (w.isApproved === true
                    ? "approved"
                    : w.isApproved === false
                      ? "pending"
                      : "approval not specified")
                }
              />
            </div>

            <p className="muted-text">
              Registered {formatDate(w.createdAt || w.created_at)}
            </p>
          </Panel>

          <Panel
            title="Worker jobs"
            subtitle="Jobs included in this worker response"
          >
            <DataState
              loading={false}
              error=""
              empty={!jobs.length}
            />

            {jobs.length > 0 && (
              <Table
                rows={jobs}
                columns={[
                  {
                    key: "ticketId",
                    label: "Ticket",
                    render: (job) =>
                      job.ticketId || job._id || job.id || "—",
                  },
                  {
                    key: "title",
                    label: "Issue",
                    render: (job) =>
                      job.title || job.description || "—",
                  },
                  {
                    key: "status",
                    label: "Status",
                    render: (job) => (
                      <StatusBadge value={job.status} />
                    ),
                  },
                  {
                    key: "createdAt",
                    label: "Created",
                    render: (job) => formatDate(job.createdAt),
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