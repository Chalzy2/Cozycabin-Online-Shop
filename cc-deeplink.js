    // ============================================================
//  COZYCABIN — cc-deeplink.js  v4.1 (Fixed Category Navigation)
//  Reads ?id= from the URL and auto-opens the exact product.
//  Also handles legacy ?shop=&idx= links (redirects to ?id=).
//  Also handles ?v= to pre-select a variant.
// ============================================================

(function () {
  'use strict';

  var CAT_TO_SUBMENU = {
    shoes:'fashion-sub', travel:'fashion-sub', shirts:'fashion-sub',
    hoodies:'fashion-sub', watches:'fashion-sub', bags:'fashion-sub',
    caps:'fashion-sub', jeans:'fashion-sub', jackets:'fashion-sub',
    cutlery:'kitchen-sub', dispenser:'kitchen-sub', hotpots:'kitchen-sub',
    racks:'kitchen-sub', flasks:'kitchen-sub', bottles:'kitchen-sub',
    cookers:'kitchen-sub', blenders:'kitchen-sub',
    solarlights:'solar-sub', panels:'solar-sub', inverters:'solar-sub',
    batteries:'solar-sub', streetlights:'solar-sub', floodlights:'solar-sub'
  };

  function getParam(name) {
    var match = RegExp('[?&]' + name + '=([^&]*)').exec(window.location.search);
    return match ? decodeURIComponent(match[1].replace(/\+/g, ' ')) : null;
  }

  function openProduct(cat, index, variantIndex) {
    // 1. Ensure category submenu sidebar is expanded if applicable
    var subId = CAT_TO_SUBMENU[cat];
    if (subId) {
      var subEl = document.getElementById(subId);
      if (subEl) {
        subEl.classList.add('active');
        subEl.style.display = 'block';
      }
    }

    // 2. Render the specific category grid using original application logic
    if (typeof window.showProducts === 'function') {
      window.showProducts(cat);
    }

    // 3. Open the product modal if a valid index is specified
    if (index !== -1) {
      setTimeout(function () {
        var cards = document.querySelectorAll('.product-card');
        if (cards && cards[index]) {
          var clickEl = cards[index].querySelector('.product-clickable') || cards[index];
          if (clickEl) {
            clickEl.click();
            // Handle variant selection after modal renders
            if (variantIndex !== -1) {
              setTimeout(function () {
                var opts = document.querySelectorAll('.variant-opt');
                if (opts && opts[variantIndex]) {
                  opts[variantIndex].click();
                }
              }, 150);
            }
          }
        }
      }, 200);
    }
  }

  function run() {
    var id = getParam('id');
    var shop = getParam('shop');
    var idxRaw = getParam('idx');
    var vRaw = getParam('v');
    var variantIndex = vRaw !== null ? parseInt(vRaw, 10) : -1;

    // Only intercept and execute deep linking if a valid deep link parameter is present
    if (!id && !shop) return;

    // —— Modern URL String Mapping (?id=) ——
    if (id) {
      var map = window.CC_PRODUCTS_BY_ID;
      if (!map || !map[id]) {
        setTimeout(function () { run(); }, 300);
        return;
      }
      var entry = map[id];
      openProduct(entry.category, entry.index, variantIndex);
      return;
    }

    // —— Legacy Mapping Handling (?shop=&idx=) ——
    if (shop) {
      var idx = idxRaw !== null ? parseInt(idxRaw, 10) : 0;
      var prods = window.products;
      if (prods && prods[shop] && prods[shop][idx]) {
        var p = prods[shop][idx];
        var pid = p.id || (window.ccSlug && window.ccSlug(p.title)) || '';
        if (pid) {
          try { window.history.replaceState(null, '', '?id=' + pid); } catch (e) {}
        }
        openProduct(shop, idx, variantIndex);
      } else {
        openProduct(shop, -1, -1);
      }
    }
  }

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
        if ((typeof window.CC_PRODUCTS_BY_ID !== 'undefined' && typeof window.showProducts !== 'undefined') || attempts > 50) {
          clearInterval(poll);
          run();
        }
      }, 100);
    }
  }

  waitAndRun();
})();
