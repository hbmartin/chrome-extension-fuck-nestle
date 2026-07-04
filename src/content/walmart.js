"use strict";

(function () {
  function findMainContent() {
    const main = document.getElementsByTagName("main")[0];
    if (!main) {
      return undefined;
    }
    for (const child of main.children) {
      if (
        child.className.indexOf("flex-column") !== -1 ||
        child.className.indexOf("h-100") !== -1
      ) {
        return child.children[1];
      }
    }
    return undefined;
  }

  const container = findFirstElement([
    findMainContent,
    () => document.querySelector("main h1")?.closest("section, div"),
    () => document.getElementById("maincontent"),
    () => document.getElementsByTagName("main")[0],
  ]);
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
