/** Shared API helpers — expand in later sections */
export function apiBase(): string {
  return process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, '') || '';
}

type ApiErrorBody = {
  error?: { code?: string; message?: string };
};

/**
 * Reads a response as JSON, but degrades gracefully when the body is not JSON
 * (dev-proxy timeouts and gateway errors return plain text or HTML).
 */
export async function parseJson<T>(res: Response): Promise<T> {
  if (res.status === 204) return undefined as T;

  const raw = await res.text();
  if (raw.trim() === '') {
    if (res.ok) return undefined as T;
    throw new Error(`Request failed (${res.status} ${res.statusText})`);
  }

  let data: (T & ApiErrorBody) | null = null;
  try {
    data = JSON.parse(raw) as T & ApiErrorBody;
  } catch {
    const snippet = raw.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim().slice(0, 120);
    throw new Error(
      res.ok
        ? `Unexpected non-JSON response from the API: ${snippet}`
        : `API error ${res.status}: ${snippet || res.statusText}`,
    );
  }

  if (!res.ok) {
    throw new Error(data?.error?.message || `Request failed (${res.status})`);
  }
  return data;
}
