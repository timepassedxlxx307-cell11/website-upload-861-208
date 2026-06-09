(function () {
  var menuButton = document.querySelector("[data-menu-button]");
  var siteNav = document.querySelector("[data-site-nav]");

  if (menuButton && siteNav) {
    menuButton.addEventListener("click", function () {
      siteNav.classList.toggle("is-open");
    });
  }

  document.querySelectorAll("[data-search-scope]").forEach(function (scope) {
    var input = scope.querySelector("[data-search-input]");
    var buttons = Array.prototype.slice.call(scope.querySelectorAll("[data-filter-kind]"));
    var cards = Array.prototype.slice.call(scope.querySelectorAll("[data-card]"));
    var activeKind = "all";

    function applyFilter() {
      var query = input ? input.value.trim().toLowerCase() : "";

      cards.forEach(function (card) {
        var text = (card.getAttribute("data-search-text") || "").toLowerCase();
        var kind = card.getAttribute("data-kind") || "movie";
        var matchQuery = !query || text.indexOf(query) !== -1;
        var matchKind = activeKind === "all" || kind === activeKind;
        card.classList.toggle("hidden-by-filter", !(matchQuery && matchKind));
      });
    }

    if (input) {
      input.addEventListener("input", applyFilter);
    }

    buttons.forEach(function (button) {
      button.addEventListener("click", function () {
        activeKind = button.getAttribute("data-filter-kind") || "all";
        buttons.forEach(function (item) {
          item.classList.toggle("is-active", item === button);
        });
        applyFilter();
      });
    });
  });

  document.querySelectorAll("[data-hero]").forEach(function (hero) {
    var slides = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-slide]"));
    var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-dot]"));
    var index = 0;

    function activate(nextIndex) {
      if (!slides.length) {
        return;
      }

      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle("is-active", slideIndex === index);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle("is-active", dotIndex === index);
      });
    }

    dots.forEach(function (dot, dotIndex) {
      dot.addEventListener("click", function () {
        activate(dotIndex);
      });
    });

    if (slides.length > 1) {
      window.setInterval(function () {
        activate(index + 1);
      }, 5600);
    }
  });
})();
