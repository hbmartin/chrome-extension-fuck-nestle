"use strict";

function showWarning(ppd, brand) {
  const warningElement = document.createElement("div");
  warningElement.style.cssText = `
    background-color: #ffcccc;
    border: 2px solid #ff0000;
    padding: 10px;
    margin-bottom: 15px;
    font-weight: bold;
    text-align: center;
  `;
  warningElement.innerHTML = `⛔️ This may be a Nestlé (${brand}) product. ⛔️<br /><a href="https://www.fucknestle.art/">https://www.fucknestle.art/</a>`;
  ppd.insertBefore(warningElement, ppd.firstChild);
}

(function () {
  const ppd = document.getElementsByTagName("main")[0].children[0].children[0];
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
          showWarning(ppd, foundBrand);
        } else {
          const brandsStrict = content["brands_strict"];
          const h1s = ppd.getElementsByTagName("h1");
          if (h1s.length > 0) {
            const title = h1s[0].innerText.toLowerCase()
            const foundTitleBrand = brandsStrict.find((brand) =>
              title.includes(brand.toLowerCase()),
            );
            if (foundTitleBrand) {
              showWarning(ppd, foundTitleBrand);
            }
          }
        }
      });
  } else {
    console.log("Element with id 'ppd' not found.");
  }
})();
