"use strict";

const observer = new MutationObserver(detectAndWarn);

function detectAndWarn() {
  observer.disconnect();
  if (document.getElementById("fuck-nestle-warning")) {
    observer.observe(document.body, {
      childList: true,
      subtree: true,
    });
    return;
  }

  const item_details = document.getElementById("item_details");
  if (item_details) {
    const ppd = item_details.children[1];
    fetch(chrome.runtime.getURL("src/content/brands.json"))
      .then((resp) => resp.json())
      .then((content) => {
        const brands = content["brands"];
        console.log(brands);
        const ppdText = ppd.innerText.toLowerCase();
        const foundBrand = brands.find((brand) =>
          ppdText.includes(brand.toLowerCase()),
        );
        if (foundBrand) {
          console.log(`Found brand: ${foundBrand}`);
          showNestleWarning(item_details, foundBrand);
        } else {
          const brandsStrict = content["brands_strict"];
          const h2s = ppd.getElementsByTagName("h2");
          if (h2s.length > 0) {
            const title = h2s[0].innerText.toLowerCase();
            const foundTitleBrand = brandsStrict.find((brand) =>
              title.includes(brand.toLowerCase()),
            );
            if (foundTitleBrand) {
              showNestleWarning(item_details, foundTitleBrand);
            }
          }
        }
        observer.observe(document.body, {
          childList: true,
          subtree: true,
        });
      });
  } else {
    observer.observe(document.body, {
      childList: true,
      subtree: true,
    });
  }
}

(function () {
  observer.observe(document.body, {
    childList: true,
    subtree: true,
  });
})();
