import assert from "node:assert/strict";
import { test } from "node:test";
import { parseBatchOrderResponse, shouldPollBatchOrder } from "../src/lib/batch-order.ts";

const first = "A".repeat(24);
const second = "B".repeat(24);
const completed = {
  ec: 200,
  code: 0,
  data: {
    buy_count: 2,
    delivered: true,
    cdk: first,
    cdks: [first, second],
    amount: 2468,
    plan: { title: "month", valid_days: 30 },
  },
};

test("completed batch returns every independent card and its actual total", () => {
  const result = parseBatchOrderResponse(completed, 200, 2);
  assert.equal(result.status, "complete");
  assert.deepEqual(result.orderInfo.cdks, [first, second]);
  assert.equal(result.orderInfo.amount, 2468);
});

test("legacy first-card field cannot satisfy a multi-card purchase", () => {
  const { cdks: _cdks, ...data } = completed.data;
  assert.equal(parseBatchOrderResponse({ ...completed, data }).status, "error");
  assert.equal(
    parseBatchOrderResponse({ ec: 200, code: 0, data: { buy_count: 1, cdk: first } }, 200, 2)
      .status,
    "error"
  );
});

test("delivery is not complete until the backend confirms it", () => {
  const data = { ...completed.data, delivered: false };
  assert.equal(parseBatchOrderResponse({ ...completed, data }).status, "issuing");
  delete data.delivered;
  assert.equal(parseBatchOrderResponse({ ...completed, data }).status, "error");
});

test("a delivered order may omit blocked cards without remaining stuck in issuance", () => {
  const result = parseBatchOrderResponse({
    ...completed,
    data: { ...completed.data, cdks: [first] },
  });
  assert.equal(result.status, "complete");
  assert.equal(result.orderInfo.buy_count, 2);
  assert.deepEqual(result.orderInfo.cdks, [first]);
});

test("card-only and single-card orders remain readable", () => {
  const result = parseBatchOrderResponse({
    ec: 200,
    code: 0,
    data: { buy_count: 1, cdk: first, cdks: [first] },
  });
  assert.equal(result.status, "complete");
  assert.deepEqual(result.orderInfo.cdks, [first]);
});

test("malformed or duplicate card lists cannot be exported as delivered orders", () => {
  for (const cdks of [
    [],
    [first, first],
    [first, null],
    [first, "invalid"],
    [first, second, first],
  ]) {
    assert.equal(
      parseBatchOrderResponse({ ...completed, data: { ...completed.data, cdks } }).status,
      "error"
    );
  }
});

test("business status governs HTTP 200 responses and reconciliation stops automatic retries", () => {
  for (const [body, expected, automatic] of [
    [{ ec: 404, code: 21002 }, "unpaid", true],
    [{ ec: 202, code: 21005 }, "issuing", true],
    [{ ec: 503, code: 21005 }, "issuing", true],
    [{ ec: 409, code: 21006 }, "review", false],
    [{ ec: 409, code: 21007 }, "ambiguous", false],
    [{ ec: 403, code: 21004 }, "blocked", false],
    [{ ec: 400, code: 21001 }, "invalid", false],
    [{ ec: 500, code: 21000 }, "error", false],
  ]) {
    const result = parseBatchOrderResponse(body, 200);
    assert.equal(result.status, expected);
    assert.equal(shouldPollBatchOrder(result.status), automatic);
  }
});

test("gateway failures never imply payment confirmation or a normal unpaid order", () => {
  for (const [body, httpStatus] of [
    [{ message: "Service unavailable" }, 503],
    [{ detail: "Not Found" }, 404],
    [{ ec: 503, message: "Service unavailable" }, 503],
    [{ ec: 404, message: "Not Found" }, 404],
    [{ ec: 202, code: 99999 }, 200],
    [completed, 503],
  ]) {
    const result = parseBatchOrderResponse(body, httpStatus);
    assert.equal(result.status, "error");
    assert.equal(shouldPollBatchOrder(result.status), false);
  }
});

test("code-zero success without ec remains compatible only over HTTP 200", () => {
  const { ec: _ec, ...body } = completed;
  assert.equal(parseBatchOrderResponse(body, 200).status, "complete");
  assert.equal(parseBatchOrderResponse(body, 503).status, "error");
});
