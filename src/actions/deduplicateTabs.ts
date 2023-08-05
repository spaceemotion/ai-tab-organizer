import { mapTabIds } from "../utils/tabs";

// Keep these URLs open, as they don't keep their state in the URl
const keepUrlsRegex = /(chat\.openai\.com)/i;

export default async function deduplicateTabs() {
  const tabs = await chrome.tabs.query({});
  const urls = tabs.map((tab) => tab.url);

  const duplicates = urls.filter((url, index) => urls.indexOf(url) !== index);
  const duplicateTabs = tabs.filter((tab) => (
    duplicates.includes(tab.url) && !keepUrlsRegex.test(tab.url!)
  ));

  console.log(
    `Found ${duplicateTabs.length} duplicate tabs, closing`,
    duplicateTabs.map((tab) => tab.url),
  );

  chrome.tabs.remove(mapTabIds(duplicateTabs));
}
