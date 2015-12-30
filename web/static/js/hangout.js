/* jshint esnext: true */
import socket from './socket'

var callButton = document.querySelector('#call')
var rtcConfig = {
  iceServers: [{
    urls: [
      "stun:stun.l.google.com:19302",
      "stun:stun1.l.google.com:19302",
      "stun:stun2.l.google.com:19302",
      "stun:stun3.l.google.com:19302",
      "stun:stun4.l.google.com:19302",
      "stun:stun.ekiga.net",
      "stun:stun.ideasip.com",
      "stun:stun.rixtelecom.se",
      "stun:stun.schlund.de",
      "stun:stun.stunprotocol.org:3478",
      "stun:stun.voiparound.com",
      "stun:stun.voipbuster.com",
      "stun:stun.voipstunt.com",
      "stun:stun.voxgratia.org"
    ]
  }]
}

export var run = () => {
  var RTCPeerConnection =     window.RTCPeerConnection || window.mozRTCPeerConnection ||
                          window.webkitRTCPeerConnection || window.msRTCPeerConnection;
  var RTCSessionDescription = window.RTCSessionDescription || window.mozRTCSessionDescription ||
                          window.webkitRTCSessionDescription || window.msRTCSessionDescription;
  var RTCIceCandidate =       window.webkitRTCIceCandidate;

  navigator.getUserMedia = navigator.getUserMedia ||
                           navigator.webkitGetUserMedia;
  var user = {
    video: document.querySelector('#user video'),
    muteButton: document.querySelector('#user .mute')
  }
  var partner = {
    video: document.querySelector('#partner video'),
    stream: undefined,
    audioTrack: undefined
  }

  $(user.video).dblclick(user.video.toggleFullScreen)
  $(partner.video).dblclick(partner.video.toggleFullScreen)

  partner.peerConn = new RTCPeerConnection(rtcConfig)

  partner.peerConn.onaddstream = evt => {
    partner.stream = evt.stream
    partner.video.src = URL.createObjectURL(partner.stream)
  }

  navigator.getUserMedia({audio: true, video: true}, stream => {
    user.stream     = stream;
    user.videoTrack = stream.getVideoTracks()[0];
    user.audioTrack = stream.getAudioTracks()[0];
    user.video.src  = URL.createObjectURL(stream);

    user.muteButton.addEventListener('click', () => {
      user.audioTrack.enabled = !user.audioTrack.enabled;
      if (user.audioTrack.enabled) {
        user.muteBtn.textContent = 'Muted (click to unmute)';
      } else {
        user.muteBtn.textContent = 'Unmuted (click to mute)';
      }
    });
  }, err => {
    console.log(err)
  });

  let streamId = window.location.href.split('/').pop()
  let channel = socket.channel('hangout:'+streamId)

  channel.join()
    .receive('ok', resp => { console.log('Joined successfully', resp) })
    .receive('error', resp => { console.log('Unable to join', resp) })

  partner.peerConn.onicecandidate = evt => {
    if (evt.candidate)
      channel.push('ice_candidate', {candidate: evt.candidate})
  }

  callButton.addEventListener('click', () => {
    partner.peerConn.addStream(user.stream)
    partner.peerConn.createOffer(offer => {
      let desc = new RTCSessionDescription(offer)
      partner.peerConn.setLocalDescription(desc)
      channel.push('offer', {offer: offer})
    })
  })

  channel.on('ice_candidate', payload => {
    pc.addIceCandidate(new RTCIceCandidate(payload.candidate))
  })

  // Answer incoming call
  channel.on('offer', payload => {
    var remoteDesc = new RTCSessionDescription(payload.offer)
    partner.peerConn.setRemoteDescription(remoteDesc, () => {
      partner.peerConn.createAnswer(answer => {
        var localDesc = new RTCSessionDescription(answer)
        partner.peerConn.setLocalDescription(localDesc, () => {
          channel.push('answer', {answer: answer})
        })
      })
    })
  })

  // Handle answer
  channel.on('answer', payload => {
    var desc = new RTCSessionDescription(payload.answer)
    partner.peerConn.setRemoteDescription(desc)
  })
}
