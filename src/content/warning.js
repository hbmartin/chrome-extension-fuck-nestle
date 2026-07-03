"use strict";

/* exported showNestleWarning */

function showNestleWarning(ppd, brand) {
  if (document.getElementById("fuck-nestle-warning")) {
    return;
  }
  const warningElement = document.createElement("div");
  warningElement.id = "fuck-nestle-warning";
  warningElement.setAttribute("role", "alert");
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
