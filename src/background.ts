
import deduplicateTabs from './actions/deduplicateTabs';
import closeBlankPages from './actions/closeBlankPages';
import organizeViaAi from './actions/organizeViaAi';
import sortTabs from './actions/sortTabs';
import groupDomains from './actions/groupDomains';

enum Actions {
  CloseBlanks = 'action-closeblanks',
  Deduplicate = 'action-deduplicate',
  Ai = 'action-ai',
  Sort = 'action-sort',
  GroupTLDs = 'action-group-tlds',
}

const actionMap: Record<Actions, Function> = {
  [Actions.CloseBlanks]: closeBlankPages,
  [Actions.Deduplicate]: deduplicateTabs,
  [Actions.Ai]: organizeViaAi,
  [Actions.Sort]: sortTabs,
  [Actions.GroupTLDs]: groupDomains,
};

chrome.runtime.onMessage.addListener(async (message, sender, sendResponse) => {
  if (!message.action) {
    return;
  }

  await actionMap[message.action as Actions]?.();
});
