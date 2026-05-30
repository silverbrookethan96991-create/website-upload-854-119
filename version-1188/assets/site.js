function ready(fn) {
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", fn);
  } else {
    fn();
  }
}

function normalizeText(value) {
  return String(value || "").toLowerCase().replace(/\s+/g, "");
}

function initMobileMenu() {
  var toggle = document.querySelector("[data-menu-toggle]");
  var panel = document.querySelector("[data-mobile-panel]");
  if (!toggle || !panel) {
    return;
  }
  toggle.addEventListener("click", function () {
    panel.classList.toggle("is-open");
  });
}

function initHeaderSearch() {
  document.querySelectorAll("[data-header-search]").forEach(function (form) {
    form.addEventListener("submit", function (event) {
      event.preventDefault();
      var input = form.querySelector("input");
      var query = input ? input.value.trim() : "";
      var target = "./archive.html";
      if (query) {
        target += "?q=" + encodeURIComponent(query);
      }
      window.location.href = target;
    });
  });
}

function initHero() {
  var hero = document.querySelector("[data-hero]");
  if (!hero) {
    return;
  }
  var slides = Array.prototype.slice.call(hero.querySelectorAll(".hero-slide"));
  var dots = Array.prototype.slice.call(hero.querySelectorAll(".hero-dot"));
  var prev = hero.querySelector("[data-hero-prev]");
  var next = hero.querySelector("[data-hero-next]");
  var current = 0;
  var timer = null;

  function show(index) {
    if (!slides.length) {
      return;
    }
    current = (index + slides.length) % slides.length;
    slides.forEach(function (slide, slideIndex) {
      slide.classList.toggle("is-active", slideIndex === current);
    });
    dots.forEach(function (dot, dotIndex) {
      dot.classList.toggle("is-active", dotIndex === current);
    });
  }

  function restart() {
    if (timer) {
      window.clearInterval(timer);
    }
    timer = window.setInterval(function () {
      show(current + 1);
    }, 5200);
  }

  dots.forEach(function (dot, index) {
    dot.addEventListener("click", function () {
      show(index);
      restart();
    });
  });

  if (prev) {
    prev.addEventListener("click", function () {
      show(current - 1);
      restart();
    });
  }

  if (next) {
    next.addEventListener("click", function () {
      show(current + 1);
      restart();
    });
  }

  show(0);
  restart();
}

function initFilters() {
  document.querySelectorAll("[data-filter-panel]").forEach(function (panel) {
    var scopeId = panel.getAttribute("data-filter-panel");
    var scope = scopeId ? document.getElementById(scopeId) : document;
    var cards = Array.prototype.slice.call(scope.querySelectorAll("[data-title]"));
    var input = panel.querySelector("[data-filter-search]");
    var region = panel.querySelector("[data-filter-region]");
    var year = panel.querySelector("[data-filter-year]");
    var type = panel.querySelector("[data-filter-type]");
    var count = document.querySelector('[data-filter-count="' + scopeId + '"]');
    var empty = document.querySelector('[data-empty-state="' + scopeId + '"]');
    var params = new URLSearchParams(window.location.search);
    var q = params.get("q");

    if (q && input) {
      input.value = q;
    }

    function apply() {
      var query = normalizeText(input ? input.value : "");
      var regionValue = region ? region.value : "";
      var yearValue = year ? year.value : "";
      var typeValue = type ? type.value : "";
      var visible = 0;

      cards.forEach(function (card) {
        var haystack = normalizeText([
          card.getAttribute("data-title"),
          card.getAttribute("data-tags"),
          card.getAttribute("data-region"),
          card.getAttribute("data-year"),
          card.getAttribute("data-type")
        ].join(" "));
        var matched = true;

        if (query && haystack.indexOf(query) === -1) {
          matched = false;
        }
        if (regionValue && card.getAttribute("data-region") !== regionValue) {
          matched = false;
        }
        if (yearValue && card.getAttribute("data-year") !== yearValue) {
          matched = false;
        }
        if (typeValue && card.getAttribute("data-type") !== typeValue) {
          matched = false;
        }

        card.style.display = matched ? "" : "none";
        if (matched) {
          visible += 1;
        }
      });

      if (count) {
        count.textContent = "当前显示 " + visible + " 部";
      }
      if (empty) {
        empty.classList.toggle("is-visible", visible === 0);
      }
    }

    [input, region, year, type].forEach(function (control) {
      if (control) {
        control.addEventListener("input", apply);
        control.addEventListener("change", apply);
      }
    });

    apply();
  });
}

function initPlayers() {
  document.querySelectorAll("[data-player]").forEach(function (player) {
    var stream = player.getAttribute("data-stream");
    var video = player.querySelector("video");
    var overlay = player.querySelector("[data-play]");
    var instance = null;

    if (!stream || !video || !overlay) {
      return;
    }

    function start() {
      overlay.classList.add("is-hidden");

      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        if (video.getAttribute("src") !== stream) {
          video.setAttribute("src", stream);
        }
        video.play().catch(function () {});
        return;
      }

      if (window.Hls && window.Hls.isSupported()) {
        if (!instance) {
          instance = new window.Hls({
            enableWorker: true,
            lowLatencyMode: true
          });
          instance.loadSource(stream);
          instance.attachMedia(video);
          instance.on(window.Hls.Events.MANIFEST_PARSED, function () {
            video.play().catch(function () {});
          });
        } else {
          video.play().catch(function () {});
        }
        return;
      }

      video.setAttribute("src", stream);
      video.play().catch(function () {});
    }

    overlay.addEventListener("click", start);
    video.addEventListener("click", function () {
      if (video.paused) {
        start();
      }
    });
  });
}

ready(function () {
  initMobileMenu();
  initHeaderSearch();
  initHero();
  initFilters();
  initPlayers();
});
