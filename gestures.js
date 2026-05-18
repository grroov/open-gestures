if (window.location.hostname === "remotedesktop.google.com") {
  console.log('⛔ no Open Gestures on this site ⛔')
} else {
  let startX, startY;
  let isDown = false;
  let currentGesture = null;

  let settings = {
    showTrail: true,
    showOverlay: true,
    escCancel: true,
    trailColor: '#cf699b',
    threshold: 10,
    mouseButton: 0
  };

  function cancelGesture() {
    isDown = false;
    currentGesture = null;
    feedback.style.display = 'none';
    trailSvg.style.display = 'none';
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
    startDot.setAttribute("fill", settings.trailColor);
    trailLine.setAttribute("stroke", settings.trailColor);
  }

  function safeSendMessage(msg) {
    if (chrome && chrome.runtime && chrome.runtime.sendMessage) {
      try {
        chrome.runtime.sendMessage(msg);
      } catch (e) {
        console.warn("Open Gestures: Error sending message.", e);
      }
    } else {
      console.warn("Open Gestures: Extension context invalidated. Please refresh the page.");
    }
  }

  const GESTURE_MAP = {
    'U': { label: 'Scroll Top', action: () => window.scrollTo({ top: 0, behavior: 'smooth' }) },
    'D': { label: 'Scroll Bottom', action: () => window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' }) },
    'L': { label: 'Back', action: () => window.history.back() },
    'R': { label: 'Forward', action: () => window.history.forward() },
    'UL': { label: 'Prev Tab', action: () => safeSendMessage({ openGesture: 'tabprev' }) },
    'UR': { label: 'Next Tab', action: () => safeSendMessage({ openGesture: 'tabnext' }) },
    'DL': { label: 'New Tab', action: () => safeSendMessage({ openGesture: 'tabnew' }) },
    'DR': { label: 'Close Tab', action: () => safeSendMessage({ openGesture: 'tabclose' }) }
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
    if (distance < settings.threshold) return null;

    const angle = Math.atan2(dy, dx) * (180 / Math.PI); // -180 to 180
    // Normalize to 0 to 360, where 0 is Right
    const norm = (angle + 360 + 22.5) % 360;
    const sector = Math.floor(norm / 45);

    return ['R', 'DR', 'D', 'DL', 'L', 'UL', 'U', 'UR'][sector];
  }

  window.addEventListener('mousedown', (e) => {
    if (e.button === settings.mouseButton) {
      e.preventDefault(); // Prevent autoscroll and drag-and-drop from stealing the event
      startX = e.clientX;
      startY = e.clientY;
      isDown = true;

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
    if (e.button === settings.mouseButton && isDown) {
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

  // Block default actions (click, auxclick, contextmenu) if a gesture was performed
  window.addEventListener('click', (e) => {
    if (e.button === settings.mouseButton) {
      const dx = e.clientX - startX;
      const dy = e.clientY - startY;
      if (Math.sqrt(dx * dx + dy * dy) > settings.threshold) {
        e.preventDefault();
      }
    }
  }, true);

  window.addEventListener('auxclick', (e) => {
    if (e.button === settings.mouseButton) {
      // If we moved enough to trigger a gesture, prevent the default action (like opening a link)
      const dx = e.clientX - startX;
      const dy = e.clientY - startY;
      if (Math.sqrt(dx * dx + dy * dy) > settings.threshold) {
        e.preventDefault();
      }
    }
  }, true);

  window.addEventListener('contextmenu', (e) => {
    if (settings.mouseButton === 2) {
      const dx = e.clientX - startX;
      const dy = e.clientY - startY;
      if (Math.sqrt(dx * dx + dy * dy) > settings.threshold) {
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