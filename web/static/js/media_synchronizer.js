import React from 'react'

var MediaSynchronizer = {
  propTypes: {
    socket: React.PropTypes.object.isRequired,
    mediaId: React.PropTypes.string.isRequired
  },

  onError: function(resp) {
    console.log(resp)
  },

  onOk: function(resp) {
    console.log(resp)
  },

  componentWillMount: function() {
    let channel = this.props.socket.channel("media:" + this.props.mediaId, {});
    this.setState({channel})

    channel.join()
      .receive("ok", () => {
        this.onOk()

        channel.on('play', payload => {
          this.onChannelPlay(payload)
        })
        channel.on('pause', payload => {
          this.onChannelPause(payload)
        })

        channel.on('time_update', payload => {
          this.setState({partnerTime: payload.currentTime})
          if (this.onTimeUpdate)
            this.onTimeUpdate(payload)
        })

        let startTime = Date.now
        this.pingInterval = window.setInterval(function ping() {
          startTime = Date.now()
          channel.push('ping', {})
        }, 1000)
        channel.on('pong', () => {
          let latency = (Date.now() - startTime) / 1000 // ms to s
          this.setState({latency})
          if(this.onLatency)
            this.onLatency(latency)
        })

        channel.on('taken_control', () => {
          this.setState({controlling: false})
          if (this.onTakenControl)
            this.onTakenControl()
        })

        window.setInterval(() => {
          if(this.currentTime)
            channel.push('time_update',
                         {currentTime: this.currentTime() + this.state.latency})
        }, 500)
      })
      .receive("error", this.onError);

    this.setState({
      channel,
      partnerTime: undefined,
      controlling: undefined,
      latency: undefined
    })
  },

  takeControl: function() {
    this.state.channel.push('taken_control', {})
    this.setState({controlling: true})
  },
  giveUpControl: function() {
    this.setState({controlling: false})
  },

  channelPlay: function(currentTime) {
    if (!this.state.controlling)
      return
    if (currentTime && !isNaN(currentTime))
      this.state.channel.push('play',
                              {currentTime: currentTime + this.state.latency})
    else
      this.state.channel.push('play',
                              {currentTime: this.currentTime() + this.state.latency})
  },

  channelPause: function(currentTime) {
    if (!this.state.controlling)
      return
    if (currentTime && !isNaN(currentTime))
      this.state.channel.push('pause', {currentTime})
    else
      this.state.channel.push('pause', {currentTime: this.currentTime()})
  }
}

export default MediaSynchronizer
