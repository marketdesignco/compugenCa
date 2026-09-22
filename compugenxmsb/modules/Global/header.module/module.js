var globalHeader = document.querySelector('.global-header');

if (globalHeader) {

  var panel = globalHeader.querySelector('.global-header__panel');
  var toggle = globalHeader.querySelector('.global-header__toggle');

  function closePanel() {
    panel.classList.remove('is-open');
    toggle.setAttribute('aria-expanded', 'false');
    toggle.setAttribute('aria-label', 'Open menu');
  }

  function openPanel() {
    panel.classList.add('is-open');
    toggle.setAttribute('aria-expanded', 'true');
    toggle.setAttribute('aria-label', 'Close menu');
  }

  toggle.addEventListener('click', function () {
    if (panel.classList.contains('is-open')) {
      closePanel();
    } else {
      openPanel();
    }
  });

  var submenuItems = globalHeader.querySelectorAll('.global-header__menu-item--has-submenu');

  Array.prototype.forEach.call(submenuItems, function (item) {

    var link = item.querySelector(':scope > .global-header__menu-link');
    var submenuToggle = item.querySelector(':scope > .global-header__menu-toggle');

    function closeSubmenu() {
      item.classList.remove('global-header__menu-item--open');
      if (link) {
        link.setAttribute('aria-expanded', 'false');
      }
      if (submenuToggle) {
        submenuToggle.setAttribute('aria-expanded', 'false');
      }
    }

    function openSubmenu() {
      item.classList.add('global-header__menu-item--open');
      if (link) {
        link.setAttribute('aria-expanded', 'true');
      }
      if (submenuToggle) {
        submenuToggle.setAttribute('aria-expanded', 'true');
      }
    }

    item.addEventListener('mouseenter', function () {
      if (window.matchMedia('(min-width: 768px)').matches) {
        openSubmenu();
      }
    });

    item.addEventListener('mouseleave', function () {
      if (window.matchMedia('(min-width: 768px)').matches) {
        closeSubmenu();
      }
    });

    if (submenuToggle) {
      submenuToggle.addEventListener('click', function () {
        if (item.classList.contains('global-header__menu-item--open')) {
          closeSubmenu();
        } else {
          openSubmenu();
        }
      });
    }

  });

  document.addEventListener('keydown', function (event) {
    if (event.key !== 'Escape') {
      return;
    }
    if (panel.classList.contains('is-open')) {
      closePanel();
      toggle.focus();
    }
    Array.prototype.forEach.call(submenuItems, function (item) {
      item.classList.remove('global-header__menu-item--open');
      var link = item.querySelector(':scope > .global-header__menu-link');
      var submenuToggle = item.querySelector(':scope > .global-header__menu-toggle');
      if (link) {
        link.setAttribute('aria-expanded', 'false');
      }
      if (submenuToggle) {
        submenuToggle.setAttribute('aria-expanded', 'false');
      }
    });
  });

  document.addEventListener('click', function (event) {
    Array.prototype.forEach.call(submenuItems, function (item) {
      if (!item.contains(event.target) && item.classList.contains('global-header__menu-item--open')) {
        item.classList.remove('global-header__menu-item--open');
        var link = item.querySelector(':scope > .global-header__menu-link');
        var submenuToggle = item.querySelector(':scope > .global-header__menu-toggle');
        if (link) {
          link.setAttribute('aria-expanded', 'false');
        }
        if (submenuToggle) {
          submenuToggle.setAttribute('aria-expanded', 'false');
        }
      }
    });
  });

}
