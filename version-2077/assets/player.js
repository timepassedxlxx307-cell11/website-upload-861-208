(function () {
    function mountPlayer(id, source) {
        var root = document.getElementById(id);
        if (!root) {
            return;
        }

        var video = root.querySelector("video");
        var overlay = root.querySelector(".player-overlay");
        var errorBox = root.querySelector(".player-error");
        var buttons = root.querySelectorAll("[data-play]");
        var initialized = false;
        var hls = null;

        function showError(message) {
            if (errorBox) {
                errorBox.textContent = message;
                errorBox.classList.add("is-visible");
            }
        }

        function clearError() {
            if (errorBox) {
                errorBox.textContent = "";
                errorBox.classList.remove("is-visible");
            }
        }

        function initialize() {
            if (initialized || !video) {
                return;
            }
            initialized = true;
            clearError();
            if (window.Hls && window.Hls.isSupported()) {
                hls = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: false
                });
                hls.loadSource(source);
                hls.attachMedia(video);
                hls.on(window.Hls.Events.ERROR, function (event, data) {
                    if (!data || !data.fatal) {
                        return;
                    }
                    if (data.type === window.Hls.ErrorTypes.NETWORK_ERROR) {
                        hls.startLoad();
                    } else if (data.type === window.Hls.ErrorTypes.MEDIA_ERROR) {
                        hls.recoverMediaError();
                    } else {
                        showError("播放暂时不可用，请稍后再试。");
                    }
                });
            } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
                video.src = source;
            } else {
                showError("播放暂时不可用，请稍后再试。");
            }
        }

        function beginPlayback() {
            initialize();
            if (!video) {
                return;
            }
            if (overlay) {
                overlay.classList.add("is-hidden");
            }
            var result = video.play();
            if (result && typeof result.catch === "function") {
                result.catch(function () {
                    showError("点击播放按钮后可继续观看。");
                    if (overlay) {
                        overlay.classList.remove("is-hidden");
                    }
                });
            }
        }

        buttons.forEach(function (button) {
            button.addEventListener("click", beginPlayback);
        });

        if (overlay) {
            overlay.addEventListener("click", beginPlayback);
        }

        if (video) {
            video.addEventListener("play", function () {
                clearError();
                if (overlay) {
                    overlay.classList.add("is-hidden");
                }
            });
            video.addEventListener("pause", function () {
                if (video.currentTime === 0 && overlay) {
                    overlay.classList.remove("is-hidden");
                }
            });
            video.addEventListener("error", function () {
                showError("播放暂时不可用，请稍后再试。");
            });
        }
    }

    window.SitePlayer = {
        mount: mountPlayer
    };
})();
