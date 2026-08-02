import test from "node:test";
import assert from "node:assert/strict";
import { getRecentBorrowRecords } from "./libraryHelpers.jsx";

test("returns the most recently borrowed records first", () => {
  const records = [
    { id: "old", borrowed: "2026-07-01" },
    { id: "new", borrowed: "2026-07-19" },
    { id: "middle", borrowed: "2026-07-10" },
  ];

  const result = getRecentBorrowRecords(records, 2);

  assert.deepEqual(result.map((r) => r.id), ["new", "middle"]);
});
