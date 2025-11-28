import React, { useState, useEffect } from 'react';
import axios from 'axios';

const API_URL = "http://localhost:4000/api";

function ResumeManager({ token, onClose }) {
    const [resumes, setResumes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState("");

    useEffect(() => {
        fetchResumes();
    }, [token]);

    const fetchResumes = async () => {
        try {
            const res = await axios.get(`${API_URL}/resumes`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setResumes(res.data);
        } catch (err) {
            console.error(err);
            setError("Failed to load resumes.");
        } finally {
            setLoading(false);
        }
    };

    const handleUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        if (file.type !== 'application/pdf') {
            setError("Only PDF files are allowed.");
            return;
        }

        const formData = new FormData();
        formData.append('resume', file);

        setUploading(true);
        setError("");

        try {
            const res = await axios.post(`${API_URL}/resumes`, formData, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'multipart/form-data'
                }
            });
            setResumes([res.data, ...resumes]);
        } catch (err) {
            console.error(err);
            setError("Failed to upload resume.");
        } finally {
            setUploading(false);
        }
    };

    const handleSetPrimary = async (id) => {
        try {
            await axios.put(`${API_URL}/resumes/${id}/primary`, {}, {
                headers: { Authorization: `Bearer ${token}` }
            });
            // Update local state
            setResumes(resumes.map(r => ({
                ...r,
                is_primary: r.id === id ? 1 : 0
            })));
        } catch (err) {
            console.error(err);
            setError("Failed to set primary resume.");
        }
    };

    const handleDelete = async (id) => {
        if (!confirm("Are you sure you want to delete this resume?")) return;
        try {
            await axios.delete(`${API_URL}/resumes/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setResumes(resumes.filter(r => r.id !== id));
        } catch (err) {
            console.error(err);
            setError("Failed to delete resume.");
        }
    };

    const handleDownload = async (id, originalName) => {
        try {
            const response = await axios.get(`${API_URL}/resumes/${id}/download`, {
                headers: { Authorization: `Bearer ${token}` },
                responseType: 'blob',
            });
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', originalName);
            document.body.appendChild(link);
            link.click();
            link.remove();
        } catch (err) {
            console.error(err);
            setError("Failed to download resume.");
        }
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <h2 className="modal-title">Manage Resumes</h2>
                    <button className="close-btn" onClick={onClose}>&times;</button>
                </div>

                <div className="modal-body">
                    {error && <div className="error-text" style={{ marginBottom: '16px' }}>{error}</div>}

                    <div className="upload-section" style={{ marginBottom: '24px', padding: '20px', border: '2px dashed #334155', borderRadius: '8px', textAlign: 'center' }}>
                        <input
                            type="file"
                            id="resume-upload"
                            accept=".pdf"
                            onChange={handleUpload}
                            style={{ display: 'none' }}
                            disabled={uploading}
                        />
                        <label htmlFor="resume-upload" className="btn btn-primary" style={{ cursor: 'pointer' }}>
                            {uploading ? "Uploading..." : "Upload New Resume (PDF)"}
                        </label>
                        <p style={{ marginTop: '8px', color: '#94a3b8', fontSize: '12px' }}>Max file size: 5MB</p>
                    </div>

                    {loading ? (
                        <div style={{ textAlign: 'center', color: '#94a3b8' }}>Loading resumes...</div>
                    ) : resumes.length === 0 ? (
                        <div style={{ textAlign: 'center', color: '#94a3b8' }}>No resumes uploaded yet.</div>
                    ) : (
                        <div className="resume-list">
                            {resumes.map((resume) => (
                                <div key={resume.id} className="resume-item" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px', background: '#0f172a', borderRadius: '8px', marginBottom: '8px', border: resume.is_primary ? '1px solid #60a5fa' : '1px solid #334155' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                        <div style={{ color: '#ef4444' }}>
                                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="24" height="24">
                                                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                                                <polyline points="14 2 14 8 20 8"></polyline>
                                                <line x1="16" y1="13" x2="8" y2="13"></line>
                                                <line x1="16" y1="17" x2="8" y2="17"></line>
                                                <polyline points="10 9 9 9 8 9"></polyline>
                                            </svg>
                                        </div>
                                        <div>
                                            <div style={{ fontWeight: '500', color: '#e2e8f0' }}>{resume.original_name}</div>
                                            <div style={{ fontSize: '12px', color: '#94a3b8' }}>Uploaded: {new Date(resume.created_at).toLocaleDateString()}</div>
                                        </div>
                                    </div>

                                    <div style={{ display: 'flex', gap: '8px' }}>
                                        {resume.is_primary ? (
                                            <span className="status-chip status-accepted" style={{ fontSize: '11px' }}>Primary</span>
                                        ) : (
                                            <button
                                                className="btn btn-sm btn-ghost"
                                                onClick={() => handleSetPrimary(resume.id)}
                                                style={{ fontSize: '12px' }}
                                            >
                                                Make Primary
                                            </button>
                                        )}
                                        <button
                                            className="btn btn-sm btn-ghost"
                                            onClick={() => handleDownload(resume.id, resume.original_name)}
                                            title="Download"
                                        >
                                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16">
                                                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                                                <polyline points="7 10 12 15 17 10"></polyline>
                                                <line x1="12" y1="15" x2="12" y2="3"></line>
                                            </svg>
                                        </button>
                                        <button
                                            className="btn btn-sm btn-danger"
                                            onClick={() => handleDelete(resume.id)}
                                            title="Delete"
                                        >
                                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16">
                                                <polyline points="3 6 5 6 21 6"></polyline>
                                                <path d="M19 6v14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                                            </svg>
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                <div className="modal-footer">
                    <button className="btn btn-secondary" onClick={onClose}>Close</button>
                </div>
            </div>
        </div>
    );
}

export default ResumeManager;
