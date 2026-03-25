chrome.runtime.onMessage.addListener(
  function(request, sender, sendResponse) {
    switch(request.openGesture) {
      case 'tabnew':
        chrome.tabs.create({});
      break;
      case 'tabclose':
        chrome.tabs.query({ active: true, lastFocusedWindow: true }, function(tabs) {
          chrome.tabs.remove(tabs[0].id);
        });
      break;
      case 'tabprev':
        chrome.tabs.query({ lastFocusedWindow: true }, function(tabs) {
          if (tabs.length === 1) return;
          let activeTabIndex = null;
          tabs.forEach((tab, index) => { if (tab.active === true) activeTabIndex = index; });
          const prevTab = tabs[(activeTabIndex - 1) % tabs.length];
          chrome.tabs.update(prevTab.id, { active: true });
        });
      break;
      case 'tabnext':
        chrome.tabs.query({ lastFocusedWindow: true }, function(tabs) {
          if (tabs.length === 1) return;
          let activeTabIndex = null;
          tabs.forEach((tab, index) => { if (tab.active === true) activeTabIndex = index; });
          const nextTab = tabs[(activeTabIndex + 1) % tabs.length];
          chrome.tabs.update(nextTab.id, { active: true });
        });
      break;
    }
  }
);