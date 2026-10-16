import { useEffect, useState } from "react";
import { api } from "../services/api";

export function AdminUsers() {
  const [users, setUsers] = useState([]);
  useEffect(() => {
    api.adminUsers().then((d) => setUsers(d.users || []));
  }, []);

  return (
    <div className="list-card">
      <h2>Users</h2>
      <PeopleTable
        rows={users}
        onToggle={async (user) => {
          await api.userStatus(user._id, !user.isActive);
          const data = await api.adminUsers();
          setUsers(data.users || []);
        }}
      />
    </div>
  );
}

export function AdminWorkers() {
  const [workers, setWorkers] = useState([]);
  useEffect(() => {
    api.adminWorkers().then((d) => setWorkers(d.workers || []));
  }, []);

  return (
    <div className="list-card">
      <h2>Workers</h2>
      <PeopleTable
        rows={workers}
        extra
        onToggle={async (user) => {
          await api.workerStatus(user._id, { isActive: !user.isActive });
          const data = await api.adminWorkers();
          setWorkers(data.workers || []);
        }}
        onApprove={async (user) => {
          await api.workerStatus(user._id, { isApproved: !user.isApproved });
          const data = await api.adminWorkers();
          setWorkers(data.workers || []);
        }}
      />
    </div>
  );
}

function PeopleTable({ rows, onToggle, onApprove, extra }) {
  return (
    <div className="table-wrapper">
      <table>
        <thead>
          <tr>
            <th>Name</th>
            <th>Email</th>
            <th>Phone</th>
            {extra && <th>Category</th>}
            <th>Status</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row._id}>
              <td><strong>{row.name}</strong></td>
              <td>{row.email}</td>
              <td>{row.phone || "—"}</td>
              {extra && <td>{row.category}</td>}
              <td>{row.isActive ? "Active" : "Disabled"}{extra ? ` · ${row.isApproved ? "Approved" : "Pending"}` : ""}</td>
              <td>
                <button className="ghost-btn" onClick={() => onToggle(row)}>
                  {row.isActive ? "Deactivate" : "Activate"}
                </button>
                {onApprove && (
                  <button className="ticket-view" style={{ marginLeft: 8 }} onClick={() => onApprove(row)}>
                    {row.isApproved ? "Unapprove" : "Approve"}
                  </button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function AdminReports() {
  const [data, setData] = useState(null);
  useEffect(() => {
    api.reports().then(setData);
  }, []);
  if (!data) return <p className="empty-state">Building report...</p>;

  return (
    <div className="list-card">
      <h2>Operational reports</h2>
      <p style={{ color: "#8ea7c8" }}>Generated {new Date(data.generatedAt).toLocaleString()}</p>
      <div className="table-wrapper" style={{ marginTop: 16 }}>
        <table>
          <thead>
            <tr>
              <th>Worker</th>
              <th>Category</th>
              <th>Assigned</th>
              <th>Completed</th>
              <th>Completion %</th>
              <th>Rating</th>
            </tr>
          </thead>
          <tbody>
            {data.workload.map((row) => (
              <tr key={row.worker}>
                <td><strong>{row.worker}</strong></td>
                <td>{row.category}</td>
                <td>{row.assigned}</td>
                <td>{row.completed}</td>
                <td>{row.completionRate}</td>
                <td>{row.rating}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
