import { useCallback, useEffect, useState } from "react";
export default function useAdminResource(loader, deps = []) {
  const [data, setData] = useState(null); const [loading, setLoading] = useState(true); const [error, setError] = useState("");
  const reload = useCallback(async () => { setLoading(true); setError(""); try { setData(await loader()); } catch (e) { setError(e?.message || "Unexpected API error"); } finally { setLoading(false); } }, deps); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => { reload(); }, [reload]);
  return { data, loading, error, reload, setData };
}
