if (window.location.hostname === "remotedesktop.google.com") {
  console.log('⛔ no Open Gestures on this site ⛔')
} else {
  var startX, startY; // start coordinates
  var mDown = false;  // middle mouse button press status
  var moved = false;  // mouse move status
  function mouseDown(e) {
    var midclick;
    if (e.which) midclick = (e.which == 2);
    else if (e.button) midclick = (e.button == 4);
    if (midclick) {
      startX = e.pageX;
      startY = e.pageY;
      mDown = true;
    }
  }
  function mouseMove(e) {
    if (mDown) moved = true;
  }
  function mouseUp(e) {
    var midclick;
    var gesture = '';
    if (e.which) midclick = (e.which == 2);
    else if (e.button) midclick = (e.button == 4);
    if (midclick) {
      mDown = false;
      if ((e.pageY - startY) < 40 * -1) gesture += 'U';
      if ((e.pageY - startY) > 40)      gesture += 'D';
      if ((e.pageX - startX) < 40 * -1) gesture += 'L';
      if ((e.pageX - startX) > 40)      gesture += 'R';
      switch(gesture) {
        case 'U': window.scrollTo(0,0); break;
        case 'D': window.scrollTo(0,document.body.scrollHeight); break;
        case 'L': window.history.back();    break;
        case 'R': window.history.forward(); break;
        case 'UL': chrome.runtime.sendMessage({openGesture: 'tabprev'});  break;
        case 'UR': chrome.runtime.sendMessage({openGesture: 'tabnext'});  break;
        case 'DL': chrome.runtime.sendMessage({openGesture: 'tabnew'});   break;
        case 'DR': chrome.runtime.sendMessage({openGesture: 'tabclose'}); break;
      }
    }
  }
  window.addEventListener('mousedown', mouseDown, false);
  window.addEventListener('mouseup',   mouseUp,   false);
  window.addEventListener('mousemove', mouseMove, false);
  window.addEventListener("auxclick", (e) => { if (e.button === 1) e.preventDefault(); }); // prevent middle click opening links
}