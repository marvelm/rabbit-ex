// Brunch automatically concatenates all files in your
// watched paths. Those paths can be configured at
// config.paths.watched in "brunch-config.js".
//
// However, those files will only be executed if
// explicitly imported. The only exception are files
// in vendor, which are never wrapped in imports and
// therefore are always executed.

// Import dependencies
//
// If you no longer want to use a dependency, remember
// to also remove its path from "config.paths.watched".
import "phoenix_html"

// import React from 'react'
// import ReactDOM from 'react-dom'

// class HelloWorld extends React.Component {
//   constructor(props) {
//     super(props)
//     this.state = {num: 0}
//     setInterval(() => {
//       this.state.num += 1
//       this.setState(this.state)
//     }, 1000)
//   }
//   render() {
//     return (
//         <div>{this.state.num}</div>
//     )
//   }
// }

// ReactDOM.render(<HelloWorld/>, document.getElementById('hello'))

// Import local files
//
// Local files can be imported directly using relative
// paths "./socket" or full ones "web/static/js/socket".

// import socket from "./socket"

if (/\/video\//.test(window.location.pathname)) {
  var streamId = window.location.href.split('/')[4];
  var videoEle = document.getElementById('video');
  var Video = require('web/static/js/video');

  var socket = require('web/static/js/socket').default;
  var syncVid = Video.mount(streamId, videoEle, socket);

  var video = syncVid.video;
  window.addEventListener('keydown', function(e) {
    // Key codes
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

    var seekStep = 3
    var volumeStep = 0.1

    var key = e.charCode ? e.charCode : e.keyCode ? e.keyCode : 0;
    switch (key) {
    case keys.arrow.right:
      video.currentTime += seekStep;
      e.preventDefault();
      break;
    case keys.arrow.left:
      video.currentTime -= seekStep;
      e.preventDefault();
      break;
    case keys.arrow.up:
      if (video.volume + volumeStep >= 1)
        video.volume = 1;
      else video.volume += volumeStep;
      e.preventDefault();
      break;
    case keys.arrow.down:
      if (video.volume - volumeStep <= 0)
        video.volume = 0;
      else video.volume -= volumeStep;
      e.preventDefault();
      break;
    case keys.space:
    case keys.p:
      video.togglePlaying();
      e.preventDefault();
      break;
    case keys.f:
      video.toggleFullScreen();
      e.preventDefault();
      break;
    }
  });
}
