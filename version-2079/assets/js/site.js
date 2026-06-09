(function () {
    var toggle = document.querySelector('[data-menu-toggle]');
    var nav = document.querySelector('[data-mobile-nav]');
    if (toggle && nav) {
        toggle.addEventListener('click', function () {
            var open = nav.classList.toggle('is-open');
            toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
        });
    }

    var hero = document.querySelector('[data-hero]');
    if (hero) {
        var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
        var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
        var next = hero.querySelector('[data-hero-next]');
        var prev = hero.querySelector('[data-hero-prev]');
        var index = 0;
        var timer = null;
        var show = function (target) {
            if (!slides.length) {
                return;
            }
            index = (target + slides.length) % slides.length;
            slides.forEach(function (slide, i) {
                slide.classList.toggle('is-active', i === index);
            });
            dots.forEach(function (dot, i) {
                dot.classList.toggle('is-active', i === index);
            });
        };
        var start = function () {
            timer = window.setInterval(function () {
                show(index + 1);
            }, 5000);
        };
        var restart = function () {
            window.clearInterval(timer);
            start();
        };
        if (next) {
            next.addEventListener('click', function () {
                show(index + 1);
                restart();
            });
        }
        if (prev) {
            prev.addEventListener('click', function () {
                show(index - 1);
                restart();
            });
        }
        dots.forEach(function (dot) {
            dot.addEventListener('click', function () {
                show(Number(dot.getAttribute('data-hero-dot')) || 0);
                restart();
            });
        });
        start();
    }

    var filterInput = document.querySelector('[data-filter-input]');
    var filterGrid = document.querySelector('[data-filter-grid]');
    if (filterInput && filterGrid) {
        var cards = Array.prototype.slice.call(filterGrid.querySelectorAll('.movie-card'));
        var chips = Array.prototype.slice.call(document.querySelectorAll('[data-chip]'));
        var activeChip = '';
        var applyFilter = function () {
            var q = filterInput.value.trim().toLowerCase();
            cards.forEach(function (card) {
                var text = [
                    card.getAttribute('data-title') || '',
                    card.getAttribute('data-region') || '',
                    card.getAttribute('data-type') || '',
                    card.getAttribute('data-genre') || '',
                    card.textContent || ''
                ].join(' ').toLowerCase();
                var matchedText = !q || text.indexOf(q) !== -1;
                var matchedChip = !activeChip || text.indexOf(activeChip.toLowerCase()) !== -1;
                card.classList.toggle('is-hidden-card', !(matchedText && matchedChip));
            });
        };
        filterInput.addEventListener('input', applyFilter);
        chips.forEach(function (chip) {
            chip.addEventListener('click', function () {
                var value = chip.getAttribute('data-chip') || '';
                activeChip = activeChip === value ? '' : value;
                chips.forEach(function (item) {
                    item.classList.toggle('is-active', item.getAttribute('data-chip') === activeChip);
                });
                applyFilter();
            });
        });
    }

    var searchInput = document.querySelector('[data-site-search]');
    var searchResults = document.querySelector('[data-search-results]');
    if (searchInput && searchResults && Array.isArray(window.SEARCH_MOVIES)) {
        var render = function (items) {
            if (!items.length) {
                searchResults.innerHTML = '<div class="no-results">暂无匹配内容</div>';
                return;
            }
            searchResults.innerHTML = '<div class="movie-grid">' + items.map(function (movie) {
                return '<article class="movie-card"><a href="' + movie.url + '" class="movie-card-link"><span class="poster-wrap"><img src="' + movie.cover + '" alt="' + escapeHtml(movie.title) + '" loading="lazy"><span class="poster-gradient"></span><span class="poster-play"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M8 5.2v13.6L18.8 12 8 5.2Z"></path></svg></span><span class="poster-label">' + escapeHtml(movie.type) + '</span></span><span class="movie-card-body"><strong>' + escapeHtml(movie.title) + '</strong><span class="meta-line">' + escapeHtml(movie.type) + ' · ' + escapeHtml(movie.year) + ' · ' + escapeHtml(movie.region) + '</span><span class="movie-one-line">' + escapeHtml(movie.oneLine) + '</span></span></a></article>';
            }).join('') + '</div>';
        };
        var escapeHtml = function (value) {
            return String(value || '').replace(/[&<>"']/g, function (ch) {
                return {
                    '&': '&amp;',
                    '<': '&lt;',
                    '>': '&gt;',
                    '"': '&quot;',
                    "'": '&#39;'
                }[ch];
            });
        };
        searchInput.addEventListener('input', function () {
            var q = searchInput.value.trim().toLowerCase();
            if (!q) {
                render(window.SEARCH_MOVIES.slice(0, 24));
                return;
            }
            var hits = window.SEARCH_MOVIES.filter(function (movie) {
                return movie.index.indexOf(q) !== -1;
            }).slice(0, 72);
            render(hits);
        });
    }
}());
