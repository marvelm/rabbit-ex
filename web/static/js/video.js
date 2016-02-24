/* jshint esnext: true */
import socket from './socket'

// Add important functions to video element
export function polyfill(video) {
  video.requestFullscreen = video.requestFullscreen || video.msRequestFullscreen || video.mozRequestFullScreen || video.webkitRequestFullscreen
  document.exitFullscreen = document.exitFullscreen || document.webkitExitFullscreen || document.mozCancelFullScreen || document.msExitFullscreen

  video.togglePlaying = () => {
    if (video.paused)
      video.play()
    else
      video.pause()
  }

  video.toggleFullScreen = () => {
    if (document.webkitFullscreenElement)
      document.exitFullscreen()
    else
      video.requestFullscreen()
  }

  // Resets the video element
  video.destroy = () => {
    video.src = ''
    video.load()
  }
}

import React from 'react'
import ReactDOM from 'react-dom'

function humanizeSeconds(seconds) {
  var date = new Date(null)
  date.setSeconds(seconds)
  // hh:mm:ss
  return date.toISOString().substr(11, 8)
}

function debounce(fn, delay) {
  var timer = null;
  return function () {
    var context = this, args = arguments;
    clearTimeout(timer);
    timer = setTimeout(function () {
      fn.apply(context, args);
    }, delay);
  };
}

export class SynchronizedVideo extends React.Component {
  constructor(props) {
    super(props)
    this.state = {streamId: props.streamId,
                  controlling: false,
                  partnerTime: 0,
                  isDisplayingCurrentTime: false}
  }

  useChannel(channel) {
    let state = this.state
    state.channel = channel

    var startTime = Date.now()
    state.pingInterval = window.setInterval(function ping() {
      startTime = Date.now()
      channel.push('ping', {})
    }, 1000)
    channel.on('pong', () => {
      this.setState({
        latency: (Date.now() - startTime) / 1000 // ms to s
      })
    })

    let video = this.refs.videoElement
    channel.on('play', payload => {
      video.currentTime = payload.currentTime + this.state.latency
      video.play()
    })
    channel.on('pause', payload => {
      video.currentTime = payload.currentTime
      video.pause()
    })

    state.timeUpdateInterval = window.setInterval(() => {
      channel.push('time_update',
                   {currentTime: video.currentTime + this.state.latency})
    }, 500)

    channel.on('time_update', payload => {
      this.setState({
        partnerTime: payload.currentTime
      })
    })

    channel.on('redirect', payload => {
      window.location.href = `/video/${payload.location}`
    })

    channel.on('taken_control', () => {
      this.setState({
        controlling: false
      })
    })
  }

  render() {
    let video = this.refs.videoElement
    let state = this.state
    let remaining = video ?
          humanizeSeconds(video.duration - video.currentTime) :
          humanizeSeconds(0)

    let partnerTime = state.partnerTime ?
          humanizeSeconds(state.partnerTime) :
          "Partner hasn't played yet"

    let hasControl = state.controlling ? "Give up control" : "Take control"

    let captionClasses = state.isDisplayingCurrentTime ? "caption" : "hidden"

    let toggleControl = (e) => {
      let controlling = !this.state.controlling
      if (controlling && this.state.channel) {
        this.state.channel.push('taken_control', {})
      }
      this.setState({controlling})
    }

    let displayCurrentTime = (e) => {
      if (!this.state.isDisplayingCurrentTime) {
        this.setState({
          isDisplayingCurrentTime: true
        })
        window.setTimeout(() => {
          this.setState({
            isDisplayingCurrentTime: false
          })
        }, 2000)
      }
    }

    let togglePlaying = () => {
      video.togglePlaying()
    }
    let toggleFullScreen = () => {
      video.toggleFullScreen()
    }

    let onPlaying = () => {
      if (state.controlling)
        state.channel.push('play',
                           {currentTime: video.currentTime + state.latency})
    }
    let onPlay = () => {
      if (state.controlling)
        state.channel.push('play',
                           {currentTime: video.currentTime + state.latency})
    }
    let onPause = () => {
      if (state.controlling)
        state.channel.push('pause',
                           {currentTime: video.currentTime})
    }
    let onTimeUpdate = () => {
      if (state.controlling && video.paused)
        state.channel.push('pause',
                           {currentTime: video.currentTime})
    }

    return (
        <div className="synchronized-video">

        <div className="player" onMouseMove={displayCurrentTime}>
        <video ref="videoElement" src={'/stream/' + this.state.streamId}
      controls
      onClick={togglePlaying}
      onDoubleClick={toggleFullScreen}
      onPlaying={onPlaying}
      onPause={onPause}
      onTimeUpdate={onTimeUpdate}
        ></video>
        <h1 className={captionClasses}>{remaining} remaining</h1>
        </div>

        <a href="javascript:;" className="controller"
      onClick={toggleControl}>{hasControl}</a>

        <div className="partnerTime">{partnerTime}</div>

        </div>
    )
  }

  componentDidMount() {
    let video = this.refs.videoElement
    polyfill(video)
    this.video = video
  }

  componentWillUnmount() {
  }
}

SynchronizedVideo.propTypes = {
  streamId: React.PropTypes.string
}

export function mount(streamId, ele) {
  return ReactDOM.render(<SynchronizedVideo streamId={streamId}/>, ele)
}

// export var run = function(video = document.getElementById('main-video'),
//                           $controller = $('#controller'),
//                           channelName = undefined) {
//   $('video').each((i, v) => {
//     polyfill(v)
//   })

//   let $video = $(video)
//   let $window = $(window)

//   video.resize = () => {
//     $video.css({
//       'height': $window.height() + 'px',
//       'width': $window.width() + 'px'
//     })
//   }

//   window.onresize = video.resize

//   video.volumeStep = 0.05
//   video.skipStep = 3

//   window.controlling = false

//   // Key codes
//   let keys = {
//     space: 32,
//     arrow: {
//       right: 39,
//       left: 37,
//       up: 38,
//       down: 40
//     },
//     p: 80,
//     f: 70
//   }

//   // To slow down fast forwarding with the keyboard
//   // Debouncing
//   let keyboardDelay = false
//   setInterval(() => {
//     keyboardDelay = false
//   }, 300)

//   $video.on('click', video.togglePlaying)
//   $video.on('dblclick', video.toggleFullScreen)

//   window.addEventListener('keydown', (e) => {
//     if (!$video.is(':hover')) {
//       return;
//     }
//     let key = e.charCode ? e.charCode : e.keyCode ? e.keyCode : 0
//     switch (key) {
//     case keys.arrow.right:
//       if (!keyboardDelay) {
//         keyboardDelay = true
//         video.currentTime += video.skipStep
//       }
//       e.preventDefault()
//       break
//     case keys.arrow.left:
//       if (!keyboardDelay) {
//         keyboardDelay = true
//         video.currentTime -= video.skipStep
//       }
//       e.preventDefault()
//       break
//     case keys.arrow.up:
//       if (video.volume + video.volumeStep >= 1)
//         video.volume = 1
//       else
//         video.volume += video.volumeStep
//       e.preventDefault()
//       break
//     case keys.arrow.down:
//       if (video.volume - video.volumeStep <= 0)
//         video.volume = 0
//       else
//         video.volume -= video.volumeStep
//       e.preventDefault()
//       break
//     case keys.space:
//     case keys.p:
//       video.togglePlaying()
//       e.preventDefault()
//       break
//     case keys.f:
//       video.toggleFullScreen()
//       e.preventDefault()
//       break
//     }
//   })

//   video.resize()

//   // Channel stuff
//   video.streamId = video.src.split('/').pop()
//   let channel = channelName ? socket.channel(`video:${channelName}`) :
//         socket.channel(`video:${video.streamId}`, {})
//   video.channel = channel

//   channel.on('play', payload => {
//     video.currentTime = payload.currentTime + video.latency
//     video.play()
//   })
//   video.onplay = () => {
//     if (window.controlling)
//       channel.push('play', {currentTime: video.currentTime + video.latency})
//   }

//   channel.on('pause', payload => {
//     video.currentTime = payload.currentTime
//     video.pause()
//   })
//   video.onpause = () => {
//     if (window.controlling)
//       channel.push('pause', {currentTime: video.currentTime})
//   }

//   channel.join()
//     .receive('ok', resp => { console.log('Joined successfully', resp) })
//     .receive('error', resp => { console.log('Unable to join', resp) })

//   var startTime
//   function ping() {
//     startTime = Date.now()
//     channel.push('ping', {})
//   }
//   setInterval(ping, 1000)
//   channel.on('pong', () => {
//     video.latency = (Date.now() - startTime) / 1000 // ms to s
//   })

//   let $caption = $('#caption')
//   video.displayingCaption = false

//   video.captionTimeout = 3000
//   video.displayCaption = (caption, time, important) => {
//     function resetCaption () {
//       $caption.text('')
//       video.displayingCaption = false
//     }

//     if (!video.displayingCaption) {
//       if (important)
//         video.displayingCaption = true
//       $caption.text(caption)
//       if (time)
//         setTimeout(resetCaption, time)
//       else
//         setTimeout(resetCaption, video.captionTimeout)
//     }
//   }

//   function humanizeSeconds(seconds) {
//     var date = new Date(null)
//     date.setSeconds(seconds)
//     // hh:mm:ss
//     return date.toISOString().substr(11, 8)
//   }

//   video.addEventListener('mousemove', () => {
//     video.displayCaption(
//       `${humanizeSeconds(video.duration - video.currentTime)} remaining`)
//   })

//   function setController(bool) {
//     window.controlling = bool
//     if (window.controlling) {
//       channel.push('taken_control', {})
//       $controller.text('You are controlling the video')
//     } else {
//       $controller.text('Take control')
//     }
//   }

//   setController(false)

//   var toggleController = () => {
//     setController(!window.controlling)
//   }
//   $controller.on('click', toggleController)

//   channel.on('taken_control', () => {
//     setController(false)
//   })

//   video.partnerTime = 0
//   setInterval(() => {
//     channel.push('time_update', {currentTime: video.currentTime + video.latency})
//   }, 500)
//   channel.on('time_update', payload => {
//     video.partnerTime = payload.currentTime + video.latency
//   })

//   channel.on('redirect', payload => {
//     window.location.href = `/video/${payload.location}`
//   })

//   video.redirect = (loc) => {
//     channel.push('redirect', {location: loc})
//   }

//   return {
//     teardown: () => {
//       $controller.off('click', toggleController)
//       $video.off('click', video.togglePlaying)
//       $video.off('dblclick', video.toggleFullScreen)
//       video.destroy()
//       channel.leave()
//     },
//     video: video
//   }
// }
