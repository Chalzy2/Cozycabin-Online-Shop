// ============================================================
//  COZYCABIN — cc-deeplink.js  v2
//  Reads ?id= from the URL and auto-opens the exact product.
//  Also handles legacy ?shop=&idx= links (redirects to ?id=).
//  Also handles ?v= to pre-select a variant.
//
//  Load ORDER in index.html:
//    <script src="products.js"></script>
//    <script src="cc-deeplink.js"></script>   ← this file
// ============================================================

(function () {
  'use strict';

  // ── category key → parent submenu id (mirrors index.html)
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
    washingmachines: 'appliances-sub', cookersapp:  'appliances-sub',
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

  // ── Scroll to card + gold highlight
  function highlightCard(card) {
    if (!card) return;
    card.scrollIntoView({ behavior: 'smooth', block: 'start' });
    card.style.transition = 'box-shadow .3s ease';
    card.style.boxShadow  = '0 0 0 3px #ffd700, 0 0 28px rgba(255,215,0,0.25)';
    setTimeout(function () { card.style.boxShadow = ''; }, 2200);
  }

  // ── Core open routine
  function openProduct(category, cardIndex, variantIndex) {
    var subId = CAT_TO_SUBMENU[category];

    // Use toggleSub — this is what correctly opens the panel and
    // positions the products container (same as clicking a grid button)
    if (subId && typeof window.toggleSub === 'function') {
      // Only call toggleSub if the panel isn't already open
      var panel = document.getElementById(subId);
      if (panel && !panel.classList.contains('open')) {
        window.toggleSub(subId);
      }
    }

    if (typeof window.showProducts === 'function') {
      window.showProducts(category);
    }

    if (cardIndex >= 0) {
      setTimeout(function () {
        var container = document.getElementById('products-container');
        if (!container) return;
        var cards = container.querySelectorAll('.product-card');
        highlightCard(cards[cardIndex]);

        // ── Pre-select variant if ?v= is present ──
        if (variantIndex >= 0) {
          // vcSelectVariant is a local function in products.js — use vcSwitch
          // which IS on window and retrieves the variants array internally
          if (typeof window.vcSwitch === 'function') {
            window.vcSwitch(cardIndex, variantIndex);
          }
        }
      }, 500);
    }
  }

  // ── Main entry point
  function run() {
    var params       = new URLSearchParams(window.location.search);
    var id           = params.get('id');
    var shop         = params.get('shop');
    var idxRaw       = params.get('idx') !== null ? params.get('idx') : params.get('i');
    var vRaw         = params.get('v');
    var variantIndex = vRaw !== null ? parseInt(vRaw, 10) : -1;
    if (isNaN(variantIndex)) variantIndex = -1;

    // ── ?id= permanent link ──
    if (id) {
      var map = window.CC_PRODUCTS_BY_ID;
      if (!map || !map[id]) {
        // Race condition — retry once
        setTimeout(function () { run(); }, 300);
        return;
      }
      var entry = map[id];
      openProduct(entry.category, entry.index, variantIndex);
      return;
    }

    // ── Legacy ?shop=&idx= ──
    if (shop) {
      var idx  = idxRaw !== null ? parseInt(idxRaw, 10) : 0;
      var prods = window.products;
      if (prods && prods[shop] && prods[shop][idx]) {
        var p   = prods[shop][idx];
        var pid = p.id || (window.ccSlug && window.ccSlug(p.title)) || '';
        if (pid) {
          try { window.history.replaceState(null, '', '?id=' + pid); } catch (e) {}
        }
        openProduct(shop, idx, variantIndex);
      } else if (shop) {
        openProduct(shop, -1, -1);
      }
      return;
    }

    // No params → normal load, do nothing
  }

  // ── Wait for DOM + products.js to be ready
  function waitAndRun() {
    if (typeof window.CC_PRODUCTS_BY_ID !== 'undefined' &&
        typeof window.showProducts      !== 'undefined' &&
        document.readyState !== 'loading') {
      run();
    } else if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', waitAndRun);
    } else {
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
