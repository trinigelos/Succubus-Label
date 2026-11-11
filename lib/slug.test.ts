import { describe, expect, it } from "vitest";
import { slugify } from "./slug";

describe("slugify", () => {
  it("lowercases and hyphenates spaces", () => {
    expect(slugify("Set harness")).toBe("set-harness");
  });

  it("strips accents", () => {
    expect(slugify("Reggiseno in rete — città")).toBe("reggiseno-in-rete-citta");
  });

  it("collapses non-alphanumeric runs into a single hyphen", () => {
    expect(slugify("Collare & guinzaglio!!")).toBe("collare-guinzaglio");
  });

  it("trims leading and trailing hyphens", () => {
    expect(slugify("  Polsini in pelle  ")).toBe("polsini-in-pelle");
  });

  it("returns an empty string for input with no alphanumeric characters", () => {
    expect(slugify("—!!!—")).toBe("");
  });
});
