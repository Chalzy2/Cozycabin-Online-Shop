// ============================================================
//  COZYCABIN — cc-deeplink.js  v4.2 (Isolated Safe-Fail)
// ============================================================

(function () {
  'use strict';

  // --- STEP 1: IMMEDIATE ISOLATION GUARD ---
  // If the user isn't coming from a shared deep link, KILL this script completely 
  // so it cannot block or override any click handlers or category buttons.
  var _qs = window.location.search;
  var hasId = _qs.indexOf('id=') !== -1;
  var hasShop = _qs.indexOf('shop=') !== -1;
  
  if (!hasId && !hasShop) {
    return; // Hard exit. Script does absolutely nothing on standard visits.
  }

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
    var subId = CAT_TO_SUBMENU[cat];
    if (subId) {
      var subEl = document.getElementById(subId);
      if (subEl) {
        subEl.classList.add('active');
        subEl.style.display = 'block';
      }
    }

    if (typeof window.showProducts === 'function') {
      window.showProducts(cat);
    }

    if (index !== -1) {
      setTimeout(function () {
        var cards = document.querySelectorAll('.product-card');
        if (cards && cards[index]) {
          var clickEl = cards[index].querySelector('.product-clickable') || cards[index];
          if (clickEl) {
            clickEl.click();
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

    if (id) {
      var map = window.CC_PRODUCTS_BY_ID;
      if (!map || !map[id]) return; // Exit silently if maps aren't populated yet
      var entry = map[id];
      openProduct(entry.category, entry.index, variantIndex);
      return;
    }

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

  // Poll safely only if running a deep link
  var attempts = 0;
  var poll = setInterval(function () {
    attempts++;
    if ((typeof window.CC_PRODUCTS_BY_ID !== 'undefined' && typeof window.showProducts !== 'undefined') || attempts > 30) {
      clearInterval(poll);
      if (typeof window.showProducts !== 'undefined') {
        run();
      }
    }
  }, 100);

})();

  
