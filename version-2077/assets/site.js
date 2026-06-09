(function () {
    function ready(fn) {
        if (document.readyState !== "loading") {
            fn();
        } else {
            document.addEventListener("DOMContentLoaded", fn);
        }
    }

    ready(function () {
        document.querySelectorAll("img").forEach(function (image) {
            image.addEventListener("error", function () {
                image.classList.add("is-missing");
            });
        });

        var toggle = document.querySelector(".mobile-toggle");
        var nav = document.querySelector(".nav-links");
        if (toggle && nav) {
            toggle.addEventListener("click", function () {
                nav.classList.toggle("is-open");
                document.body.classList.toggle("no-scroll", nav.classList.contains("is-open"));
            });
        }

        var slides = Array.prototype.slice.call(document.querySelectorAll(".hero-slide"));
        var dots = Array.prototype.slice.call(document.querySelectorAll(".hero-dot"));
        if (slides.length > 1) {
            var current = 0;
            var showSlide = function (index) {
                current = (index + slides.length) % slides.length;
                slides.forEach(function (slide, slideIndex) {
                    slide.classList.toggle("is-active", slideIndex === current);
                });
                dots.forEach(function (dot, dotIndex) {
                    dot.classList.toggle("is-active", dotIndex === current);
                });
            };
            dots.forEach(function (dot, dotIndex) {
                dot.addEventListener("click", function () {
                    showSlide(dotIndex);
                });
            });
            window.setInterval(function () {
                showSlide(current + 1);
            }, 5600);
        }

        var form = document.querySelector("[data-home-search]");
        if (form) {
            form.addEventListener("submit", function (event) {
                event.preventDefault();
                var input = form.querySelector("input");
                var query = input ? input.value.trim() : "";
                window.location.href = query ? "./movies.html?q=" + encodeURIComponent(query) : "./movies.html";
            });
        }

        var searchInput = document.querySelector("[data-search-input]");
        var genreSelect = document.querySelector("[data-genre-select]");
        var cards = Array.prototype.slice.call(document.querySelectorAll(".searchable-card"));
        var empty = document.querySelector(".search-empty");
        var params = new URLSearchParams(window.location.search);
        var initialQuery = params.get("q");
        if (searchInput && initialQuery) {
            searchInput.value = initialQuery;
        }

        var filterCards = function () {
            var query = searchInput ? searchInput.value.trim().toLowerCase() : "";
            var genre = genreSelect ? genreSelect.value : "";
            var visible = 0;
            cards.forEach(function (card) {
                var haystack = [
                    card.getAttribute("data-title") || "",
                    card.getAttribute("data-meta") || "",
                    card.getAttribute("data-tags") || ""
                ].join(" ").toLowerCase();
                var cardGenre = card.getAttribute("data-genre") || "";
                var matchQuery = !query || haystack.indexOf(query) !== -1;
                var matchGenre = !genre || cardGenre.indexOf(genre) !== -1;
                var show = matchQuery && matchGenre;
                card.style.display = show ? "" : "none";
                if (show) {
                    visible += 1;
                }
            });
            if (empty) {
                empty.classList.toggle("is-visible", visible === 0);
            }
        };

        if (searchInput || genreSelect) {
            if (searchInput) {
                searchInput.addEventListener("input", filterCards);
            }
            if (genreSelect) {
                genreSelect.addEventListener("change", filterCards);
            }
            filterCards();
        }
    });
})();
