(function () {
  'use strict';

  var instanceCounter = 0;

  function activate(tabs, panels, index) {
    for (var i = 0; i < tabs.length; i++) {
      var isActive = i === index;
      tabs[i].classList.toggle('tabs__nav-item--active', isActive);
      tabs[i].setAttribute('aria-selected', isActive ? 'true' : 'false');
      tabs[i].setAttribute('tabindex', isActive ? '0' : '-1');
      if (isActive) {
        panels[i].removeAttribute('hidden');
      } else {
        panels[i].setAttribute('hidden', '');
      }
    }
  }

  function initTabs(root) {
    var tabs = root.querySelectorAll('[data-tabs-tab]');
    var panels = root.querySelectorAll('[data-tabs-panel]');

    if (!tabs.length || tabs.length !== panels.length) {
      return;
    }

    instanceCounter += 1;
    var instanceId = 'tabs-' + instanceCounter;

    for (var i = 0; i < tabs.length; i++) {
      var tabId = instanceId + '-tab-' + i;
      var panelId = instanceId + '-panel-' + i;
      tabs[i].id = tabId;
      panels[i].id = panelId;
      tabs[i].setAttribute('aria-controls', panelId);
      panels[i].setAttribute('aria-labelledby', tabId);
      tabs[i].setAttribute('tabindex', i === 0 ? '0' : '-1');

      (function (index) {
        tabs[index].addEventListener('click', function () {
          activate(tabs, panels, index);
        });

        tabs[index].addEventListener('keydown', function (event) {
          var nextIndex = null;

          switch (event.key) {
            case 'ArrowUp':
            case 'ArrowLeft':
              nextIndex = (index - 1 + tabs.length) % tabs.length;
              break;
            case 'ArrowDown':
            case 'ArrowRight':
              nextIndex = (index + 1) % tabs.length;
              break;
            case 'Home':
              nextIndex = 0;
              break;
            case 'End':
              nextIndex = tabs.length - 1;
              break;
            case 'Enter':
            case ' ':
              event.preventDefault();
              activate(tabs, panels, index);
              return;
            default:
              return;
          }

          event.preventDefault();
          activate(tabs, panels, nextIndex);
          tabs[nextIndex].focus();
        });
      })(i);
    }

    // Panels render without `hidden` in the server-rendered HTML (see
    // module.css) so content stays visible if this script never runs.
    // Once it does run, only the first tab's panel should actually be
    // shown - activate(0) both sets the initial hidden state and
    // reconciles aria-selected/tabindex/active classes in one pass.
    activate(tabs, panels, 0);
  }

  function init() {
    var instances = document.querySelectorAll('.tabs');
    for (var i = 0; i < instances.length; i++) {
      initTabs(instances[i]);
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
