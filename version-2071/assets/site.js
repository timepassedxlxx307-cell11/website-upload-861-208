(function () {
    var menuButton = document.querySelector('[data-menu-toggle]');
    var mobileNav = document.querySelector('[data-mobile-nav]');

    if (menuButton && mobileNav) {
        menuButton.addEventListener('click', function () {
            mobileNav.classList.toggle('is-open');
            document.body.classList.toggle('menu-open', mobileNav.classList.contains('is-open'));
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

        function showSlide(index) {
            if (!slides.length) {
                return;
            }

            current = (index + slides.length) % slides.length;

            slides.forEach(function (slide, i) {
                slide.classList.toggle('is-active', i === current);
            });

            dots.forEach(function (dot, i) {
                dot.classList.toggle('is-active', i === current);
            });
        }

        function restart() {
            if (timer) {
                window.clearInterval(timer);
            }

            timer = window.setInterval(function () {
                showSlide(current + 1);
            }, 5200);
        }

        if (prev) {
            prev.addEventListener('click', function () {
                showSlide(current - 1);
                restart();
            });
        }

        if (next) {
            next.addEventListener('click', function () {
                showSlide(current + 1);
                restart();
            });
        }

        dots.forEach(function (dot) {
            dot.addEventListener('click', function () {
                var index = Number(dot.getAttribute('data-hero-dot'));
                showSlide(index);
                restart();
            });
        });

        showSlide(0);
        restart();
    }

    var searchInput = document.querySelector('[data-card-search]');
    var categorySelect = document.querySelector('[data-card-category]');
    var cardList = document.querySelector('[data-card-list]');

    if (cardList && (searchInput || categorySelect)) {
        var cards = Array.prototype.slice.call(cardList.querySelectorAll('.movie-card'));

        function filterCards() {
            var keyword = searchInput ? searchInput.value.trim().toLowerCase() : '';
            var category = categorySelect ? categorySelect.value : '';

            cards.forEach(function (card) {
                var text = [
                    card.getAttribute('data-title'),
                    card.getAttribute('data-region'),
                    card.getAttribute('data-year'),
                    card.getAttribute('data-genre')
                ].join(' ').toLowerCase();
                var matchKeyword = !keyword || text.indexOf(keyword) !== -1;
                var matchCategory = !category || card.getAttribute('data-category') === category;

                card.classList.toggle('is-hidden-card', !(matchKeyword && matchCategory));
            });
        }

        if (searchInput) {
            searchInput.addEventListener('input', filterCards);
        }

        if (categorySelect) {
            categorySelect.addEventListener('change', filterCards);
        }
    }
})();

function initMoviePlayer(videoId, buttonId, source) {
    var video = document.getElementById(videoId);
    var button = document.getElementById(buttonId);
    var hlsInstance = null;
    var attached = false;

    if (!video || !button || !source) {
        return;
    }

    function attachSource() {
        if (attached) {
            return;
        }

        attached = true;

        if (video.canPlayType('application/vnd.apple.mpegurl')) {
            video.src = source;
            return;
        }

        if (window.Hls && window.Hls.isSupported()) {
            hlsInstance = new window.Hls({
                enableWorker: true,
                lowLatencyMode: true
            });
            hlsInstance.loadSource(source);
            hlsInstance.attachMedia(video);
            return;
        }

        video.src = source;
    }

    function startPlayback() {
        attachSource();
        button.classList.add('is-hidden');
        var playPromise = video.play();

        if (playPromise && typeof playPromise.catch === 'function') {
            playPromise.catch(function () {
                button.classList.remove('is-hidden');
            });
        }
    }

    button.addEventListener('click', startPlayback);

    video.addEventListener('click', function () {
        if (video.paused) {
            startPlayback();
        } else {
            video.pause();
        }
    });

    video.addEventListener('play', function () {
        button.classList.add('is-hidden');
    });

    video.addEventListener('pause', function () {
        if (!video.ended) {
            button.classList.remove('is-hidden');
        }
    });

    video.addEventListener('ended', function () {
        button.classList.remove('is-hidden');
    });

    window.addEventListener('beforeunload', function () {
        if (hlsInstance) {
            hlsInstance.destroy();
        }
    });
}
