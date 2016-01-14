import socket from './socket'
import { run as runVideo } from './video'

export var run = function() {
  let screen = document.getElementById('screen')

  let channel = socket.channel('live:default', {})
  let $window = $(window)
  let $form = $('form')
  let $input = $('input')

  let video = document.getElementById('main-video')
  let $video = $(video)
  let $controller = $('#controller')

  video.hide = () => {
    $video.addClass('hidden')
  }
  video.show = () => {
    $video.removeClass('hidden')
  }

  let ytPlayer = new YT.Player('youtube', {
    height: $window.height(),
    width: $window.width(),
    events: {
      onReady: onPlayerReady,
      onStateChange: onPlayerStateChange
    }
  })
  ytPlayer.hide = () => {
    $('#youtube').addClass('hidden')
  }
  ytPlayer.show = () => {
    $('#youtube').removeClass('hidden')
  }
  screen.ytPlayer = ytPlayer

  let youtubeRegex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/ ]{11})/i

  ytPlayer.getVideoId = () => {
    return youtubeRegex.exec(ytPlayer.getVideoUrl())[1]
  }

  $form.submit(function(event) {
    event.preventDefault()
    let input = $input.val()
    let result = youtubeRegex.exec(input)

    if (result && result.length > 0) {
      let youtubeId = result[result.length - 1]
      if (youtubeId)
        channel.push('media', {
          mediaType: 'youtube',
          youtubeId: youtubeId
        })
    }

    else {
      channel.push('media', {
        mediaType: 'video',
        path: input
      })
    }
  })
  $input.focus(() => {
    $input
      .one('mouseup', () => {
        $input.select()
        return false
      })
      .select()
  })

  let teardownVideo = undefined

  channel.on('media', function(payload) {
    screen.current = payload

    try {
      video.destroy()
      teardownVideo()
      ytPlayer.hide()
      ytPlayer.stopVideo()
    } catch (e) { console.log(e) }

    if (payload.mediaType == 'youtube') {
      video.hide()
      ytPlayer.loadVideoById({
        videoId: payload.youtubeId,
        startSeconds: 0,
        suggestedQuality: 'large'
      })
      ytPlayer.show()
    }

    else if (payload.mediaType == 'video') {
      video.show()
      video.src = `/stream/${payload.path}`
      teardownVideo = runVideo(video, $controller).teardown
      // try { ytPlayer.destroy() } catch (e) { console.log(e); }
    }
  })

  channel.on('play', function(payload) {
    ytPlayer.seekTo(payload.currentTime)
    ytPlayer.playVideo()
  })
  channel.on('pause', function(payload) {
    ytPlayer.pauseVideo()
    ytPlayer.seekTo(payload.currentTime)
  })

  function onPlayerReady(event) {
    // console.log(event)
  }

  function onPlayerStateChange(event) {
    if (window.controlling) {
      switch (event.data) {
      case YT.PlayerState.PLAYING:

        // User has selected a related video.
        let id = ytPlayer.getVideoId()
        if (screen.current.youtubeId != id) {
          screen.current = {
            youtubeId: id,
            mediaType: 'youtube'
          }
          channel.push('media', screen.current)
        }

        channel.push('play', {
          currentTime: ytPlayer.getCurrentTime()
        })
        break
      case YT.PlayerState.PAUSED:
        channel.push('pause', {
          currentTime: ytPlayer.getCurrentTime()
        })
        break
      }
    }
    // console.log(event)
  }

  channel.join()
    .receive('ok', resp => { console.log('Joined successfully', resp) })
    .receive('error', resp => { console.log('Unable to join', resp) })
}
