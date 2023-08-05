import { mapTabIds } from "../utils/tabs";

export default async function closeBlankPages() {
  chrome.tabs.query({ currentWindow: false }, (tabs) => {
    const blankTabs = tabs.filter((tab) => tab.url === 'chrome://newtab/');

    console.log(
      `Found ${blankTabs.length} blank tabs, closing`,
      blankTabs.map((tab) => tab.url),
    );

    chrome.tabs.remove(mapTabIds(blankTabs));
  });
}
