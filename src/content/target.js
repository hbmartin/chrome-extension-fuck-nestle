"use strict";

(function () {
  const container = findFirstElement([
    () => document.getElementsByTagName("main")[0]?.children[0]?.children[0],
    () => document.querySelector("main h1")?.closest("div, section"),
    () => document.getElementsByTagName("main")[0],
  ]);
  if (!container) {
    console.log("Fuck Nestle: no product container found on this page.");
    return;
  }
  scanAndWarn(container, [getHeadingText(container, "h1")]);
})();
