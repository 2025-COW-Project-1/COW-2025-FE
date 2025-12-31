import { useEffect, useState } from 'react';
import { formsApi } from '../api/forms';
import type { ActiveFormResponse } from '../api/forms';

export function useActiveForm() {
  const [data, setData] = useState<ActiveFormResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    formsApi
      .getActiveForm()
      .then((res) => setData(res))
      .catch((e) => setError(e instanceof Error ? e.message : String(e)))
      .finally(() => setLoading(false));
  }, []);

  return { data, loading, error };
}
