export const mapTabIds = (tabs: chrome.tabs.Tab[]) => (
  tabs
    .map((tab) => tab.id)
    .filter((id): id is number => !!id)
);
