const getAPIKeyElement = () => document.getElementById('api-key') as HTMLInputElement;
const getAIModelElement = () => document.getElementById('ai-model') as HTMLInputElement;

// Saves options to chrome.storage
const saveOptions = async () => {
  const key = getAPIKeyElement().value;
  const model = getAIModelElement().value;

  await chrome.storage.sync.set({
    apiKey: key,
    aiModel: model,
  });
};

// Restores select box and checkbox state using the preferences
// stored in chrome.storage.
const restoreOptions = async () => {
  const options = await chrome.storage.sync.get({
    apiKey: '',
    aiModel: '',
  });

  getAPIKeyElement().value = options.apiKey;
  getAIModelElement().value = options.aiModel;
};

document.addEventListener('DOMContentLoaded', restoreOptions);
document.getElementById('save')?.addEventListener('click', saveOptions);
