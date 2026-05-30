(function () {
    var menuButton = document.querySelector('[data-menu-toggle]');
    var mobileNav = document.querySelector('[data-mobile-nav]');

    if (menuButton && mobileNav) {
        menuButton.addEventListener('click', function () {
            mobileNav.classList.toggle('is-open');
        });
    }

    var carousel = document.querySelector('[data-hero-carousel]');

    if (carousel) {
        var slides = Array.prototype.slice.call(carousel.querySelectorAll('[data-hero-slide]'));
        var dots = Array.prototype.slice.call(carousel.querySelectorAll('[data-hero-dot]'));
        var prev = carousel.querySelector('[data-hero-prev]');
        var next = carousel.querySelector('[data-hero-next]');
        var current = 0;
        var timer = null;

        function showSlide(index) {
            if (!slides.length) {
                return;
            }

            current = (index + slides.length) % slides.length;

            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle('is-active', slideIndex === current);
            });

            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle('is-active', dotIndex === current);
            });
        }

        function startTimer() {
            stopTimer();
            timer = window.setInterval(function () {
                showSlide(current + 1);
            }, 5200);
        }

        function stopTimer() {
            if (timer) {
                window.clearInterval(timer);
                timer = null;
            }
        }

        dots.forEach(function (dot) {
            dot.addEventListener('click', function () {
                showSlide(Number(dot.getAttribute('data-hero-dot')) || 0);
                startTimer();
            });
        });

        if (prev) {
            prev.addEventListener('click', function () {
                showSlide(current - 1);
                startTimer();
            });
        }

        if (next) {
            next.addEventListener('click', function () {
                showSlide(current + 1);
                startTimer();
            });
        }

        carousel.addEventListener('mouseenter', stopTimer);
        carousel.addEventListener('mouseleave', startTimer);
        showSlide(0);
        startTimer();
    }

    var filterInput = document.querySelector('[data-filter-input]');
    var yearFilter = document.querySelector('[data-year-filter]');
    var filterGrid = document.querySelector('[data-filter-grid]');

    if (filterGrid && (filterInput || yearFilter)) {
        var cards = Array.prototype.slice.call(filterGrid.querySelectorAll('.movie-card'));

        function runFilter() {
            var query = filterInput ? filterInput.value.trim().toLowerCase() : '';
            var year = yearFilter ? yearFilter.value : '';

            cards.forEach(function (card) {
                var haystack = [
                    card.getAttribute('data-title') || '',
                    card.getAttribute('data-tags') || '',
                    card.getAttribute('data-year') || ''
                ].join(' ').toLowerCase();
                var cardYear = card.getAttribute('data-year') || '';
                var matchesQuery = !query || haystack.indexOf(query) !== -1;
                var matchesYear = !year || cardYear === year;

                card.style.display = matchesQuery && matchesYear ? '' : 'none';
            });
        }

        if (filterInput) {
            filterInput.addEventListener('input', runFilter);
        }

        if (yearFilter) {
            yearFilter.addEventListener('change', runFilter);
        }
    }
})();
