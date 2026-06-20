// ============================================================
//  COZYCABIN — cc-deeplink.js
//  Reads ?id= from the URL and auto-opens the exact product.
//  Also handles legacy ?shop=&idx= links (redirects to ?id=).
//
//  Load ORDER in index.html:
//    <script src="products.js"></script>
//    <script src="cc-deeplink.js"></script>   ← this file
//
//  HOW IT WORKS
//  ────────────────────────────────────────────────────────────
//  1. On page load, reads window.location.search
//  2. ?id=mens-premium-formal-shoes
//       → looks up CC_PRODUCTS_BY_ID[id]
//       → opens the parent submenu via toggleSub / classList
//       → calls showProducts(category)
//       → scrolls to the card + brief gold highlight
//  3. ?shop=shoes&idx=7  (legacy)
//       → converts to ?id= using CC_PRODUCTS_BY_ID map
//       → silently rewrites URL then does step 2
//  4. No URL params → does nothing (normal homepage load)
// ============================================================

(function () {
  'use strict';

  // ── Submenu → minor-menu id map (mirrors index.html + fashion.html)
  // category key → parent minor-menu id
  var CAT_TO_SUBMENU = {
    // Fashion
    shoes:       'fashion-sub', travel:      'fashion-sub',
    shirts:      'fashion-sub', hoodies:     'fashion-sub',
    watches:     'fashion-sub', bags:        'fashion-sub',
    caps:        'fashion-sub', jeans:       'fashion-sub',
    jackets:     'fashion-sub',
    // Kitchen
    cutlery:     'kitchen-sub', dispenser:   'kitchen-sub',
    hotpots:     'kitchen-sub', racks:       'kitchen-sub',
    flasks:      'kitchen-sub', bottles:     'kitchen-sub',
    cookers:     'kitchen-sub', blenders:    'kitchen-sub',
    // Solar
    solarlights: 'solar-sub',  panels:       'solar-sub',
    inverters:   'solar-sub',  batteries:    'solar-sub',
    streetlights:'solar-sub',  floodlights:  'solar-sub',
    chargers:    'solar-sub',  fans:         'solar-sub',
    solarfans:   'solar-sub',  jsotussolar:  'solar-sub',
    yomy:        'solar-sub',
    // Appliances
    fridges:     'appliances-sub', microwaves:  'appliances-sub',
    washing:     'appliances-sub', cookersapp:  'appliances-sub',
    kettles:     'appliances-sub', irons:       'appliances-sub',
    heaters:     'appliances-sub', fansapp:     'appliances-sub',
    // Decor
    wallart:     'decor-sub',  mirrors:      'decor-sub',
    flowers:     'decor-sub',  lamps:        'decor-sub',
    carpets:     'decor-sub',  curtains:     'decor-sub',
    frames:      'decor-sub',  vases:        'decor-sub',
    // Bedding
    duvets:      'bedding-sub', bedsheets:   'bedding-sub',
    blankets:    'bedding-sub', pillows:     'bedding-sub',
    mattress:    'bedding-sub', covers:      'bedding-sub',
    nets:        'bedding-sub', towels:      'bedding-sub',
    // Security
    cameras:     'security-sub', alarms:     'security-sub',
    locks:       'security-sub', doorbells:  'security-sub',
    trackers:    'security-sub', sensors:    'security-sub',
    safes:       'security-sub', recorders:  'security-sub',
    // Electronics
    speakers:    'electronics-sub', radios:    'electronics-sub',
    earbuds:     'electronics-sub', tvbox:     'electronics-sub',
    powerbanks:  'electronics-sub', flashdisks:'electronics-sub',
    smartwatch:  'electronics-sub', gaming:    'electronics-sub',
    // Computers
    phones:      'computers-sub', laptops:    'computers-sub',
    tablets:     'computers-sub', routers:    'computers-sub',
    keyboards:   'computers-sub', mouse:      'computers-sub',
    printers:    'computers-sub', storage:    'computers-sub',
  };

  // ── Open a submenu panel (mirrors how grid buttons work in index.html)
  function openSubmenu(subId) {
    if (!subId) return;
    // Close all other minor menus first
    document.querySelectorAll('.minor-menu').forEach(function (m) {
      var digitalIds = ['video-courses','ebooks-menu','crypto-menu',
                        'affiliate-menu','problem-menu','entertainment-menu','free-tools-menu'];
      if (m.id !== subId && digitalIds.indexOf(m.id) === -1) {
        m.classList.remove('open');
        m.style.display = 'none';
      }
    });
    var panel = document.getElementById(subId);
    if (!panel) return;
    panel.classList.add('open');
    panel.style.display = 'block';
  }

  // ── Scroll to a card and briefly highlight it in gold
  function highlightCard(card) {
    if (!card) return;
    card.scrollIntoView({ behavior: 'smooth', block: 'start' });
    card.style.transition = 'box-shadow .3s ease';
    card.style.boxShadow  = '0 0 0 3px #ffd700, 0 0 28px rgba(255,215,0,0.25)';
    setTimeout(function () { card.style.boxShadow = ''; }, 2200);
  }

  // ── Core open routine: open submenu → render products → scroll to card
  function openProduct(category, cardIndex) {
    var subId = CAT_TO_SUBMENU[category];
    openSubmenu(subId);

    if (typeof window.showProducts === 'function') {
      window.showProducts(category);
    }

    if (cardIndex >= 0) {
      // Products render asynchronously, so wait a tick
      setTimeout(function () {
        var container = document.getElementById('products-container');
        if (!container) return;
        var cards = container.querySelectorAll('.product-card');
        highlightCard(cards[cardIndex]);
      }, 500);
    }
  }

  // ── Main entry point: called after DOM + products.js are ready
  function run() {
    var params  = new URLSearchParams(window.location.search);
    var id      = params.get('id');
    var shop    = params.get('shop');
    var idxRaw  = params.get('idx') !== null ? params.get('idx') : params.get('i');

    // ── NEW: ?id= param (permanent link) ──────────────────────
    if (id) {
      var map = window.CC_PRODUCTS_BY_ID;
      if (!map || !map[id]) {
        // Products map may not exist yet (race condition) — retry once
        setTimeout(function () { run(); }, 300);
        return;
      }
      var entry = map[id];
      openProduct(entry.category, entry.index);
      return;
    }

    // ── LEGACY: ?shop=&idx= → convert to ?id= and open ───────
    if (shop) {
      var idx = idxRaw !== null ? parseInt(idxRaw, 10) : 0;
      // Find the product by category + position
      var prods = window.products;
      if (prods && prods[shop] && prods[shop][idx]) {
        var p  = prods[shop][idx];
        var pid = p.id || (window.ccSlug && window.ccSlug(p.title)) || '';
        if (pid) {
          // Silently rewrite URL to the permanent form (no page reload)
          try {
            window.history.replaceState(null, '', '?id=' + pid);
          } catch (e) {}
        }
        openProduct(shop, idx);
      } else if (shop) {
        // Unknown idx — just open the category
        openProduct(shop, -1);
      }
      return;
    }

    // No params → normal homepage load, do nothing
  }

  // ── Wait for DOM + products.js (CC_PRODUCTS_BY_ID) to both be ready
  function waitAndRun() {
    if (typeof window.CC_PRODUCTS_BY_ID !== 'undefined' &&
        typeof window.showProducts      !== 'undefined' &&
        document.readyState !== 'loading') {
      run();
    } else if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', waitAndRun);
    } else {
      // DOM ready but products.js still loading — poll briefly
      var attempts = 0;
      var poll = setInterval(function () {
        attempts++;
        if (typeof window.CC_PRODUCTS_BY_ID !== 'undefined' &&
            typeof window.showProducts      !== 'undefined') {
          clearInterval(poll);
          run();
        }
        if (attempts > 40) clearInterval(poll); // give up after 4s
      }, 100);
    }
  }

  waitAndRun();

})();
