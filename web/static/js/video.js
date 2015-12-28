$video = $('video')

function resizeVideo() {
    $video.css({
        height: $window.height() + 'px';
        width: $window.width() + 'px';
    })
}

window.onresize = resizeVideo;
