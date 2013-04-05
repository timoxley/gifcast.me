'use strict'

var debug = require('debug')
var debugState = debug('state')
var debugInfo = debug('user')
var Chef = require('YouAreDaChef')
var Emitter = require('emitter')
var process = require('./process')
var badge = require('./badge')

module.exports = function initialize() {
  module.gifcast = module.gifcast || new GifCast()
  badge(module.gifcast)
  module.gifcast.IdleState()
  return module.gifcast
}

function GifCast() {
  var self = this
  this.on('transition', function(event, state) {
    debugState(event + ' ' + state)
    self.emit(event, state)
    self.emit(event + ' ' + state)
  })
  chrome.browserAction.onClicked.addListener(function(e) {
    debugInfo('click', e)
    self.emit('click')
  })
  this.options = {
    fps: 3
  }
}

GifCast.prototype = new Emitter()

GifCast.prototype.IdleState = function disabled() {
  var self = this
  var enable = this.EnabledState.bind(this)
  this.on('click', enable)
  this.once('leave Idle', function() {
    self.off('click', enable)
  })
  return this
}

GifCast.prototype.EnabledState = function enabled() {
//chrome.extension.onRequest.addListener(
  //function(request, sender, sendResponse) {
    //sendResponse({counter: request.counter+1});
  //});

  var self = this
  //chrome.runtime.onConnect.addListener(function(port) {
    //port.onMessage.addListener(function(msg) {
      //port.postMessage({counter: msg.counter+1});
    //});


    chrome.tabs.getSelected(null, function(tab) {
      self.tab = tab
      //debugger
      chrome.tabs.sendMessage(self.tab.id, {selectElement: true}, function(position) {
        self.RecordingState(position)
      })
    });
    //selector.enable()
    //selector.on('selected', function() {
      //console.log(arguments)
    //})
  //})
  //this.once('leave Enabled', function() {
    //selector.disable()
  //})
  return this
}

GifCast.prototype.RecordingState = function recording(position) {
  console.log("position", position)
  var self = this
  var data = {
    position: position,
    frames: []
  }
  var recordingTick = setInterval(function() {
    chrome.tabs.captureVisibleTab(null, {format: 'png'}, function(imageData) {
      data.frames.push({
        //el: {
          //x: rect.offsetLeft,
          //y: el.y,
          //x: el.x,
          //x: el.x,
          //x: el.x,
        //},
        src: imageData
      })
    })
  }, 1000/this.options.fps)

  var stop = function() {
    clearInterval(recordingTick)
    self.ProcessState(data)
  }

  this.on('click', stop)
  this.once('leave Recording', function() {
    chrome.tabs.sendMessage(self.tab.id, {deselectElement: true})
    self.off('click', stop)
  })

  return this
}

GifCast.prototype.ProcessState = function processData(data) {
  var self = this
  console.log('Processing items: ', data.frames.length)
  process(this.options, data, function(err, imageData) {
    self.DownloadState(imageData)
  })
}

GifCast.prototype.DownloadState = function download(imageData) {
  var self = this
  chrome.tabs.sendMessage(this.tab.id, {save: imageData}, function(response) {
    self.IdleState()
  })
}

Chef(GifCast)
  .methods(/(.*)State$/)
  .before(function(match) {
    var newState = match.replace(/State$/, '')
    if (this.state === newState) return
    if (this.state) this.emit('transition', 'leave', this.state)
    this.state = newState
    this.emit('transition', 'enter', this.state)
  })
