import { organizeTabs } from "src/categories";

export default async function groupDomains({
  minTabs = 10,
}: {
  minTabs?: number
} = {}) {
  // Get all tabs we care about
  const ungroupedTabs = await chrome.tabs.query({
    pinned: false,
    groupId: chrome.tabGroups.TAB_GROUP_ID_NONE,
  });

  console.log(`Found ${ungroupedTabs.length} tabs`);

  // Build a map of domains to tabs, group them by TLD (e.g. example.com)
  const domainMap = new Map<string, chrome.tabs.Tab[]>();

  for (const tab of ungroupedTabs) {
    const url = new URL(tab.url!);
    const domain = url.hostname
      .replace(/^www\./, ''); // Remove common prefixes

    if (!domain) {
      // Might be a local file
      continue;
    }

    if (!domainMap.has(domain)) {
      domainMap.set(domain, []);
    }

    domainMap.get(domain)!.push(tab);
  }

  console.log(`Found ${domainMap.size} domains`);

  const domains = Array.from(domainMap.entries())
    // Filter out domains that don't have enough tabs
    .filter(([_, tabs]) => tabs.length >= minTabs)
    // Map to domain name and tab IDs
    .map(([domain, tabs]) => [domain, tabs.map((tab) => tab.id)] as [string, number[]])
    // Sort by domain name
    .sort((a, b) => a[0].localeCompare(b[0]));

  console.log(`Found ${domains.length} domains with at least ${minTabs} tabs`);

  // Create a group for each domain, but in the current window
  await organizeTabs(
    Object.fromEntries(domains),
    await chrome.windows.getCurrent(),
  );
};
