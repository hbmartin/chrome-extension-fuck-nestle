"use strict";

/* exported scanAndWarn, findFirstElement, getTextByIds, getHeadingText */

const BRAND_DATA_STORAGE_KEY = "brandData";

let brandDataPromise = null;

async function loadBrandData() {
  const version = chrome.runtime.getManifest().version;
  try {
    const stored = await chrome.storage.local.get(BRAND_DATA_STORAGE_KEY);
    const cached = stored[BRAND_DATA_STORAGE_KEY];
    if (cached && cached.version === version) {
      return cached.data;
    }
  } catch {
    // storage unavailable — fall through to fetching the packaged file
  }
  const response = await fetch(
    chrome.runtime.getURL("src/content/brands.json"),
  );
  const data = await response.json();
  try {
    await chrome.storage.local.set({
      [BRAND_DATA_STORAGE_KEY]: { version, data },
    });
  } catch {
    // caching is best-effort
  }
  return data;
}

function getBrandData() {
  if (!brandDataPromise) {
    brandDataPromise = loadBrandData().catch((error) => {
      brandDataPromise = null;
      throw error;
    });
  }
  return brandDataPromise;
}

// Scans the container's text (and the given title/byline texts against the
// stricter list) and shows the warning banner on a match. The banner is
// inserted into warningTarget when given, otherwise into the container.
async function scanAndWarn(container, titleTexts, warningTarget) {
  const brandData = await getBrandData();
  const foundBrand = findNestleBrand(
    brandData,
    container.innerText,
    titleTexts,
  );
  if (foundBrand) {
    console.log(`Found Nestlé brand: ${foundBrand}`);
    showNestleWarning(warningTarget || container, foundBrand);
  }
  return foundBrand;
}

function findFirstElement(finders) {
  for (const finder of finders) {
    const element = finder();
    if (element) {
      return element;
    }
  }
  return undefined;
}

function getTextByIds(elementIds) {
  for (const id of elementIds) {
    const element = document.getElementById(id);
    if (element) {
      return element.textContent;
    }
  }
  return undefined;
}

function getHeadingText(container, tagName) {
  const headings = container.getElementsByTagName(tagName);
  return headings.length > 0 ? headings[0].innerText : undefined;
}
