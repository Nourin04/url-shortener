import { useState, useEffect } from "react";
import type { URLStats } from "../types";
import { fetchStats } from "../api";

const BASE_URL = import.meta.env.VITE_API_URL ?? "http://localhost:8000";

interface Props {
  id: number;
  token: string;
  shortCode: string;
  onClose: () => void;
}

export default function StatsModal({ id, token, shortCode, onClose }: Props) {
  const [stats, setStats] = useState<URLStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);

  const shortUrl = `${BASE_URL}/${shortCode}`;

  useEffect(() => {
    fetchStats(token, id)
      .then(setStats)
      .catch(() => setError("Could not load stats."))
      .finally(() => setLoading(false));
  }, [token, id]);

  function formatDate(iso: string) {
    return new Date(iso).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  }

  function handleCopy() {
    navigator.clipboard.writeText(shortUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-card" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>📊 Analytics</h2>
          <button className="modal-close" onClick={onClose} id="close-stats-btn">
            ✕
          </button>
        </div>

        {loading && (
          <div className="modal-loading">
            <span className="spinner large" />
          </div>
        )}

        {error && <p className="error-msg">{error}</p>}

        {stats && (
          <div className="stats-grid">
            {/* Short URL — full clickable link */}
            <div className="stat-card wide stat-card-link-row">
              <span className="stat-label">Short URL</span>
              <div className="stat-link-row">
                <a
                  href={shortUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="stat-url stat-url-bold"
                >
                  {shortUrl}
                </a>
                <button
                  className="btn btn-ghost btn-sm"
                  onClick={handleCopy}
                >
                  {copied ? "✓ Copied" : "Copy"}
                </button>
              </div>
            </div>

            <div className="stat-card">
              <span className="stat-label">Short Code</span>
              <span className="stat-value code">/{shortCode}</span>
            </div>
            <div className="stat-card highlight">
              <span className="stat-label">Total Clicks</span>
              <span className="stat-value big">{stats.click_count}</span>
            </div>
            <div className="stat-card wide">
              <span className="stat-label">Original URL</span>
              <a
                href={stats.original_url}
                target="_blank"
                rel="noopener noreferrer"
                className="stat-url"
              >
                {stats.original_url}
              </a>
            </div>
            <div className="stat-card">
              <span className="stat-label">Created</span>
              <span className="stat-value">{formatDate(stats.created_at)}</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
