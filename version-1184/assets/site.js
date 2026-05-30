(function () {
  function ready(fn) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", fn);
    } else {
      fn();
    }
  }

  function setupMenu() {
    var button = document.querySelector("[data-menu-toggle]");
    var nav = document.querySelector("[data-mobile-nav]");
    if (!button || !nav) {
      return;
    }
    button.addEventListener("click", function () {
      nav.classList.toggle("open");
    });
  }

  function setupHero() {
    var hero = document.querySelector("[data-hero]");
    if (!hero) {
      return;
    }
    var slides = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-slide]"));
    var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-dot]"));
    if (slides.length <= 1) {
      return;
    }
    var active = 0;
    function show(index) {
      active = (index + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle("active", i === active);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle("active", i === active);
      });
    }
    dots.forEach(function (dot, i) {
      dot.addEventListener("click", function () {
        show(i);
      });
    });
    setInterval(function () {
      show(active + 1);
    }, 5200);
  }

  function uniqueOptions(cards, field) {
    var values = [];
    cards.forEach(function (card) {
      var raw = card.getAttribute("data-" + field) || "";
      raw.split(/[，,、/\s]+/).forEach(function (item) {
        item = item.trim();
        if (item && values.indexOf(item) === -1) {
          values.push(item);
        }
      });
    });
    return values.slice(0, 40);
  }

  function setupFilters() {
    document.querySelectorAll(".filter-panel").forEach(function (panel) {
      var cards = Array.prototype.slice.call(panel.querySelectorAll("[data-movie-card]"));
      var queryInput = panel.querySelector("[data-filter-query]");
      var yearSelect = panel.querySelector('[data-filter-field="year"]');
      var genreSelect = panel.querySelector('[data-filter-field="genre"]');
      var emptyTip = panel.querySelector("[data-empty-tip]");
      if (!cards.length) {
        return;
      }
      if (yearSelect) {
        uniqueOptions(cards, "year").sort().reverse().forEach(function (year) {
          var option = document.createElement("option");
          option.value = year;
          option.textContent = year;
          yearSelect.appendChild(option);
        });
      }
      if (genreSelect) {
        uniqueOptions(cards, "genre").forEach(function (genre) {
          var option = document.createElement("option");
          option.value = genre;
          option.textContent = genre;
          genreSelect.appendChild(option);
        });
      }
      function apply() {
        var query = queryInput ? queryInput.value.trim().toLowerCase() : "";
        var year = yearSelect ? yearSelect.value : "";
        var genre = genreSelect ? genreSelect.value : "";
        var visible = 0;
        cards.forEach(function (card) {
          var text = (card.getAttribute("data-search") || "").toLowerCase();
          var cardYear = card.getAttribute("data-year") || "";
          var cardGenre = card.getAttribute("data-genre") || "";
          var matched = true;
          if (query && text.indexOf(query) === -1) {
            matched = false;
          }
          if (year && cardYear !== year) {
            matched = false;
          }
          if (genre && cardGenre.indexOf(genre) === -1) {
            matched = false;
          }
          card.style.display = matched ? "" : "none";
          if (matched) {
            visible += 1;
          }
        });
        if (emptyTip) {
          emptyTip.classList.toggle("open", visible === 0);
        }
      }
      [queryInput, yearSelect, genreSelect].forEach(function (el) {
        if (el) {
          el.addEventListener("input", apply);
          el.addEventListener("change", apply);
        }
      });
    });
  }

  function setupGlobalSearch() {
    var input = document.querySelector("[data-global-search]");
    var popover = document.querySelector("[data-search-popover]");
    if (!input || !popover || !window.SEARCH_INDEX) {
      return;
    }
    function close() {
      popover.classList.remove("open");
      popover.innerHTML = "";
    }
    input.addEventListener("input", function () {
      var value = input.value.trim().toLowerCase();
      if (!value) {
        close();
        return;
      }
      var results = window.SEARCH_INDEX.filter(function (item) {
        return item.search.indexOf(value) !== -1;
      }).slice(0, 10);
      if (!results.length) {
        close();
        return;
      }
      popover.innerHTML = results.map(function (item) {
        return '<a href="' + item.url + '"><img src="' + item.cover + '" alt=""><span><b>' + item.title + '</b><em>' + item.meta + '</em></span></a>';
      }).join("");
      popover.classList.add("open");
    });
    document.addEventListener("click", function (event) {
      if (!popover.contains(event.target) && event.target !== input) {
        close();
      }
    });
    input.addEventListener("keydown", function (event) {
      if (event.key === "Enter") {
        var first = popover.querySelector("a");
        if (first) {
          event.preventDefault();
          window.location.href = first.getAttribute("href");
        }
      }
    });
  }

  function setupPlayer() {
    if (typeof playerConfig === "undefined" || !playerConfig.source) {
      return;
    }
    var video = document.querySelector("#moviePlayer");
    var button = document.querySelector("#playButton");
    var wrap = document.querySelector(".video-wrap");
    if (!video || !button || !wrap) {
      return;
    }
    var attached = false;
    var hlsInstance = null;
    function attach() {
      if (attached) {
        return;
      }
      attached = true;
      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = playerConfig.source;
      } else if (window.Hls && window.Hls.isSupported()) {
        hlsInstance = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hlsInstance.loadSource(playerConfig.source);
        hlsInstance.attachMedia(video);
      } else {
        video.src = playerConfig.source;
      }
      if (playerConfig.poster) {
        video.setAttribute("poster", playerConfig.poster);
      }
    }
    function start() {
      attach();
      wrap.classList.add("is-playing");
      var playPromise = video.play();
      if (playPromise && playPromise.catch) {
        playPromise.catch(function () {});
      }
    }
    button.addEventListener("click", start);
    video.addEventListener("click", function () {
      if (video.paused) {
        start();
      }
    });
    video.addEventListener("play", function () {
      wrap.classList.add("is-playing");
    });
    window.addEventListener("pagehide", function () {
      if (hlsInstance) {
        hlsInstance.destroy();
      }
    });
  }

  ready(function () {
    setupMenu();
    setupHero();
    setupFilters();
    setupGlobalSearch();
    setupPlayer();
  });
})();
