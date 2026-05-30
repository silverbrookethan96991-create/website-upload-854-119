(function () {
    function qs(selector, root) {
        return (root || document).querySelector(selector);
    }

    function qsa(selector, root) {
        return Array.prototype.slice.call((root || document).querySelectorAll(selector));
    }

    function normalize(value) {
        return String(value || '').trim().toLowerCase();
    }

    function initMobileNav() {
        var toggle = qs('[data-mobile-toggle]');
        var nav = qs('[data-mobile-nav]');
        if (!toggle || !nav) {
            return;
        }
        toggle.addEventListener('click', function () {
            nav.classList.toggle('is-open');
        });
    }

    function initHero() {
        var hero = qs('[data-hero]');
        if (!hero) {
            return;
        }
        var slides = qsa('[data-hero-slide]', hero);
        var dots = qsa('[data-hero-dot]', hero);
        if (slides.length <= 1) {
            return;
        }
        var active = 0;
        var timer = null;

        function show(index) {
            active = (index + slides.length) % slides.length;
            slides.forEach(function (slide, i) {
                slide.classList.toggle('is-active', i === active);
            });
            dots.forEach(function (dot, i) {
                dot.classList.toggle('is-active', i === active);
            });
        }

        function start() {
            stop();
            timer = window.setInterval(function () {
                show(active + 1);
            }, 5200);
        }

        function stop() {
            if (timer) {
                window.clearInterval(timer);
                timer = null;
            }
        }

        dots.forEach(function (dot, i) {
            dot.addEventListener('click', function () {
                show(i);
                start();
            });
        });

        hero.addEventListener('mouseenter', stop);
        hero.addEventListener('mouseleave', start);
        start();
    }

    function fillSelect(select, values) {
        if (!select) {
            return;
        }
        var first = select.querySelector('option');
        select.innerHTML = '';
        if (first) {
            select.appendChild(first);
        }
        values.forEach(function (value) {
            var option = document.createElement('option');
            option.value = value;
            option.textContent = value;
            select.appendChild(option);
        });
    }

    function uniqueSorted(cards, key) {
        var values = [];
        var seen = Object.create(null);
        cards.forEach(function (card) {
            var value = card.getAttribute(key) || '';
            if (value && !seen[value]) {
                seen[value] = true;
                values.push(value);
            }
        });
        return values.sort(function (a, b) {
            var na = parseInt(a, 10);
            var nb = parseInt(b, 10);
            if (!isNaN(na) && !isNaN(nb)) {
                return nb - na;
            }
            return a.localeCompare(b, 'zh-CN');
        });
    }

    function initFilters() {
        qsa('[data-filter-scope]').forEach(function (scope) {
            var cards = qsa('[data-movie-card]', scope);
            if (!cards.length) {
                return;
            }
            var search = qs('[data-filter-search]', scope);
            var year = qs('[data-filter-year]', scope);
            var region = qs('[data-filter-region]', scope);
            var type = qs('[data-filter-type]', scope);
            var empty = qs('[data-filter-empty]', scope);

            fillSelect(year, uniqueSorted(cards, 'data-year'));
            fillSelect(region, uniqueSorted(cards, 'data-region'));
            fillSelect(type, uniqueSorted(cards, 'data-type'));

            var params = new URLSearchParams(window.location.search);
            var initialQuery = params.get('q');
            if (initialQuery && search) {
                search.value = initialQuery;
            }

            function cardText(card) {
                return normalize([
                    card.getAttribute('data-title'),
                    card.getAttribute('data-region'),
                    card.getAttribute('data-year'),
                    card.getAttribute('data-type'),
                    card.getAttribute('data-genre'),
                    card.getAttribute('data-tags'),
                    card.textContent
                ].join(' '));
            }

            function apply() {
                var q = normalize(search ? search.value : '');
                var y = year ? year.value : '';
                var r = region ? region.value : '';
                var t = type ? type.value : '';
                var visible = 0;

                cards.forEach(function (card) {
                    var matchQuery = !q || cardText(card).indexOf(q) >= 0;
                    var matchYear = !y || card.getAttribute('data-year') === y;
                    var matchRegion = !r || card.getAttribute('data-region') === r;
                    var matchType = !t || card.getAttribute('data-type') === t;
                    var matched = matchQuery && matchYear && matchRegion && matchType;
                    card.hidden = !matched;
                    if (matched) {
                        visible += 1;
                    }
                });

                if (empty) {
                    empty.hidden = visible !== 0;
                }
            }

            [search, year, region, type].forEach(function (control) {
                if (control) {
                    control.addEventListener('input', apply);
                    control.addEventListener('change', apply);
                }
            });

            apply();
        });
    }

    function initPlayers() {
        qsa('[data-player]').forEach(function (shell) {
            var video = qs('video', shell);
            var button = qs('[data-play-button]', shell);
            if (!video || !button) {
                return;
            }
            var src = video.getAttribute('data-src');
            var loaded = false;
            var hls = null;

            function playVideo() {
                var promise = video.play();
                if (promise && typeof promise.catch === 'function') {
                    promise.catch(function () {});
                }
            }

            function load() {
                if (!src) {
                    return;
                }
                shell.classList.add('is-playing');
                if (loaded) {
                    playVideo();
                    return;
                }
                loaded = true;
                if (video.canPlayType('application/vnd.apple.mpegurl')) {
                    video.src = src;
                    video.addEventListener('loadedmetadata', playVideo, { once: true });
                    video.load();
                    return;
                }
                if (window.Hls && window.Hls.isSupported()) {
                    hls = new window.Hls({ enableWorker: true, lowLatencyMode: true });
                    hls.loadSource(src);
                    hls.attachMedia(video);
                    hls.on(window.Hls.Events.MANIFEST_PARSED, playVideo);
                    return;
                }
                video.src = src;
                video.addEventListener('loadedmetadata', playVideo, { once: true });
                video.load();
            }

            button.addEventListener('click', function (event) {
                event.preventDefault();
                event.stopPropagation();
                load();
            });

            shell.addEventListener('click', function (event) {
                if (event.target === shell) {
                    load();
                }
            });

            window.addEventListener('pagehide', function () {
                if (hls && typeof hls.destroy === 'function') {
                    hls.destroy();
                }
            });
        });
    }

    document.addEventListener('DOMContentLoaded', function () {
        initMobileNav();
        initHero();
        initFilters();
        initPlayers();
    });
})();
