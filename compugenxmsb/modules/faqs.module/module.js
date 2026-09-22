(function () {
  'use strict';

  var instanceCounter = 0;

  function setOpen(item, button, panel, isOpen) {
    item.classList.toggle('faqs__item--open', isOpen);
    button.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
    if (isOpen) {
      panel.removeAttribute('hidden');
    } else {
      panel.setAttribute('hidden', '');
    }
  }

  function toggle(items, buttons, panels, index) {
    var willOpen = buttons[index].getAttribute('aria-expanded') !== 'true';
    for (var i = 0; i < buttons.length; i++) {
      setOpen(items[i], buttons[i], panels[i], i === index && willOpen);
    }
  }

  function initFaqs(root) {
    var items = root.querySelectorAll('[data-faqs-item]');
    var buttons = root.querySelectorAll('[data-faqs-button]');
    var panels = root.querySelectorAll('[data-faqs-panel]');

    if (!buttons.length || buttons.length !== panels.length) {
      return;
    }

    instanceCounter += 1;
    var instanceId = 'faqs-' + instanceCounter;

    for (var i = 0; i < buttons.length; i++) {
      var buttonId = instanceId + '-question-' + i;
      var panelId = instanceId + '-answer-' + i;
      buttons[i].id = buttonId;
      panels[i].id = panelId;
      buttons[i].setAttribute('aria-controls', panelId);
      panels[i].setAttribute('aria-labelledby', buttonId);

      (function (index) {
        buttons[index].addEventListener('click', function () {
          toggle(items, buttons, panels, index);
        });

        buttons[index].addEventListener('keydown', function (event) {
          var nextIndex = null;

          switch (event.key) {
            case 'ArrowUp':
              nextIndex = (index - 1 + buttons.length) % buttons.length;
              break;
            case 'ArrowDown':
              nextIndex = (index + 1) % buttons.length;
              break;
            case 'Home':
              nextIndex = 0;
              break;
            case 'End':
              nextIndex = buttons.length - 1;
              break;
            default:
              return;
          }

          event.preventDefault();
          buttons[nextIndex].focus();
        });
      })(i);
    }

    // Panels render without `hidden` in the server-rendered HTML (see
    // module.css) so content stays visible if this script never runs.
    // Once it does run, only the first item's answer should actually be
    // shown - setOpen() both sets the initial hidden state and reconciles
    // aria-expanded/the open modifier class in one pass.
    for (var j = 0; j < buttons.length; j++) {
      setOpen(items[j], buttons[j], panels[j], j === 0);
    }
  }

  function init() {
    var instances = document.querySelectorAll('.faqs');
    for (var i = 0; i < instances.length; i++) {
      initFaqs(instances[i]);
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
