import { describe, expect, it } from "vitest";
import { findNestleBrand, matchBrand } from "../src/content/matcher.js";

describe("matchBrand", () => {
  it("matches a brand regardless of case", () => {
    expect(matchBrand("NESCAFÉ Gold Instant Coffee", ["Nescafé"])).toBe(
      "Nescafé",
    );
    expect(matchBrand("kit kat 4 pack", ["Kit Kat"])).toBe("Kit Kat");
  });

  it("only matches whole words, not substrings", () => {
    expect(matchBrand("child booster seat", ["Boost"])).toBeUndefined();
    expect(matchBrand("glazed doughnuts", ["Nuts"])).toBeUndefined();
    expect(matchBrand("golf club set", ["Club"])).toBe("Club");
    expect(matchBrand("clubhouse sandwich kit", ["Club"])).toBeUndefined();
    expect(matchBrand("laptop stand", ["TOP"])).toBeUndefined();
  });

  it("treats punctuation and edges as word boundaries", () => {
    expect(matchBrand("Boost, high protein drink", ["Boost"])).toBe("Boost");
    expect(matchBrand("Boost", ["Boost"])).toBe("Boost");
    expect(matchBrand("drink (Boost)", ["Boost"])).toBe("Boost");
  });

  it("matches brands containing regex special characters", () => {
    expect(matchBrand("chips ahoy! cookies", ["Chips Ahoy!"])).toBe(
      "Chips Ahoy!",
    );
    expect(matchBrand("special.t tea machine", ["Special.T"])).toBe(
      "Special.T",
    );
    expect(matchBrand("push-up frozen treats", ["Push-Up"])).toBe("Push-Up");
    expect(matchBrand("specialty tea", ["Special.T"])).toBeUndefined();
  });

  it("matches brands with non-ASCII characters", () => {
    expect(matchBrand("leite moça original", ["Moça"])).toBe("Moça");
    expect(matchBrand("häagen-dazs vanilla", ["Häagen-Dazs"])).toBe(
      "Häagen-Dazs",
    );
  });

  it("returns undefined for missing text or brand list", () => {
    expect(matchBrand(undefined, ["Boost"])).toBeUndefined();
    expect(matchBrand("", ["Boost"])).toBeUndefined();
    expect(matchBrand("some text", undefined)).toBeUndefined();
  });
});

describe("findNestleBrand", () => {
  const brandData = {
    brands: ["Nescafé", "Kit Kat"],
    brands_strict: ["Boost", "Club"],
  };

  it("finds a distinctive brand anywhere in the full text", () => {
    const fullText = "Product details\nNescafé Gold\nCustomer reviews";
    expect(findNestleBrand(brandData, fullText, [])).toBe("Nescafé");
  });

  it("only matches strict brands in title texts, not the full text", () => {
    const fullText = "Some drink\nCustomers also bought Boost";
    expect(
      findNestleBrand(brandData, fullText, ["Some drink"]),
    ).toBeUndefined();
    expect(findNestleBrand(brandData, fullText, ["Boost drink 6 pack"])).toBe(
      "Boost",
    );
  });

  it("checks each title text and skips missing ones", () => {
    expect(
      findNestleBrand(brandData, "text", [undefined, "Club crackers"]),
    ).toBe("Club");
    expect(findNestleBrand(brandData, "text", undefined)).toBeUndefined();
  });

  it("prefers a full-text match over a title match", () => {
    expect(findNestleBrand(brandData, "Kit Kat bar", ["Boost bar"])).toBe(
      "Kit Kat",
    );
  });
});
