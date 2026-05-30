(function () {
    var form = document.querySelector('[data-search-form]');
    var input = document.querySelector('[data-search-input]');
    var results = document.querySelector('[data-search-results]');

    if (!form || !input || !results || !Array.isArray(window.SITE_MOVIES)) {
        return;
    }

    function card(movie) {
        var tags = movie.tags.slice(0, 3).map(function (tag) {
            return '<span>' + escapeHtml(tag) + '</span>';
        }).join('');

        return '' +
            '<article class="movie-card">' +
                '<a href="' + movie.url + '" class="movie-cover">' +
                    '<img src="' + movie.cover + '" alt="' + escapeHtml(movie.title) + '" loading="lazy">' +
                    '<span class="movie-year">' + escapeHtml(movie.year) + '</span>' +
                    '<span class="play-chip">▶</span>' +
                '</a>' +
                '<div class="movie-body">' +
                    '<a href="' + movie.url + '" class="movie-title">' + escapeHtml(movie.title) + '</a>' +
                    '<p>' + escapeHtml(movie.oneLine) + '</p>' +
                    '<div class="movie-meta"><span>' + escapeHtml(movie.region) + '</span><span>' + escapeHtml(movie.type) + '</span></div>' +
                    '<div class="tag-row">' + tags + '</div>' +
                '</div>' +
            '</article>';
    }

    function escapeHtml(value) {
        return String(value || '')
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#039;');
    }

    function runSearch(value) {
        var query = String(value || '').trim().toLowerCase();
        var matches = window.SITE_MOVIES.filter(function (movie) {
            if (!query) {
                return true;
            }

            return movie.search.indexOf(query) !== -1;
        }).slice(0, 96);

        if (!matches.length) {
            results.innerHTML = '<div class="empty-state">没有找到匹配的影片。</div>';
            return;
        }

        results.innerHTML = matches.map(card).join('');
    }

    form.addEventListener('submit', function (event) {
        event.preventDefault();
        runSearch(input.value);
    });

    input.addEventListener('input', function () {
        runSearch(input.value);
    });

    var params = new URLSearchParams(window.location.search);
    var initial = params.get('q') || '';
    input.value = initial;
    runSearch(initial);
})();
