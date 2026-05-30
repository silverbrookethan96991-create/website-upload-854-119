(function () {
    function ready(callback) {
        if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", callback);
        } else {
            callback();
        }
    }

    function normalize(value) {
        return String(value || "").toLowerCase().trim();
    }

    ready(function () {
        var menuButton = document.querySelector("[data-menu-button]");
        var mobilePanel = document.querySelector("[data-mobile-panel]");
        if (menuButton && mobilePanel) {
            menuButton.addEventListener("click", function () {
                mobilePanel.classList.toggle("is-open");
            });
        }

        document.querySelectorAll("[data-hero-carousel]").forEach(function (carousel) {
            var slides = Array.prototype.slice.call(carousel.querySelectorAll("[data-hero-slide]"));
            var dots = Array.prototype.slice.call(carousel.querySelectorAll("[data-hero-dot]"));
            var prev = carousel.querySelector("[data-hero-prev]");
            var next = carousel.querySelector("[data-hero-next]");
            var index = 0;
            var timer = null;

            function show(nextIndex) {
                if (!slides.length) {
                    return;
                }
                index = (nextIndex + slides.length) % slides.length;
                slides.forEach(function (slide, pos) {
                    slide.classList.toggle("is-active", pos === index);
                });
                dots.forEach(function (dot, pos) {
                    dot.classList.toggle("is-active", pos === index);
                });
            }

            function restart() {
                if (timer) {
                    window.clearInterval(timer);
                }
                timer = window.setInterval(function () {
                    show(index + 1);
                }, 5000);
            }

            if (prev) {
                prev.addEventListener("click", function () {
                    show(index - 1);
                    restart();
                });
            }
            if (next) {
                next.addEventListener("click", function () {
                    show(index + 1);
                    restart();
                });
            }
            dots.forEach(function (dot) {
                dot.addEventListener("click", function () {
                    show(parseInt(dot.getAttribute("data-hero-dot"), 10) || 0);
                    restart();
                });
            });
            restart();
        });

        document.querySelectorAll("[data-index-filter-box]").forEach(function (box) {
            var buttons = Array.prototype.slice.call(box.querySelectorAll("[data-index-filter]"));
            var cards = Array.prototype.slice.call(box.querySelectorAll(".movie-card"));
            buttons.forEach(function (button) {
                button.addEventListener("click", function () {
                    var value = button.getAttribute("data-value");
                    buttons.forEach(function (item) {
                        item.classList.remove("is-active");
                    });
                    button.classList.add("is-active");
                    cards.forEach(function (card) {
                        var match = value === "all" || card.getAttribute("data-region") === value;
                        card.classList.toggle("is-filter-hidden", !match);
                    });
                });
            });
        });

        document.querySelectorAll("[data-filter-page]").forEach(function (page) {
            var search = page.querySelector("[data-filter-search]");
            var cards = Array.prototype.slice.call(page.querySelectorAll("[data-filter-list] .movie-card, [data-filter-list] .rank-card"));
            var active = {
                year: "all",
                region: "all"
            };

            function applyFilter() {
                var query = normalize(search ? search.value : "");
                cards.forEach(function (card) {
                    var title = normalize(card.getAttribute("data-title"));
                    var region = normalize(card.getAttribute("data-region"));
                    var year = normalize(card.getAttribute("data-year"));
                    var genre = normalize(card.getAttribute("data-genre"));
                    var text = title + " " + region + " " + year + " " + genre + " " + normalize(card.textContent);
                    var matchQuery = !query || text.indexOf(query) !== -1;
                    var matchYear = active.year === "all" || card.getAttribute("data-year") === active.year;
                    var matchRegion = active.region === "all" || card.getAttribute("data-region") === active.region;
                    card.classList.toggle("is-filter-hidden", !(matchQuery && matchYear && matchRegion));
                });
            }

            page.querySelectorAll("[data-filter-type]").forEach(function (button) {
                button.addEventListener("click", function () {
                    var type = button.getAttribute("data-filter-type");
                    active[type] = button.getAttribute("data-value") || "all";
                    page.querySelectorAll("[data-filter-type='" + type + "']").forEach(function (item) {
                        item.classList.remove("is-active");
                    });
                    button.classList.add("is-active");
                    applyFilter();
                });
            });

            if (search) {
                var params = new URLSearchParams(window.location.search);
                var keyword = params.get("q");
                if (keyword) {
                    search.value = keyword;
                }
                search.addEventListener("input", applyFilter);
            }
            applyFilter();
        });
    });
})();

function initMoviePlayer(src) {
    var player = document.querySelector("[data-player]");
    if (!player) {
        return;
    }

    var video = player.querySelector("[data-player-video]");
    var startLayer = player.querySelector("[data-player-poster]");
    var attached = false;
    var hls = null;

    function showMessage(text) {
        var old = player.querySelector(".player-message");
        if (old) {
            old.remove();
        }
        var message = document.createElement("div");
        message.className = "player-message";
        message.textContent = text;
        player.appendChild(message);
    }

    function attach() {
        if (attached || !video) {
            return true;
        }
        if (video.canPlayType("application/vnd.apple.mpegurl")) {
            video.src = src;
            attached = true;
            return true;
        }
        if (window.Hls && window.Hls.isSupported()) {
            hls = new window.Hls({
                enableWorker: true,
                lowLatencyMode: true
            });
            hls.loadSource(src);
            hls.attachMedia(video);
            hls.on(window.Hls.Events.ERROR, function (event, data) {
                if (data && data.fatal && hls) {
                    if (data.type === window.Hls.ErrorTypes.NETWORK_ERROR) {
                        hls.startLoad();
                    } else if (data.type === window.Hls.ErrorTypes.MEDIA_ERROR) {
                        hls.recoverMediaError();
                    } else {
                        showMessage("播放暂时中断，请稍后再试");
                        hls.destroy();
                    }
                }
            });
            attached = true;
            return true;
        }
        showMessage("暂时无法播放，请稍后再试");
        return false;
    }

    function play() {
        if (!attach()) {
            return;
        }
        if (startLayer) {
            startLayer.classList.add("is-hidden");
        }
        var result = video.play();
        if (result && typeof result.catch === "function") {
            result.catch(function () {
                showMessage("点击视频区域继续播放");
            });
        }
    }

    if (startLayer) {
        startLayer.addEventListener("click", play);
    }

    if (video) {
        video.addEventListener("click", function () {
            if (video.paused) {
                play();
            } else {
                video.pause();
            }
        });
        video.addEventListener("play", function () {
            if (startLayer) {
                startLayer.classList.add("is-hidden");
            }
        });
    }

    window.addEventListener("beforeunload", function () {
        if (hls) {
            hls.destroy();
        }
    });
}
