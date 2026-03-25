if (window.location.hostname === "remotedesktop.google.com") {
  console.log('⛔ no Open Gestures on this site ⛔')
} else {
  let startX, startY;
  let isDown = false;
  let currentGesture = null;
  const THRESHOLD = 50; // Radial distance to trigger

  let settings = {
    showTrail: true,
    showOverlay: true,
    escCancel: true,
    dynamicColor: true,
    trailColor: '#00ffff'
  };

  function cancelGesture() {
    isDown = false;
    currentGesture = null;
    feedback.style.display = 'none';
    trailSvg.style.display = 'none';
  }

  function getHighContrastColor() {
    if (!settings.dynamicColor) return settings.trailColor;

    // Get background color of the body or root
    let bg = window.getComputedStyle(document.body).backgroundColor;

    // If body is transparent, check documentElement
    if (bg === 'rgba(0, 0, 0, 0)' || bg === 'transparent') {
      bg = window.getComputedStyle(document.documentElement).backgroundColor;
    }

    const rgb = bg.match(/\d+/g);
    if (!rgb || rgb.length < 3) return settings.trailColor;

    // Calculate luminance: 0.299R + 0.587G + 0.114B
    const luminance = (0.299 * rgb[0] + 0.587 * rgb[1] + 0.114 * rgb[2]) / 255;

    // If background is dark, use cyan. If light, use a deep magenta/purple.
    return luminance > 0.5 ? '#ff00ff' : '#00ffff';
  }

  // Load settings and listen for changes
  chrome.storage.sync.get(settings, (items) => {
    settings = items;
    updateTrailStyles();
  });

  chrome.storage.onChanged.addListener((changes, area) => {
    if (area === 'sync') {
      for (let key in changes) {
        settings[key] = changes[key].newValue;
      }
      updateTrailStyles();
    }
  });

  function updateTrailStyles() {
    const color = getHighContrastColor();
    startDot.setAttribute("fill", color);
    trailLine.setAttribute("stroke", color);
  }

  const GESTURE_MAP = {
    'U': { label: 'Scroll Top', action: () => window.scrollTo({ top: 0, behavior: 'smooth' }) },
    'D': { label: 'Scroll Bottom', action: () => window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' }) },
    'L': { label: 'Back', action: () => window.history.back() },
    'R': { label: 'Forward', action: () => window.history.forward() },
    'UL': { label: 'Prev Tab', action: () => chrome.runtime.sendMessage({ openGesture: 'tabprev' }) },
    'UR': { label: 'Next Tab', action: () => chrome.runtime.sendMessage({ openGesture: 'tabnext' }) },
    'DL': { label: 'New Tab', action: () => chrome.runtime.sendMessage({ openGesture: 'tabnew' }) },
    'DR': { label: 'Close Tab', action: () => chrome.runtime.sendMessage({ openGesture: 'tabclose' }) }
  };

  const feedback = document.createElement('div');
  Object.assign(feedback.style, {
    position: 'fixed',
    zIndex: '999999',
    padding: '8px 12px',
    background: 'rgba(0,0,0,0.8)',
    color: '#fff',
    borderRadius: '4px',
    font: 'bold 14px sans-serif',
    pointerEvents: 'none',
    display: 'none',
    boxShadow: '0 2px 10px rgba(0,0,0,0.3)',
    transform: 'translate(-50%, -100%)',
    marginTop: '-20px'
  });

  const svgNS = "http://www.w3.org/2000/svg";
  const trailSvg = document.createElementNS(svgNS, "svg");
  Object.assign(trailSvg.style, {
    position: 'fixed',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    pointerEvents: 'none',
    zIndex: '999998',
    display: 'none'
  });

  const startDot = document.createElementNS(svgNS, "circle");
  startDot.setAttribute("r", "3");
  startDot.setAttribute("fill", settings.trailColor);
  startDot.setAttribute("shape-rendering", "geometricPrecision");

  const trailLine = document.createElementNS(svgNS, "path");
  trailLine.setAttribute("stroke", settings.trailColor);
  trailLine.setAttribute("stroke-width", "1");
  trailLine.setAttribute("fill", "none");
  trailLine.setAttribute("stroke-linecap", "round");
  trailLine.setAttribute("stroke-linejoin", "round");
  trailLine.setAttribute("shape-rendering", "geometricPrecision");

  trailSvg.appendChild(startDot);
  trailSvg.appendChild(trailLine);
  document.documentElement.appendChild(feedback);
  document.documentElement.appendChild(trailSvg);

  function getGesture(dx, dy) {
    const distance = Math.sqrt(dx * dx + dy * dy);
    if (distance < THRESHOLD) return null;

    const angle = Math.atan2(dy, dx) * (180 / Math.PI); // -180 to 180
    // Normalize to 0 to 360, where 0 is Right
    const norm = (angle + 360 + 22.5) % 360;
    const sector = Math.floor(norm / 45);

    return ['R', 'DR', 'D', 'DL', 'L', 'UL', 'U', 'UR'][sector];
  }

  window.addEventListener('mousedown', (e) => {
    if (e.button === 1) {
      startX = e.clientX;
      startY = e.clientY;
      isDown = true;

      updateTrailStyles(); // Recalculate color for the current page context

      if (settings.showTrail) {
        startDot.setAttribute("cx", startX);
        startDot.setAttribute("cy", startY);
        trailLine.setAttribute("d", `M ${startX} ${startY}`);
        trailSvg.style.display = 'block';
      }
    }
  }, true);

  window.addEventListener('mousemove', (e) => {
    if (!isDown) return;

    const dx = e.clientX - startX;
    const dy = e.clientY - startY;
    currentGesture = getGesture(dx, dy);

    // Update trail line
    if (settings.showTrail) {
      const d = trailLine.getAttribute("d");
      trailLine.setAttribute("d", `${d} L ${e.clientX} ${e.clientY}`);
    }

    if (currentGesture && settings.showOverlay) {
      feedback.style.left = `${e.clientX}px`;
      feedback.style.top = `${e.clientY}px`;
      feedback.innerText = GESTURE_MAP[currentGesture].label;
      feedback.style.display = 'block';
      e.preventDefault();
    } else {
      feedback.style.display = 'none';
    }
  }, { passive: false });

  window.addEventListener('mouseup', (e) => {
    if (e.button === 1 && isDown) {
      isDown = false;
      feedback.style.display = 'none';
      trailSvg.style.display = 'none';

      if (currentGesture) {
        GESTURE_MAP[currentGesture].action();
        currentGesture = null;
        e.preventDefault();
        e.stopPropagation();
      }
    }
  }, true);

  // Block the middle-click "autoscroll" and context menu if a gesture was performed
  window.addEventListener('click', (e) => {
    if (e.button === 1 && currentGesture) {
      e.preventDefault();
    }
  }, true);

  window.addEventListener('auxclick', (e) => {
    if (e.button === 1) {
      // If we moved enough to trigger a gesture, prevent the default middle-click action (like opening a link)
      const dx = e.clientX - startX;
      const dy = e.clientY - startY;
      if (Math.sqrt(dx * dx + dy * dy) > THRESHOLD) {
        e.preventDefault();
      }
    }
  }, true);

  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && isDown && settings.escCancel) {
      cancelGesture();
      e.preventDefault();
      e.stopPropagation();
    }
  }, true);
}