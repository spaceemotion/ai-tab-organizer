const registerAction = (id: string) => {
  document.getElementById(id)?.addEventListener('click', () => {
    chrome.runtime.sendMessage({ action: id });
  });
};

registerAction('action-ai');
registerAction('action-deduplicate');
registerAction('action-closeblanks');
registerAction('action-sort');
