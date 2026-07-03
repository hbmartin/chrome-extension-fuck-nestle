"use strict";

(function () {
  let scanning = false;

  function detectAndWarn() {
    if (scanning || document.getElementById("fuck-nestle-warning")) {
      return;
    }
    const itemDetails = document.getElementById("item_details");
    const container = itemDetails?.children[1];
    if (!container) {
      return;
    }
    scanning = true;
    scanAndWarn(
      container,
      [getHeadingText(container, "h2")],
      itemDetails,
    ).finally(() => {
      scanning = false;
    });
  }

  detectAndWarn();
  new MutationObserver(detectAndWarn).observe(document.body, {
    childList: true,
    subtree: true,
  });
})();
