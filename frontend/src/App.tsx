import { useState } from "react";
import Login from "./components/Login";
import Dashboard from "./components/Dashboard";

export default function App() {
  const [token, setToken] = useState<string | null>(
    () => sessionStorage.getItem("access_token")
  );

  function handleLogin(access: string) {
    sessionStorage.setItem("access_token", access);
    setToken(access);
  }

  function handleLogout() {
    sessionStorage.removeItem("access_token");
    setToken(null);
  }

  return token ? (
    <Dashboard token={token} onLogout={handleLogout} />
  ) : (
    <Login onLogin={handleLogin} />
  );
}
