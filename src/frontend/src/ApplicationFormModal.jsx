import { useState, useEffect } from "react";
import axios from "axios";
import ResumeMatcher from "./ResumeMatcher";

const API_URL = "http://localhost:4000/api";

function ApplicationFormModal({ isOpen, onClose, onSubmit, initialData = null, title = "Add New Application", token, onApplicationUpdated }) {
    const [company, setCompany] = useState("");
    const [jobTitle, setJobTitle] = useState("");
    const [location, setLocation] = useState("");
    const [status, setStatus] = useState("Applied");
    const [source, setSource] = useState("");
    const [appliedDate, setAppliedDate] = useState("");
    const [jobLink, setJobLink] = useState("");
    const [notes, setNotes] = useState("");

    // New Fields
    const [companyDescription, setCompanyDescription] = useState("");
    const [responsibilities, setResponsibilities] = useState("");
    const [requiredQualifications, setRequiredQualifications] = useState("");
    const [preferredQualifications, setPreferredQualifications] = useState("");

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    useEffect(() => {
        if (isOpen) {
            if (initialData) {
                setCompany(initialData.company || "");
                setJobTitle(initialData.job_title || "");
                setLocation(initialData.location || "");
                setStatus(initialData.status || "Applied");
                setSource(initialData.source || "");
                setAppliedDate(initialData.applied_date ? new Date(initialData.applied_date).toISOString().split('T')[0] : "");
                setJobLink(initialData.job_link || "");
                setNotes(initialData.notes || "");
                setCompanyDescription(initialData.company_description || "");
                setResponsibilities(initialData.responsibilities || "");
                setRequiredQualifications(initialData.required_qualifications || "");
                setPreferredQualifications(initialData.preferred_qualifications || "");
            } else {
                setCompany("");
                setJobTitle("");
                setLocation("");
                setStatus("Applied");
                setSource("");
                setAppliedDate("");
                setJobLink("");
                setNotes("");
                setCompanyDescription("");
                setResponsibilities("");
                setRequiredQualifications("");
                setPreferredQualifications("");
            }
            setError("");
        }
    }, [isOpen, initialData]);

    if (!isOpen) return null;

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");

        if (!company || !jobTitle) {
            setError("Company and job title are required.");
            return;
        }

        const appData = {
            company,
            jobTitle,
            location,
            status,
            source,
            appliedDate,
            jobLink,
            notes,
            companyDescription,
            responsibilities,
            requiredQualifications,
            preferredQualifications
        };

        try {
            setLoading(true);
            await onSubmit(appData);
            onClose();
        } catch (err) {
            setError(err.message || "Failed to save application.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <h2 className="modal-title">{title}</h2>
                    <button className="close-btn" onClick={onClose}>&times;</button>
                </div>

                <div className="modal-body">
                    <form onSubmit={handleSubmit} className="form-grid">
                        {/* AI Match Section - Only for existing applications */}
                        {initialData && (
                            <ResumeMatcher
                                jobDetails={{
                                    company,
                                    jobTitle,
                                    companyDescription,
                                    responsibilities,
                                    requiredQualifications
                                }}
                                applicationId={initialData.id}
                                initialScore={initialData.resume_match_score}
                                token={token}
                                onMatchComplete={(result) => {
                                    if (onApplicationUpdated) {
                                        onApplicationUpdated({
                                            ...initialData,
                                            resume_match_score: result.score
                                        });
                                    }
                                }}
                            />
                        )}
                        <div className="field">
                            <span className="field-label">Company *</span>
                            <input
                                className="field-input"
                                value={company}
                                onChange={(e) => setCompany(e.target.value)}
                                placeholder="Google"
                                required
                            />
                        </div>

                        <div className="field">
                            <span className="field-label">Job Title *</span>
                            <input
                                className="field-input"
                                value={jobTitle}
                                onChange={(e) => setJobTitle(e.target.value)}
                                placeholder="Software Engineer"
                                required
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
                                <option value="Saved">Saved</option>
                                <option value="Applied">Applied</option>
                                <option value="Online Assessment">Online Assessment</option>
                                <option value="Interviewing">Interviewing</option>
                                <option value="Offer">Offer</option>
                                <option value="Rejected">Rejected</option>
                                <option value="Accepted">Accepted</option>
                            </select>
                        </div>

                        <div className="field">
                            <span className="field-label">Source</span>
                            <input
                                className="field-input"
                                value={source}
                                onChange={(e) => setSource(e.target.value)}
                                placeholder="LinkedIn, Referral..."
                            />
                        </div>

                        <div className="field">
                            <span className="field-label">Applied Date</span>
                            <input
                                type="date"
                                className="field-input"
                                value={appliedDate}
                                onChange={(e) => setAppliedDate(e.target.value)}
                            />
                        </div>

                        <div className="field full-width">
                            <span className="field-label">Job Link</span>
                            <input
                                className="field-input"
                                value={jobLink}
                                onChange={(e) => setJobLink(e.target.value)}
                                placeholder="https://..."
                            />
                        </div>

                        <div className="field full-width">
                            <span className="field-label">About the Company</span>
                            <textarea
                                className="field-textarea"
                                value={companyDescription}
                                onChange={(e) => setCompanyDescription(e.target.value)}
                                placeholder="Brief description of the company..."
                                rows={3}
                            />
                        </div>

                        <div className="field full-width">
                            <span className="field-label">Responsibilities</span>
                            <textarea
                                className="field-textarea"
                                value={responsibilities}
                                onChange={(e) => setResponsibilities(e.target.value)}
                                placeholder="Key responsibilities..."
                                rows={4}
                            />
                        </div>

                        <div className="field full-width">
                            <span className="field-label">Qualifications</span>
                            <textarea
                                className="field-textarea"
                                value={requiredQualifications}
                                onChange={(e) => setRequiredQualifications(e.target.value)}
                                placeholder="Required skills and experience..."
                                rows={4}
                            />
                        </div>

                        <div className="field full-width">
                            <span className="field-label">Preferred Qualifications</span>
                            <textarea
                                className="field-textarea"
                                value={preferredQualifications}
                                onChange={(e) => setPreferredQualifications(e.target.value)}
                                placeholder="Nice-to-have skills..."
                                rows={3}
                            />
                        </div>

                        <div className="field full-width">
                            <span className="field-label">Notes</span>
                            <textarea
                                className="field-textarea"
                                value={notes}
                                onChange={(e) => setNotes(e.target.value)}
                                placeholder="Personal notes..."
                                rows={2}
                            />
                        </div>

                        {error && <div className="error-text full-width">{error}</div>}

                        <div className="modal-footer full-width" style={{ marginTop: '20px', padding: 0, border: 'none' }}>
                            <button type="button" className="btn btn-secondary" onClick={onClose} style={{ marginRight: '10px' }}>Cancel</button>
                            <button className="btn btn-primary" type="submit" disabled={loading}>
                                {loading ? "Saving..." : "Save Application"}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
            <style>{`
        .full-width {
          grid-column: 1 / -1;
        }
        .form-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 16px;
        }
        @media (max-width: 600px) {
          .form-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
        </div>
    );
}

export default ApplicationFormModal;
