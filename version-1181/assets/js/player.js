(function () {
  function setupMoviePlayer(streamUrl) {
    var video = document.querySelector("[data-video]");
    var cover = document.querySelector("[data-play-button]");
    var hasLoaded = false;
    var hlsInstance = null;

    if (!video || !cover || !streamUrl) {
      return;
    }

    function attachStream() {
      if (hasLoaded) {
        return;
      }

      hasLoaded = true;
      video.controls = true;

      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = streamUrl;
      } else if (window.Hls && window.Hls.isSupported()) {
        hlsInstance = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hlsInstance.loadSource(streamUrl);
        hlsInstance.attachMedia(video);
      } else {
        video.src = streamUrl;
      }
    }

    function startPlayback() {
      attachStream();
      cover.classList.add("is-hidden");
      var playPromise = video.play();
      if (playPromise && typeof playPromise.catch === "function") {
        playPromise.catch(function () {
          video.controls = true;
          cover.classList.remove("is-hidden");
        });
      }
    }

    cover.addEventListener("click", startPlayback);

    video.addEventListener("click", function () {
      if (!hasLoaded || video.paused) {
        startPlayback();
      }
    });

    window.addEventListener("pagehide", function () {
      if (hlsInstance) {
        hlsInstance.destroy();
        hlsInstance = null;
      }
    });
  }

  window.setupMoviePlayer = setupMoviePlayer;
})();
