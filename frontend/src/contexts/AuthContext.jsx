import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { api } from "../services/api.js";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const raw = localStorage.getItem("alignx-user");
    return raw ? JSON.parse(raw) : null;
  });
  const [loading, setLoading] = useState(Boolean(localStorage.getItem("alignx-token")) && !user);

  useEffect(() => {
    if (!localStorage.getItem("alignx-token")) return;
    api("/auth/me")
      .then((me) => {
        setUser(me);
        localStorage.setItem("alignx-user", JSON.stringify(me));
        localStorage.setItem("alignx-role", me.role);
      })
      .catch(() => logout())
      .finally(() => setLoading(false));
  }, []);

  async function login(email, password) {
    const data = await api("/auth/login", { method: "POST", body: JSON.stringify({ email, password }) });
    localStorage.setItem("alignx-token", data.access_token);
    localStorage.setItem("alignx-user", JSON.stringify(data.user));
    localStorage.setItem("alignx-role", data.user.role);
    setUser(data.user);
    return data.user;
  }

  function logout() {
    localStorage.removeItem("alignx-token");
    localStorage.removeItem("alignx-user");
    localStorage.removeItem("alignx-role");
    setUser(null);
  }

  const value = useMemo(() => ({ user, loading, login, logout }), [user, loading]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}
