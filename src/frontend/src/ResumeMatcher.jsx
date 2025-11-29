import React, { useState, useEffect } from 'react';
import axios from 'axios';
import ScoreGauge from './ScoreGauge';

const API_URL = "http://localhost:4000/api";

const ResumeMatcher = ({ jobDetails, applicationId, initialScore, token, onMatchComplete }) => {
    const [resumes, setResumes] = useState([]);
    const [selectedResumeId, setSelectedResumeId] = useState("");
    const [matchResult, setMatchResult] = useState(initialScore ? { score: initialScore, reasoning: "Previous analysis." } : null);
    const [analyzing, setAnalyzing] = useState(false);
    const [error, setError] = useState("");

    useEffect(() => {
        const fetchResumes = async () => {
            try {
                const res = await axios.get(`${API_URL}/resumes`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setResumes(res.data);
                // Auto-select primary
                const primary = res.data.find(r => r.is_primary);
                if (primary) setSelectedResumeId(primary.id);
                else if (res.data.length > 0) setSelectedResumeId(res.data[0].id);
            } catch (err) {
                console.error("Failed to fetch resumes", err);
            }
        };
        fetchResumes();
    }, [token]);

    const handleAnalyze = async () => {
        if (!selectedResumeId) {
            setError("Please select a resume to analyze.");
            return;
        }

        // Basic validation
        if (!jobDetails.companyDescription && !jobDetails.responsibilities && !jobDetails.requiredQualifications) {
            setError("Please add some job details (Description, Responsibilities, or Qualifications) to analyze.");
            return;
        }

        setAnalyzing(true);
        setError("");
        setMatchResult(null);

        try {
            const res = await axios.post(`${API_URL}/resumes/${selectedResumeId}/match`, {
                jobDetails,
                applicationId
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setMatchResult(res.data);

            if (onMatchComplete) {
                onMatchComplete(res.data);
            }
        } catch (err) {
            console.error(err);
            setError("Analysis failed. Please try again.");
        } finally {
            setAnalyzing(false);
        }
    };

    return (
        <div className="full-width" style={{ marginBottom: '20px', padding: '20px', background: '#0f172a', borderRadius: '8px', border: '1px solid #334155' }}>
            <h3 style={{ margin: '0 0 16px 0', color: '#60a5fa', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="20" height="20">
                    <path d="M12 2a10 10 0 1 0 10 10H12V2z"></path>
                    <path d="M12 2a10 10 0 0 1 10 10"></path>
                    <path d="M12 12 2.1 12.1"></path>
                </svg>
                AI Resume Match
            </h3>

            <div style={{ display: 'flex', gap: '12px', marginBottom: '16px' }}>
                <select
                    className="field-select"
                    style={{ flex: 1 }}
                    value={selectedResumeId}
                    onChange={(e) => setSelectedResumeId(e.target.value)}
                >
                    <option value="">Select Resume...</option>
                    {resumes.map(r => (
                        <option key={r.id} value={r.id}>
                            {r.original_name} {r.is_primary ? '(Primary)' : ''}
                        </option>
                    ))}
                </select>
                <button
                    type="button"
                    className="btn btn-primary"
                    onClick={handleAnalyze}
                    disabled={analyzing || !selectedResumeId}
                >
                    {analyzing ? "Analyzing..." : "Analyze Match"}
                </button>
            </div>

            {error && <div className="error-text" style={{ marginBottom: '16px' }}>{error}</div>}

            {matchResult && (
                <div className="match-results">
                    <ScoreGauge score={matchResult.score} />
                    <div style={{ background: '#1e293b', padding: '16px', borderRadius: '8px', marginTop: '16px' }}>
                        <h4 style={{ margin: '0 0 8px 0', color: '#e2e8f0' }}>AI Analysis</h4>
                        <p style={{ margin: 0, color: '#94a3b8', lineHeight: '1.6' }}>{matchResult.reasoning}</p>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ResumeMatcher;
