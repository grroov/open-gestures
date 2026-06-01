  let startX, startY, startTime;
  let isDown = false;
  let currentGesture = null;
  let gestureActive = false;

  let settings = {
    showTrail: true,
    trailColor: '#cf699b',
    threshold: 1,
    mouseButton: 2,
    keyPressDisable: true,
    excludedDomains: 'remotedesktop.google.com, docs.google.com'
  };

  function isCurrentDomainExcluded() {
    if (!settings.excludedDomains) return false;
    const currentHost = window.location.hostname.toLowerCase();
    return settings.excludedDomains
      .split(',')
      .map(d => d.trim().toLowerCase())
      .filter(d => d.length > 0)
      .some(d => currentHost === d || currentHost.endsWith('.' + d));
  }

  function cancelGesture() {
    isDown = false;
    gestureActive = false;
    currentGesture = null;
    trailSvg.style.display = 'none';
  }

  // Load settings and listen for changes
  chrome.storage.sync.get(settings, (items) => {
    settings = items;
    updateTrailStyles();
    if (isCurrentDomainExcluded()) {
      console.log('⛔ Open Gestures is disabled on this domain ⛔');
    }
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

  function isInteractiveElement(target, event) {
    if (!target) return false;
    const interactiveTags = ['INPUT', 'TEXTAREA', 'SELECT', 'OPTION', 'BUTTON', 'A', 'LABEL'];
    const interactiveRoles = ['button', 'link', 'checkbox', 'radio', 'textbox', 'listbox', 'combobox', 'menuitem'];

    // Use composedPath if available to traverse shadow DOM
    const path = event && typeof event.composedPath === 'function' ? event.composedPath() : [];
    if (path.length > 0) {
      for (const el of path) {
        if (el.tagName) {
          const tagName = el.tagName.toUpperCase();
          if (interactiveTags.includes(tagName)) return true;
          if (el.hasAttribute && el.hasAttribute('contenteditable')) return true;
          if (el.isContentEditable) return true;
          const role = el.getAttribute && el.getAttribute('role');
          if (role && interactiveRoles.includes(role.toLowerCase())) return true;
        }
      }
      return false;
    }

    // Fallback to manual ancestor traversal
    let current = target;
    while (current && current !== document.documentElement) {
      if (current.tagName) {
        const tagName = current.tagName.toUpperCase();
        if (interactiveTags.includes(tagName)) return true;
        if (current.hasAttribute && current.hasAttribute('contenteditable')) return true;
        if (current.isContentEditable) return true;
        const role = current.getAttribute && current.getAttribute('role');
        if (role && interactiveRoles.includes(role.toLowerCase())) return true;
      }
      current = current.parentElement;
    }
    return false;
  }

  window.addEventListener('mousedown', (e) => {
    if (isCurrentDomainExcluded()) return;
    const hasModifier = e.shiftKey || e.ctrlKey || e.altKey || e.metaKey;
    if (settings.keyPressDisable && hasModifier) return;
    if (e.button === settings.mouseButton) {
      // If left click is the trigger, don't intercept interactions with form and interactive elements
      if (settings.mouseButton === 0 && isInteractiveElement(e.target, e)) {
        gestureActive = false;
        return;
      }
      gestureActive = true;
      startX = e.clientX;
      startY = e.clientY;
      startTime = Date.now();
      isDown = true;

      // Only prevent default immediately on mousedown if mouseButton is NOT 0 (left-click)
      // For left-click, we let mousedown bubble normally so text selection can start.
      if (settings.mouseButton !== 0) {
        e.preventDefault(); // Prevent autoscroll and drag-and-drop from stealing the event
      }

      // We only show the trail immediately if we aren't using left-click.
      // For left-click, we delay showing the trail until a gesture is actually detected,
      // so the user doesn't see a dot/trail when they are just selecting text or clicking.
      if (settings.showTrail && settings.mouseButton !== 0) {
        startDot.setAttribute("cx", startX);
        startDot.setAttribute("cy", startY);
        trailLine.setAttribute("d", `M ${startX} ${startY}`);
        trailSvg.style.display = 'block';
      }
    }
  }, true);

  window.addEventListener('mousemove', (e) => {
    if (isCurrentDomainExcluded() || !isDown) return;

    if (settings.mouseButton === 0) {
      const elapsed = Date.now() - startTime;
      if (elapsed < 150) {
        return;
      }
      const selection = window.getSelection ? window.getSelection() : null;
      if (selection && selection.toString() !== "") {
        cancelGesture();
        return;
      }
    }

    const dx = e.clientX - startX;
    const dy = e.clientY - startY;
    const distance = Math.sqrt(dx * dx + dy * dy);


    currentGesture = getGesture(dx, dy);

    // If we have a gesture (meaning distance > threshold and angle is within sector)
    if (currentGesture) {
      // For Left-Click, if the gesture just became active and trail isn't showing yet:
      if (settings.mouseButton === 0 && trailSvg.style.display !== 'block') {
        // Clear any text selection that started during the initial drag
        if (window.getSelection) {
          const sel = window.getSelection();
          if (sel && sel.removeAllRanges) {
            sel.removeAllRanges();
          }
        }

        if (settings.showTrail) {
          startDot.setAttribute("cx", startX);
          startDot.setAttribute("cy", startY);
          trailLine.setAttribute("d", `M ${startX} ${startY}`);
          trailSvg.style.display = 'block';
        }
      }

      // Update trail line
      if (settings.showTrail) {
        const d = trailLine.getAttribute("d");
        trailLine.setAttribute("d", `${d} L ${e.clientX} ${e.clientY}`);
      }
      e.preventDefault();
    } else {
      // If we don't have a recognized gesture but the trail is showing (e.g. mouse moved but back to center)
      if (settings.showTrail && trailSvg.style.display === 'block') {
        const d = trailLine.getAttribute("d");
        trailLine.setAttribute("d", `${d} L ${e.clientX} ${e.clientY}`);
      }
    }
  }, { passive: false });

  window.addEventListener('mouseup', (e) => {
    if (isCurrentDomainExcluded()) return;
    if (e.button === settings.mouseButton && isDown) {
      isDown = false;
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
    if (isCurrentDomainExcluded()) return;
    const hasModifier = e.shiftKey || e.ctrlKey || e.altKey || e.metaKey;
    if (settings.keyPressDisable && hasModifier) return;
    if (e.button === settings.mouseButton && gestureActive) {
      const dx = e.clientX - startX;
      const dy = e.clientY - startY;
      if (Math.sqrt(dx * dx + dy * dy) > settings.threshold) {
        e.preventDefault();
      }
    }
  }, true);

  window.addEventListener('auxclick', (e) => {
    if (isCurrentDomainExcluded()) return;
    const hasModifier = e.shiftKey || e.ctrlKey || e.altKey || e.metaKey;
    if (settings.keyPressDisable && hasModifier) return;
    if (e.button === settings.mouseButton && gestureActive) {
      // If we moved enough to trigger a gesture, prevent the default action (like opening a link)
      const dx = e.clientX - startX;
      const dy = e.clientY - startY;
      if (Math.sqrt(dx * dx + dy * dy) > settings.threshold) {
        e.preventDefault();
      }
    }
  }, true);

  window.addEventListener('contextmenu', (e) => {
    if (isCurrentDomainExcluded()) return;
    const hasModifier = e.shiftKey || e.ctrlKey || e.altKey || e.metaKey;
    if (settings.keyPressDisable && hasModifier) return;
    if (settings.mouseButton === 2 && gestureActive) {
      e.preventDefault();
    }
  }, true);

  window.addEventListener('keydown', (e) => {
    if (isCurrentDomainExcluded()) return;
    if (settings.keyPressDisable && isDown) {
      cancelGesture();
      e.preventDefault();
      e.stopPropagation();
    }
  }, true);