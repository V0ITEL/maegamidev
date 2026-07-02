/* Shared RU->EN i18n for embedded pages (calc + animations).
   Each page sets window.I18N_EN = { "ru text": "en text", ... } and
   optionally window.I18N_PAT = [ { re:/.../g, to:"..." } ] before loading this.
   Reacts to re-renders (MutationObserver) and live toggle from the parent
   (storage event on key "lang", shared because same origin). */
(function () {
  var EN = window.I18N_EN || {};
  var PAT = window.I18N_PAT || [];
  var lang = 'ru', raf = null;

  // Fold all dash variants (hyphen, non-breaking hyphen, en/em dash) to ASCII '-'
  // and collapse whitespace, so a key matches the DOM text regardless of which
  // dash glyph or spacing is used. Applied to keys AND DOM text, never to output.
  function norm(s) { return s.replace(/[‐‑‒–—―−]/g, '-').replace(/\s+/g, ' ').trim(); }

  // Normalize the map keys once so lookups are dash/space agnostic.
  var ENn = {};
  for (var __k in EN) { if (Object.prototype.hasOwnProperty.call(EN, __k)) ENn[norm(__k)] = EN[__k]; }

  function toEN(s) {
    var lead = (s.match(/^\s*/) || [''])[0];
    var trail = (s.match(/\s*$/) || [''])[0];
    var core = norm(s);
    if (Object.prototype.hasOwnProperty.call(ENn, core)) return lead + ENn[core] + trail;
    var out = s, changed = false;
    for (var i = 0; i < PAT.length; i++) {
      var n = out.replace(PAT[i].re, PAT[i].to);
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

  function applyEN() { each(function (n) { var en = toEN(n.nodeValue); if (en != null) { n.__ru = n.nodeValue; n.nodeValue = en; } }); }
  function restoreRU() { each(function (n) { if (n.__ru != null) { n.nodeValue = n.__ru; n.__ru = null; } }); }

  function cur() {
    try { return localStorage.getItem('lang') || (/^(ru|uk|be)/i.test(navigator.language || '') ? 'ru' : 'en'); }
    catch (e) { return 'ru'; }
  }
  function set(l) { lang = l; if (l === 'en') applyEN(); else restoreRU(); }
  function schedule() { if (lang !== 'en' || raf) return; raf = requestAnimationFrame(function () { raf = null; applyEN(); }); }

  function init() {
    set(cur());
    new MutationObserver(schedule).observe(document.body, { childList: true, subtree: true, characterData: true });
    window.addEventListener('storage', function (e) { if (e.key === 'lang') set(cur()); });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
