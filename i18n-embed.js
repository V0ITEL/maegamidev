/* Shared RU->EN/UK i18n for embedded pages (calc + animations).
   Each page sets window.I18N_EN = { "ru text": "en text", ... } and optionally
   window.I18N_UK = { "ru text": "uk text", ... }, plus pattern lists
   window.I18N_PAT (EN) / window.I18N_PAT_UK (UK) before loading this.
   Reacts to re-renders (MutationObserver) and live toggle from the parent
   (storage event on key "lang", shared because same origin). */
(function () {
  // Fold all dash variants (hyphen, non-breaking hyphen, en/em dash) to ASCII '-'
  // and collapse whitespace, so a key matches the DOM text regardless of which
  // dash glyph or spacing is used. Applied to keys AND DOM text, never to output.
  function norm(s) { return s.replace(/[‐‑‒–—―−]/g, '-').replace(/\s+/g, ' ').trim(); }

  function normKeys(map) {
    var out = {};
    for (var k in map) { if (Object.prototype.hasOwnProperty.call(map, k)) out[norm(k)] = map[k]; }
    return out;
  }

  var DICT = { en: normKeys(window.I18N_EN || {}), uk: normKeys(window.I18N_UK || {}) };
  var PAT = { en: window.I18N_PAT || [], uk: window.I18N_PAT_UK || [] };
  var lang = 'ru', raf = null;

  function translate(src, l) {
    var lead = (src.match(/^\s*/) || [''])[0];
    var trail = (src.match(/\s*$/) || [''])[0];
    var core = norm(src);
    var dict = DICT[l];
    if (Object.prototype.hasOwnProperty.call(dict, core)) return lead + dict[core] + trail;
    var pats = PAT[l], out = src, changed = false;
    for (var i = 0; i < pats.length; i++) {
      var n = out.replace(pats[i].re, pats[i].to);
      if (n !== out) { out = n; changed = true; }
    }
    return changed ? out : null;
  }

  function each(fn) {
    if (!document.body) return;
    var w = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, {
      acceptNode: function (n) {
        var t = n.parentNode && n.parentNode.nodeName;
        if (t === 'SCRIPT' || t === 'STYLE') return NodeFilter.FILTER_REJECT;
        return (n.nodeValue && n.nodeValue.trim()) ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_REJECT;
      }
    });
    var n; while ((n = w.nextNode())) fn(n);
  }

  function apply(l) {
    each(function (n) {
      var src = (n.__ru != null) ? n.__ru : n.nodeValue;
      var t = translate(src, l);
      if (t != null) {
        if (n.__ru == null) n.__ru = src;
        if (n.nodeValue !== t) n.nodeValue = t;
      } else if (n.__ru != null) {
        n.nodeValue = n.__ru; n.__ru = null;
      }
    });
  }

  function restoreRU() {
    each(function (n) { if (n.__ru != null) { n.nodeValue = n.__ru; n.__ru = null; } });
  }

  function cur() {
    try {
      var saved = localStorage.getItem('lang');
      if (saved) return saved;
    } catch (e) {}
    var nl = (navigator.language || '').toLowerCase();
    if (nl.indexOf('uk') === 0) return 'uk';
    if (/^(ru|be)/.test(nl)) return 'ru';
    return 'en';
  }

  function set(l) { lang = l; if (l === 'en' || l === 'uk') apply(l); else restoreRU(); }
  function schedule() {
    if ((lang !== 'en' && lang !== 'uk') || raf) return;
    raf = requestAnimationFrame(function () { raf = null; apply(lang); });
  }

  function init() {
    set(cur());
    new MutationObserver(schedule).observe(document.body, { childList: true, subtree: true, characterData: true });
    window.addEventListener('storage', function (e) { if (e.key === 'lang') set(cur()); });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
