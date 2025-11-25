import { useState } from "react";
import { createApplication } from "./apiClient";

function AddApplicationForm({ token, onCreated }) {
  const [company, setCompany] = useState("");
  const [jobTitle, setJobTitle] = useState("");
  const [location, setLocation] = useState("");
  const [status, setStatus] = useState("Applied");
  const [source, setSource] = useState("");
  const [appliedDate, setAppliedDate] = useState("");
  const [jobLink, setJobLink] = useState("");
  const [notes, setNotes] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!company || !jobTitle) {
      setError("Company and job title are required.");
      return;
    }

    const newApp = {
      company,
      jobTitle,
      location,
      status,
      source,
      appliedDate,
      jobLink,
      notes,
    };

    try {
      setLoading(true);
      const created = await createApplication(token, newApp);
      onCreated(created);

      setCompany("");
      setJobTitle("");
      setLocation("");
      setStatus("Applied");
      setSource("");
      setAppliedDate("");
      setJobLink("");
      setNotes("");
    } catch (err) {
      setError(err.message || "Failed to create application.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="form-card">
      <div className="card-header">
        <div>
          <div className="card-title">Add new application</div>
          <div className="card-subtitle">
            Capture every opportunity as you apply.
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="form-grid">
        <div className="field">
          <span className="field-label">Company</span>
          <input
            className="field-input"
            value={company}
            onChange={(e) => setCompany(e.target.value)}
            placeholder="Google"
          />
        </div>

        <div className="field">
          <span className="field-label">Job title</span>
          <input
            className="field-input"
            value={jobTitle}
            onChange={(e) => setJobTitle(e.target.value)}
            placeholder="Software Engineer"
          />
        </div>

        <div className="field">
          <span className="field-label">Location</span>
          <input
            className="field-input"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            placeholder="Remote"
          />
        </div>

        <div className="field">
          <span className="field-label">Status</span>
          <select
            className="field-select"
            value={status}
            onChange={(e) => setStatus(e.target.value)}
          >
            <option>Applied</option>
            <option>Interviewing</option>
            <option>Offer</option>
            <option>Rejected</option>
            <option>Accepted</option>
          </select>
        </div>

        <div className="field">
          <span className="field-label">Source</span>
          <input
            className="field-input"
            value={source}
            onChange={(e) => setSource(e.target.value)}
            placeholder="LinkedIn, company site, referral…"
          />
        </div>

        <div className="field">
          <span className="field-label">Applied date</span>
          <input
            type="date"
            className="field-input"
            value={appliedDate}
            onChange={(e) => setAppliedDate(e.target.value)}
          />
        </div>

        <div className="field">
          <span className="field-label">Job link</span>
          <input
            className="field-input"
            value={jobLink}
            onChange={(e) => setJobLink(e.target.value)}
            placeholder="https://..."
          />
        </div>

        <div className="field">
          <span className="field-label">Notes</span>
          <textarea
            className="field-textarea"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Recruiter name, interview plan, salary info…"
          />
        </div>

        {error && <p className="error-text">{error}</p>}

        <button className="btn btn-primary" type="submit" disabled={loading}>
          {loading ? "Saving..." : "Add application"}
        </button>
      </form>
    </div>
  );
}

export default AddApplicationForm;
