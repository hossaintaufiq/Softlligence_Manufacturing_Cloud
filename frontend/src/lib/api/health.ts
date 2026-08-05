export type HealthResponse = {
  status: string;
  service: string;
  name: string;
  version: string;
  timestamp: string;
};

export type ReadyResponse = {
  status: string;
  checks: {
    database: { ok: boolean; message: string };
  };
  timestamp: string;
};

export async function fetchHealth(): Promise<HealthResponse> {
  const res = await fetch('/api/v1/health', { cache: 'no-store' });
  if (!res.ok) throw new Error(`health ${res.status}`);
  return res.json();
}

export async function fetchReady(): Promise<ReadyResponse> {
  const res = await fetch('/api/v1/ready', { cache: 'no-store' });
  const data = (await res.json()) as ReadyResponse;
  if (!data?.status || !data?.checks?.database) {
    throw new Error(`ready ${res.status}`);
  }
  return data;
}
