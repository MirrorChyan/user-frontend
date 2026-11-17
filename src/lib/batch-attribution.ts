export interface AttributionTarget {
  rid: string;
  os: string;
  arch: string;
  channel: string;
  currentVersion?: string;
}

export type AttributionRequestResult = { ok: true; version: string } | { ok: false; code?: number };

/** A version check can queue a check-in. It does not confirm billing attribution. */
export async function requestAttributionCheck(
  backend: string,
  target: AttributionTarget,
  signal: AbortSignal,
  cdk?: string,
  fetcher: typeof fetch = fetch
): Promise<AttributionRequestResult> {
  const query = new URLSearchParams({
    os: target.os,
    arch: target.arch,
    channel: target.channel,
  });
  if (cdk) {
    query.set("cdk", cdk);
    query.set("user_agent", "mirrorchyan_web_batch");
    if (target.currentVersion) query.set("current_version", target.currentVersion);
  }
  try {
    const response = await fetcher(
      `${backend}/api/resources/${encodeURIComponent(target.rid)}/latest?${query}`,
      {
        cache: "no-store",
        signal: AbortSignal.any([signal, AbortSignal.timeout(20_000)]),
      }
    );
    const payload: unknown = await response.json();
    if (!payload || typeof payload !== "object") return { ok: false };
    const { code, data } = payload as { code?: unknown; data?: unknown };
    if (code !== 0 || !response.ok) {
      return { ok: false, code: typeof code === "number" ? code : undefined };
    }
    if (!data || typeof data !== "object") return { ok: false };
    const version = (data as { version_name?: unknown }).version_name;
    if (typeof version !== "string" || !version) return { ok: false };
    // A download URL is deliberately neither required nor opened.
    return { ok: true, version };
  } catch {
    // Avoid logging fetch errors: they may include a URL containing the CDK.
    return { ok: false };
  }
}

/** Only the supplied positions are attempted; callers pass failed positions for retries. */
export async function submitAttributionChecks(
  positions: number[],
  request: (position: number) => Promise<AttributionRequestResult>,
  onStart: (position: number) => void,
  onResult: (position: number, result: AttributionRequestResult) => void,
  signal: AbortSignal
): Promise<void> {
  let next = 0;
  const worker = async () => {
    while (!signal.aborted && next < positions.length) {
      const position = positions[next++];
      onStart(position);
      let result: AttributionRequestResult;
      try {
        result = await request(position);
      } catch {
        result = { ok: false };
      }
      if (!signal.aborted) onResult(position, result);
    }
  };
  await Promise.all(Array.from({ length: Math.min(3, positions.length) }, worker));
}
