// All of the Node.js APIs are available in the preload process.
// It has the same sandbox as a Chrome extension.
/* eslint-env browser */
window.addEventListener('DOMContentLoaded', () => {
  const replaceText = (selector: string, text?: string) => {
    const element = document.getElementById(selector);
    if (element && text) element.innerText = text;
  };

  ['chrome', 'node', 'electron'].forEach((type) => {
    replaceText(`${type}-version`, process.versions[type]);
  });
});
