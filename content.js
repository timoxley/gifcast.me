'use strict'

var selector = require('element-selector')({selector: "body *", useDefaultStyles: false})
chrome.extension.onMessage.addListener(function(request, sender, sendResponse) {
  if (request.save) {
    saveFile(request.save)
    sendResponse(null, true)
    return true
  }
  if (request.selectElement) {
    var onHighlight = function(el) {
      //var oldOutline = el.style.outline
      //el.style.outline = "thin dotted rgb(179, 212, 253)"
    }
    var onDehighlight = function(el) {
      //el.style.outline = oldOutline
    }
    var oldOutline = undefined

    var onSelect = function(el) {
      selector.disable()
      console.log('on select', arguments, el.getClientRects()[0])
      //el.style.outline = "rgb(179, 212, 253) solid thin"
      selector.off(onSelect)
      selector.off(onDehighlight)
      selector.off(onHighlight)

      sendResponse(el.getClientRects()[0])
    }
    var onDeselect = function(el) {
      selector.disable()
    }

    console.log('SELECT', arguments)
    selector.enable()

    selector.on('highlight', onHighlight)
    selector.on('dehighlight', onDehighlight)

    selector.on('select', onSelect)
    return true
  }

  if (request.deselectElement) {
    selector.deselect()
  }

  sendResponse(new Error('Bad request.'));
});

function saveFile(imageData) {
  var arraybuffer = new ArrayBuffer(imageData.length);
  var view = new Uint8Array(arraybuffer);
  for (var i=0; i<imageData.length; i++) {
      view[i] = imageData.charCodeAt(i) & 0xff;
  }
  // This is the recommended method:
  var blob = new Blob([arraybuffer], {type: 'image/gif'});
  var url = (window.webkitURL || window.URL).createObjectURL(blob);
  var link = document.createElement('a')
  link.href = url
  link.download = "GIFCast-" + location.href + ".gif"
  link.click()
}

