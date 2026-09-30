import { useCallback, useEffect, useState } from "react";

interface ConfigState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
}

/** Loads a config via the given fetcher, exposing loading/error state and reload. */
export function useConfig<T>(fetcher: () => Promise<T>) {
  const [state, setState] = useState<ConfigState<T>>({
    data: null,
    loading: true,
    error: null,
  });

  const load = useCallback(async () => {
    setState((s) => ({ ...s, loading: true, error: null }));
    try {
      const data = await fetcher();
      setState({ data, loading: false, error: null });
    } catch (err) {
      setState({
        data: null,
        loading: false,
        error: err instanceof Error ? err.message : "Failed to load configuration",
      });
    }
    // fetcher intentionally excluded; callers pass a stable reference or use reloadKey
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  return { ...state, reload: load, setData: (data: T) => setState((s) => ({ ...s, data })) };
}
