import { useEffect, useState } from "react";
import { fetcher } from "../services/api";

export function useFetch(endpoint, deps = []) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let isMounted = true;

    fetcher(endpoint)
      .then((json) => isMounted && setData(json))
      .catch((err) => isMounted && setError(err))
      .finally(() => isMounted && setLoading(false));

    return () => { isMounted = false; };
  }, deps);      // ex.: [userId] para refetches condicionais

  return { data, loading, error };
}
