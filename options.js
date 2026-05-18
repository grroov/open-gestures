const DEFAULTS = {
  showTrail: true,
  showOverlay: true,
  escCancel: true,
  trailColor: '#cf699b',
  threshold: 10,
  mouseButton: 0
};

// Saves options to chrome.storage
const saveOptions = () => {
  const settings = {
    showTrail: document.getElementById('showTrail').checked,
    showOverlay: document.getElementById('showOverlay').checked,
    escCancel: document.getElementById('escCancel').checked,
    trailColor: document.getElementById('trailColor').value,
    threshold: parseInt(document.getElementById('threshold').value, 10),
    mouseButton: parseInt(document.querySelector('input[name="mouseButton"]:checked').value, 10)
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
    document.getElementById('showOverlay').checked = items.showOverlay;
    document.getElementById('escCancel').checked = items.escCancel;
    document.getElementById('trailColor').value = items.trailColor;
    document.getElementById('trailColorHex').value = items.trailColor;
    document.getElementById('threshold').value = items.threshold;
    document.getElementById('thresholdValue').innerText = `${items.threshold}px`;
    document.querySelector(`input[name="mouseButton"][value="${items.mouseButton}"]`).checked = true;
  });
};

document.addEventListener('DOMContentLoaded', restoreOptions);
document.querySelectorAll('input[name="mouseButton"]').forEach(radio => {
  radio.addEventListener('change', saveOptions);
});
document.getElementById('showTrail').addEventListener('change', saveOptions);
document.getElementById('showOverlay').addEventListener('change', saveOptions);
document.getElementById('escCancel').addEventListener('change', saveOptions);
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
document.getElementById('threshold').addEventListener('input', (e) => {
  document.getElementById('thresholdValue').innerText = `${e.target.value}px`;
});
document.getElementById('threshold').addEventListener('change', saveOptions);

document.getElementById('titleLink').addEventListener('click', () => {
  chrome.tabs.create({ url: 'https://github.com/grroov/open-gestures' });
});
