import { describe, expect, it, vi } from "vitest";
import { isSafeProbeUrl, probeEndpoint } from "./liveness";

const publicResolver = vi.fn(async () => [{ address: "93.184.216.34", family: 4 }]);
const privateResolver = vi.fn(async () => [{ address: "127.0.0.1", family: 4 }]);

describe("liveness URL validation", () => {
  it("rejects loopback, link-local, credentials, and unsupported schemes", async () => {
    await expect(isSafeProbeUrl("http://127.0.0.1/health", privateResolver)).resolves.toBe(false);
    await expect(isSafeProbeUrl("http://169.254.169.254/latest", privateResolver)).resolves.toBe(false);
    await expect(isSafeProbeUrl("https://user:pass@example.com", publicResolver)).resolves.toBe(false);
    await expect(isSafeProbeUrl("file:///etc/passwd", publicResolver)).resolves.toBe(false);
  });

  it("validates every redirect and refuses a public-to-private redirect", async () => {
    const resolver = vi.fn(async (host: string) => [{ address: host === "safe.example" ? "93.184.216.34" : "127.0.0.1", family: 4 }]);
    const fetcher = vi.fn(async () => new Response(null, { status: 302, headers: { location: "http://internal.example/admin" } })) as unknown as typeof fetch;
    await expect(probeEndpoint("https://safe.example/health", fetcher, resolver)).resolves.toBe(false);
    expect(fetcher).toHaveBeenCalledTimes(1);
    expect(fetcher).toHaveBeenCalledWith("https://safe.example/health", expect.objectContaining({ redirect: "manual" }));
  });

  it("follows a bounded public redirect chain manually", async () => {
    const fetcher = vi.fn()
      .mockResolvedValueOnce(new Response(null, { status: 301, headers: { location: "/ready" } }))
      .mockResolvedValueOnce(new Response(null, { status: 204 })) as unknown as typeof fetch;
    await expect(probeEndpoint("https://safe.example/health", fetcher, publicResolver)).resolves.toBe(true);
    expect(fetcher).toHaveBeenCalledTimes(2);
  });
});
