(function () {

  var DESKTOP_QUERY = '(min-width: 1100px)';
  var HOVER_QUERY = '(hover: hover) and (pointer: fine)';
  var CLOSE_DELAY = 150;

  function onMediaChange(media, handler) {
    if (media.addEventListener) {
      media.addEventListener('change', handler);
    } else if (media.addListener) {
      media.addListener(handler);
    }
  }

  function initMegamenu(root) {

    var desktopMedia = window.matchMedia(DESKTOP_QUERY);
    var hoverMedia = window.matchMedia(HOVER_QUERY);
    var toggle = root.querySelector('.global-megamenu__toggle');
    var items = root.querySelectorAll('.global-megamenu__item--has-panel');
    var closeTimer = null;
    var labelOpen = root.getAttribute('data-label-open') || 'Open menu';
    var labelClose = root.getAttribute('data-label-close') || 'Close menu';

    function usesHover() {
      return desktopMedia.matches && hoverMedia.matches;
    }

    function getTrigger(item) {
      return item.querySelector('.global-megamenu__trigger');
    }

    function getPanel(item) {
      return item.querySelector('.global-megamenu__panel');
    }

    // "Centered under this menu item" panels: nudge back inside the viewport
    function clampPanel(item) {
      var panel = getPanel(item);
      panel.style.removeProperty('--global-megamenu-shift');
      if (!desktopMedia.matches || !item.classList.contains('global-megamenu__item--align-item')) {
        return;
      }
      var rect = panel.getBoundingClientRect();
      var viewportWidth = document.documentElement.clientWidth;
      var shift = 0;
      if (rect.right > viewportWidth) {
        shift = viewportWidth - rect.right;
      }
      if (rect.left + shift < 0) {
        shift = -rect.left;
      }
      if (shift) {
        panel.style.setProperty('--global-megamenu-shift', shift + 'px');
      }
    }

    function setItem(item, open) {
      if (open) {
        item.classList.add('is-open');
      } else {
        item.classList.remove('is-open');
      }
      getTrigger(item).setAttribute('aria-expanded', open ? 'true' : 'false');
      if (open) {
        clampPanel(item);
      }
    }

    function closeAll(except) {
      Array.prototype.forEach.call(items, function (item) {
        if (item !== except && item.classList.contains('is-open')) {
          setItem(item, false);
        }
      });
    }

    function openItem(item) {
      closeAll(item);
      setItem(item, true);
    }

    function getOpenItem() {
      return root.querySelector('.global-megamenu__item--has-panel.is-open');
    }

    function cancelClose() {
      if (closeTimer) {
        window.clearTimeout(closeTimer);
        closeTimer = null;
      }
    }

    function isDrawerOpen() {
      return root.classList.contains('global-megamenu--drawer-open');
    }

    function setDrawer(open) {
      if (!toggle) {
        return;
      }
      if (open) {
        root.classList.add('global-megamenu--drawer-open');
        document.body.classList.add('global-megamenu-scroll-locked');
      } else {
        root.classList.remove('global-megamenu--drawer-open');
        document.body.classList.remove('global-megamenu-scroll-locked');
        closeAll();
      }
      toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
      toggle.setAttribute('aria-label', open ? labelClose : labelOpen);
    }

    if (toggle) {
      toggle.addEventListener('click', function () {
        setDrawer(!isDrawerOpen());
      });
    }

    Array.prototype.forEach.call(items, function (item) {

      var trigger = getTrigger(item);

      trigger.addEventListener('click', function (event) {
        // A mouse click while hover already opened the panel keeps it open
        // (event.detail is 0 for keyboard-activated clicks, which toggle)
        if (usesHover() && event.detail !== 0) {
          openItem(item);
          return;
        }
        if (item.classList.contains('is-open')) {
          setItem(item, false);
        } else {
          openItem(item);
        }
      });

      item.addEventListener('mouseenter', function () {
        if (!usesHover()) {
          return;
        }
        cancelClose();
        openItem(item);
      });

      item.addEventListener('mouseleave', function () {
        if (!usesHover()) {
          return;
        }
        cancelClose();
        closeTimer = window.setTimeout(function () {
          setItem(item, false);
          closeTimer = null;
        }, CLOSE_DELAY);
      });

      item.addEventListener('focusout', function () {
        if (!desktopMedia.matches) {
          return;
        }
        window.setTimeout(function () {
          // A click on non-focusable panel space blurs the trigger - keep the
          // panel while the pointer is still over it
          if (!item.contains(document.activeElement) && !(usesHover() && item.matches(':hover'))) {
            setItem(item, false);
          }
        }, 0);
      });

    });

    document.addEventListener('keydown', function (event) {
      if (event.key !== 'Escape' && event.key !== 'Esc') {
        return;
      }
      var openItemEl = getOpenItem();
      if (openItemEl) {
        var hadFocus = openItemEl.contains(document.activeElement);
        setItem(openItemEl, false);
        if (hadFocus) {
          getTrigger(openItemEl).focus();
        }
        return;
      }
      if (isDrawerOpen()) {
        setDrawer(false);
        toggle.focus();
      }
    });

    document.addEventListener('click', function (event) {
      if (root.contains(event.target)) {
        return;
      }
      if (desktopMedia.matches) {
        closeAll();
      } else if (isDrawerOpen()) {
        setDrawer(false);
      }
    });

    window.addEventListener('resize', function () {
      var openItemEl = getOpenItem();
      if (openItemEl) {
        clampPanel(openItemEl);
      }
    });

    onMediaChange(desktopMedia, function () {
      cancelClose();
      closeAll();
      setDrawer(false);
    });

  }

  Array.prototype.forEach.call(document.querySelectorAll('[data-global-megamenu]'), initMegamenu);

})();
