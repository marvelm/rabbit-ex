import socket from './socket';
import { run as runVideo } from './video';

export var run = function() {
    let screen = document.getElementById('screen');

    let channel = socket.channel('live:default', {});
    let $window = $(window);
    let $form = $('form');
    let $input = $('input');

    let video = document.getElementById('main-video');
    let $video = $(video);
    let $controller = $('#controller');

    video.hide = () => {
        $controller.addClass('hidden');
        $video.addClass('hidden');
    };
    video.show = () => {
        $controller.removeClass('hidden');
        $video.removeClass('hidden');
    };

    let ytPlayer = new YT.Player('youtube', {
        height: $window.height(),
        width: $window.width(),
        events: {
            onReady: onPlayerReady,
            onStateChange: onPlayerStateChange
        }
    });
    ytPlayer.hide = () => {
        $('#youtube').addClass('hidden');
    };
    ytPlayer.show = () => {
        $('#youtube').removeClass('hidden');
    };

    screen.ytPlayer = ytPlayer;

    let youtubeRegex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/ ]{11})/i;

    $form.submit(function(event) {
        event.preventDefault();
        let input = $input.val();
        let result = youtubeRegex.exec(input);

        if (result && result.length > 0) {
            let youtubeId = result[result.length - 1];
            if (youtubeId)
                channel.push('media', {
                    mediaType: 'youtube',
                    youtubeId: youtubeId
                });
        }

        else {
            channel.push('media', {
                mediaType: 'video',
                path: input
            });
        }
    });

    channel.on('media', function(payload) {
        screen.current = payload;

        if (payload.mediaType == 'youtube') {
            try { video.destroy(); } catch (e) { console.log(e); }
            video.hide();
            ytPlayer.loadVideoById({
                videoId: payload.youtubeId,
                startSeconds: 0,
                suggestedQuality: 'large'
            });
            ytPlayer.show();
        }

        else if (payload.mediaType == 'video') {
            ytPlayer.hide();
            video.show();
            video.src = '/stream/' + payload.path;
            runVideo(video);
            ytPlayer.stopVideo();
            // try { ytPlayer.destroy(); } catch (e) { console.log(e); }
        }
    });

    function onPlayerReady(event) {
        if (event.data == YT.PlayerState.PLAYING)
            event.target.playVideo();
    }

    function onPlayerStateChange(event) {
    }

    channel.join()
        .receive('ok', resp => { console.log('Joined successfully', resp); })
        .receive('error', resp => { console.log('Unable to join', resp); });
};
