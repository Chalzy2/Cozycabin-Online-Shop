// ============================================================
//  wa-share-enhancer.js — Cozycabin Kenya  v4
//
//  WHAT THIS FILE DOES:
//  1. Reads ?id=product-id on page load → opens exact product
//     using CC_PRODUCTS_BY_ID (set by products.js).
//     This is the NEW permanent deep link format.
//
//  2. Reads ?shop=category (legacy) → opens category panel.
//     Old links still work. No new links are ever created with
//     ?shop= or ?idx=.
//
//  3. The compact share buttons [ WhatsApp ][ Copy ][ Facebook ]
//     [ Telegram ] are built in share-btn.js — see that file.
//
//  LOAD ORDER in index.html (already correct):
//    <script src="products.js"></script>
//    <script src="cc-deeplink.js"></script>
//    <script src="wa-share-enhancer.js"></script>
//    <script src="share-btn.js"></script>
// ============================================================

(function (global) {
  'use strict';

  // ── Auto-open product or category from URL params on load ──
  (function autoOpen() {
    function run() {
      var p   = new URLSearchParams(window.location.search);
      var ref = p.get('ref');

      // Save affiliate ref regardless of which param style is used
      if (ref && typeof localStorage !== 'undefined')
        localStorage.setItem('referralCode', ref);

      // ── NEW: ?id=product-id — permanent deep link ──────────
      // cc-deeplink.js is the primary handler; this is a safety
      // net in case cc-deeplink.js already ran before showProducts
      // was ready and needs a second attempt.
      var id = p.get('id');
      if (id) {
        function tryById() {
          var map = window.CC_PRODUCTS_BY_ID;
          var fn  = window.showProducts;
          if (!map || !fn) { setTimeout(tryById, 80); return; }
          var entry = map[id];
          if (!entry) return; // unknown id — do nothing
          fn(entry.category);
          // Scroll + highlight the exact card after render
          setTimeout(function () {
            var container = document.getElementById('products-container');
            if (!container) return;
            var cards = container.querySelectorAll('.product-card');
            var card  = cards[entry.index];
            if (!card) return;
            card.scrollIntoView({ behavior: 'smooth', block: 'start' });
            card.style.transition  = 'box-shadow .3s';
            card.style.boxShadow   = '0 0 0 3px #ffd700, 0 0 24px rgba(255,215,0,.25)';
            setTimeout(function () { card.style.boxShadow = ''; }, 2000);
          }, 420);
        }
        if (document.readyState === 'loading')
          document.addEventListener('DOMContentLoaded', tryById);
        else tryById();
        return; // ?id= takes priority — don't also handle ?shop=
      }

      // ── LEGACY: ?shop=category — open category panel ───────
      // Only used for backwards-compat with old shared links.
      // No new links are ever generated with ?shop= or ?idx=.
      var cat = p.get('shop');
      if (!cat) return;

      function tryByShop() {
        if (typeof window.showProducts !== 'function') {
          setTimeout(tryByShop, 80); return;
        }
        window.showProducts(cat);
      }
      if (document.readyState === 'loading')
        document.addEventListener('DOMContentLoaded', tryByShop);
      else tryByShop();
    }

    run();
  })();

}(window));
