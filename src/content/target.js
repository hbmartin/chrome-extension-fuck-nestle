"use strict";

(function () {
  function isProductPage() {
    return /^\/p(?:\/|$)/.test(window.location.pathname);
  }

  function findProductTitle() {
    if (!isProductPage()) {
      return undefined;
    }
    return findFirstElement([
      () => document.querySelector("[data-test='product-title']"),
      () => document.querySelector("[data-test='product-title-wrapper'] h1"),
      () => document.querySelector("#pdp-product-title-id"),
      () => document.querySelector("main h1"),
    ]);
  }

  function findProductContainer() {
    const title = findProductTitle();
    return title?.closest(
      "[data-test='product-details'], [data-test='product-title-wrapper'], section, div",
    );
  }

  const container = findProductContainer();
  if (!container) {
    console.log("Fuck Nestle: no product container found on this page.");
    return;
  }
  scanAndWarn(container, [() => getHeadingText(container, "h1")]).catch(
    (error) => {
      console.error("Fuck Nestle: brand scan failed.", error);
    },
  );
})();
