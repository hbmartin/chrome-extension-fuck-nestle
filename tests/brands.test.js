import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const brandData = JSON.parse(
  readFileSync(new URL("../src/content/brands.json", import.meta.url), "utf8"),
);

function duplicatesOf(list) {
  const seen = new Set();
  const duplicates = [];
  for (const entry of list) {
    const key = entry.toLowerCase().normalize("NFC");
    if (seen.has(key)) {
      duplicates.push(entry);
    }
    seen.add(key);
  }
  return duplicates;
}

describe("brands.json", () => {
  it("has both brand lists", () => {
    expect(brandData.brands.length).toBeGreaterThan(0);
    expect(brandData.brands_strict.length).toBeGreaterThan(0);
  });

  it("has no duplicate entries in brands", () => {
    expect(duplicatesOf(brandData.brands)).toEqual([]);
  });

  it("has no duplicate entries in brands_strict", () => {
    expect(duplicatesOf(brandData.brands_strict)).toEqual([]);
  });

  it("has no brands_strict entries that are redundant with brands", () => {
    // A brand in "brands" is matched against the full container text, which
    // includes the title — a strict (title-only) copy would be dead weight.
    const brandKeys = new Set(
      brandData.brands.map((entry) => entry.toLowerCase().normalize("NFC")),
    );
    const redundant = brandData.brands_strict.filter((entry) =>
      brandKeys.has(entry.toLowerCase().normalize("NFC")),
    );
    expect(redundant).toEqual([]);
  });

  it("has no blank or non-string entries", () => {
    for (const list of [brandData.brands, brandData.brands_strict]) {
      for (const entry of list) {
        expect(typeof entry).toBe("string");
        expect(entry.trim()).not.toBe("");
      }
    }
  });
});
