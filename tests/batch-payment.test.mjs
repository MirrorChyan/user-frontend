import assert from "node:assert/strict";
import { registerHooks } from "node:module";
import { test } from "node:test";

// Resolve the app's TypeScript paths without adding a test runner dependency.
registerHooks({
  resolve(specifier, context, nextResolve) {
    if (specifier.startsWith("@/")) {
      return nextResolve(new URL(`../src/${specifier.slice(2)}.ts`, import.meta.url).href, context);
    }
    return nextResolve(specifier, context);
  },
});
const { createBatchPayment, parseBuyCount } = await import("../src/lib/batch-payment.ts");
const planInfo = { title: "month", alipay_id: "alipay-month", weixin_id: "wechat-month" };
const request = {
  planInfo,
  paymentMethod: "alipay",
  canTryH5: false,
  buyCount: 20,
  source: "gift",
};
const valid = {
  ec: 200,
  code: 0,
  data: {
    custom_order_id: "order-20",
    amount: 24680,
    buy_count: 20,
    pay_url: "https://example.test/pay",
  },
};

test("quantity rejects fractional, exponential and unsafe input", () => {
  for (const value of ["", "1", "0", "-2", "2.5", "1e3", "Infinity", "9007199254740992"]) {
    assert.equal(parseBuyCount(value), undefined);
  }
  assert.equal(parseBuyCount("20"), 20);
});

test("batch creation sends quantity, source and the selected channel, without renew", async t => {
  const calls = [];
  t.mock.method(globalThis, "fetch", async url => {
    calls.push(new URL(url, "https://example.test"));
    return Response.json(valid);
  });
  const result = await createBatchPayment(request);
  assert.equal(result.amount, 24680);
  assert.equal(result.buy_count, 20);
  assert.equal(calls[0].pathname, "/api/billing/order/alipay/create");
  assert.equal(calls[0].searchParams.get("plan_id"), "alipay-month");
  assert.equal(calls[0].searchParams.get("buy_count"), "20");
  assert.equal(calls[0].searchParams.get("source"), "gift");
  assert.equal(calls[0].searchParams.has("renew"), false);
});

test("mobile Alipay and WeChat preserve the existing payment protocols", async t => {
  const calls = [];
  t.mock.method(globalThis, "fetch", async url => {
    calls.push(new URL(url, "https://example.test"));
    return Response.json(valid);
  });
  const mobile = await createBatchPayment({ ...request, canTryH5: true });
  assert.equal(mobile.payOnNewPage, true);
  assert.equal(calls[0].searchParams.get("pay"), "H5");
  const wechat = await createBatchPayment({ ...request, paymentMethod: "wechatPay" });
  assert.equal(wechat.payOnNewPage, false);
  assert.equal(calls[1].pathname, "/api/billing/order/weixin/create");
  assert.equal(calls[1].searchParams.get("plan_id"), "wechat-month");
});

test("old backends and mismatched quantities cannot open a single-card payment", async t => {
  for (const data of [
    { ...valid.data, buy_count: undefined },
    { ...valid.data, buy_count: 1 },
    { ...valid.data, amount: 0 },
    { ...valid.data, amount: 2.5 },
    { ...valid.data, amount: 2147483648 },
    { ...valid.data, custom_order_id: "" },
    { ...valid.data, pay_url: "" },
  ]) {
    t.mock.method(globalThis, "fetch", async () => Response.json({ ...valid, data }));
    await assert.rejects(createBatchPayment(request), /batchUnavailable/);
    t.mock.restoreAll();
  }
});

test("HTTP and billing failures cannot open payment even with valid-looking data", async t => {
  for (const response of [
    () => Response.json(valid, { status: 503 }),
    () => Response.json({ ...valid, ec: 400, code: 21001 }),
    () => Response.json({ ...valid, ec: 200, code: 21001 }),
  ]) {
    t.mock.method(globalThis, "fetch", async () => response());
    await assert.rejects(createBatchPayment(request), /createFailed/);
    t.mock.restoreAll();
  }
});
