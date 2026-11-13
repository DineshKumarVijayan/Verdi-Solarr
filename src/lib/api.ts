export class ApiError extends Error {
  constructor(
    public status: number,
    public code: string,
    message: string,
    public details?: unknown,
  ) {
    super(message);
  }
}

export async function api<T>(path: string, init: RequestInit = {}): Promise<T> {
  let res: Response;
  try {
    res = await fetch(path, {
      ...init,
      credentials: "same-origin",
      headers: { Accept: "application/json", ...(init.body ? { "Content-Type": "application/json" } : {}), ...init.headers },
    });
  } catch {
    throw new ApiError(0, "network", "Network error — please check your connection.");
  }
  // Cloudflare Access may redirect an expired admin session to its login page.
  if (res.type === "opaqueredirect" || (res.redirected && !res.url.includes("/api/"))) {
    throw new ApiError(401, "unauthenticated", "Your session has expired. Please sign in again.");
  }
  const text = await res.text();
  let data: unknown = null;
  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    if (!res.ok) throw new ApiError(res.status, "http", `Request failed (${res.status}).`);
    throw new ApiError(res.status, "bad_response", "Unexpected response from server.");
  }
  if (!res.ok) {
    const e = (data as { error?: { code: string; message: string; details?: unknown } })?.error;
    throw new ApiError(res.status, e?.code ?? "http", e?.message ?? `Request failed (${res.status}).`, e?.details);
  }
  return data as T;
}
