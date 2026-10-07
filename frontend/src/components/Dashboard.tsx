import { useState, useEffect, useCallback } from "react";
import type { URLItem } from "../types";
import { fetchURLs, shortenURL, deleteURL } from "../api";
import StatsModal from "./StatsModal";

const BASE_URL = "http://localhost:8000";

interface Props {
  token: string;
  onLogout: () => void;
}

export default function Dashboard({ token, onLogout }: Props) {
  const [urls, setUrls] = useState<URLItem[]>([]);
  const [inputURL, setInputURL] = useState("");
  const [loadingShorten, setLoadingShorten] = useState(false);
  const [loadingList, setLoadingList] = useState(true);
  const [shortenError, setShortenError] = useState("");
  const [lastShortened, setLastShortened] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [statsTarget, setStatsTarget] = useState<{ id: number; shortCode: string } | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const loadURLs = useCallback(async () => {
    setLoadingList(true);
    try {
      const data = await fetchURLs(token);
      setUrls(data);
    } catch {
      // silently fail — user sees empty list
    } finally {
      setLoadingList(false);
    }
  }, [token]);

  useEffect(() => {
    loadURLs();
  }, [loadURLs]);

  async function handleShorten(e: React.FormEvent) {
    e.preventDefault();
    setShortenError("");
    setLastShortened(null);
    setLoadingShorten(true);
    try {
      const data = await shortenURL(token, inputURL);
      setLastShortened(`${BASE_URL}/${data.short_code}`);
      setInputURL("");
      await loadURLs();
    } catch (err: unknown) {
      setShortenError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setLoadingShorten(false);
    }
  }

  async function handleDelete(id: number) {
    setDeletingId(id);
    try {
      await deleteURL(token, id);
      setUrls((prev) => prev.filter((u) => u.id !== id));
    } catch {
      // could show toast
    } finally {
      setDeletingId(null);
    }
  }

  function handleCopy() {
    if (!lastShortened) return;
    navigator.clipboard.writeText(lastShortened);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  function truncate(s: string, n = 40) {
    return s.length > n ? s.slice(0, n) + "…" : s;
  }

  return (
    <div className="dashboard">
      {/* Header */}
      <header className="dash-header">
        <div className="dash-logo">
          <span>🔗</span>
          <span>URL Shortener</span>
        </div>
        <button
          id="logout-btn"
          className="btn btn-ghost"
          onClick={onLogout}
        >
          Sign out
        </button>
      </header>

      <main className="dash-main">
        {/* Shorten box */}
        <section className="shorten-section">
          <h2 className="section-title">Shorten a URL</h2>
          <form onSubmit={handleShorten} className="shorten-form">
            <input
              id="url-input"
              type="url"
              value={inputURL}
              onChange={(e) => setInputURL(e.target.value)}
              placeholder="https://example.com/a-very-long-link"
              required
            />
            <button
              id="shorten-btn"
              type="submit"
              className="btn btn-primary"
              disabled={loadingShorten}
            >
              {loadingShorten ? <span className="spinner" /> : "Shorten"}
            </button>
          </form>

          {shortenError && <p className="error-msg">{shortenError}</p>}

          {lastShortened && (
            <div className="result-box">
              <span className="result-label">Your short URL</span>
              <div className="result-row">
                <a
                  href={lastShortened}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="result-link"
                  id="shortened-link"
                >
                  {lastShortened}
                </a>
                <button
                  id="copy-btn"
                  className="btn btn-ghost btn-sm"
                  onClick={handleCopy}
                >
                  {copied ? "✓ Copied" : "Copy"}
                </button>
              </div>
            </div>
          )}
        </section>

        {/* URL list */}
        <section className="urls-section">
          <div className="section-header-row">
            <h2 className="section-title">My URLs</h2>
            <span className="url-count">{urls.length} link{urls.length !== 1 ? "s" : ""}</span>
          </div>

          {loadingList ? (
            <div className="list-loading">
              <span className="spinner large" />
            </div>
          ) : urls.length === 0 ? (
            <div className="empty-state">
              <p>No links yet. Shorten your first URL above! 🚀</p>
            </div>
          ) : (
            <div className="url-table-wrapper">
              <table className="url-table">
                <thead>
                  <tr>
                    <th>Original URL</th>
                    <th>Short Link</th>
                    <th>Clicks</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {urls.map((u) => (
                    <tr key={u.id} className="url-row">
                      <td className="url-original" title={u.url}>
                        {truncate(u.url)}
                      </td>
                      <td>
                        <a
                          href={`${BASE_URL}/${u.short_code}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="short-link"
                        >
                          /{u.short_code}
                        </a>
                      </td>
                      <td>
                        <span className="click-badge">{u.click_count}</span>
                      </td>
                      <td className="actions-cell">
                        <button
                          id={`stats-btn-${u.id}`}
                          className="btn btn-ghost btn-sm"
                          onClick={() =>
                            setStatsTarget({ id: u.id, shortCode: u.short_code })
                          }
                        >
                          Stats
                        </button>
                        <button
                          id={`delete-btn-${u.id}`}
                          className="btn btn-danger btn-sm"
                          disabled={deletingId === u.id}
                          onClick={() => handleDelete(u.id)}
                        >
                          {deletingId === u.id ? "…" : "Delete"}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </main>

      {/* Stats modal */}
      {statsTarget && (
        <StatsModal
          id={statsTarget.id}
          shortCode={statsTarget.shortCode}
          token={token}
          onClose={() => setStatsTarget(null)}
        />
      )}
    </div>
  );
}
