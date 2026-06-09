(function () {
  var navButton = document.querySelector('[data-nav-toggle]');
  var mobileMenu = document.querySelector('[data-mobile-menu]');
  if (navButton && mobileMenu) {
    navButton.addEventListener('click', function () {
      mobileMenu.classList.toggle('is-open');
    });
  }

  var slides = Array.prototype.slice.call(document.querySelectorAll('[data-hero-slide]'));
  var dots = Array.prototype.slice.call(document.querySelectorAll('[data-hero-dot]'));
  if (slides.length > 0) {
    var active = 0;
    var showSlide = function (index) {
      active = index % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('is-active', slideIndex === active);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('is-active', dotIndex === active);
      });
    };
    dots.forEach(function (dot, index) {
      dot.addEventListener('click', function () {
        showSlide(index);
      });
    });
    setInterval(function () {
      showSlide(active + 1);
    }, 5200);
  }

  var filterForms = Array.prototype.slice.call(document.querySelectorAll('[data-card-filter]'));
  filterForms.forEach(function (form) {
    var keyword = form.querySelector('[data-filter-keyword]');
    var region = form.querySelector('[data-filter-region]');
    var type = form.querySelector('[data-filter-type]');
    var cards = Array.prototype.slice.call(document.querySelectorAll('[data-movie-card]'));
    var applyFilter = function () {
      var q = keyword ? keyword.value.trim().toLowerCase() : '';
      var r = region ? region.value : '';
      var t = type ? type.value : '';
      cards.forEach(function (card) {
        var text = (card.getAttribute('data-title') + ' ' + card.getAttribute('data-genre') + ' ' + card.getAttribute('data-tags')).toLowerCase();
        var regionOk = !r || card.getAttribute('data-region') === r;
        var typeOk = !t || card.getAttribute('data-type') === t;
        var keywordOk = !q || text.indexOf(q) !== -1;
        card.style.display = regionOk && typeOk && keywordOk ? '' : 'none';
      });
    };
    [keyword, region, type].forEach(function (el) {
      if (el) {
        el.addEventListener('input', applyFilter);
        el.addEventListener('change', applyFilter);
      }
    });
  });

  var globalSearch = document.querySelector('[data-global-search]');
  if (globalSearch) {
    globalSearch.addEventListener('submit', function (event) {
      var input = globalSearch.querySelector('input[name="q"]');
      if (input && input.value.trim()) {
        return;
      }
      event.preventDefault();
      window.location.href = './search.html';
    });
  }
})();
