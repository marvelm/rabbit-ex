import socket from './socket'

export class Youtube {
  constructor(elementId = 'youtube',
              $controller = $('#controller'),
              channelName = 'default') {
    this.idRegex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/ ]{11})/i
    this.elementId = elementId
    this.$controller = $controller

    let channel = socket.channel(`youtube:${channelName}`, {})
    let $window = $(window)

    let ytPlayer = new YT.Player(elementId, {
      height: $window.height(),
      width: $window.width(),
      events: {
        onReady: onPlayerReady,
        onStateChange: onPlayerStateChange
      }
    })
  }
}

