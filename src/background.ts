

chrome.action.onClicked.addListener(async () => {
  const { apiKey } = await chrome.storage.sync.get({ apiKey: '' });
  console.log(apiKey);

  if (!apiKey) {
    console.error('No API key found');
    return;
  }
});
