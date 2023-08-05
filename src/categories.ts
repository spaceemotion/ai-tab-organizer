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
      const validIds = tabs.filter((id) => Number.isSafeInteger(id) && id >= 0);

      if (validIds.length === 0) {
        continue;
      }

      if (!merged[name]) {
        merged[name] = validIds;
      } else {
        merged[name].push(...validIds);
      }
    }
  }

  return merged;
};

export const organizeTabs = async (categorizedTabs: Record<string, number[]>): Promise<void> => {
  const newWindow = await chrome.windows.create();

  await Promise.all(Object.entries(categorizedTabs).map(async ([name, tabIds]) => {
    // Create a new tab group for each category
    const group = await chrome.tabs.group({
      tabIds,
      createProperties: {
        windowId: newWindow.id,
      },
    });

    // Set the title of the group to the category name
    await chrome.tabGroups.update(group, {
      title: name,
      collapsed: true,
    });
  }));
};
