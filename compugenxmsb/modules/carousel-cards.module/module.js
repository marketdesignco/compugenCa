(function () {
  'use strict';

  function buildConfig(root) {
    var desktopSlides = parseInt(root.getAttribute('data-slides-desktop'), 10);
    if (!desktopSlides || desktopSlides < 1) {
      desktopSlides = 4;
    }

    return {
      accessibility: true,
      arrows: true,
      dots: false,
      infinite: true,
      slidesToScroll: 1,
      slidesToShow: desktopSlides,
      prevArrow:
        '<button type="button" class="carousel-cards__arrow carousel-cards__arrow--prev" aria-label="Previous cards">&lsaquo;</button>',
      nextArrow:
        '<button type="button" class="carousel-cards__arrow carousel-cards__arrow--next" aria-label="Next cards">&rsaquo;</button>',
      responsive: [
        { breakpoint: 1200, settings: { slidesToShow: Math.min(desktopSlides, 3) } },
        { breakpoint: 992, settings: { slidesToShow: Math.min(desktopSlides, 2) } },
        { breakpoint: 768, settings: { slidesToShow: 1 } }
      ]
    };
  }

  function initCarousel(root) {
    if (root.getAttribute('data-carousel-initialized') === 'true') {
      return;
    }

    var list = root.querySelector('[data-carousel-track]');
    if (!list) {
      return;
    }

    window.jQuery(list).slick(buildConfig(root));
    root.setAttribute('data-carousel-initialized', 'true');
  }

  function whenSlickReady(callback, attemptsLeft) {
    attemptsLeft = typeof attemptsLeft === 'number' ? attemptsLeft : 50;

    if (window.jQuery && window.jQuery.fn && window.jQuery.fn.slick) {
      callback();
      return;
    }

    if (attemptsLeft <= 0) {
      return;
    }

    setTimeout(function () {
      whenSlickReady(callback, attemptsLeft - 1);
    }, 100);
  }

  function init() {
    var instances = document.querySelectorAll('[data-carousel-cards]');
    if (!instances.length) {
      return;
    }

    // Cards render as a plain stacked list until Slick actually
    // initializes (see module.css) - if the CDN scripts are ever blocked
    // or slow, content stays visible and readable instead of being
    // silently hidden with no way to reveal it, same progressive-
    // enhancement principle as this theme's other module.js files
    // (SKILL.md section 11.1). Polling (rather than a fixed delay) is
    // needed here specifically because jQuery/Slick load from separate
    // CDN requests this module has no control over the timing of.
    whenSlickReady(function () {
      for (var i = 0; i < instances.length; i++) {
        initCarousel(instances[i]);
      }
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
