// ============================================================
//  wa-share-enhancer.js — Cozycabin Kenya
//
//  WHAT THIS FILE DOES NOW (v3):
//  The big full-width "Share on WhatsApp" button this file used
//  to inject into every product card has been replaced by the
//  compact 4-icon row [ WhatsApp ][ Copy ][ Facebook ][ Telegram ]
//  built in share-btn.js — that's the only thing that changed.
//
//  This file's other job stays exactly as it was: if someone
//  opens an old-style link — https://cozycabin.co.ke/?shop=X&idx=N —
//  this auto-opens the right category so the link still works.
//  (functions/_middleware.js and cc-deeplink.js also still
//  understand these old links server-side / for direct product
//  resolution — this is just the category-level fallback for
//  the client.)
//
//  INSTALL: add one line to index.html before </body>:
//    <script src="wa-share-enhancer.js"></script>
// ============================================================

(function (global) {
  'use strict';

  // ── Auto-open category from ?shop= on page load (legacy) ──
  (function autoOpen() {
    function run() {
      var p   = new URLSearchParams(window.location.search);
      var cat = p.get('shop');
      if (!cat) return;
      var ref = p.get('ref');
      if (ref && typeof localStorage !== 'undefined')
        localStorage.setItem('referralCode', ref);
      if (typeof window.showProducts === 'function') {
        setTimeout(function () { window.showProducts(cat); }, 200);
      } else {
        setTimeout(run, 100);
      }
    }
    if (document.readyState === 'loading')
      document.addEventListener('DOMContentLoaded', run);
    else run();
  })();

}(window));
