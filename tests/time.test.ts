import { test } from "node:test";
import assert from "node:assert/strict";
import { formatAge, formatDuration, formatTimer, fromTimeInput, timeAgo } from "../lib/time.ts";

const now = new Date(2026, 10, 5, 14, 0); // 5/nov/2026 14:00 local

test("formatAge", () => {
  assert.equal(formatAge("2026-11-05", now), "nasceu hoje");
  assert.equal(formatAge("2026-11-04", now), "1 dia");
  assert.equal(formatAge("2026-10-24", now), "12 dias");
  assert.equal(formatAge("2026-10-05", now), "1 mês");
  assert.equal(formatAge("2026-08-03", now), "3 meses e 2 dias");
  assert.equal(formatAge("2026-08-30", now), "2 meses e 6 dias");
  assert.equal(formatAge("2025-09-05", now), "1 ano e 2 meses");
  assert.equal(formatAge("2024-11-05", now), "2 anos");
});

test("formatDuration / formatTimer", () => {
  assert.equal(formatDuration(5 * 60_000), "5min");
  assert.equal(formatDuration((2 * 60 + 15) * 60_000), "2h 15min");
  assert.equal(formatTimer(42 * 60_000), "0h 42min");
});

test("timeAgo", () => {
  assert.equal(timeAgo(new Date(now.getTime() - 30_000), now), "agora mesmo");
  assert.equal(timeAgo(new Date(now.getTime() - 5 * 60_000), now), "há 5min");
  assert.equal(timeAgo(new Date(now.getTime() - 135 * 60_000), now), "há 2h 15min");
  assert.equal(timeAgo(new Date(now.getTime() - 3 * 86_400_000), now), "há 3 dias");
});

test("fromTimeInput assume ontem quando o horário está no futuro", () => {
  const past = fromTimeInput("13:30", now);
  assert.equal(past.getDate(), 5);
  const future = fromTimeInput("23:50", now);
  assert.equal(future.getDate(), 4);
  assert.equal(future.getHours(), 23);
});
