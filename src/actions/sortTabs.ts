import { mapTabIds } from "src/utils/tabs";

type Entry = {
  id: number;
  groupId: number;
  index: number;
  url: string;
}

const isGroupedTab = (id: number) => (
  id !== chrome.tabGroups.TAB_GROUP_ID_NONE
);

/**
 * Sorts tabs by their URL, using a custom strategy,
 * so we have the following order:
 *
 * 1. bar.com
 * 2. foo.com
 * 3. baz.foo.com
 * 4. example.foo.com
 * 5. a.sub.xyz.com
 * 6. b.sub.xyz.com
 *
 * Afterwards the URL gets ordered by the rest (/subdirector/file.html?query#hash)
 */
const urlTabSort = (a: Entry, b: Entry): number => {
  const aUrl = new URL(a.url);
  const bUrl = new URL(b.url);

  const aParts = aUrl.hostname.split('.').reverse();
  const bParts = bUrl.hostname.split('.').reverse();

  for (let i = 0; i < Math.max(aParts.length, bParts.length); i++) {
    if (aParts[i] !== bParts[i]) {
      // If one URL has fewer parts, it goes first
      if (!aParts[i]) return -1;
      if (!bParts[i]) return 1;

      // Otherwise, compare the parts
      return aParts[i].localeCompare(bParts[i], 'en');
    }
  }

  // If the hostnames are identical, sort by their full URL
  return aUrl.href.localeCompare(bUrl.href, 'en');
}

export default async function sortTabs() {
  const tabs = await chrome.tabs.query({
    currentWindow: true,
  });

  // 1. Group the entries by groupId
  const grouped: { [groupId: number]: Entry[] } = {};
  const groupOrder: number[] = []; // Keep track of the order of the groupIds

  for (const tab of tabs) {
    if (!grouped.hasOwnProperty(tab.groupId)) {
      grouped[tab.groupId] = [];

      // Remember the order of appearance of groupIds
      if (isGroupedTab(tab.groupId)) {
        groupOrder.push(tab.groupId);
      }
    }

    grouped[tab.groupId].push({
      id: tab.id!,
      groupId: tab.groupId,
      index: tab.index,
      url: tab.url ?? '',
    });
  }


  // 2. Sort each group individually
  for (let groupId in grouped) {
    grouped[groupId].sort(urlTabSort);
    console.log(`Sorted group ${groupId}`, grouped[groupId]);
  }

  // 3. Move ungrouped tabs to the end
  const validGroups = groupOrder.filter((groupId) => isGroupedTab(groupId));
  // validGroups.push(chrome.tabGroups.TAB_GROUP_ID_NONE);

  // 4. Re-apply the sort in the same group order as before and
  //    make sure that every entry has a continuous index
  const sortedTabIds: number[] = [];

  for (let groupId of groupOrder) {
    for (let entry of grouped[groupId]) {
      sortedTabIds.push(entry.id);
    }
  }

  // Move each tab  group individually, so they are preserved
  // https://developer.chrome.com/docs/extensions/reference/tabs/#method-move
  let offset = 0;

  for (const groupId of validGroups) {
    console.log(`Moving group ${groupId}`, grouped[groupId]);
    const [_, ...rest] = grouped[groupId];

    for (let index = 0; index < rest.length; index++) {
      const tab = grouped[groupId][index];
      await chrome.tabs.move(tab.id, { index: offset + index });
    }

    await chrome.tabs.group({
      groupId,
      tabIds: mapTabIds(grouped[groupId]),
    });

    offset += grouped[groupId].length;
  }

  // Move ungrouped tabs to the end
  const ungroupedIds = mapTabIds(grouped[chrome.tabGroups.TAB_GROUP_ID_NONE] ?? []);

  if (ungroupedIds.length > 0) {
    console.log('Moving ungrouped tabs', grouped[chrome.tabGroups.TAB_GROUP_ID_NONE]);
    await chrome.tabs.move(ungroupedIds, { index: -1 });
  }
}
