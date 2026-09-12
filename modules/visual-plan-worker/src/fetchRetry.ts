// A self-hosted tunnel occasionally answers a slow-to-respond origin with a
// gateway error (502/503/504) even when the origin itself is healthy — one
// quiet retry papers over that class of transient failure instead of
// surfacing it to the user.
const RETRYABLE_STATUS = new Set([502, 503, 504]);

export async function fetchWithRetry(
  input: string,
  init: RequestInit,
  retries = 1,
  delayMs = 600,
): Promise<Response> {
  let lastRes: Response | undefined;
  for (let attempt = 0; attempt <= retries; attempt++) {
    const res = await fetch(input, init);
    if (res.ok || !RETRYABLE_STATUS.has(res.status) || attempt === retries) {
      return res;
    }
    lastRes = res;
    await new Promise((r) => setTimeout(r, delayMs));
  }
  return lastRes!;
}
