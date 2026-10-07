import { useState, useEffect } from "react";
import type { URLStats } from "../types";
import { fetchStats } from "../api";

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

  // Fetch on mount
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
