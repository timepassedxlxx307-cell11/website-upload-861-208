function initMoviePlayer(options) {
    var video = document.getElementById(options.videoId);
    var overlay = document.getElementById(options.overlayId);
    var source = options.source;
    var hls = null;
    var prepared = false;

    function prepare() {
        if (!video || prepared) {
            return;
        }
        prepared = true;
        if (video.canPlayType('application/vnd.apple.mpegurl')) {
            video.src = source;
        } else if (window.Hls && window.Hls.isSupported()) {
            hls = new window.Hls({
                enableWorker: true,
                lowLatencyMode: true
            });
            hls.loadSource(source);
            hls.attachMedia(video);
        } else {
            video.src = source;
        }
    }

    function play() {
        prepare();
        if (overlay) {
            overlay.classList.add('is-hidden');
        }
        var playResult = video.play();
        if (playResult && typeof playResult.catch === 'function') {
            playResult.catch(function () {
                if (overlay) {
                    overlay.classList.remove('is-hidden');
                }
            });
        }
    }

    if (!video) {
        return;
    }
    if (overlay) {
        overlay.addEventListener('click', play);
    }
    video.addEventListener('click', function () {
        if (video.paused) {
            play();
        }
    });
    video.addEventListener('play', function () {
        if (overlay) {
            overlay.classList.add('is-hidden');
        }
    });
    video.addEventListener('pause', function () {
        if (overlay && video.currentTime === 0) {
            overlay.classList.remove('is-hidden');
        }
    });
}
