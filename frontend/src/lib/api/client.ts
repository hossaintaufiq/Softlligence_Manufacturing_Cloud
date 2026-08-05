/** Shared API helpers — expand in later sections */
export function apiBase(): string {
  return process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, '') || '';
}
