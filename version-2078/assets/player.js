(function () {
  var video = document.querySelector("[data-video-player]");
  var overlay = document.querySelector("[data-play-overlay]");

  if (!video) {
    return;
  }

  var streamUrl = video.getAttribute("data-play-url") || "";
  var prepared = false;
  var hlsInstance = null;

  function prepareVideo() {
    if (prepared || !streamUrl) {
      return;
    }

    prepared = true;

    if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = streamUrl;
      return;
    }

    if (window.Hls && window.Hls.isSupported()) {
      hlsInstance = new window.Hls({
        enableWorker: true,
        lowLatencyMode: false
      });
      hlsInstance.loadSource(streamUrl);
      hlsInstance.attachMedia(video);
      return;
    }

    video.src = streamUrl;
  }

  function startVideo() {
    prepareVideo();
    if (overlay) {
      overlay.classList.add("is-hidden");
    }
    var playPromise = video.play();
    if (playPromise && typeof playPromise.catch === "function") {
      playPromise.catch(function () {});
    }
  }

  if (overlay) {
    overlay.addEventListener("click", startVideo);
  }

  video.addEventListener("click", function () {
    if (video.paused) {
      startVideo();
    }
  });

  video.addEventListener("play", function () {
    if (overlay) {
      overlay.classList.add("is-hidden");
    }
  });

  window.addEventListener("pagehide", function () {
    if (hlsInstance && typeof hlsInstance.destroy === "function") {
      hlsInstance.destroy();
    }
  });
})();
