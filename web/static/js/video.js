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
                  isDisplayingCurrentTime: false,
                  firstTime: true}
    let streamPrefs = window.localStorage.getItem(this.state.streamId)
    if (streamPrefs) {
      this.state.streamPrefs = JSON.parse(streamPrefs)
    }
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
      window.localStorage.setItem(this.state.streamId,
                                  JSON.stringify({lastPosition: video.currentTime}))
      if (state.controlling)
        state.channel.push('pause',
                           {currentTime: video.currentTime})
    }
    let onTimeUpdate = () => {
      if (state.controlling && video.paused)
        state.channel.push('pause',
                           {currentTime: video.currentTime})
    }

    let videoStyle = {}
    if (this.props.scale)
      videoStyle = {
        width: window.innerWidth
      }

    return (
        <div className="synchronized-video">

        <div className="player" onMouseMove={displayCurrentTime}>
        <video
      ref="videoElement"
      src={'/stream/' + this.state.streamId}
      style={videoStyle}
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

    if (this.state.firstTime) {
      if (this.state.streamPrefs) {
        video.currentTime = this.state.streamPrefs.lastPosition
      }
      this.setState({firstTime: false})
    }
  }

  componentWillUnmount() {
  }
}

SynchronizedVideo.propTypes = {
  streamId: React.PropTypes.string
}

export function mount(streamId, ele) {
  return ReactDOM.render(<SynchronizedVideo streamId={streamId} scale/>, ele)
}
