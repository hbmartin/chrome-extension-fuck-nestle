"use strict";

/* exported matchBrand, findNestleBrand */

const brandPatterns = new Map();

function normalizeMatchText(text) {
  return text.normalize("NFC").toLowerCase();
}

function escapeRegExp(text) {
  return text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

// Matches the brand as a whole word (not surrounded by letters or digits),
// so generic entries like "Boost" or "Nuts" don't flag "booster" or "doughnuts".
function brandPattern(brand) {
  const normalizedBrand = normalizeMatchText(brand);
  let pattern = brandPatterns.get(normalizedBrand);
  if (!pattern) {
    pattern = new RegExp(
      `(?<![\\p{L}\\p{N}])${escapeRegExp(normalizedBrand)}(?![\\p{L}\\p{N}])`,
      "u",
    );
    brandPatterns.set(normalizedBrand, pattern);
  }
  return pattern;
}

function matchBrand(text, brandList) {
  if (!text || !brandList) {
    return undefined;
  }
  const normalizedText = normalizeMatchText(text);
  return brandList.find((brand) => brandPattern(brand).test(normalizedText));
}

// Distinctive brand names ("brands") are matched against the whole product
// container text; generic ones ("brands_strict") only against title/byline
// text, where a match is much more likely to describe the product itself.
function findNestleBrand(brandData, fullText, titleTexts) {
  const fullTextBrand = matchBrand(fullText, brandData["brands"]);
  if (fullTextBrand) {
    return fullTextBrand;
  }
  for (const titleText of titleTexts || []) {
    const titleBrand = matchBrand(titleText, brandData["brands_strict"]);
    if (titleBrand) {
      return titleBrand;
    }
  }
  return undefined;
}

if (typeof module !== "undefined" && module.exports) {
  module.exports = { matchBrand, findNestleBrand };
}
