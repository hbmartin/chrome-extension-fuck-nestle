"use strict";

function getMainContent() {
  const mains = document.getElementsByTagName("main");
  if (mains.length > 0) {
    const main = mains[0];
    for (const child of main.children) {
      if (
        child.className.indexOf("flex-column") != -1 ||
        child.className.indexOf("h-100") != -1
      ) {
        return child.children[1];
      }
    }
  }
  return undefined;
}

(function () {
  const ppd = getMainContent();
  if (ppd) {
    fetch(chrome.runtime.getURL("src/content/brands.json"))
      .then((resp) => resp.json())
      .then((content) => {
        const brands = content["brands"];
        const ppdText = ppd.innerText.toLowerCase();
        const foundBrand = brands.find((brand) =>
          ppdText.includes(brand.toLowerCase()),
        );
        if (foundBrand) {
          console.log(`Found brand: ${foundBrand}`);
          showNestleWarning(ppd, foundBrand);
        } else {
          const brandsStrict = content["brands_strict"];
          const h1s = ppd.getElementsByTagName("h1");
          if (h1s.length > 0) {
            const title = h1s[0].innerText.toLowerCase();
            const foundTitleBrand = brandsStrict.find((brand) =>
              title.includes(brand.toLowerCase()),
            );
            if (foundTitleBrand) {
              showNestleWarning(ppd, foundTitleBrand);
            }
          }
        }
      });
  } else {
    console.log("Element with id 'ppd' not found.");
  }
})();
