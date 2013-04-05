'use strict'

var Batch = require('batch')

var debug = require('debug')('processing')

var CONCURRENCY = 1

module.exports = function(options, data, fn) {
  var frameSources = data.frames.map(function(frame) {return frame.src})
  loadIntoImages(frameSources, function(err, images) {
    if (err) return fn(err)
    drawToCanvases(images, data.position, function(err, contextDatas) {
      if (err) return fn(err)
      splitJobs(options.concurrency || CONCURRENCY, contextDatas, function(err, jobs) {
        if (err) return fn(err)
        var batch = new Batch()
        jobs.forEach(function(job) {
          batch.push(function(next) {
            var worker = new Worker('run.js')
            worker.addEventListener('message', function(e) {
              if (e.data.msg === 'progress') return console.log('progress')
              next(null, e.data.job)
            }, false);
            worker.addEventListener('error', function() {
              console.error(arguments)
            })
            worker.postMessage({cmd: 'encode', job: job, options: options})
          })
        })

        batch.end(function(err, jobs) {
          jobs = jobs.sort(function sortByOffset(jobA, jobB) {
            return jobA.offset - jobB.offset;
          })
          var imageData = jobs.map(function(job) { return job.frameData }).join('')
          fn(null, imageData)
        })
      })
    })
  })
}

function splitJobs(concurrency, frames, fn) {
  var jobs = []
  for (var offset = 0;
       offset < frames.length;
       offset += frames.length/concurrency) {

    jobs.push({
      offset: offset,
      frames: frames.slice(offset, offset + frames.length/concurrency)
    })
  }
  jobs[jobs.length - 1].last = true
  fn(null, jobs)
}

function loadIntoImages(frames, fn) {
  var batch = new Batch()
  frames.forEach(function(frameData) {
    batch.push(function(next) {
      var image = new Image()
      image.src = frameData
      image.onload = next.bind(undefined, null, image)
    })
  })
  batch.end(fn)
}

function drawToCanvases(images, position, fn) {
  fn(null, images.map(function(image) {
    var canvas = document.createElement('canvas')
    var ctx = canvas.getContext('2d')
    ctx.fillStyle = "rgb(255,255,255)";
    canvas.height = image.height
    canvas.width = image.width
    ctx.fillRect(0,0, canvas.width, canvas.height)
    ctx.drawImage(image, 0, 0, canvas.width, canvas.height)
    return ctx.getImageData(position.left, position.top, position.width, position.height)
  }))
}

//function processFrames(frames, fn) {
  //encoder.addFrame(ctx)
  //encoder.finish()
  //var encoderData = encoder.stream().getData()
  ////var imageData = 'data:image/gif;base64,' +
  //fn(null, encoderData)
//}

//function makeGif(encoder, frames, fn) {
  //encoder.start()

  //batch.end(function(err, images) {

    //encoder.addFrame(ctx)
    //encoder.finish()
    //var encoderData = encoder.stream().getData()
    ////var imageData = 'data:image/gif;base64,' +
    //fn(null, encoderData)
  //})
//}

//function work() {

//}

//var worker = new Worker('doWork.js');
//worker.addEventListener('message', function(e) {
  //console.log('Worker said: ', e.data);
//}, false);

//worker.postMessage('Hello World'); // Send data to our worker.
//doWork.js (the worker):

//self.addEventListener('message', function(e) {
  //self.postMessage(e.data);
//}, false);
