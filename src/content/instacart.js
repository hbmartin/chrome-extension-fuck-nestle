"use strict";

const observer = new MutationObserver(detectAndWarn);

function showWarning(ppd, brand) {
  const warningElement = document.createElement("div");
  warningElement.id = "fuck-nestle-warning";
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

function detectAndWarn() {
  observer.disconnect();
  if (document.getElementById("fuck-nestle-warning")) {
    observer.observe(document.body, {
      childList: true,
      subtree: true,
    });
    return;
  }

  const ppd = document.getElementById("item_details");
  if (ppd) {
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
          showWarning(ppd, foundBrand);
        } else {
          const brandsStrict = content["brands_strict"];
          const h2s = ppd.getElementsByTagName("h2");
          if (h2s.length > 0) {
            const title = h2s[0].innerText.toLowerCase();
            const foundTitleBrand = brandsStrict.find((brand) =>
              title.includes(brand.toLowerCase()),
            );
            if (foundTitleBrand) {
              showWarning(ppd, foundTitleBrand);
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
