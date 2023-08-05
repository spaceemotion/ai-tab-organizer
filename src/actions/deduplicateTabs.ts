import { mapTabIds } from "../utils/tabs";

export default async function deduplicateTabs() {
  chrome.tabs.query({ currentWindow: false }, (tabs) => {
    const urls = tabs.map((tab) => tab.url);
    const duplicates = urls.filter((url, index) => urls.indexOf(url) !== index);
    const duplicateTabs = tabs.filter((tab) => duplicates.includes(tab.url));

    console.log(
      `Found ${duplicateTabs.length} duplicate tabs, closing`,
      duplicateTabs.map((tab) => tab.url),
    );

    chrome.tabs.remove(mapTabIds(duplicateTabs));
  });
}
