(function () {
  'use strict';

  // Resource listing: topic/type filter + search + pagination, all in the browser.
  // HubL renders every card (from several blogs) with data-type (its blog),
  // data-tags (tag slugs), data-date (timestamp) and data-search (a lowercase
  // title/meta description/tags string). This script shows/hides cards, so it
  // does not depend on the server reading the URL query string. The URL is
  // kept in sync (?topic=&type=&q=&page=) and read again on load, so filtered
  // views can be shared. Without JS every card stays visible.

  var SEARCH_DEBOUNCE_MS = 250;

  function readParams() {
    var out = { topic: '', type: '', q: '', page: 1 };
    var query = window.location.search.replace(/^\?/, '');
    if (!query) { return out; }
    var pairs = query.split('&');
    for (var i = 0; i < pairs.length; i++) {
      var kv = pairs[i].split('=');
      var key = decodeURIComponent(kv[0] || '');
      var val = decodeURIComponent((kv[1] || '').replace(/\+/g, ' '));
      if (key === 'topic' || key === 'type' || key === 'q') {
        out[key] = val;
      } else if (key === 'page') {
        var n = parseInt(val, 10);
        out.page = n > 0 ? n : 1;
      }
    }
    return out;
  }

  function buildQuery(state, page) {
    var parts = [];
    if (state.q) { parts.push('q=' + encodeURIComponent(state.q)); }
    if (state.topic) { parts.push('topic=' + encodeURIComponent(state.topic)); }
    if (state.type) { parts.push('type=' + encodeURIComponent(state.type)); }
    if (page > 1) { parts.push('page=' + page); }
    return parts.length ? '?' + parts.join('&') : window.location.pathname;
  }

  function init(root) {
    var form = root.querySelector('[data-resource-listing-filters]');
    var grid = root.querySelector('[data-resource-listing-grid]');
    var emptyEl = root.querySelector('[data-resource-listing-empty]');
    var pagerEl = root.querySelector('[data-resource-listing-pagination]');
    var statusEl = root.querySelector('[data-resource-listing-status]');
    if (!grid) { return; }

    // Cards arrive grouped by blog: sort them newest first (stable on ties).
    var cards = Array.prototype.slice.call(grid.querySelectorAll('[data-resource-listing-card]'));
    var order = cards.map(function (card, index) { return { card: card, index: index }; });
    order.sort(function (a, b) {
      var da = parseInt(a.card.getAttribute('data-date'), 10) || 0;
      var db = parseInt(b.card.getAttribute('data-date'), 10) || 0;
      return db - da || a.index - b.index;
    });
    cards = order.map(function (item) { return item.card; });
    cards.forEach(function (card) { grid.appendChild(card); });
    var perPage = parseInt(root.getAttribute('data-per-page'), 10);
    if (!(perPage > 0)) { perPage = 12; }

    var topicSelect = form ? form.querySelector('select[name="topic"]') : null;
    var typeSelect = form ? form.querySelector('select[name="type"]') : null;
    var searchInput = form ? form.querySelector('input[name="q"]') : null;

    // Topics come from several blogs in discovery order: list them A-Z.
    if (topicSelect) {
      var opts = Array.prototype.slice.call(topicSelect.options, 1);
      opts.sort(function (a, b) {
        var ta = a.text.toLowerCase();
        var tb = b.text.toLowerCase();
        return ta < tb ? -1 : (ta > tb ? 1 : 0);
      });
      opts.forEach(function (opt) { topicSelect.appendChild(opt); });
    }

    var state = readParams();

    function hasOption(select, value) {
      if (!select) { return false; }
      for (var i = 0; i < select.options.length; i++) {
        if (select.options[i].value === value) { return true; }
      }
      return false;
    }

    // Reflect the URL state in the controls (ignore unknown tag slugs).
    if (topicSelect) {
      if (hasOption(topicSelect, state.topic)) { topicSelect.value = state.topic; } else { state.topic = ''; }
    } else {
      state.topic = '';
    }
    if (typeSelect) {
      if (hasOption(typeSelect, state.type)) { typeSelect.value = state.type; } else { state.type = ''; }
    } else {
      state.type = '';
    }
    if (searchInput) { searchInput.value = state.q; }

    function matches(card) {
      var tags = ' ' + (card.getAttribute('data-tags') || '') + ' ';
      if (state.topic && tags.indexOf(' ' + state.topic + ' ') === -1) { return false; }
      if (state.type && card.getAttribute('data-type') !== state.type) { return false; }
      if (state.q) {
        var haystack = card.getAttribute('data-search') || '';
        var terms = state.q.toLowerCase().split(/\s+/);
        for (var i = 0; i < terms.length; i++) {
          if (terms[i] && haystack.indexOf(terms[i]) === -1) { return false; }
        }
      }
      return true;
    }

    function pageLink(label, page, className, ariaLabel) {
      var a = document.createElement('a');
      a.className = className;
      a.href = buildQuery(state, page);
      a.setAttribute('data-page', String(page));
      if (ariaLabel) { a.setAttribute('aria-label', ariaLabel); }
      a.innerHTML = label;
      return a;
    }

    function renderPager(totalPages) {
      if (!pagerEl) { return; }
      pagerEl.innerHTML = '';
      if (totalPages <= 1) { pagerEl.hidden = true; return; }

      var current = state.page;
      var chevronPrev = '<svg viewBox="0 0 8 12" width="8" height="12" fill="none" aria-hidden="true"><path d="M6.5 1L1.5 6l5 5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>';
      var chevronNext = '<svg viewBox="0 0 8 12" width="8" height="12" fill="none" aria-hidden="true"><path d="M1.5 1l5 5-5 5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>';

      if (current > 1) {
        pagerEl.appendChild(pageLink(chevronPrev, current - 1, 'resource-listing__page-link resource-listing__page-link--prev', 'Previous page'));
      }

      var ul = document.createElement('ul');
      ul.className = 'resource-listing__page-numbers';

      var winStart = current - 2;
      var winEnd = current + 2;
      if (winStart < 1) { winEnd += (1 - winStart); winStart = 1; }
      if (winEnd > totalPages) { winStart -= (winEnd - totalPages); winEnd = totalPages; }
      if (winStart < 1) { winStart = 1; }

      function addItem(node) {
        var li = document.createElement('li');
        li.appendChild(node);
        ul.appendChild(li);
      }
      function addEllipsis() {
        var li = document.createElement('li');
        li.className = 'resource-listing__page-ellipsis';
        li.setAttribute('aria-hidden', 'true');
        li.innerHTML = '&hellip;';
        ul.appendChild(li);
      }

      if (winStart > 1) {
        addItem(pageLink('1', 1, 'resource-listing__page-number', 'Page 1'));
        if (winStart > 2) { addEllipsis(); }
      }
      for (var p = winStart; p <= winEnd; p++) {
        if (p === current) {
          var span = document.createElement('span');
          span.className = 'resource-listing__page-number is-current';
          span.setAttribute('aria-current', 'page');
          span.textContent = String(p);
          addItem(span);
        } else {
          addItem(pageLink(String(p), p, 'resource-listing__page-number', 'Page ' + p));
        }
      }
      if (winEnd < totalPages) {
        if (winEnd < totalPages - 1) { addEllipsis(); }
        addItem(pageLink(String(totalPages), totalPages, 'resource-listing__page-number', 'Page ' + totalPages));
      }
      pagerEl.appendChild(ul);

      if (current < totalPages) {
        pagerEl.appendChild(pageLink(chevronNext, current + 1, 'resource-listing__page-link resource-listing__page-link--next', 'Next page'));
      }
      pagerEl.hidden = false;
    }

    function render() {
      var matched = [];
      for (var i = 0; i < cards.length; i++) {
        if (matches(cards[i])) { matched.push(cards[i]); }
      }
      var totalPages = Math.max(1, Math.ceil(matched.length / perPage));
      if (state.page > totalPages) { state.page = totalPages; }
      if (state.page < 1) { state.page = 1; }

      var start = (state.page - 1) * perPage;
      var stop = start + perPage;
      for (var c = 0; c < cards.length; c++) { cards[c].hidden = true; }
      for (var m = 0; m < matched.length; m++) {
        matched[m].hidden = !(m >= start && m < stop);
      }

      grid.hidden = matched.length === 0;
      if (emptyEl) { emptyEl.hidden = matched.length !== 0; }
      renderPager(totalPages);

      if (statusEl) {
        statusEl.textContent = matched.length + (matched.length === 1 ? ' article' : ' articles') +
          (totalPages > 1 ? ', page ' + state.page + ' of ' + totalPages : '');
      }

      try {
        if (window.history && window.history.replaceState) {
          window.history.replaceState(null, '', buildQuery(state, state.page));
        }
      } catch (e) {
        // URL sync is optional (e.g. blocked history API); filtering still works.
      }
    }

    function applyFilters() {
      state.topic = topicSelect ? topicSelect.value : '';
      state.type = typeSelect ? typeSelect.value : '';
      state.q = searchInput ? searchInput.value.replace(/^\s+|\s+$/g, '') : '';
      state.page = 1;
      render();
    }

    if (topicSelect) { topicSelect.addEventListener('change', applyFilters); }
    if (typeSelect) { typeSelect.addEventListener('change', applyFilters); }
    if (searchInput) {
      var timer = null;
      searchInput.addEventListener('input', function () {
        window.clearTimeout(timer);
        timer = window.setTimeout(applyFilters, SEARCH_DEBOUNCE_MS);
      });
    }
    if (form) {
      form.addEventListener('submit', function (event) {
        event.preventDefault();
        applyFilters();
      });
    }

    if (pagerEl) {
      pagerEl.addEventListener('click', function (event) {
        var link = event.target;
        while (link && link !== pagerEl && !(link.getAttribute && link.getAttribute('data-page'))) {
          link = link.parentNode;
        }
        if (!link || link === pagerEl) { return; }
        event.preventDefault();
        state.page = parseInt(link.getAttribute('data-page'), 10) || 1;
        render();
        if (grid.scrollIntoView) { grid.scrollIntoView({ behavior: 'smooth', block: 'start' }); }
      });
    }

    render();
  }

  function boot() {
    var roots = document.querySelectorAll('[data-resource-listing]');
    for (var i = 0; i < roots.length; i++) { init(roots[i]); }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})();
