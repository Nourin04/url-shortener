import { useState } from "react";
import { login, register } from "../api";

interface Props {
  onLogin: (access: string) => void;
}

export default function Login({ onLogin }: Props) {
  const [mode, setMode]               = useState<"login" | "register">("login");
  const [username, setUsername]       = useState("");
  const [password, setPassword]       = useState("");
  const [confirmPassword, setConfirm] = useState("");
  const [error, setError]             = useState("");
  const [success, setSuccess]         = useState("");
  const [loading, setLoading]         = useState(false);

  function switchMode(next: "login" | "register") {
    setMode(next);
    setError("");
    setSuccess("");
    setUsername("");
    setPassword("");
    setConfirm("");
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    try {
      if (mode === "login") {
        const tokens = await login(username, password);
        onLogin(tokens.access);
      } else {
        await register(username, password, confirmPassword);
        setSuccess("Account created! Signing you in…");
        // Auto-login after successful registration
        const tokens = await login(username, password);
        onLogin(tokens.access);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  const isLogin = mode === "login";

  return (
    <div className="auth-wrapper">
      <div className="auth-card">
        <div className="auth-logo">
          <span className="logo-icon">🔗</span>
          <h1>URL Shortener</h1>
          <p className="auth-subtitle">
            {isLogin ? "Sign in to manage your links" : "Create a free account"}
          </p>
        </div>

        {/* Tab toggle */}
        <div className="auth-tabs">
          <button
            type="button"
            className={`auth-tab ${isLogin ? "active" : ""}`}
            onClick={() => switchMode("login")}
          >
            Sign In
          </button>
          <button
            type="button"
            className={`auth-tab ${!isLogin ? "active" : ""}`}
            onClick={() => switchMode("register")}
          >
            Sign Up
          </button>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="field">
            <label htmlFor="username">Username</label>
            <input
              id="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="your_username"
              required
              autoFocus
            />
          </div>
          <div className="field">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
            />
          </div>

          {!isLogin && (
            <div className="field">
              <label htmlFor="confirm-password">Confirm Password</label>
              <input
                id="confirm-password"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirm(e.target.value)}
                placeholder="••••••••"
                required
              />
            </div>
          )}

          {error   && <p className="error-msg">{error}</p>}
          {success && <p className="success-msg">{success}</p>}

          <button
            id={isLogin ? "login-btn" : "register-btn"}
            type="submit"
            className="btn btn-primary btn-full"
            disabled={loading}
          >
            {loading
              ? <span className="spinner" />
              : isLogin ? "Sign In" : "Create Account"}
          </button>
        </form>
      </div>
    </div>
  );
}
