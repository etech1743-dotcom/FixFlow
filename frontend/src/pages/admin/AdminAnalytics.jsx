import React from "react";
import {
  Activity,
  CheckCircle2,
  Clock3,
  Ticket,
  Users,
  RefreshCw,
} from "lucide-react";

import { adminApi, objectFrom } from "../../services/adminApi";
import useAdminResource from "./useAdminResource";

import {
  PageHeader,
  Panel,
  StatCard,
  DataState,
  Table,
  StatusBadge,
  Button,
} from "../../components/AdminUI";

export default function AdminAnalytics() {
  const r = useAdminResource(adminApi.analytics, []);

  const response = objectFrom(r.data);
  const d =
    response.reports ||
    response.report ||
    response.analytics ||
    response;

  const workload = Array.isArray(d.workload) ? d.workload : [];

  const totalTickets = Number(d.ticketCount ?? 0);

  const totalAssigned = workload.reduce(
    (sum, worker) => sum + Number(worker.assigned ?? 0),
    0
  );

  const totalCompleted = workload.reduce(
    (sum, worker) => sum + Number(worker.completed ?? 0),
    0
  );

  const completionRate =
    totalAssigned > 0
      ? Number(((totalCompleted / totalAssigned) * 100).toFixed(1))
      : 0;

  const averageRating = (() => {
    const ratedWorkers = workload.filter(
      (worker) => Number(worker.rating) > 0
    );

    if (!ratedWorkers.length) return 0;

    return Number(
      (
        ratedWorkers.reduce(
          (sum, worker) => sum + Number(worker.rating),
          0
        ) / ratedWorkers.length
      ).toFixed(1)
    );
  })();

  return (
    <>
      <PageHeader
        title="Analytics & reports"
        subtitle="Understand ticket volume, completion trends and workforce performance."
        action={
          <Button
            variant="secondary"
            onClick={r.reload}
            disabled={r.loading}
          >
            <RefreshCw size={15} />
            {r.loading ? "Refreshing..." : "Refresh"}
          </Button>
        }
      />

      <DataState
        loading={r.loading}
        error={r.error}
        empty={!r.loading && !r.error && !r.data}
        onRetry={r.reload}
      />

      {r.data && !r.loading && (
        <>
          <div className="stats-grid">
            <StatCard
              label="Total tickets"
              value={totalTickets}
              icon={Ticket}
            />

            <StatCard
              label="Completed jobs"
              value={totalCompleted}
              icon={CheckCircle2}
              tone="green"
            />

            <StatCard
              label="Assigned jobs"
              value={totalAssigned}
              icon={Users}
              tone="purple"
            />

            <StatCard
              label="Completion rate"
              value={`${completionRate}%`}
              icon={Activity}
              tone="blue"
            />
          </div>

          <div className="detail-grid">
            <Panel
              title="Worker workload"
              subtitle="Assigned and completed jobs by worker"
            >
              {workload.length === 0 ? (
                <DataState
                  loading={false}
                  error=""
                  empty
                />
              ) : (
                workload.map((worker, index) => {
                  const assigned = Number(worker.assigned ?? 0);
                  const completed = Number(worker.completed ?? 0);

                  const percentage =
                    assigned > 0
                      ? Math.min(100, (completed / assigned) * 100)
                      : 0;

                  return (
                    <div
                      className="bar-row"
                      key={`${worker.worker || "worker"}-${index}`}
                    >
                      <div>
                        <span>
                          {worker.worker || "Unnamed worker"}
                          {worker.category
                            ? ` · ${worker.category}`
                            : ""}
                        </span>

                        <strong>
                          {completed}/{assigned}
                        </strong>
                      </div>

                      <div
                        className="bar-track"
                        role="progressbar"
                        aria-label={`${worker.worker || "Worker"} completion rate`}
                        aria-valuemin={0}
                        aria-valuemax={100}
                        aria-valuenow={Math.round(percentage)}
                      >
                        <i
                          style={{
                            width: `${percentage}%`,
                          }}
                        />
                      </div>

                      <p className="muted-text">
                        {percentage.toFixed(1)}% completed
                      </p>
                    </div>
                  );
                })
              )}
            </Panel>

            <Panel
              title="Worker performance"
              subtitle="Completion and rating statistics"
            >
              {workload.length === 0 ? (
                <DataState
                  loading={false}
                  error=""
                  empty
                />
              ) : (
                <Table
                  rows={workload}
                  columns={[
                    {
                      key: "worker",
                      label: "Worker",
                      render: (worker) =>
                        worker.worker || "—",
                    },
                    {
                      key: "assigned",
                      label: "Assigned",
                      render: (worker) =>
                        worker.assigned ?? 0,
                    },
                    {
                      key: "completed",
                      label: "Completed",
                      render: (worker) =>
                        worker.completed ?? 0,
                    },
                    {
                      key: "completionRate",
                      label: "Completion",
                      render: (worker) =>
                        `${worker.completionRate ?? 0}%`,
                    },
                    {
                      key: "rating",
                      label: "Rating",
                      render: (worker) =>
                        Number(worker.rating ?? 0) > 0
                          ? `${worker.rating}/5`
                          : "Not rated",
                    },
                    {
                      key: "status",
                      label: "Performance",
                      render: (worker) => (
                        <StatusBadge
                          value={
                            Number(worker.completionRate) >= 75
                              ? "Good"
                              : Number(worker.completionRate) > 0
                                ? "In progress"
                                : "No completed jobs"
                          }
                        />
                      ),
                    },
                  ]}
                />
              )}
            </Panel>
          </div>

          <Panel
            title="Report information"
            subtitle="Summary of the current report"
          >
            <div className="profile-detail-grid">
              <div>
                <Ticket size={17} />
                <span>Total tickets: {totalTickets}</span>
              </div>

              <div>
                <Users size={17} />
                <span>Workers: {workload.length}</span>
              </div>

              <div>
                <CheckCircle2 size={17} />
                <span>Completed jobs: {totalCompleted}</span>
              </div>

              <div>
                <Activity size={17} />
                <span>Overall completion: {completionRate}%</span>
              </div>

              <div>
                <Clock3 size={17} />
                <span>
                  Average worker rating:{" "}
                  {averageRating > 0
                    ? `${averageRating}/5`
                    : "Not rated"}
                </span>
              </div>
            </div>

            <p className="muted-text">
              Generated:{" "}
              {d.generatedAt
                ? new Date(d.generatedAt).toLocaleString()
                : "Not provided by API"}
            </p>
          </Panel>
        </>
      )}
    </>
  );
}