"use strict";

function getElementText(fallbackIds) {
  for (let i = 0; i < fallbackIds.length; i++) {
    const element = document.getElementById(fallbackIds[i]);
    if (element) {
      return element.textContent.toLowerCase();
    }
  }
}

(function () {
  const ppd = document.getElementById("ppd");
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
          const title = getElementText([
            "title",
            "productTitle",
            "titleSection",
            "title_feature_div",
          ]);
          const byline = getElementText([
            "bylineInfo",
            "bylineInfo_feature_div",
          ]);
          const foundTitleBrand = brandsStrict.find((brand) =>
            title.includes(brand.toLowerCase()),
          );
          const foundBylineBrand = brandsStrict.find((brand) =>
            byline.includes(brand.toLowerCase()),
          );
          if (foundTitleBrand || foundBylineBrand) {
            showNestleWarning(ppd, foundTitleBrand || foundBylineBrand);
          }
        }
      });
  } else {
    console.log("Element with id 'ppd' not found.");
  }
})();
