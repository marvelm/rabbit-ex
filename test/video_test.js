require('mocha-generators').install();
var spawn = require('child_process').spawn;
var path = require('path')

var Nightmare = require('nightmare');
var expect = require('chai').expect; // jshint ignore:line

var videoLocation = path.resolve(__dirname, '../bbb_trailer.webm');
var fileUrl = 'test';

var nightmare1 = Nightmare({show: true});
var nightmare2 = null;

describe('rabbit', function() {
  before(function* () {
    yield nightmare1.goto('http://localhost:4000');
  })

  it('should successfully add a file', function*() {
    yield nightmare1
      .goto('http://localhost:4000/files')
      .click('a[href="/files/new"]')

      .insert('input#file_url', fileUrl)
      .insert('input#file_location', videoLocation)
      .insert('input#file_content_type', 'video/webm')
      .click('input[type=submit]')
      .wait(250);
  });

  it('should embed the added file', function*() {
    yield nightmare1.goto('http://localhost:4000/video/' + fileUrl)
    var src = yield nightmare1.evaluate(function() {
      return document.querySelector('video').src
    })
    expect(src).to.equal('http://localhost:4000/stream/'+ fileUrl)
  });

  it('should toggle the "Take control" button', function*() {
    var before = yield nightmare1
          .evaluate(function() {
            return document.querySelector('div.synchronized-video > a').text;
          })
    expect(before).to.equal('Take control')

    yield nightmare1
      .click('div.syncronized-video > a')

    var after = yield nightmare1
          .evaluate(function() {
            return document.querySelector('div.synchronized-video > a').text;
          })

    expect(after).to.equal('Give up control')
  })

  it('should synchronize the video', function*() {

    nightmare2 = Nightmare({show: true});
    yield nightmare2
      .goto('http://localhost:4000/video/' + fileUrl)
      .wait('video')

    // nightmare1 already has control
    yield nightmare1
      .evaluate(function() {
        var video = document.querySelector('video');
        video.currentTime = 5;
      })
      .wait(250)

    var partnerTime = yield nightmare2
          .evaluate(function() {
            var video = document.querySelector('video');
            return video.currentTime;
          })
          .wait(100)

    expect(partnerTime).to.equal(5);
  })

  after(function*() {
    yield nightmare1.end();
    yield nightmare2.end();
  });
});
