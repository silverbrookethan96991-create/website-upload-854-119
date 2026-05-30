(function () {
  function queryAll(selector, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(selector));
  }

  function initMenu() {
    var button = document.querySelector('[data-menu-button]');
    var nav = document.querySelector('[data-site-nav]');
    if (!button || !nav) {
      return;
    }
    button.addEventListener('click', function () {
      nav.classList.toggle('is-open');
    });
  }

  function initHero() {
    var root = document.querySelector('[data-hero]');
    if (!root) {
      return;
    }
    var slides = queryAll('[data-hero-slide]', root);
    var dots = queryAll('[data-hero-dot]', root);
    var prev = root.querySelector('[data-hero-prev]');
    var next = root.querySelector('[data-hero-next]');
    var index = 0;
    var timer = null;

    function render(nextIndex) {
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle('is-active', i === index);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle('is-active', i === index);
      });
    }

    function start() {
      stop();
      timer = window.setInterval(function () {
        render(index + 1);
      }, 5000);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
      }
    }

    if (prev) {
      prev.addEventListener('click', function () {
        render(index - 1);
        start();
      });
    }
    if (next) {
      next.addEventListener('click', function () {
        render(index + 1);
        start();
      });
    }
    dots.forEach(function (dot, i) {
      dot.addEventListener('click', function () {
        render(i);
        start();
      });
    });
    root.addEventListener('mouseenter', stop);
    root.addEventListener('mouseleave', start);
    start();
  }

  function initFilters() {
    var input = document.querySelector('[data-filter-input]');
    var list = document.querySelector('[data-filter-list]');
    if (!input || !list) {
      return;
    }
    var cards = queryAll('.movie-card', list);
    input.addEventListener('input', function () {
      var value = input.value.trim().toLowerCase();
      cards.forEach(function (card) {
        var haystack = [
          card.getAttribute('data-title'),
          card.getAttribute('data-tags'),
          card.getAttribute('data-year'),
          card.getAttribute('data-region')
        ].join(' ');
        card.style.display = !value || haystack.indexOf(value) > -1 ? '' : 'none';
      });
    });
  }

  function movieCard(movie) {
    return [
      '<article class="movie-card">',
      '<a class="movie-thumb" href="./' + movie.file + '">',
      '<img src="./' + movie.cover + '.jpg" alt="' + escapeHtml(movie.title) + '" loading="lazy">',
      '<span class="movie-year">' + escapeHtml(movie.year) + '</span>',
      '</a>',
      '<div class="movie-card-body">',
      '<a class="movie-title" href="./' + movie.file + '">' + escapeHtml(movie.title) + '</a>',
      '<p class="movie-line">' + escapeHtml(movie.line) + '</p>',
      '<div class="movie-meta"><span>' + escapeHtml(movie.category) + '</span><span>' + escapeHtml(movie.region) + '</span><span>' + escapeHtml(movie.type) + '</span></div>',
      '</div>',
      '</article>'
    ].join('');
  }

  function escapeHtml(value) {
    return String(value || '').replace(/[&<>"]/g, function (char) {
      return {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;'
      }[char];
    });
  }

  function initSearchPage() {
    var input = document.querySelector('[data-search-page-input]');
    var results = document.querySelector('[data-search-results]');
    var empty = document.querySelector('[data-search-empty]');
    if (!input || !results || !empty || !window.SEARCH_INDEX) {
      return;
    }
    var params = new URLSearchParams(window.location.search);
    var query = params.get('q') || '';
    input.value = query;

    function render(value) {
      var needle = value.trim().toLowerCase();
      results.innerHTML = '';
      if (!needle) {
        empty.textContent = '请输入关键词开始搜索。';
        empty.style.display = '';
        return;
      }
      var matches = window.SEARCH_INDEX.filter(function (movie) {
        return movie.search.indexOf(needle) > -1;
      }).slice(0, 120);
      if (!matches.length) {
        empty.textContent = '没有找到匹配内容。';
        empty.style.display = '';
        return;
      }
      empty.style.display = 'none';
      results.innerHTML = matches.map(movieCard).join('');
    }

    render(query);
    input.addEventListener('input', function () {
      render(input.value);
    });
  }

  function initPlayer(videoId, url) {
    var video = document.getElementById(videoId);
    if (!video) {
      return;
    }
    var player = video.closest('[data-player]');
    var button = player ? player.querySelector('.player-play') : null;
    var state = player ? player.querySelector('.player-state') : null;
    var attached = false;
    var hls = null;

    function setState(message) {
      if (state) {
        state.textContent = message || '';
      }
    }

    function attach() {
      if (attached) {
        return;
      }
      attached = true;
      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = url;
      } else if (window.Hls && window.Hls.isSupported()) {
        hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hls.loadSource(url);
        hls.attachMedia(video);
        hls.on(window.Hls.Events.ERROR, function (_, data) {
          if (!data || !data.fatal) {
            return;
          }
          if (data.type === window.Hls.ErrorTypes.NETWORK_ERROR) {
            setState('网络波动，正在恢复');
            hls.startLoad();
          } else if (data.type === window.Hls.ErrorTypes.MEDIA_ERROR) {
            setState('媒体恢复中');
            hls.recoverMediaError();
          } else {
            setState('播放失败，请稍后重试');
            hls.destroy();
          }
        });
      } else {
        setState('浏览器暂不支持此视频');
      }
    }

    function play() {
      attach();
      var result = video.play();
      if (result && typeof result.catch === 'function') {
        result.catch(function () {
          setState('点击视频继续播放');
        });
      }
    }

    if (button) {
      button.addEventListener('click', play);
    }
    video.addEventListener('click', function () {
      if (video.paused) {
        play();
      }
    });
    video.addEventListener('play', function () {
      if (player) {
        player.classList.add('is-playing');
      }
      setState('');
    });
    video.addEventListener('pause', function () {
      if (player) {
        player.classList.remove('is-playing');
      }
    });
    window.addEventListener('beforeunload', function () {
      if (hls) {
        hls.destroy();
      }
    });
  }

  window.Site = window.Site || {};
  window.Site.initPlayer = initPlayer;

  document.addEventListener('DOMContentLoaded', function () {
    initMenu();
    initHero();
    initFilters();
    initSearchPage();
  });
})();
