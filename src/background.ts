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
  const chunks = chunk(tabs, 80);

  const categories = await Promise.all(
    chunks.map((chunk) => analyzeTabs(apiKey, chunk)),
  );

  // Merge shared categories
  const merged = mergeCategories(categories);
  console.log(merged);

  // organizeTabs(categorizedTabs);
});
