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

function humanizeSeconds(seconds) {
  var date = new Date(null)
    date.setSeconds(seconds)
  // hh:mm:ss
  try {
    return date.toISOString().substr(11, 8)
  } catch(e) {
    return '';
  }
}

import MediaSynchronizer from "web/static/js/media_synchronizer"

var SynchronizedVideo = React.createClass({
  mixins: [MediaSynchronizer],

  componentDidMount() {
    let video = this.refs.videoElement
    polyfill(video)
    this.video = video

    if (this.state.firstTime) {
      if (this.state.streamPrefs)
        video.currentTime = this.state.streamPrefs.lastPosition
      this.setState({firstTime: false})
    }
  },

  getInitialState: function() {
    let streamPrefs = window.localStorage.getItem(this.props.mediaId)
    let state = {
      socket: this.props.socket,
      mediaId: this.props.mediaId
    }
    if (streamPrefs)
      state.streamPrefs = JSON.parse(streamPrefs)
    return state
  },

  currentTime: function() {
    return this.refs.videoElement.currentTime
  },

  onChannelPlay: function(payload) {
    this.refs.videoElement.currentTime = payload.currentTime + this.state.latency
    this.refs.videoElement.play()
  },

  onChannelPause: function(payload) {
    this.refs.videoElement.pause()
    this.refs.videoElement.currentTime = payload.currentTime
  },

  render: function() {
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
      if (controlling)
        this.takeControl()
      else
        this.giveUpControl()
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

    let onPause = () => {
      window.localStorage.setItem(this.props.mediaId,
                                  JSON.stringify({lastPosition: video.currentTime}))
      this.channelPause()
    }
    let onTimeUpdate = () => {
      if (state.controlling && video.paused)
        this.channelPause()
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
            style={videoStyle}
            controls
            onClick={togglePlaying}
            onDoubleClick={this.toggleFullScreen}
            onPlaying={this.channelPlay}
            onPlay={this.channelPlay}
            onPause={onPause}
            onTimeUpdate={onTimeUpdate}>
            <source src={"/stream/" + this.props.mediaId}/>
            <track label="English" kind="subtitles" srcLang="en"
              src={"/subtitle/" + this.props.mediaId} default/>
          </video>
          <h1 className={captionClasses}>{remaining} remaining</h1>
        </div>

        <a
          href="javascript:;"
          className="controller btn btn-large btn-default"
          onClick={toggleControl}>{hasControl}</a>

        <div className="partnerTime">{partnerTime}</div>

      </div>
    )
  }
})

import ReactDOM from 'react-dom'
import React from 'react'
export function mount(streamId, ele, socket) {
  return ReactDOM.render(
      <SynchronizedVideo mediaId={streamId} socket={socket} scale/>, ele)
}
