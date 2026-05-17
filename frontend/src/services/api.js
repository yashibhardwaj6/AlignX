const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000/api";

export function token() {
  return localStorage.getItem("alignx-token");
}

export async function api(path, options = {}) {
  const headers = { "Content-Type": "application/json", ...(options.headers || {}) };
  if (token()) headers.Authorization = `Bearer ${token()}`;
  const res = await fetch(`${API_URL}${path}`, { ...options, headers });
  if (!res.ok) {
    let detail = "Request failed";
    try {
      const body = await res.json();
      detail = body.detail || detail;
    } catch {
      detail = res.statusText;
    }
    throw new Error(detail);
  }
  if (res.status === 204) return null;
  return res.json();
}

export function reportUrl(type, format) {
  return `${API_URL}/reports/${type}.${format}`;
}
