(function () {
    function ready(callback) {
        if (document.readyState !== "loading") {
            callback();
            return;
        }
        document.addEventListener("DOMContentLoaded", callback);
    }

    function setupMenu() {
        var button = document.querySelector(".menu-toggle");
        var nav = document.querySelector(".mobile-nav");
        if (!button || !nav) {
            return;
        }
        button.addEventListener("click", function () {
            nav.classList.toggle("is-open");
        });
    }

    function setupHero() {
        var slider = document.querySelector("[data-hero-slider]");
        if (!slider) {
            return;
        }
        var slides = Array.prototype.slice.call(slider.querySelectorAll(".hero-slide"));
        var dots = Array.prototype.slice.call(document.querySelectorAll(".hero-dot"));
        var prev = document.querySelector("[data-hero-prev]");
        var next = document.querySelector("[data-hero-next]");
        var index = 0;
        var timer = null;

        function show(nextIndex) {
            if (!slides.length) {
                return;
            }
            index = (nextIndex + slides.length) % slides.length;
            slides.forEach(function (slide, i) {
                slide.classList.toggle("is-active", i === index);
            });
            dots.forEach(function (dot, i) {
                dot.classList.toggle("is-active", i === index);
            });
        }

        function start() {
            clearInterval(timer);
            timer = setInterval(function () {
                show(index + 1);
            }, 5200);
        }

        if (prev) {
            prev.addEventListener("click", function () {
                show(index - 1);
                start();
            });
        }
        if (next) {
            next.addEventListener("click", function () {
                show(index + 1);
                start();
            });
        }
        dots.forEach(function (dot, i) {
            dot.addEventListener("click", function () {
                show(i);
                start();
            });
        });
        show(0);
        start();
    }

    function setupFilters() {
        var forms = Array.prototype.slice.call(document.querySelectorAll("[data-filter-panel]"));
        forms.forEach(function (panel) {
            var keyword = panel.querySelector("[data-filter-keyword]");
            var year = panel.querySelector("[data-filter-year]");
            var scope = document.querySelector(panel.getAttribute("data-filter-panel"));
            if (!scope) {
                return;
            }
            var cards = Array.prototype.slice.call(scope.querySelectorAll(".movie-card"));
            var empty = document.querySelector("[data-empty-state]");

            function normalize(value) {
                return String(value || "").toLowerCase().trim();
            }

            function apply() {
                var q = normalize(keyword && keyword.value);
                var y = normalize(year && year.value);
                var visible = 0;
                cards.forEach(function (card) {
                    var haystack = normalize([
                        card.getAttribute("data-title"),
                        card.getAttribute("data-tags"),
                        card.getAttribute("data-region")
                    ].join(" "));
                    var cardYear = normalize(card.getAttribute("data-year"));
                    var ok = (!q || haystack.indexOf(q) !== -1) && (!y || cardYear === y);
                    card.style.display = ok ? "" : "none";
                    if (ok) {
                        visible += 1;
                    }
                });
                if (empty) {
                    empty.classList.toggle("is-visible", visible === 0);
                }
            }

            if (keyword) {
                keyword.addEventListener("input", apply);
            }
            if (year) {
                year.addEventListener("change", apply);
            }
        });
    }

    function setupPlayer() {
        var player = document.querySelector("[data-player]");
        if (!player) {
            return;
        }
        var video = player.querySelector("video");
        var cover = player.querySelector(".player-cover");
        var button = player.querySelector(".play-toggle");
        if (!video) {
            return;
        }
        var stream = video.getAttribute("data-stream");
        var hlsInstance = null;

        function launch() {
            if (!stream) {
                return;
            }
            if (cover) {
                cover.classList.add("is-hidden");
            }
            if (video.canPlayType("application/vnd.apple.mpegurl")) {
                if (!video.getAttribute("src")) {
                    video.setAttribute("src", stream);
                }
                video.play().catch(function () {});
                return;
            }
            if (window.Hls && window.Hls.isSupported()) {
                if (!hlsInstance) {
                    hlsInstance = new window.Hls();
                    hlsInstance.loadSource(stream);
                    hlsInstance.attachMedia(video);
                }
                video.play().catch(function () {});
                return;
            }
            if (!video.getAttribute("src")) {
                video.setAttribute("src", stream);
            }
            video.play().catch(function () {});
        }

        if (button) {
            button.addEventListener("click", function (event) {
                event.preventDefault();
                event.stopPropagation();
                launch();
            });
        }
        if (cover) {
            cover.addEventListener("click", launch);
        }
        video.addEventListener("click", function () {
            if (video.paused) {
                launch();
            }
        });
    }

    ready(function () {
        setupMenu();
        setupHero();
        setupFilters();
        setupPlayer();
    });
})();
