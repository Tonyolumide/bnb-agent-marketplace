import { describe, expect, it } from "vitest";
import { isJobRequestAuthorized } from "./authorization";

describe("job API authorization", () => {
  it("preserves unauthenticated mock behavior", () => {
    expect(isJobRequestAuthorized(new Request("http://test/jobs"), { AGENT_COMMERCE_ADAPTER: "mock" })).toBe(true);
  });

  it("fails closed in real mode and accepts only the configured key", () => {
    const env = { AGENT_COMMERCE_ADAPTER: "erc8183", JOB_API_KEY: "secret-value" };
    expect(isJobRequestAuthorized(new Request("http://test/jobs"), env)).toBe(false);
    expect(isJobRequestAuthorized(new Request("http://test/jobs", { headers: { "x-job-api-key": "wrong-value!" } }), env)).toBe(false);
    expect(isJobRequestAuthorized(new Request("http://test/jobs", { headers: { "x-job-api-key": "secret-value" } }), env)).toBe(true);
  });
});
