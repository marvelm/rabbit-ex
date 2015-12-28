function polyfill(video) {
  video.requestFullscreen = video.requestFullscreen || video.msRequestFullscreen || video.mozRequestFullScreen || video.webkitRequestFullscreen;
  document.exitFullscreen = document.exitFullscreen || document.webkitExitFullscreen || document.mozCancelFullScreen || document.msExitFullscreen;

  if (typeof(document.isFullscreen === undefined)) {
    document.isFullscreen = function() {
      return document.webkitIsFullscreen || //Webkit browsers
            document.mozFullScreen || // Firefox
            (function() { // IE
              if (document.msFullscreenElement !== undefined)
                return true;
              return false;
            }());
    };
  }
}

export var run = function() {
  var video = document.getElementsByTagName('video')[0];
  var $video = $(video);
  var $window = $(window);

  polyfill(video);

  video.resize = function() {
    $video.css({
      'height': $window.height() + 'px',
      'width': $window.width() + 'px'
    });
  };

  video.togglePlaying = function() {
    if (video.paused)
      video.play();
    else
      video.pause();
  };

  video.toggleFullScreen = function() {
    if (document.webkitFullscreenElement)
      document.exitFullscreen();
    else
      video.requestFullscreen();
  };

  window.onresize = video.resize;

  video.volumeStep = 0.05;
  video.skipStep = 3;

  var keys = {
    space: 32,
    arrow: {
      right: 39,
      left: 37,
      up: 38,
      down: 40
    },
    p: 80,
    f: 70
  };

  // To slow down fast forwarding with the keyboard
  var keyboardDelay = false;
  setInterval(function() {
    keyboardDelay = false;
  }, 300);

  $video.click(video.togglePlaying);
  $video.dblclick(video.toggleFullScreen);

  window.addEventListener('keydown', function(e) {
    var key = e.charCode ? e.charCode : e.keyCode ? e.keyCode : 0;
    switch (key) {
     case keys.arrow.right:
       if (!keyboardDelay) {
         keyboardDelay = true;
         video.currentTime += video.skipStep;
       }
       e.preventDefault();
       break;
     case keys.arrow.left:
       if (!keyboardDelay) {
         keyboardDelay = true;
         video.currentTime -= video.skipStep;
       }
       e.preventDefault();
       break;
     case keys.arrow.up:
       if (video.volume + 0.1 >= 1)
         video.volume = 1;
       else
         video.volume += video.volumeStep;
       e.preventDefault();
       break;
     case keys.arrow.down:
       if (video.volume - 0.1 <= 0)
         video.volume = 0;
       else
         video.volume -= video.volumeStep;
       e.preventDefault();
       break;
     case keys.space:
     case keys.p:
       video.togglePlaying();
       e.preventDefault();
       break;
     case keys.f:
       video.toggleFullScreen();
       e.stopPropagation();
       break;
    }
  });

  $(video.resize);
}
