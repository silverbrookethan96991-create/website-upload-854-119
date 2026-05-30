(function () {
  var toggle = document.querySelector('[data-mobile-toggle]');
  var panel = document.querySelector('[data-mobile-panel]');

  if (toggle && panel) {
    toggle.addEventListener('click', function () {
      panel.classList.toggle('is-open');
    });
  }

  var hero = document.querySelector('[data-hero]');

  if (hero) {
    var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
    var prev = hero.querySelector('[data-hero-prev]');
    var next = hero.querySelector('[data-hero-next]');
    var current = 0;
    var timer = null;

    function show(index) {
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

    function start() {
      window.clearInterval(timer);
      timer = window.setInterval(function () {
        show(current + 1);
      }, 5000);
    }

    if (prev) {
      prev.addEventListener('click', function () {
        show(current - 1);
        start();
      });
    }

    if (next) {
      next.addEventListener('click', function () {
        show(current + 1);
        start();
      });
    }

    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        show(Number(dot.getAttribute('data-hero-dot')) || 0);
        start();
      });
    });

    show(0);
    start();
  }

  var filters = Array.prototype.slice.call(document.querySelectorAll('[data-catalog-filter]'));

  filters.forEach(function (filter) {
    var section = filter.closest('.content-section');
    var keyword = filter.querySelector('[data-filter-keyword]');
    var type = filter.querySelector('[data-filter-type]');
    var year = filter.querySelector('[data-filter-year]');
    var cards = section ? Array.prototype.slice.call(section.querySelectorAll('.movie-card')) : [];
    var empty = section ? section.querySelector('[data-empty-state]') : null;

    function normalize(value) {
      return String(value || '').toLowerCase().trim();
    }

    function apply() {
      var q = normalize(keyword ? keyword.value : '');
      var typeValue = type ? type.value : '';
      var yearValue = year ? year.value : '';
      var visible = 0;

      cards.forEach(function (card) {
        var haystack = normalize([
          card.getAttribute('data-title'),
          card.getAttribute('data-type'),
          card.getAttribute('data-region'),
          card.getAttribute('data-genre'),
          card.getAttribute('data-year')
        ].join(' '));
        var matchKeyword = !q || haystack.indexOf(q) !== -1;
        var matchType = !typeValue || card.getAttribute('data-type') === typeValue;
        var matchYear = !yearValue || card.getAttribute('data-year') === yearValue;
        var matched = matchKeyword && matchType && matchYear;

        card.style.display = matched ? '' : 'none';

        if (matched) {
          visible += 1;
        }
      });

      if (empty) {
        empty.classList.toggle('is-visible', visible === 0);
      }
    }

    [keyword, type, year].forEach(function (control) {
      if (control) {
        control.addEventListener('input', apply);
        control.addEventListener('change', apply);
      }
    });

    apply();
  });
})();
