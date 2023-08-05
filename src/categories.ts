export interface TabItem {
  id: number;
  title: string;
  domain: string;
}

const extractTabInfo = (tab: chrome.tabs.Tab): TabItem => {
  const url = new URL(tab.url ?? '');

  return {
    id: tab.id ?? -1,
    title: tab.title ?? '',
    domain: url.hostname.replace(/^www\./, ''),
  };
};

export const collectTabs = async (): Promise<TabItem[]> => {
  return new Promise((resolve) => {
    chrome.tabs.query({}, (tabs) => {
      resolve(tabs.map(extractTabInfo));
    });
  });
};

export const mergeCategories = (categories: Record<string, number[]>[]): Record<string, number[]> => {
  const merged: Record<string, number[]> = {};

  for (const category of categories) {
    for (const [name, tabs] of Object.entries(category)) {
      if (!merged[name]) {
        merged[name] = [];
      }

      merged[name].push(...tabs);
    }
  }

  return merged;
};

export const organizeTabs = (categorizedTabs: { category: string, tabs: number[] }): void => {
  // Logic to organize tabs into groups based on categories
};
