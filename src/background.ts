
import deduplicateTabs from './actions/deduplicateTabs';
import closeBlankPages from './actions/closeBlankPages';
import organizeViaAi from './actions/organizeViaAi';

enum Actions {
  CloseBlanks = 'action-closeblanks',
  Deduplicate = 'action-deduplicate',
  Ai = 'action-ai',
}

const actionMap: Record<Actions, Function> = {
  [Actions.CloseBlanks]: closeBlankPages,
  [Actions.Deduplicate]: deduplicateTabs,
  [Actions.Ai]: organizeViaAi,
};

chrome.runtime.onMessage.addListener(async (message, sender, sendResponse) => {
  if (!message.action) {
    return;
  }

  await actionMap[message.action as Actions]?.();
});
