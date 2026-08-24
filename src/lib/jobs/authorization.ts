import { timingSafeEqual } from "node:crypto";

export function isJobRequestAuthorized(request: Request, env: Record<string, string | undefined> = process.env) {
  if ((env.AGENT_COMMERCE_ADAPTER ?? "mock") !== "erc8183") return true;
  const expected = env.JOB_API_KEY;
  const supplied = request.headers.get("x-job-api-key");
  if (!expected || !supplied) return false;
  const expectedBytes = Buffer.from(expected);
  const suppliedBytes = Buffer.from(supplied);
  return expectedBytes.length === suppliedBytes.length && timingSafeEqual(expectedBytes, suppliedBytes);
}
