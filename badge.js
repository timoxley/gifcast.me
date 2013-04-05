function getActiveTab(fn) {
	chrome.tabs.getAllInWindow(function(tabs) {
		console.log('TABS', tabs, tabs.filter(function(tab) {return tab.active == true}))
		fn(null, tabs.filter(function(tab) {return tab.active == true})[0])
	})
}

module.exports = function(gifcast) {
	//debugger
  gifcast.on('enter Idle', function() {
		console.log('enter idle')
    if (!gifcast.tab) return getActiveTab(function(err, tab) {
			//console.log('NO TAB', tab, '|||', gifcast)
      if (!tab) return
				console.log('cock')
      chrome.browserAction.setBadgeText({
        tabId: tab.id,
        text: ""
      })
			return
    })
    var tabId = gifcast.tab.id
    chrome.browserAction.setBadgeText({
      tabId: tabId,
      text: ""
    })
  })

  gifcast.on('enter Recording', function() {
    var tabId = gifcast.tab.id
    chrome.browserAction.setBadgeBackgroundColor({
      tabId: tabId,
      color: "#FF0000"
    })
    chrome.browserAction.setBadgeText({
      tabId: tabId,
      text: "■",
    })
  })

  gifcast.on('leave Recording', function() {
    var tabId = gifcast.tab.id
    chrome.browserAction.setBadgeBackgroundColor({
      tabId: tabId,
      color: "#00FF00"
    })

    chrome.browserAction.setBadgeText({
      tabId: tabId,
      text: "",
    })
  })

  var processingInterval
  gifcast.on('enter Process', function() {
    var tabId = gifcast.tab.id
    chrome.browserAction.setBadgeBackgroundColor({
      tabId: tabId,
      color: "#00FFFF"
    })
    processingInterval = animateBadge(tabId, ['.', '..', '...'], 400)
  })

  gifcast.on('leave Process', function() {
    var tabId = gifcast.tab.id
    chrome.browserAction.setBadgeBackgroundColor({
      tabId: tabId,
      color: "#00FF00"
    })
    clearInterval(processingInterval)
    chrome.browserAction.setBadgeText({
      tabId: tabId,
      text: "",
    })
  })

  function animateBadge(tabId, texts, interval) {
    var current = 0;
    return setInterval(function() {
      //console.log('OM')
      //console.log(current)
      var index = ++current % texts.length;
      chrome.browserAction.setBadgeText({
        tabId: tabId,
        text: texts[index]
      })
    }, 300);
  }
}
