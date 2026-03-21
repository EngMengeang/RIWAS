import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import SideBar from '../../components/SideBar';
import axios from 'axios';

const API = axios.create({ baseURL: 'http://localhost:5000/api' });

API.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken') || localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export default function ViewCVCandidate() {
  const { id }     = useParams();   // resume ID
  const navigate   = useNavigate();
  const location   = useLocation();

  const [resumeUrl, setResumeUrl] = useState(null);
  const [fileName, setFileName]   = useState('Resume');
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState(null);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError(null);

      // ── Case 1: URL passed via navigation state (from ProfileCandidate) ──
      if (location.state?.resumeUrl) {
        setResumeUrl(location.state.resumeUrl);
        if (location.state.fileName) setFileName(location.state.fileName);
        setLoading(false);
        return;
      }

      // ── Case 2: Fetch resume by ID from /api/resumes/:id ──
      try {
        const res = await API.get(`/resumes/${id}`);
        const data = res.data?.data || res.data;
        const url  = data?.resume || data?.url || null;
        const name = data?.originalName || data?.original_name || data?.filename || 'Resume';
        if (!url) throw new Error('Resume file not found.');
        setResumeUrl(url);
        setFileName(name);
      } catch (err) {
        setError(
          err?.response?.data?.error ||
          err?.response?.data?.message ||
          err.message ||
          'Failed to load resume.'
        );
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id, location.state]);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Roboto:wght@300;400;500;700&display=swap');

        .vcv-root * { box-sizing: border-box; margin: 0; padding: 0; }

        .vcv-root {
          font-family: 'Roboto', sans-serif;
          background: #eeede8;
          height: 100vh;
          overflow: hidden;
          display: flex;
        }

        .vcv-main {
          flex: 1;
          padding: 20px 20px 16px 20px;
          display: flex;
          flex-direction: column;
          gap: 12px;
          height: 100vh;
          overflow: hidden;
          min-width: 0;
        }

        /* ── Header ── */
        .vcv-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          flex-shrink: 0;
        }

        .vcv-header-left {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .vcv-back {
          width: 34px;
          height: 34px;
          border: 1px solid #d4d4d4;
          background: #fff;
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: background 0.15s, border-color 0.15s;
          flex-shrink: 0;
        }
        .vcv-back:hover { background: #f0f0ef; border-color: #b5b5b3; }

        .vcv-title-wrap { display: flex; flex-direction: column; gap: 1px; }

        .vcv-title {
          font-size: 17px;
          font-weight: 700;
          color: #1a1a1a;
          letter-spacing: 0.01em;
        }

        .vcv-subtitle {
          font-size: 12px;
          color: #999;
          font-weight: 400;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          max-width: 400px;
        }

        .vcv-badge {
          font-family: 'Roboto', sans-serif;
          font-size: 11px;
          font-weight: 500;
          color: #888;
          background: #e2e2de;
          padding: 3px 10px;
          border-radius: 4px;
          letter-spacing: 0.07em;
          text-transform: uppercase;
        }

        /* ── Card ── */
        .vcv-card {
          background: #fff;
          border: 1px solid #ddddd8;
          border-radius: 10px;
          overflow: hidden;
          flex: 1;
          display: flex;
          flex-direction: column;
          min-height: 0;
        }

        /* ── Toolbar inside card ── */
        .vcv-toolbar {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 10px 16px;
          border-bottom: 1px solid #e8e8e4;
          background: #fafaf8;
          flex-shrink: 0;
        }

        .vcv-doc-info {
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .vcv-doc-icon {
          width: 32px;
          height: 32px;
          background: #fff1f0;
          border: 1px solid #fdd;
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .vcv-doc-name {
          font-size: 13px;
          font-weight: 600;
          color: #1a1a1a;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          max-width: 340px;
        }

        .vcv-doc-type {
          font-size: 11px;
          color: #aaa;
          margin-top: 1px;
        }

        /* ── Viewer ── */
        .vcv-viewer {
          flex: 1;
          width: 100%;
          display: block;
          border: none;
          min-height: 0;
        }

        /* ── Empty / Error state ── */
        .vcv-state {
          flex: 1;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 10px;
        }

        .vcv-state-icon {
          width: 52px;
          height: 52px;
          background: #f5f5f3;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .vcv-state p {
          font-size: 13px;
          color: #b0b0aa;
          font-weight: 400;
        }

        .vcv-state .error-text { color: #f87171; }

        /* ── Download button ── */
        .vcv-download {
          display: inline-flex;
          align-items: center;
          gap: 7px;
          padding: 9px 20px;
          font-family: 'Roboto', sans-serif;
          font-size: 13px;
          font-weight: 500;
          border-radius: 8px;
          text-decoration: none;
          background: #22a64a;
          color: #fff;
          border: none;
          cursor: pointer;
          transition: background 0.15s, box-shadow 0.15s;
          letter-spacing: 0.02em;
          flex-shrink: 0;
        }
        .vcv-download:hover {
          background: #1a8f3e;
          box-shadow: 0 3px 10px rgba(34,166,74,0.28);
        }

        /* ── Loading ── */
        .vcv-loading {
          flex: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          color: #bbb;
          font-size: 13px;
        }

        .vcv-spinner {
          width: 16px;
          height: 16px;
          border: 2px solid #e4e4e3;
          border-top-color: #999;
          border-radius: 50%;
          animation: vcv-spin 0.7s linear infinite;
        }

        @keyframes vcv-spin { to { transform: rotate(360deg); } }
      `}</style>

      <div className="vcv-root">
        <SideBar />

        <main className="vcv-main">

          {/* Header */}
          <div className="vcv-header">
            <div className="vcv-header-left">
              <button className="vcv-back" onClick={() => navigate(-1)} aria-label="Go back">
                <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <div className="vcv-title-wrap">
                <h1 className="vcv-title">My Resume</h1>
                {fileName && <span className="vcv-subtitle">{fileName}</span>}
              </div>
            </div>
            <span className="vcv-badge">View Only</span>
          </div>

          {/* Card */}
          <div className="vcv-card">

            {loading ? (
              <div className="vcv-loading">
                <div className="vcv-spinner" />
                Loading resume…
              </div>
            ) : error ? (
              <div className="vcv-state">
                <div className="vcv-state-icon">
                  <svg width="22" height="22" fill="none" stroke="#f87171" strokeWidth="1.5" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10"/><path d="M12 8v4m0 4h.01"/>
                  </svg>
                </div>
                <p className="error-text">{error}</p>
              </div>
            ) : resumeUrl ? (
              <>
                {/* Toolbar */}
                <div className="vcv-toolbar">
                  <div className="vcv-doc-info">
                    <div className="vcv-doc-icon">
                      <svg width="15" height="15" fill="none" stroke="#f87171" strokeWidth="1.75" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
                      </svg>
                    </div>
                    <div>
                      <p className="vcv-doc-name">{fileName}</p>
                      <p className="vcv-doc-type">PDF Document</p>
                    </div>
                  </div>
                  <a
                    href={resumeUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="vcv-download"
                  >
                    <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M12 10v6m0 0l-3-3m3 3l3-3M3 17v3a1 1 0 001 1h16a1 1 0 001-1v-3"/>
                    </svg>
                    Download
                  </a>
                </div>

                {/* PDF Viewer */}
                <iframe
                  src={`https://docs.google.com/gview?url=${encodeURIComponent(resumeUrl)}&embedded=true`}
                  className="vcv-viewer"
                  title="Resume Viewer"
                />
              </>
            ) : (
              <div className="vcv-state">
                <div className="vcv-state-icon">
                  <svg width="22" height="22" fill="none" stroke="#bbb" strokeWidth="1.5" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
                  </svg>
                </div>
                <p>No resume file found</p>
              </div>
            )}
          </div>

        </main>
      </div>
    </>
  );
}