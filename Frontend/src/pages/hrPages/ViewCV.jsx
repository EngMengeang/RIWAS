import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getResumeUrl, getCoverLetterUrl } from '../../server/jobapplicationAPI';
import SideBar from '../../components/SideBar';

export default function ViewCV() {
  const { id }   = useParams();
  const navigate = useNavigate();

  const [resumeUrl, setResumeUrl] = useState(null);
  const [coverUrl, setCoverUrl]   = useState(null);
  const [loading, setLoading]     = useState(true);
  const [activeTab, setActiveTab] = useState('resume');

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        try { const u = await getResumeUrl(id);      setResumeUrl(u); } catch { /* none */ }
        try { const u = await getCoverLetterUrl(id); setCoverUrl(u);  } catch { /* none */ }
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id]);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Roboto:wght@300;400;500;700&display=swap');

        .vc-root * { box-sizing: border-box; }

        .vc-root {
          font-family: 'Roboto', sans-serif;
          background: #f5f5f4;
          height: 100vh;
          width: 200vh;
          overflow: hidden;
        }

        .vc-main {
          flex: 1;
          margin-left: 227px;
          padding: 28px 36px 20px 36px;
          display: flex;
          flex-direction: column;
          gap: 16px;
          height: 100vh;
          overflow: hidden;
        }

        /* ── Header ── */
        .vc-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          flex-shrink: 0;
        }

        .vc-header-left {
          display: flex;
          align-items: center;
          gap: 14px;
        }

        .vc-back {
          width: 38px;
          height: 38px;
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
        .vc-back:hover { background: #f0f0ef; border-color: #b5b5b3; }

        .vc-title {
          font-size: 18px;
          font-weight: 700;
          color: #1a1a1a;
          letter-spacing: 0.01em;
          margin: 0;
        }

        .vc-badge {
          font-family: 'Roboto', sans-serif;
          font-size: 11px;
          font-weight: 500;
          color: #737370;
          background: #ebebea;
          padding: 4px 10px;
          border-radius: 4px;
          letter-spacing: 0.07em;
          text-transform: uppercase;
        }

        /* ── Card ── */
        .vc-card {
          background: #fff;
          border: 1px solid #e4e4e3;
          border-radius: 12px;
          overflow: hidden;
          flex: 1;
          display: flex;
          flex-direction: column;
          min-height: 0;
        }

        /* ── Tabs ── */
        .vc-tabs {
          display: flex;
          border-bottom: 1px solid #e4e4e3;
          background: #fafaf9;
          padding: 0 6px;
          gap: 2px;
          flex-shrink: 0;
        }

        .vc-tab {
          position: relative;
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 15px 22px;
          font-family: 'Roboto', sans-serif;
          font-size: 13.5px;
          font-weight: 500;
          color: #8a8a87;
          background: transparent;
          border: none;
          border-bottom: 2px solid transparent;
          margin-bottom: -1px;
          cursor: pointer;
          transition: color 0.15s;
          letter-spacing: 0.01em;
        }

        .vc-tab:hover { color: #3a3a38; }

        .vc-tab.active {
          color: #1a1a1a;
          border-bottom-color: #1a1a1a;
        }

        .vc-tab svg { flex-shrink: 0; }

        /* ── Viewer ── */
        .vc-viewer {
          flex: 1;
          width: 100%;
          display: block;
          border: none;
          min-height: 0;
        }

        /* ── Empty state ── */
        .vc-empty {
          flex: 1;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 12px;
        }

        .vc-empty-icon {
          width: 52px;
          height: 52px;
          background: #f0f0ef;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .vc-empty p {
          font-family: 'Roboto', sans-serif;
          font-size: 13.5px;
          color: #a3a3a0;
          margin: 0;
          font-weight: 400;
        }

        /* ── Actions ── */
        .vc-actions {
          display: flex;
          gap: 12px;
          flex-shrink: 0;
          padding-bottom: 4px;
        }

        .vc-btn {
          display: inline-flex;
          align-items: center;
          gap: 9px;
          padding: 13px 28px;
          font-family: 'Roboto', sans-serif;
          font-size: 14px;
          font-weight: 500;
          border-radius: 8px;
          text-decoration: none;
          transition: background 0.15s, box-shadow 0.15s;
          letter-spacing: 0.02em;
          min-width: 180px;
          justify-content: center;
        }

        .vc-btn-primary {
          background: #16a34a;
          color: #fff;
          border: 1px solid #16a34a;
        }
        .vc-btn-primary:hover {
          background: #15803d;
          box-shadow: 0 3px 10px rgba(22,163,74,0.3);
        }

        .vc-btn-secondary {
          background: #16a34a;
          color: #fff;
          border: 1px solid #16a34a;
        }
        .vc-btn-secondary:hover {
          background: #15803d;
          box-shadow: 0 3px 10px rgba(22,163,74,0.3);
        }

        /* ── Loading ── */
        .vc-loading {
          flex: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          color: #a3a3a0;
          font-family: 'Roboto', sans-serif;
          font-size: 13.5px;
        }

        .vc-spinner {
          width: 17px;
          height: 17px;
          border: 2px solid #e4e4e3;
          border-top-color: #737370;
          border-radius: 50%;
          animation: vc-spin 0.7s linear infinite;
        }

        @keyframes vc-spin { to { transform: rotate(360deg); } }
      `}</style>

      <div className="vc-root">
        <SideBar />

        <main className="vc-main">

          {/* Header */}
          <div className="vc-header">
            <div className="vc-header-left">
              <button className="vc-back" onClick={() => navigate(-1)} aria-label="Go back">
                <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.75" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <h1 className="vc-title">Application Documents</h1>
            </div>
            <span className="vc-badge">View Only</span>
          </div>

          {/* Card */}
          <div className="vc-card">

            {/* Tabs */}
            <div className="vc-tabs">
              <button
                className={`vc-tab ${activeTab === 'resume' ? 'active' : ''}`}
                onClick={() => setActiveTab('resume')}
              >
                <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="1.75" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Resume / CV
              </button>

              {coverUrl && (
                <button
                  className={`vc-tab ${activeTab === 'cover' ? 'active' : ''}`}
                  onClick={() => setActiveTab('cover')}
                >
                  <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="1.75" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  Cover Letter
                </button>
              )}
            </div>

            {/* Content */}
            {loading ? (
              <div className="vc-loading">
                <div className="vc-spinner" />
                Loading documents…
              </div>
            ) : (
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0 }}>
                {activeTab === 'resume' && (
                  resumeUrl ? (
                    <iframe
                      src={`https://docs.google.com/gview?url=${encodeURIComponent(resumeUrl)}&embedded=true`}
                      className="vc-viewer"
                      title="Resume"
                    />
                  ) : (
                    <div className="vc-empty">
                      <div className="vc-empty-icon">
                        <svg width="22" height="22" fill="none" stroke="#a3a3a0" strokeWidth="1.5" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                      </div>
                      <p>No resume uploaded for this application</p>
                    </div>
                  )
                )}

                {activeTab === 'cover' && (
                  coverUrl ? (
                    <iframe
                      src={`https://docs.google.com/gview?url=${encodeURIComponent(coverUrl)}&embedded=true`}
                      className="vc-viewer"
                      title="Cover Letter"
                    />
                  ) : (
                    <div className="vc-empty">
                      <div className="vc-empty-icon">
                        <svg width="22" height="22" fill="none" stroke="#a3a3a0" strokeWidth="1.5" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                      </div>
                      <p>No cover letter uploaded for this application</p>
                    </div>
                  )
                )}
              </div>
            )}
          </div>

          {/* Download actions */}
          {!loading && (resumeUrl || coverUrl) && (
            <div className="vc-actions">
              {resumeUrl && (
                <a href={resumeUrl} target="_blank" rel="noopener noreferrer" className="vc-btn vc-btn-primary">
                  <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 10v6m0 0l-3-3m3 3l3-3M3 17v3a1 1 0 001 1h16a1 1 0 001-1v-3" />
                  </svg>
                  Download Resume
                </a>
              )}
              {coverUrl && (
                <a href={coverUrl} target="_blank" rel="noopener noreferrer" className="vc-btn vc-btn-secondary">
                  <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 10v6m0 0l-3-3m3 3l3-3M3 17v3a1 1 0 001 1h16a1 1 0 001-1v-3" />
                  </svg>
                  Download Cover Letter
                </a>
              )}
            </div>
          )}

        </main>
      </div>
    </>
  );
}