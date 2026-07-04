import { readFileSync } from "node:fs";
import vm from "node:vm";
import { describe, expect, it, vi } from "vitest";

function readContentScript(fileName) {
  return readFileSync(
    new URL(`../src/content/${fileName}`, import.meta.url),
    "utf8",
  );
}

function runScript(fileName, context) {
  vm.runInNewContext(readContentScript(fileName), context);
}

function createElement({
  tagName = "div",
  text = "",
  dataTest,
  children = [],
}) {
  const element = {
    tagName: tagName.toUpperCase(),
    textContent: text,
    innerText: text,
    dataTest,
    children,
    parentElement: undefined,
    closest(selector) {
      for (let current = this; current; current = current.parentElement) {
        if (matchesSelectorList(current, selector)) {
          return current;
        }
      }
      return undefined;
    },
  };

  for (const child of children) {
    child.parentElement = element;
  }

  return element;
}

function matchesSelectorList(element, selector) {
  return selector.split(",").some((part) => {
    const trimmed = part.trim();
    return (
      element.tagName.toLowerCase() === trimmed ||
      trimmed === `[data-test="${element.dataTest}"]` ||
      trimmed === `[data-test='${element.dataTest}']`
    );
  });
}

function createTargetContext({ pathname, selectors }) {
  return {
    window: {
      location: { pathname },
    },
    document: {
      querySelector: vi.fn((selector) => selectors[selector]),
    },
    findFirstElement(finders) {
      for (const finder of finders) {
        const element = finder();
        if (element) {
          return element;
        }
      }
      return undefined;
    },
    getHeadingText: vi.fn(() => "Kit Kat"),
    scanAndWarn: vi.fn(() => Promise.resolve()),
    console: {
      log: vi.fn(),
      error: vi.fn(),
    },
  };
}

describe("scanAndWarn", () => {
  it("resolves lazy title text after brand data loads", async () => {
    const brandData = { brands: [], brands_strict: ["Boost"] };
    const context = {
      chrome: {
        runtime: {
          getManifest: () => ({ version: "1.0.0" }),
          getURL: () => "src/content/brands.json",
        },
        storage: {
          local: {
            get: vi.fn(async () => ({
              brandData: { version: "1.0.0", data: brandData },
            })),
            set: vi.fn(),
          },
        },
      },
      fetch: vi.fn(),
      findNestleBrand: vi.fn(),
      showNestleWarning: vi.fn(),
      console,
    };
    let titleText = "loading";

    runScript("scan.js", context);
    const scan = context.scanAndWarn({ innerText: "product details" }, [
      () => titleText,
    ]);
    titleText = "Boost drink 6 pack";
    await scan;

    expect(context.findNestleBrand).toHaveBeenCalledWith(
      brandData,
      "product details",
      ["Boost drink 6 pack"],
    );
  });
});

describe("amazon content script", () => {
  function runAmazonContext(scanAndWarn) {
    const elements = {
      ppd: createElement({}),
    };
    const context = {
      document: {
        getElementById: vi.fn((id) => elements[id]),
      },
      getTextByIds(elementIds) {
        for (const id of elementIds) {
          const element = context.document.getElementById(id);
          if (element) {
            return element.textContent;
          }
        }
        return undefined;
      },
      scanAndWarn,
      console: {
        log: vi.fn(),
        error: vi.fn(),
      },
    };

    runScript("amazon.js", context);
    return { context, elements };
  }

  it("passes lazy title and byline lookups to scanAndWarn", () => {
    const scanAndWarn = vi.fn(() => Promise.resolve());
    const { elements } = runAmazonContext(scanAndWarn);
    const titleLookups = scanAndWarn.mock.calls[0][1];

    elements.productTitle = createElement({ text: "Late Nescafé title" });
    elements.bylineInfo = createElement({ text: "Late byline" });

    expect(titleLookups[0]()).toBe("Late Nescafé title");
    expect(titleLookups[1]()).toBe("Late byline");
  });

  it("handles scan failures locally", async () => {
    const error = new Error("brand data failed");
    const scanAndWarn = vi.fn(() => Promise.reject(error));
    const { context } = runAmazonContext(scanAndWarn);

    await Promise.resolve();

    expect(context.console.error).toHaveBeenCalledWith(
      "Fuck Nestle: brand scan failed.",
      error,
    );
  });
});

describe("target content script", () => {
  it("does not scan generic main headings on non-product pages", () => {
    const title = createElement({ tagName: "h1", text: "Kit Kat deals" });
    const context = createTargetContext({
      pathname: "/c/snacks/N-5xt1a",
      selectors: {
        "main h1": title,
      },
    });

    runScript("target.js", context);

    expect(context.scanAndWarn).not.toHaveBeenCalled();
    expect(context.console.log).toHaveBeenCalledWith(
      "Fuck Nestle: no product container found on this page.",
    );
  });

  it("scans from a product title container on product pages", () => {
    const title = createElement({ tagName: "h1", text: "Kit Kat" });
    const container = createElement({
      tagName: "section",
      dataTest: "product-details",
      children: [title],
    });
    const context = createTargetContext({
      pathname: "/p/kit-kat-bar/-/A-12345678",
      selectors: {
        "[data-test='product-title']": title,
      },
    });

    runScript("target.js", context);

    expect(context.scanAndWarn).toHaveBeenCalledWith(container, [
      expect.any(Function),
    ]);
    expect(context.scanAndWarn.mock.calls[0][1][0]()).toBe("Kit Kat");
  });
});
