import { useEffect, useState } from "react";
import {
  getApplications,
  deleteApplication,
  updateApplication,
} from "./apiClient";

function getStatusClass(status) {
  if (!status) return "status-chip";
  const key = status.toLowerCase();
  if (key === "applied") return "status-chip status-applied";
  if (key === "interviewing") return "status-chip status-interviewing";
  if (key === "offer") return "status-chip status-offer";
  if (key === "accepted") return "status-chip status-accepted";
  if (key === "rejected") return "status-chip status-rejected";
  return "status-chip";
}

function ApplicationsTable({ token, reloadFlag }) {
  const [apps, setApps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [deletingId, setDeletingId] = useState(null);

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");

  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({
    company: "",
    jobTitle: "",
    location: "",
    status: "Applied",
    source: "",
    appliedDate: "",
    jobLink: "",
    notes: "",
  });

  const [sortField, setSortField] = useState("applied_date");
  const [sortDir, setSortDir] = useState("desc");

  useEffect(() => {
    async function load() {
      try {
        const data = await getApplications(token);
        setApps(data);
        setError("");
      } catch (err) {
        console.error("Error loading applications:", err);
        setError(err.message || "Failed to load applications");
      } finally {
        setLoading(false);
      }
    }

    setLoading(true);
    load();
  }, [token, reloadFlag]);

  const handleDelete = async (id) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this application?"
    );
    if (!confirmDelete) return;

    try {
      setDeletingId(id);
      await deleteApplication(token, id);
      setApps((prev) => prev.filter((app) => app.id !== id));
    } catch (err) {
      alert(err.message || "Failed to delete application");
    } finally {
      setDeletingId(null);
    }
  };

  const startEditing = (app) => {
    setEditingId(app.id);
    setEditForm({
      company: app.company || "",
      jobTitle: app.job_title || "",
      location: app.location || "",
      status: app.status || "Applied",
      source: app.source || "",
      appliedDate: app.applied_date
        ? String(app.applied_date).split("T")[0]
        : "",
      jobLink: app.job_link || "",
      notes: app.notes || "",
    });
  };

  const cancelEditing = () => {
    setEditingId(null);
  };

  const handleEditChange = (field, value) => {
    setEditForm((prev) => ({ ...prev, [field]: value }));
  };

  const saveEdit = async (id) => {
    if (!editForm.company || !editForm.jobTitle) {
      alert("Company and job title are required.");
      return;
    }

    try {
      const updated = await updateApplication(token, id, {
        company: editForm.company,
        jobTitle: editForm.jobTitle,
        location: editForm.location,
        status: editForm.status,
        source: editForm.source,
        appliedDate: editForm.appliedDate,
        jobLink: editForm.jobLink,
        notes: editForm.notes,
      });

      setApps((prev) =>
        prev.map((app) => (app.id === id ? updated : app))
      );
      setEditingId(null);
    } catch (err) {
      alert(err.message || "Failed to update application");
    }
  };

  const setSort = (field) => {
    if (sortField === field) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortField(field);
      setSortDir("asc");
    }
  };

  const getSortIndicator = (field) => {
    if (sortField !== field) return "";
    return sortDir === "asc" ? "▲" : "▼";
  };

  const filteredAndSortedApps = apps
    .filter((app) => {
      const term = searchTerm.toLowerCase();
      const matchesSearch =
        app.company.toLowerCase().includes(term) ||
        app.job_title.toLowerCase().includes(term);

      const matchesStatus =
        statusFilter === "All" ? true : app.status === statusFilter;

      return matchesSearch && matchesStatus;
    })
    .slice()
    .sort((a, b) => {
      let aVal;
      let bVal;

      if (sortField === "company") {
        aVal = a.company.toLowerCase();
        bVal = b.company.toLowerCase();
      } else if (sortField === "status") {
        aVal = (a.status || "").toLowerCase();
        bVal = (b.status || "").toLowerCase();
      } else if (sortField === "applied_date") {
        const aDate = a.applied_date ? new Date(a.applied_date) : null;
        const bDate = b.applied_date ? new Date(b.applied_date) : null;
        if (!aDate && !bDate) return 0;
        if (!aDate) return 1;
        if (!bDate) return -1;
        aVal = aDate.getTime();
        bVal = bDate.getTime();
      } else {
        return 0;
      }

      let cmp = 0;
      if (aVal < bVal) cmp = -1;
      else if (aVal > bVal) cmp = 1;

      return sortDir === "asc" ? cmp : -cmp;
    });

  const total = apps.length;
  const appliedCount = apps.filter((a) => a.status === "Applied").length;
  const interviewingCount = apps.filter((a) => a.status === "Interviewing")
    .length;
  const offerCount = apps.filter((a) => a.status === "Offer").length;
  const rejectedCount = apps.filter((a) => a.status === "Rejected").length;

  if (loading) {
    return (
      <div className="card">
        <div className="card-header">
          <div className="card-title">Your pipeline</div>
        </div>
        <p className="text-subtle">Loading applications...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="card">
        <div className="card-header">
          <div className="card-title">Your pipeline</div>
        </div>
        <p className="error-text">{error}</p>
      </div>
    );
  }

  if (apps.length === 0) {
    return (
      <div className="card">
        <div className="card-header">
          <div className="card-title">Your pipeline</div>
        </div>
        <p className="text-subtle">
          No applications yet. Add your first one from the form on the left.
        </p>
      </div>
    );
  }

  return (
    <div className="card">
      <div className="card-header">
        <div>
          <div className="card-title">Your pipeline</div>
          <div className="card-subtitle">
            Filter, sort and update your job search in one view.
          </div>
        </div>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-label">Total applications</div>
          <div className="stat-value">{total}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Applied</div>
          <div className="stat-value">{appliedCount}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Interviewing</div>
          <div className="stat-value">{interviewingCount}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Offers</div>
          <div className="stat-value">{offerCount}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Rejected</div>
          <div className="stat-value">{rejectedCount}</div>
        </div>
      </div>

      <div className="filter-row">
        <input
          className="filter-search"
          placeholder="Search by company or job title"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />

        <select
          className="filter-select"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="All">All statuses</option>
          <option value="Applied">Applied</option>
          <option value="Interviewing">Interviewing</option>
          <option value="Offer">Offer</option>
          <option value="Rejected">Rejected</option>
          <option value="Accepted">Accepted</option>
        </select>
      </div>

      <div className="table-wrapper">
        <table className="table">
          <thead>
            <tr>
              <th>
                <button
                  type="button"
                  className="sort-button"
                  onClick={() => setSort("company")}
                >
                  Company {getSortIndicator("company")}
                </button>
              </th>
              <th>Job title</th>
              <th>
                <button
                  type="button"
                  className="sort-button"
                  onClick={() => setSort("status")}
                >
                  Status {getSortIndicator("status")}
                </button>
              </th>
              <th>Source</th>
              <th>
                <button
                  type="button"
                  className="sort-button"
                  onClick={() => setSort("applied_date")}
                >
                  Applied date {getSortIndicator("applied_date")}
                </button>
              </th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredAndSortedApps.map((app) => {
              const isEditing = editingId === app.id;

              if (isEditing) {
                return (
                  <tr key={app.id}>
                    <td>
                      <input
                        className="field-input"
                        value={editForm.company}
                        onChange={(e) =>
                          handleEditChange("company", e.target.value)
                        }
                      />
                    </td>
                    <td>
                      <input
                        className="field-input"
                        value={editForm.jobTitle}
                        onChange={(e) =>
                          handleEditChange("jobTitle", e.target.value)
                        }
                      />
                    </td>
                    <td>
                      <select
                        className="field-select"
                        value={editForm.status}
                        onChange={(e) =>
                          handleEditChange("status", e.target.value)
                        }
                      >
                        <option>Applied</option>
                        <option>Interviewing</option>
                        <option>Offer</option>
                        <option>Rejected</option>
                        <option>Accepted</option>
                      </select>
                    </td>
                    <td>
                      <input
                        className="field-input"
                        value={editForm.source}
                        onChange={(e) =>
                          handleEditChange("source", e.target.value)
                        }
                      />
                    </td>
                    <td>
                      <input
                        type="date"
                        className="field-input"
                        value={editForm.appliedDate}
                        onChange={(e) =>
                          handleEditChange("appliedDate", e.target.value)
                        }
                      />
                    </td>
                    <td>
                      <button
                        className="btn btn-primary"
                        type="button"
                        onClick={() => saveEdit(app.id)}
                      >
                        Save
                      </button>
                      <button
                        className="btn btn-muted"
                        type="button"
                        onClick={cancelEditing}
                        style={{ marginLeft: 6 }}
                      >
                        Cancel
                      </button>
                    </td>
                  </tr>
                );
              }

              return (
                <tr key={app.id}>
                  <td>{app.company}</td>
                  <td>{app.job_title}</td>
                  <td>
                    <span className={getStatusClass(app.status)}>
                      {app.status || "Unknown"}
                    </span>
                  </td>
                  <td>{app.source || "-"}</td>
                  <td>
                    {app.applied_date
                      ? String(app.applied_date).split("T")[0]
                      : "-"}
                  </td>
                  <td>
                    <button
                      className="btn btn-muted"
                      type="button"
                      onClick={() => startEditing(app)}
                    >
                      Edit
                    </button>
                    <button
                      className="btn btn-danger"
                      type="button"
                      onClick={() => handleDelete(app.id)}
                      disabled={deletingId === app.id}
                      style={{ marginLeft: 6 }}
                    >
                      {deletingId === app.id ? "Deleting..." : "Delete"}
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default ApplicationsTable;
