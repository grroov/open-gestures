const DEFAULTS = {
  showTrail: true,
  trailColor: '#cf699b',
  threshold: 1,
  mouseButton: 2,
  keyPressDisable: true,
  excludedDomains: 'remotedesktop.google.com, docs.google.com'
};

// Saves options to chrome.storage
const saveOptions = () => {
  const settings = {
    showTrail: document.getElementById('showTrail').checked,
    trailColor: document.getElementById('trailColor').value,
    threshold: 1,
    mouseButton: parseInt(document.querySelector('input[name="mouseButton"]:checked').value, 10),
    keyPressDisable: document.getElementById('keyPressDisable').checked,
    excludedDomains: document.getElementById('excludedDomains').value
  };

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
    document.getElementById('trailColor').value = items.trailColor;
    document.getElementById('trailColorHex').value = items.trailColor;
    document.querySelector(`input[name="mouseButton"][value="${items.mouseButton}"]`).checked = true;
    document.getElementById('keyPressDisable').checked = items.keyPressDisable;
    document.getElementById('excludedDomains').value = items.excludedDomains;
  });
};

document.addEventListener('DOMContentLoaded', restoreOptions);
document.querySelectorAll('input[name="mouseButton"]').forEach(radio => {
  radio.addEventListener('change', (e) => {
    saveOptions();
  });
});
document.getElementById('showTrail').addEventListener('change', saveOptions);
document.getElementById('keyPressDisable').addEventListener('change', saveOptions);
document.getElementById('trailColor').addEventListener('input', (e) => {
  document.getElementById('trailColorHex').value = e.target.value;
  saveOptions();
});

document.getElementById('trailColorHex').addEventListener('input', (e) => {
  let hex = e.target.value;
  if (/^#[0-9A-Fa-f]{6}$/.test(hex)) {
    document.getElementById('trailColor').value = hex;
    saveOptions();
  }
});

document.getElementById('trailColorHex').addEventListener('change', (e) => {
  let hex = e.target.value;
  if (!hex.startsWith('#')) {
    hex = '#' + hex;
    e.target.value = hex;
  }
  if (/^#[0-9A-Fa-f]{6}$/.test(hex)) {
    document.getElementById('trailColor').value = hex;
    saveOptions();
  } else {
    e.target.value = document.getElementById('trailColor').value;
  }
});

document.getElementById('excludedDomains').addEventListener('input', saveOptions);

document.getElementById('titleLink').addEventListener('click', () => {
  chrome.tabs.create({ url: 'https://github.com/grroov/open-gestures' });
});
