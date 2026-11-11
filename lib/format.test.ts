import { describe, expect, it } from "vitest";
import { formatCents } from "./format";

// it-IT currency formatting uses a non-breaking space (U+00A0) before "€".
const NBSP = " ";

describe("formatCents", () => {
  it("formats whole euros", () => {
    expect(formatCents(4200)).toBe(`42,00${NBSP}€`);
  });

  it("formats cents below one euro", () => {
    expect(formatCents(50)).toBe(`0,50${NBSP}€`);
  });

  it("formats zero", () => {
    expect(formatCents(0)).toBe(`0,00${NBSP}€`);
  });

  it("rounds to two decimals", () => {
    expect(formatCents(4299)).toBe(`42,99${NBSP}€`);
  });
});
