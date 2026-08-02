import test from "node:test";
import assert from "node:assert/strict";
import { getStoredValue, setStoredValue } from "./libraryStorage.js";

test("loads a stored value when present", () => {
  const store = { "shelfwise-holds": JSON.stringify([{ id: "hold-1" }]) };

  const result = getStoredValue("shelfwise-holds", [], store);

  assert.deepEqual(result, [{ id: "hold-1" }]);
});

test("falls back to the default value when storage is empty", () => {
  const result = getStoredValue("missing-key", [{ id: "default" }], {});

  assert.deepEqual(result, [{ id: "default" }]);
});

test("writes a value to storage", () => {
  const store = {};
  const payload = [{ id: "hold-2" }];

  setStoredValue("shelfwise-holds", payload, store);

  assert.equal(store["shelfwise-holds"], JSON.stringify(payload));
});
