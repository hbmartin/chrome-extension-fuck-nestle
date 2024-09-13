function getResourceContent(fileName) {
  return fetch(chrome.runtime.getURL(fileName))
  .then(resp => resp.json()); // important line
}

(function() {
  console.log('Script "after.js" executed after page load.');
  getResourceContent("src/content/brands.json").then(content => {
    console.log(content);
  });
})();
