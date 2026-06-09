(function () {
    'use strict';

    var HLS_SCRIPT_SRC = 'https://cdn.jsdelivr.net/npm/hls.js@1.5.20/dist/hls.min.js';
    var hlsScriptPromise = null;

    function ready(callback) {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', callback);
        } else {
            callback();
        }
    }

    function loadHlsScript() {
        if (window.Hls) {
            return Promise.resolve(window.Hls);
        }

        if (hlsScriptPromise) {
            return hlsScriptPromise;
        }

        hlsScriptPromise = new Promise(function (resolve, reject) {
            var script = document.createElement('script');
            script.src = HLS_SCRIPT_SRC;
            script.async = true;
            script.onload = function () {
                if (window.Hls) {
                    resolve(window.Hls);
                } else {
                    reject(new Error('HLS library unavailable'));
                }
            };
            script.onerror = function () {
                reject(new Error('HLS library failed to load'));
            };
            document.head.appendChild(script);
        });

        return hlsScriptPromise;
    }

    function initMobileNavigation() {
        var button = document.querySelector('.mobile-menu-button');
        var menu = document.querySelector('.mobile-nav');

        if (!button || !menu) {
            return;
        }

        button.addEventListener('click', function () {
            var isOpen = button.classList.toggle('is-open');
            button.setAttribute('aria-expanded', String(isOpen));
            menu.hidden = !isOpen;
        });
    }

    function initHeroCarousel() {
        var carousel = document.querySelector('[data-hero-carousel]');

        if (!carousel) {
            return;
        }

        var slides = Array.prototype.slice.call(carousel.querySelectorAll('[data-hero-slide]'));
        var dots = Array.prototype.slice.call(carousel.querySelectorAll('[data-hero-dot]'));
        var prev = carousel.querySelector('[data-hero-prev]');
        var next = carousel.querySelector('[data-hero-next]');
        var index = 0;
        var timer = null;

        function show(nextIndex) {
            if (!slides.length) {
                return;
            }

            index = (nextIndex + slides.length) % slides.length;

            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle('is-active', slideIndex === index);
            });

            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle('is-active', dotIndex === index);
            });
        }

        function start() {
            stop();
            timer = window.setInterval(function () {
                show(index + 1);
            }, 5000);
        }

        function stop() {
            if (timer) {
                window.clearInterval(timer);
                timer = null;
            }
        }

        if (prev) {
            prev.addEventListener('click', function () {
                show(index - 1);
                start();
            });
        }

        if (next) {
            next.addEventListener('click', function () {
                show(index + 1);
                start();
            });
        }

        dots.forEach(function (dot, dotIndex) {
            dot.addEventListener('click', function () {
                show(dotIndex);
                start();
            });
        });

        carousel.addEventListener('mouseenter', stop);
        carousel.addEventListener('mouseleave', start);
        show(0);
        start();
    }

    function normalize(value) {
        return String(value || '').toLowerCase().trim();
    }

    function initCatalogFilters() {
        document.querySelectorAll('[data-catalog]').forEach(function (catalog) {
            var input = catalog.querySelector('[data-search-input]');
            var yearFilter = catalog.querySelector('[data-year-filter]');
            var typeFilter = catalog.querySelector('[data-type-filter]');
            var cards = Array.prototype.slice.call(catalog.querySelectorAll('.catalog-card'));
            var status = catalog.querySelector('[data-catalog-status]');

            function cardText(card) {
                return [
                    card.dataset.title,
                    card.dataset.region,
                    card.dataset.type,
                    card.dataset.year,
                    card.dataset.genre,
                    card.dataset.tags
                ].join(' ').toLowerCase();
            }

            function apply() {
                var query = normalize(input && input.value);
                var year = normalize(yearFilter && yearFilter.value);
                var type = normalize(typeFilter && typeFilter.value);
                var visible = 0;

                cards.forEach(function (card) {
                    var text = cardText(card);
                    var matchesQuery = !query || text.indexOf(query) !== -1;
                    var matchesYear = !year || normalize(card.dataset.year) === year;
                    var matchesType = !type || normalize(card.dataset.type).indexOf(type) !== -1;
                    var keep = matchesQuery && matchesYear && matchesType;

                    card.classList.toggle('is-hidden', !keep);
                    if (keep) {
                        visible += 1;
                    }
                });

                if (status) {
                    status.textContent = query || year || type ? '当前显示 ' + visible + ' 部影片' : '';
                }
            }

            if (input) {
                input.addEventListener('input', apply);
            }

            if (yearFilter) {
                yearFilter.addEventListener('change', apply);
            }

            if (typeFilter) {
                typeFilter.addEventListener('change', apply);
            }
        });
    }

    function playNative(video, source) {
        video.src = source;
        return video.play();
    }

    function playWithHls(video, source) {
        return loadHlsScript().then(function (Hls) {
            if (!Hls.isSupported()) {
                return playNative(video, source);
            }

            if (video.__hlsInstance) {
                video.__hlsInstance.destroy();
                video.__hlsInstance = null;
            }

            var hls = new Hls({
                enableWorker: true,
                lowLatencyMode: true,
                backBufferLength: 90
            });

            video.__hlsInstance = hls;

            return new Promise(function (resolve, reject) {
                hls.loadSource(source);
                hls.attachMedia(video);

                hls.on(Hls.Events.MANIFEST_PARSED, function () {
                    video.play().then(resolve).catch(reject);
                });

                hls.on(Hls.Events.ERROR, function (event, data) {
                    if (data && data.fatal) {
                        reject(new Error(data.details || 'HLS playback error'));
                    }
                });
            });
        });
    }

    function initPlayers() {
        document.querySelectorAll('[data-player]').forEach(function (player) {
            var video = player.querySelector('video');
            var overlay = player.querySelector('.player-overlay');
            var status = player.querySelector('[data-player-status]');
            var source = player.getAttribute('data-stream');

            if (!video || !overlay || !source) {
                return;
            }

            function setStatus(message) {
                if (status) {
                    status.textContent = message || '';
                }
            }

            function startPlayback() {
                setStatus('正在加载播放源...');
                overlay.disabled = true;

                var canPlayNative = video.canPlayType('application/vnd.apple.mpegurl') || video.canPlayType('application/x-mpegURL');
                var playback = canPlayNative ? playNative(video, source) : playWithHls(video, source);

                Promise.resolve(playback)
                    .then(function () {
                        overlay.classList.add('is-hidden');
                        setStatus('');
                    })
                    .catch(function () {
                        overlay.disabled = false;
                        setStatus('播放器启动失败，请稍后重试。');
                    });
            }

            overlay.addEventListener('click', startPlayback);
            video.addEventListener('play', function () {
                overlay.classList.add('is-hidden');
            });
            video.addEventListener('pause', function () {
                if (!video.ended) {
                    overlay.classList.remove('is-hidden');
                    overlay.disabled = false;
                }
            });
        });
    }

    ready(function () {
        initMobileNavigation();
        initHeroCarousel();
        initCatalogFilters();
        initPlayers();
    });
})();
