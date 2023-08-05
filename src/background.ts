import { chunk } from 'lodash-es';

import { collectTabs, mergeCategories, organizeTabs } from './categories';
import { analyzeTabs } from './openai';

chrome.action.onClicked.addListener(async () => {
  const { apiKey } = await chrome.storage.sync.get({ apiKey: '' });

  if (!apiKey) {
    console.error('No API key found');
    return;
  }

  const tabs = await collectTabs();
  const chunks = chunk(tabs, 60);

  const categories = await Promise.all(
    chunks.map((chunk) => analyzeTabs(apiKey, chunk)),
  );

  console.log("Got all results, now merging");

  const allMatchedTabIds = categories.flatMap((category) => category.tabs);
  const allTabIds = tabs.map((tab) => tab.id);

  // Make sure the returned Tab IDs are actually valid
  const invalidTabIds = allMatchedTabIds.filter((id) => !allTabIds.includes(id));

  if (invalidTabIds.length > 0) {
    console.warn(`Got invalid Tab IDs: ${invalidTabIds.join(', ')}`);
    categories.push({
      "Other": invalidTabIds,
    });
  }

  // Find out if we have any tabs that have not been categorized
  const leftovers = allTabIds.filter((id) => !allMatchedTabIds.includes(id));

  if (leftovers.length > 0) {
    console.warn(`Got leftover Tab IDs: ${leftovers.join(', ')}`);
    categories.push({
      "Other": leftovers,
    });
  }

  // Merge shared categories
  const merged = mergeCategories(categories);
  console.log(merged);

  organizeTabs(merged);
  console.log("Done");
});
