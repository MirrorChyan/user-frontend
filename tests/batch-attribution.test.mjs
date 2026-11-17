import test from "node:test";
import assert from "node:assert/strict";
import { requestAttributionCheck, submitAttributionChecks } from "../src/lib/batch-attribution.ts";

const target = { rid: "project", os: "windows", arch: "amd64", channel: "stable" };
const signal = () => new AbortController().signal;

test("project preflight never sends a CDK or follows a returned download URL", async () => {
  let calls = 0;
  const result = await requestAttributionCheck(
    "https://example.test",
    target,
    signal(),
    undefined,
    async url => {
      calls += 1;
      const request = new URL(url);
      assert.equal(request.pathname, "/api/resources/project/latest");
      assert.equal(request.searchParams.has("cdk"), false);
      assert.equal(request.searchParams.has("user_agent"), false);
      assert.equal(request.searchParams.get("os"), "windows");
      assert.equal(request.searchParams.get("arch"), "amd64");
      assert.equal(request.searchParams.get("channel"), "stable");
      return Response.json({
        code: 0,
        data: { version_name: "v1", url: "https://example.test/never-open" },
      });
    }
  );
  assert.deepEqual(result, { ok: true, version: "v1" });
  assert.equal(calls, 1);
});

test("check-in accepts success without a download URL and sends only the requested card", async () => {
  const result = await requestAttributionCheck(
    "",
    { ...target, currentVersion: "v2" },
    signal(),
    "test-card",
    async url => {
      const request = new URL(url, "https://example.test");
      assert.equal(request.searchParams.get("cdk"), "test-card");
      assert.equal(request.searchParams.get("current_version"), "v2");
      assert.equal(request.searchParams.get("user_agent"), "mirrorchyan_web_batch");
      return Response.json({ code: 0, data: { version_name: "v2" } });
    }
  );
  assert.deepEqual(result, { ok: true, version: "v2" });
});

test("HTTP errors, business errors and malformed success cannot be reported as successful requests", async () => {
  for (const response of [
    () => Response.json({ code: 0, data: { version_name: "v1" } }, { status: 503 }),
    () => Response.json({ code: 7004, data: { version_name: "v1" } }, { status: 403 }),
    () => Response.json({ code: 0, data: {} }),
    () => new Response("not json"),
  ]) {
    const result = await requestAttributionCheck("", target, signal(), "test-card", async () =>
      response()
    );
    assert.equal(result.ok, false);
  }
});

test("batch limits concurrency to three and retries only the supplied failed positions", async () => {
  let active = 0;
  let peak = 0;
  const results = new Map();
  const positions = [0, 1, 2, 3, 4, 5, 6];
  await submitAttributionChecks(
    positions,
    async position => {
      active += 1;
      peak = Math.max(peak, active);
      await new Promise(resolve => setImmediate(resolve));
      active -= 1;
      return position === 2 || position === 5
        ? { ok: false, code: 7004 }
        : { ok: true, version: "v1" };
    },
    () => {},
    (position, result) => results.set(position, result),
    signal()
  );
  assert.equal(peak, 3);
  assert.equal(results.size, positions.length);
  const failed = [...results].filter(([, result]) => !result.ok).map(([position]) => position);
  const retryCalls = [];
  await submitAttributionChecks(
    failed,
    async position => {
      retryCalls.push(position);
      return { ok: true, version: "v1" };
    },
    () => {},
    () => {},
    signal()
  );
  assert.deepEqual(retryCalls.sort(), [2, 5]);
});

test("unmount cancellation prevents remaining cards and result updates", async () => {
  const controller = new AbortController();
  const attempted = [];
  const received = [];
  await submitAttributionChecks(
    [0, 1, 2, 3, 4],
    async position => {
      attempted.push(position);
      controller.abort();
      return { ok: true, version: "v1" };
    },
    () => {},
    position => received.push(position),
    controller.signal
  );
  assert.deepEqual(attempted, [0]);
  assert.deepEqual(received, []);
});
