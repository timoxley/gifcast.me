'use strict'

var GIFEncoder = require('gif')
var Batch = require('batch')

module.exports = function(self) {
  self.addEventListener('message', function(e) {
    var data = e.data
    switch(data.cmd) {
      case 'encode':
        encode(data.options, data.job, function(err, job) {
          self.postMessage({msg: 'complete', job: job})
        })
        break
      case 'stop':
        self.close();
        break
      default:
        self.postMessage(new Error('Unknown command: ' + data))
    }
  }, false);
}

function encode(options, job, fn) {
  var encoder = new GIFEncoder()
  encoder.setQuality(options.quality || 1);
  encoder.setRepeat(0);
  encoder.setDelay(1000 / options.fps || 2);

  if (job.offset === 0) {
    encoder.start()
  } else {
    encoder.setProperties(true, false);
    encoder.cont()
  }

  job.frames.map(function(frame) {
    encoder.setSize(frame.width, frame.height)
    self.postMessage({msg: 'progress', starting: true})
    var ok = encoder.addFrame(frame.data, true)
    self.postMessage({msg: 'progress', ok: ok})
  })
  if (job.last) {
    encoder.finish()
  }
  fn(null, {
    offset: job.offset,
    frameData: encoder.stream().getData()
  })
}
