"use strict";

(function () {
  const container = document.getElementById("ppd");
  if (!container) {
    console.log("Fuck Nestle: no product container found on this page.");
    return;
  }
  scanAndWarn(container, [
    () =>
      getTextByIds([
        "title",
        "productTitle",
        "titleSection",
        "title_feature_div",
      ]),
    () => getTextByIds(["bylineInfo", "bylineInfo_feature_div"]),
  ]).catch((error) => {
    console.error("Fuck Nestle: brand scan failed.", error);
  });
})();
