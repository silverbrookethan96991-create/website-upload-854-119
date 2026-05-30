(function () {
  var params = new URLSearchParams(window.location.search);
  var query = (params.get('q') || '').trim();
  var input = document.querySelector('[data-search-page-input]');
  var title = document.querySelector('[data-search-title]');
  var results = document.querySelector('[data-search-results]');
  var empty = document.querySelector('[data-search-empty]');
  var source = typeof MOVIE_SEARCH_INDEX === 'undefined' ? [] : MOVIE_SEARCH_INDEX;

  if (input) {
    input.value = query;
  }

  function normalize(value) {
    return String(value || '').toLowerCase();
  }

  function appendText(element, value) {
    element.appendChild(document.createTextNode(value));
  }

  function createCard(item) {
    var article = document.createElement('article');
    article.className = 'movie-card';

    var cover = document.createElement('a');
    cover.className = 'movie-cover';
    cover.href = './' + item.url;

    var img = document.createElement('img');
    img.src = item.cover;
    img.alt = item.title;
    cover.appendChild(img);

    var shade = document.createElement('span');
    shade.className = 'cover-shade';
    cover.appendChild(shade);

    var body = document.createElement('div');
    body.className = 'movie-card-body';

    var h3 = document.createElement('h3');
    var link = document.createElement('a');
    link.href = './' + item.url;
    appendText(link, item.title);
    h3.appendChild(link);

    var p = document.createElement('p');
    appendText(p, item.oneLine || '');

    var meta = document.createElement('div');
    meta.className = 'movie-meta';
    [item.type, item.region, item.year].forEach(function (value) {
      var span = document.createElement('span');
      appendText(span, value || '');
      meta.appendChild(span);
    });

    var tagRow = document.createElement('div');
    tagRow.className = 'tag-row';
    [item.category, item.genre].concat(item.tags || []).slice(0, 4).forEach(function (value) {
      if (!value) {
        return;
      }

      var span = document.createElement('span');
      appendText(span, value);
      tagRow.appendChild(span);
    });

    body.appendChild(h3);
    body.appendChild(p);
    body.appendChild(meta);
    body.appendChild(tagRow);
    article.appendChild(cover);
    article.appendChild(body);

    return article;
  }

  function render() {
    if (!results || !empty) {
      return;
    }

    results.innerHTML = '';

    if (!query) {
      empty.textContent = '输入关键词开始搜索';
      empty.classList.add('is-visible');
      if (title) {
        title.textContent = '搜索结果';
      }
      return;
    }

    var tokens = normalize(query).split(/\s+/).filter(Boolean);
    var matched = source.filter(function (item) {
      var haystack = normalize([
        item.title,
        item.type,
        item.region,
        item.year,
        item.genre,
        item.category,
        item.oneLine,
        (item.tags || []).join(' ')
      ].join(' '));

      return tokens.every(function (token) {
        return haystack.indexOf(token) !== -1;
      });
    }).slice(0, 80);

    if (title) {
      title.textContent = '“' + query + '” 的搜索结果';
    }

    matched.forEach(function (item) {
      results.appendChild(createCard(item));
    });

    empty.textContent = matched.length ? '' : '未找到匹配影片';
    empty.classList.toggle('is-visible', matched.length === 0);
  }

  render();
})();
