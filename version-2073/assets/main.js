document.addEventListener("DOMContentLoaded", function () {
  const menuButton = document.querySelector(".menu-toggle");
  const mobileMenu = document.querySelector(".mobile-menu");

  if (menuButton && mobileMenu) {
    menuButton.addEventListener("click", function () {
      mobileMenu.classList.toggle("is-open");
    });
  }

  const hero = document.querySelector("[data-hero]");

  if (hero) {
    const slides = Array.from(hero.querySelectorAll(".hero-slide"));
    const dots = Array.from(hero.querySelectorAll(".hero-dot"));
    const prev = hero.querySelector(".hero-prev");
    const next = hero.querySelector(".hero-next");
    let active = 0;
    let timer = null;

    function showSlide(index) {
      active = (index + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle("is-active", i === active);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle("is-active", i === active);
      });
    }

    function startTimer() {
      timer = window.setInterval(function () {
        showSlide(active + 1);
      }, 5200);
    }

    function resetTimer() {
      if (timer) {
        window.clearInterval(timer);
      }
      startTimer();
    }

    dots.forEach(function (dot, i) {
      dot.addEventListener("click", function () {
        showSlide(i);
        resetTimer();
      });
    });

    if (prev) {
      prev.addEventListener("click", function () {
        showSlide(active - 1);
        resetTimer();
      });
    }

    if (next) {
      next.addEventListener("click", function () {
        showSlide(active + 1);
        resetTimer();
      });
    }

    if (slides.length > 1) {
      startTimer();
    }
  }

  document.querySelectorAll("[data-filter-input]").forEach(function (input) {
    const targetSelector = input.getAttribute("data-filter-target");
    const target = targetSelector ? document.querySelector(targetSelector) : null;

    if (!target) {
      return;
    }

    const cards = Array.from(target.querySelectorAll("[data-card]"));

    input.addEventListener("input", function () {
      const value = input.value.trim().toLowerCase();

      cards.forEach(function (card) {
        const haystack = [
          card.getAttribute("data-title"),
          card.getAttribute("data-tags"),
          card.getAttribute("data-year"),
          card.getAttribute("data-region"),
          card.getAttribute("data-type")
        ].join(" ").toLowerCase();

        card.style.display = haystack.includes(value) ? "" : "none";
      });
    });
  });

  const results = document.querySelector("#search-results");
  const searchTitle = document.querySelector("#search-title");
  const searchInput = document.querySelector("#search-page-input");

  if (results && Array.isArray(window.MOVIE_SEARCH_DATA)) {
    const params = new URLSearchParams(window.location.search);
    const query = (params.get("q") || "").trim();

    if (searchInput) {
      searchInput.value = query;
    }

    const normalized = query.toLowerCase();
    let items = window.MOVIE_SEARCH_DATA;

    if (normalized) {
      items = items.filter(function (item) {
        return [item.title, item.region, item.type, item.year, item.genre, item.tags].join(" ").toLowerCase().includes(normalized);
      });
    } else {
      items = items.slice(0, 96);
    }

    if (searchTitle) {
      searchTitle.textContent = normalized ? "搜索结果" : "热门推荐";
    }

    results.innerHTML = items.map(function (item) {
      return [
        '<article class="movie-card small-card">',
        '<a class="poster" href="' + escapeHtml(item.url) + '">',
        '<img src="' + escapeHtml(item.cover) + '" alt="' + escapeHtml(item.title) + '" loading="lazy">',
        '<span class="rating">' + escapeHtml(item.rating) + '</span>',
        '</a>',
        '<div class="card-body">',
        '<div class="card-meta"><span>' + escapeHtml(item.year) + '</span><span>' + escapeHtml(item.region) + '</span><span>' + escapeHtml(item.duration) + '</span></div>',
        '<h2><a href="' + escapeHtml(item.url) + '">' + escapeHtml(item.title) + '</a></h2>',
        '<p>' + escapeHtml(item.oneLine) + '</p>',
        '<div class="tag-line">' + item.tags.split(" ").slice(0, 3).map(function (tag) { return '<span>' + escapeHtml(tag) + '</span>'; }).join("") + '</div>',
        '</div>',
        '</article>'
      ].join("");
    }).join("");
  }
});

function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, function (char) {
    return {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;"
    }[char];
  });
}
