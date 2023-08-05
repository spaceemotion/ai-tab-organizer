const getAPIKeyElement = () => document.getElementById('api-key') as HTMLInputElement;

// Saves options to chrome.storage
const saveOptions = async () => {
  const key = getAPIKeyElement().value;

  await chrome.storage.sync.set(
    { apiKey: key },
  );
};

// Restores select box and checkbox state using the preferences
// stored in chrome.storage.
const restoreOptions = async () => {
  const { apiKey } = await chrome.storage.sync.get({ apiKey: '' });
  getAPIKeyElement().value = apiKey;
};

document.addEventListener('DOMContentLoaded', restoreOptions);
document.getElementById('save')?.addEventListener('click', saveOptions);
