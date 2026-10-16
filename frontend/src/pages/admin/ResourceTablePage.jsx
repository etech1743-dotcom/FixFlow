
import React, { useMemo, useState } from "react";
import { Download, RefreshCw, Eye } from "lucide-react";
import { useNavigate } from "react-router-dom";

import {
  PageHeader,
  Panel,
  Table,
  DataState,
  SearchBox,
  Button,
} from "../../components/AdminUI";

import { rowsFrom } from "../../services/adminApi";
import useAdminResource from "./useAdminResource";

export default function ResourceTablePage({
  title,
  subtitle,
  loader,
  columns = [],
  searchFields = [],
  detailBase,
  actions,
  emptyLabel,
}) {
  const resource = useAdminResource(loader, [loader]);

  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("all");

  const navigate = useNavigate();

  const rows = useMemo(() => {
    return rowsFrom(resource.data);
  }, [resource.data]);

  const filtered = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return rows.filter((row) => {
      const fieldsToSearch = searchFields.length
        ? searchFields.map((key) => row?.[key])
        : [
            row?.name,
            row?.fullName,
            row?.email,
            row?.title,
            row?.description,
            row?.category,
            row?.status,
            row?.priority,
            row?.ticketId,
          ];

      const searchableText = fieldsToSearch
        .filter((value) => value !== undefined && value !== null)
        .map((value) =>
          typeof value === "object"
            ? JSON.stringify(value)
            : String(value)
        )
        .join(" ")
        .toLowerCase();

      const matchesQuery = searchableText.includes(normalizedQuery);

      const rowStatus = String(row?.status || "").toLowerCase();
      const selectedStatus = status.toLowerCase();

      const matchesStatus =
        selectedStatus === "all" || rowStatus === selectedStatus;

      return matchesQuery && matchesStatus;
    });
  }, [rows, query, status, searchFields]);

  const fullColumns = useMemo(() => {
    const result = [...columns];

    if (detailBase) {
      result.push({
        key: "_actions",
        label: "Details",
        render: (row) => (
          <Button
            variant="ghost"
            onClick={() => {
              const id = row?._id || row?.id;

              if (id !== undefined && id !== null) {
                navigate(`${detailBase}/${encodeURIComponent(id)}`);
              }
            }}
          >
            <Eye size={15} />
            Open
          </Button>
        ),
      });
    }

    return result;
  }, [columns, detailBase, navigate]);

 
const exportRows = () => {
  const csv = [
    columns.map((c) => c.label).join(","),
    ...filtered.map((r) =>
      columns
        .map((c) =>
          JSON.stringify(
            String(r[c.key] ?? "").replace(/"/g, '""')
          )
        )
        .join(",")
    ),
  ].join("\r\n");

  const blob = new Blob(["\uFEFF" + csv], {
    type: "text/csv;charset=utf-8;",
  });

  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");

  a.href = url;
  a.download = `fixflow-${title
    .toLowerCase()
    .replace(/\s+/g, "-")}.csv`;

  document.body.appendChild(a);
  a.click();
  a.remove();

  URL.revokeObjectURL(url);
};


  return (
    <>
      <PageHeader
        title={title}
        subtitle={subtitle}
        action={
          <Button variant="secondary" onClick={resource.reload}>
            <RefreshCw size={15} />
            Refresh
          </Button>
        }
      />

      <Panel
        title={`${title} directory`}
        subtitle={`${filtered.length} record${
          filtered.length === 1 ? "" : "s"
        } shown`}
        action={
          <Button
            variant="secondary"
            onClick={exportRows}
            disabled={!filtered.length}
          >
            <Download size={15} />
            Export CSV
          </Button>
        }
      >
        <div className="table-toolbar">
          <SearchBox
            value={query}
            onChange={setQuery}
            placeholder={`Search ${title.toLowerCase()}...`}
          />

          <label className="filter-select">
            <span>Status</span>

            <select
              value={status}
              onChange={(event) => setStatus(event.target.value)}
            >
              <option value="all">All statuses</option>
              <option value="open">Open</option>
              <option value="pending">Pending</option>
              <option value="in progress">In progress</option>
              <option value="active">Active</option>
              <option value="resolved">Resolved</option>
              <option value="completed">Completed</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
            </select>
          </label>
        </div>

        <DataState
          loading={resource.loading}
          error={resource.error}
          empty={
            !resource.loading &&
            !resource.error &&
            filtered.length === 0
          }
          onRetry={resource.reload}
        />

        {!resource.loading &&
          !resource.error &&
          filtered.length > 0 && (
            <Table columns={fullColumns} rows={filtered} />
          )}
      </Panel>

      {actions && (
        <Panel
          title="Management actions"
          subtitle="Actions are sent to your configured backend endpoints"
        >
          {actions}
        </Panel>
      )}
    </>
  );
}
