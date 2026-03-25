const DEFAULTS = {
  showTrail: true,
  showOverlay: true,
  escCancel: true,
  dynamicColor: true,
  trailColor: '#00ffff'
};

// Saves options to chrome.storage
const saveOptions = () => {
  const settings = {
    showTrail: document.getElementById('showTrail').checked,
    showOverlay: document.getElementById('showOverlay').checked,
    escCancel: document.getElementById('escCancel').checked,
    dynamicColor: document.getElementById('dynamicColor').checked,
    trailColor: document.getElementById('trailColor').value
  };

  document.getElementById('colorPickerSection').classList.toggle('disabled', settings.dynamicColor);

  chrome.storage.sync.set(settings, () => {
    if (chrome.runtime.lastError) {
      console.error('Storage sync error:', chrome.runtime.lastError);
      return;
    }
    const status = document.getElementById('status');
    status.classList.add('visible');
    setTimeout(() => {
      status.classList.remove('visible');
    }, 2000);
  });
};

// Restores settings using the preferences stored in chrome.storage.
const restoreOptions = () => {
  chrome.storage.sync.get(DEFAULTS, (items) => {
    document.getElementById('showTrail').checked = items.showTrail;
    document.getElementById('showOverlay').checked = items.showOverlay;
    document.getElementById('escCancel').checked = items.escCancel;
    document.getElementById('dynamicColor').checked = items.dynamicColor;
    document.getElementById('trailColor').value = items.trailColor;
    document.getElementById('colorPickerSection').classList.toggle('disabled', items.dynamicColor);
  });
};

document.addEventListener('DOMContentLoaded', restoreOptions);
document.getElementById('showTrail').addEventListener('change', saveOptions);
document.getElementById('showOverlay').addEventListener('change', saveOptions);
document.getElementById('escCancel').addEventListener('change', saveOptions);
document.getElementById('dynamicColor').addEventListener('change', saveOptions);
document.getElementById('trailColor').addEventListener('input', saveOptions);

document.getElementById('titleLink').addEventListener('click', () => {
  chrome.tabs.create({ url: 'https://github.com/grroov/open-gestures' });
});
