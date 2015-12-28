import socket from './socket'

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
            }())
    }
  }
}

export var run = function() {
  let video = document.getElementsByTagName('video')[0]
  let $video = $(video)
  let $window = $(window)

  polyfill(video);

  video.resize = () => {
    $video.css({
      'height': $window.height() + 'px',
      'width': $window.width() + 'px'
    })
  }

  video.togglePlaying = () => {
    if (video.paused)
      video.play();
    else
      video.pause();
  };

  video.toggleFullScreen = () => {
    if (document.webkitFullscreenElement)
      document.exitFullscreen();
    else
      video.requestFullscreen();
  };

  window.onresize = video.resize;

  video.volumeStep = 0.05;
  video.skipStep = 3;

  video.controlling = false;

  let keys = {
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
  // Debouncing
  let keyboardDelay = false;
  setInterval(() => {
    keyboardDelay = false;
  }, 300);

  $video.click(video.togglePlaying);
  $video.dblclick(video.toggleFullScreen);

  window.addEventListener('keydown', (e) => {
    let key = e.charCode ? e.charCode : e.keyCode ? e.keyCode : 0;
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
       if (video.volume + video.volumeStep >= 1)
         video.volume = 1;
       else
         video.volume += video.volumeStep;
       e.preventDefault();
       break;
     case keys.arrow.down:
       if (video.volume - video.volumeStep <= 0)
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

  // Channel stuff

  video.streamId = window.location.href
    .split('/').pop();
  let channel = socket.channel('video:' + video.streamId, {})
  video.channel = channel

  channel.on('play', payload => {
    video.currentTime = payload.currentTime
    video.play()
  })
  video.onplay = () => {
    if (video.controlling)
      channel.push('play', {currentTime: video.currentTime})
  }

  channel.on('pause', payload => {
    video.currentTime = payload.currentTime
    video.pause()
  })
  video.onpause = () => {
    if (video.controlling)
      channel.push('pause', {currentTime: video.currentTime})
  }

  channel.on('pong', () => {
    console.log('pong')
  })

  channel.join()
    .receive('ok', resp => { console.log('Joined successfully', resp) })
    .receive('error', resp => { console.log('Unable to join', resp) })

  // Displays
  let $controller = $('#controller')
  $controller.click(() => {
    video.controlling = !video.controlling
    if (video.controlling) {
      $controller.text('You are controlling the video')
    } else {
      $controller.text('Take control')
    }
  })
}
