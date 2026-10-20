(function () {
  'use strict';

  // Same loading approach as carousel-cards.module/module.js: jQuery and
  // Slick come from separate CDN requests, so wait for both by polling
  // instead of a fixed delay. Until Slick initializes (or if it never
  // does), the cards stay a plain stacked list - visible, readable and
  // keyboard reachable.

  function prefersReducedMotion() {
    return !!(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  }

  function buildConfig(root) {
    var desktop = parseInt(root.getAttribute('data-slides-desktop'), 10);
    if (!desktop || desktop < 2 || desktop > 4) {
      desktop = 3;
    }
    var large = Math.min(desktop, 3);
    var tablet = Math.min(desktop, 2);

    // slidesToScroll always equals slidesToShow, so each dash is one
    // screen of cards. infinite is off so Slick never clones cards (cloned
    // links would be announced twice). No arrows/autoplay: not in the
    // design; dashes, swipe/drag and arrow keys (accessibility: true)
    // cover navigation. rows: 0 stops Slick 1.8.1 from wrapping every
    // slide in two extra divs, so cards can stretch to equal heights.
    return {
      accessibility: true,
      arrows: false,
      autoplay: false,
      dots: root.getAttribute('data-pagination') === 'true',
      dotsClass: 'carousel-icon-cards__dots',
      customPaging: function () {
        return '<button type="button" class="carousel-icon-cards__dash"></button>';
      },
      infinite: false,
      rows: 0,
      speed: prefersReducedMotion() ? 0 : 300,
      slidesToShow: desktop,
      slidesToScroll: desktop,
      responsive: [
        { breakpoint: 1200, settings: { slidesToShow: large, slidesToScroll: large } },
        { breakpoint: 992, settings: { slidesToShow: tablet, slidesToScroll: tablet } },
        { breakpoint: 768, settings: { slidesToShow: 1, slidesToScroll: 1 } }
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
    var instances = document.querySelectorAll('[data-carousel-icon-cards]');
    if (!instances.length) {
      return;
    }

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
