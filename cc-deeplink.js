// ============================================================
//  COZYCABIN — cc-deeplink.js  v5
//
//  TRUE PRODUCT DEEP LINKING
//  ─────────────────────────────────────────────────────────
//  A shared URL like:
//    https://cozycabin.co.ke/?id=ladies-comfort-slip-on-sandals
//    https://cozycabin.co.ke/?id=solarmax-solar-panels&ref=CZ-62TFF
//
//  Will automatically:
//    1. Read ?id= from the URL
//    2. Look up the exact product in CC_PRODUCTS_BY_ID (built by products.js)
//    3. Open the correct parent submenu (e.g. fashion-sub, solar-sub)
//    4. Call showProducts(category) to render all cards in that category
//    5. Scroll to the exact matching product card
//    6. Highlight it with a gold glow for 2.2 seconds
//    7. Pre-select a variant if ?v= is present
//    8. Preserve ?ref= referral codes throughout (never stripped)
//
//  SUPPORTED URL FORMATS
//  ─────────────────────────────────────────────────────────
//  Permanent:   ?id=ladies-comfort-slip-on-sandals
//  With ref:    ?id=ladies-comfort-slip-on-sandals&ref=CZ-62TFF
//  With variant:?id=ladies-comfort-slip-on-sandals&v=2
//  Legacy:      ?shop=shoes&idx=0          → resolves to ?id= then opens
//  Legacy+ref:  ?shop=shoes&idx=0&ref=CZ-62TFF
//
//  LOAD ORDER in index.html (required):
//    <script src="products.js"></script>     ← must be first
//    <script src="cc-deeplink.js"></script>  ← this file
//    <script src="cart.js"></script>
//    <script src="share-btn.js"></script>
// ============================================================

(function () {
  'use strict';

  // ── Exit immediately when no relevant params are present ──
  // Never runs on plain homepage loads — zero overhead for regular visitors.
  var _qs = window.location.search;
  if (!_qs || (_qs.indexOf('id=') === -1 && _qs.indexOf('shop=') === -1)) return;

  // ────────────────────────────────────────────────────────
  //  CATEGORY → SUBMENU ID MAP
  //  Every category key used in products.js must have an entry
  //  here so the correct parent panel opens automatically.
  //  Submenu IDs must match the id="" values in index.html.
  // ────────────────────────────────────────────────────────
  var CAT_TO_SUBMENU = {
    // ── Fashion ──
    shoes:          'fashion-sub',
    travel:         'fashion-sub',
    bags:           'fashion-sub',
    watches:        'fashion-sub',
    belts:          'fashion-sub',
    jackets:        'fashion-sub',
    trousers:       'fashion-sub',
    ties:           'fashion-sub',
    sportswear:     'fashion-sub',
    shirts:         'fashion-sub',
    hoodies:        'fashion-sub',
    caps:           'fashion-sub',
    jeans:          'fashion-sub',

    // ── Kitchen ──
    cutlery:        'kitchen-sub',
    dispenser:      'kitchen-sub',
    hotpots:        'kitchen-sub',
    racks:          'kitchen-sub',
    flasks:         'kitchen-sub',
    bottles:        'kitchen-sub',
    blenders:       'kitchen-sub',
    cups:           'kitchen-sub',
    dinnerset:      'kitchen-sub',
    plates:         'kitchen-sub',
    cookers:        'kitchen-sub',
    irons:          'kitchen-sub',

    // ── Solar ──
    solarlights:    'solar-sub',
    panels:         'solar-sub',
    inverters:      'solar-sub',
    batteries:      'solar-sub',
    streetlights:   'solar-sub',
    floodlights:    'solar-sub',
    chargers:       'solar-sub',
    solarfans:      'solar-sub',
    jsotussolar:    'solar-sub',
    yomy:           'solar-sub',

    // ── Home Appliances ──
    fridges:        'appliances-sub',
    microwaves:     'appliances-sub',
    fryers:         'appliances-sub',
    washingmachines:'appliances-sub',
    kettles:        'appliances-sub',
    heaters:        'appliances-sub',
    fans:           'appliances-sub',
    fansapp:        'appliances-sub',
    cookersapp:     'appliances-sub',

    // ── Home Décor ──
    wallart:        'decor-sub',
    mirrors:        'decor-sub',
    flowers:        'decor-sub',
    lamps:          'decor-sub',
    carpets:        'decor-sub',
    curtains:       'decor-sub',
    frames:         'decor-sub',
    vases:          'decor-sub',

    // ── Bedding ──
    duvets:         'bedding-sub',
    bedsheets:      'bedding-sub',
    blankets:       'bedding-sub',
    pillows:        'bedding-sub',
    mattress:       'bedding-sub',
    covers:         'bedding-sub',
    nets:           'bedding-sub',
    towels:         'bedding-sub',

    // ── Security ──
    cameras:        'security-sub',
    alarms:         'security-sub',
    locks:          'security-sub',
    doorbells:      'security-sub',
    trackers:       'security-sub',
    sensors:        'security-sub',
    safes:          'security-sub',
    recorders:      'security-sub',

    // ── Electronics ──
    speakers:       'electronics-sub',
    radios:         'electronics-sub',
    earbuds:        'electronics-sub',
    tvbox:          'electronics-sub',
    powerbanks:     'electronics-sub',
    flashdisks:     'electronics-sub',
    smartwatch:     'electronics-sub',
    gaming:         'electronics-sub',

    // ── Computers ──
    phones:         'computers-sub',
    laptops:        'computers-sub',
    tablets:        'computers-sub',
    routers:        'computers-sub',
    keyboards:      'computers-sub',
    mouse:          'computers-sub',
    printers:       'computers-sub',
    storage:        'computers-sub',

    // ── E-Mobility ──
    ebikes:         'emobility-sub',
    escooters:      'emobility-sub',
    evchargers:     'emobility-sub',
    solarvehicle:   'emobility-sub',
    rentals:        'emobility-sub',
    electricservices:'emobility-sub',

    // ── Crafts ──
    artcraft:       'crafts-sub',
    sewing:         'crafts-sub',
    printing:       'crafts-sub',
    jewelry:        'crafts-sub',
    digitalproducts:'crafts-sub',
    handmade:       'crafts-sub',

    // ── Services ──
    services:       'services-sub',
  };

  // ────────────────────────────────────────────────────────
  //  HIGHLIGHT — scroll to card + gold glow ring
  // ────────────────────────────────────────────────────────
  function highlightCard(card) {
    if (!card) return;
    // Scroll card into view with a small top margin so the sticky
    // header does not cover it on mobile
    var headerH = 70;
    var rect = card.getBoundingClientRect();
    var scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    var cardTop = rect.top + scrollTop - headerH;
    window.scrollTo({ top: cardTop, behavior: 'smooth' });

    // Gold glow — fades out after 2.2 s
    card.style.transition  = 'box-shadow .35s ease, outline .35s ease';
    card.style.boxShadow   = '0 0 0 3px #ffd700, 0 0 32px rgba(255,215,0,0.30)';
    card.style.outline     = '2px solid #ffd700';
    card.style.borderRadius = '16px';
    setTimeout(function () {
      card.style.boxShadow = '';
      card.style.outline   = '';
    }, 2200);
  }

  // ────────────────────────────────────────────────────────
  //  FIND CARD BY PRODUCT ID
  //  products.js renders cards with data-product-id="<slug>"
  //  on the .buy-btn inside each .product-card.
  //  We use that attribute to find the exact card after render.
  // ────────────────────────────────────────────────────────
  function findCardById(productId) {
    // Primary: data-product-id on buy button (set by products.js renderer)
    var btn = document.querySelector('[data-product-id="' + productId + '"]');
    if (btn) return btn.closest('.product-card');

    // Fallback: check card index position (products.js renders in array order)
    return null;
  }

  // ────────────────────────────────────────────────────────
  //  CORE — open submenu → render category → find & highlight card
  // ────────────────────────────────────────────────────────
  function openProduct(category, productId, cardIndex, variantIndex) {
    var subId = CAT_TO_SUBMENU[category];

    // ── Step 1: Open the submenu panel ──
    // toggleSub is defined in products.js. It handles:
    //   - closing all other open submenus
    //   - adding .open class to the target panel
    //   - hiding the products container if toggling off
    // We only call it if the panel is not already open.
    if (subId && typeof window.toggleSub === 'function') {
      var panel = document.getElementById(subId);
      if (panel && !panel.classList.contains('open')) {
        window.toggleSub(subId);
      }
    }

    // ── Step 2: Render the product cards for this category ──
    // Small delay lets toggleSub finish DOM repositioning before
    // showProducts moves the products-container element.
    setTimeout(function () {
      if (typeof window.showProducts === 'function') {
        window.showProducts(category);
      }

      // ── Step 3: Find + highlight the exact card ──
      // showProducts() is synchronous HTML injection so cards exist
      // in the DOM immediately after it returns — but we give the
      // browser one additional frame to paint before scrolling.
      setTimeout(function () {
        var container = document.getElementById('products-container');
        if (!container) return;

        // Preferred: find by product id slug (most precise)
        var card = productId ? findCardById(productId) : null;

        // Fallback: find by array index (guaranteed to exist)
        if (!card && cardIndex >= 0) {
          var cards = container.querySelectorAll('.product-card');
          card = cards[cardIndex] || null;
        }

        if (card) {
          highlightCard(card);

          // Pre-select variant if ?v= was in the URL
          if (variantIndex >= 0 && typeof window.vcSwitch === 'function') {
            window.vcSwitch(cardIndex, variantIndex);
          }
        }
      }, 80); // one RAF worth of time after showProducts

    }, 120); // after toggleSub DOM settle
  }

  // ────────────────────────────────────────────────────────
  //  REFERRAL — preserve ?ref= forever in localStorage
  //  products.js also does this, but we duplicate it here
  //  so the ref is captured even on deep-link entry before
  //  products.js has executed.
  // ────────────────────────────────────────────────────────
  (function captureRef() {
    try {
      var params = new URLSearchParams(window.location.search);
      var ref    = params.get('ref');
      if (ref) {
        localStorage.setItem('referralCode', ref);
      }
    } catch (e) { /* localStorage blocked in private mode — safe to ignore */ }
  })();

  // ────────────────────────────────────────────────────────
  //  MAIN ENTRY POINT
  // ────────────────────────────────────────────────────────
  function run() {
    var params       = new URLSearchParams(window.location.search);
    var id           = params.get('id')   || '';
    var shop         = params.get('shop') || '';
    var idxRaw       = params.get('idx') !== null ? params.get('idx') : params.get('i');
    var vRaw         = params.get('v');
    var variantIndex = (vRaw !== null && !isNaN(parseInt(vRaw, 10)))
                         ? parseInt(vRaw, 10) : -1;

    // ── ?id= permanent deep link (canonical format) ──────
    if (id) {
      var map = window.CC_PRODUCTS_BY_ID;

      // CC_PRODUCTS_BY_ID not yet populated — retry in 300 ms
      // (can happen if products.js is still executing on slow devices)
      if (!map || !map[id]) {
        setTimeout(function () { run(); }, 300);
        return;
      }

      var entry    = map[id]; // { category, index, product }
      var category = entry.category;
      var index    = entry.index;

      // Rewrite URL to canonical ?id= form, preserving ?ref= if present
      // (browser only — does not reload the page)
      try {
        var canonical = '?id=' + id;
        var ref = params.get('ref');
        if (ref) canonical += '&ref=' + encodeURIComponent(ref);
        window.history.replaceState(null, '', canonical);
      } catch (e) { /* replaceState blocked in some browsers — safe to ignore */ }

      openProduct(category, id, index, variantIndex);
      return;
    }

    // ── Legacy ?shop=&idx= link ──────────────────────────
    // Converts to a ?id= URL so the link becomes permanent
    // and the standard openProduct flow handles everything.
    if (shop) {
      var idx   = idxRaw !== null ? parseInt(idxRaw, 10) : 0;
      var prods = window.products;

      if (prods && prods[shop]) {
        var p = prods[shop][idx] || prods[shop][0];

        if (p) {
          // Resolve slug: use explicit p.id if present, otherwise derive
          var pid = p.id
            || (typeof window.ccSlug === 'function' ? window.ccSlug(p.title || p.name || '') : '');

          // Upgrade the browser URL to the canonical ?id= form
          if (pid) {
            try {
              var upgraded = '?id=' + pid;
              var ref2 = params.get('ref');
              if (ref2) upgraded += '&ref=' + encodeURIComponent(ref2);
              window.history.replaceState(null, '', upgraded);
            } catch (e) { }
          }

          openProduct(shop, pid, idx, variantIndex);
          return;
        }
      }

      // Category exists but no specific product — just open the submenu
      openProduct(shop, '', -1, -1);
    }
  }

  // ────────────────────────────────────────────────────────
  //  WAIT FOR READINESS
  //  cc-deeplink.js loads immediately after products.js so
  //  CC_PRODUCTS_BY_ID is almost always already defined.
  //  The poll covers the rare race where products.js is still
  //  parsing (large file, slow network, deferred execution).
  // ────────────────────────────────────────────────────────
  function waitAndRun() {
    var domReady = document.readyState !== 'loading';
    var dataReady = (
      typeof window.CC_PRODUCTS_BY_ID !== 'undefined' &&
      typeof window.showProducts      !== 'undefined' &&
      typeof window.toggleSub         !== 'undefined'
    );

    if (domReady && dataReady) {
      run();
      return;
    }

    if (!domReady) {
      // DOM not yet parsed — wait for it
      document.addEventListener('DOMContentLoaded', waitAndRun);
      return;
    }

    // DOM is ready but products.js hasn't finished yet — poll
    var attempts = 0;
    var poll = setInterval(function () {
      attempts++;
      if (
        typeof window.CC_PRODUCTS_BY_ID !== 'undefined' &&
        typeof window.showProducts      !== 'undefined' &&
        typeof window.toggleSub         !== 'undefined'
      ) {
        clearInterval(poll);
        run();
      }
      // Stop after 4 seconds (40 × 100ms) — avoids infinite loop
      // if products.js fails to load entirely
      if (attempts > 40) {
        clearInterval(poll);
        console.warn('[cc-deeplink] Timed out waiting for products.js — deep link did not resolve. Check that products.js loads before cc-deeplink.js.');
      }
    }, 100);
  }

  waitAndRun();

})();
