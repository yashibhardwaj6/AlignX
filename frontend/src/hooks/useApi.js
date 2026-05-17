import { useEffect, useState } from "react";
import { api } from "../services/api.js";

export function useApi(path, initial = null) {
  const [data, setData] = useState(initial);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function refresh() {
    setLoading(true);
    setError("");
    try {
      setData(await api(path));
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    refresh();
  }, [path]);

  return { data, loading, error, refresh, setData };
}
