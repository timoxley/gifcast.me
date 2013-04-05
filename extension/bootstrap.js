var gifcast = require('gifcast')

chrome.browserAction.onClicked.addListener(function(tab) {
  gifcast.toggle()
});


